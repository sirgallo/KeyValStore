import { Dealer } from 'zeromq';
import { randomUUID } from 'crypto';

import { cryptoOptions } from '@core/crypto/CryptoOptions';
import { LogProvider } from '@core/providers/LogProvider';
import { SimpleQueueProvider } from '@core/providers/queue/SimpleQueueProvider';
import {
  IHeartBeat,
  IInternalJobQueueMessage,
  IInternalLivelinessResponse,
  LifeCycle,
  MachineStatus
} from '@core/models/infrastructure/IMq';
import { IGenericJob } from '@core/models/infrastructure/IJob';

const NAME = 'MQ Provider';
const strEncoding = 'utf-8';

/*
  ZMQ implementation of an brokerless message queue

  Dealer --> Async REQ
  Router --> Async REP

  Dealer --> binds self and listens
    --> on http request to an http route, pass request to router
    --> relay to 1 of n routers
  
  Router --> binds single or many dealers/load balancer, m to n relationship
    --> on message from dealer, push element onto queue
      --> pop first element in queue and perform operation
        --> once complete, send message as response in return to Dealer

  General Layout:
 
      Dealer   Dealer ...
        \      /
         \    /
          \  /
          Router
         Heartbeat
          Queue
         Heartbeat
          Router
          /   \
         /     \
        /       \
      Dealer   Dealer ...
      Queue    Queue

  Completely non-blocking
*/

const workerQueueEventName = 'workerQueueUpdate';
const reqQueueEventName = 'reqQueueUpdate';

export class MQProvider {
  isQueue = false;
  sock: Dealer;

  private machineStatus: MachineStatus = 'Ready';
  private workerQueue: SimpleQueueProvider;
  private reqQueue: SimpleQueueProvider;

  private log = new LogProvider(NAME)
  constructor(
    private address: string, 
    private port: string,
    private domain: string,
    private protocol = 'tcp'
  ) {}

  async startWorker(jobClassReq: IGenericJob) {
    try {
      this.sock = new Dealer();
      this.sock.routingId = randomUUID(cryptoOptions);
      //  connect to load balancer, each dealer will still have a unique id
      this.sock.connect(`${this.protocol}://${this.domain}:${this.port}`);

      this.workerQueue = new SimpleQueueProvider(workerQueueEventName);
      this.workerQueueOn(jobClassReq);
      this.isQueue = true;

      this.reqQueue = new SimpleQueueProvider(reqQueueEventName);
      this.reqQueueOn();
      //  check for stale jobs in queue on interval, in case no new jobs come in on sock
      MQProvider.setIntervalQueue(this.workerQueue);
      MQProvider.setIntervalQueue(this.reqQueue);

      const healthCheck: IHeartBeat = { 
        routerId: this.sock.routingId, 
        healthy: 'Alive',
        status: this.machineStatus 
      }

      await this.sock.send(JSON.stringify(healthCheck));

      /*
        Need to know message format beforehand, we are the ones designing the messages passed between machines
      */
      for await (const [ message ] of this.sock) {
        const jsonBody = JSON.parse(message.toString(strEncoding));
        if (jsonBody.message) {
          const queueEntry: IInternalJobQueueMessage = {
            jobId: jsonBody.message,
            header: this.sock.routingId,
            body: jsonBody
          }

          this.workerQueue.enqueue(queueEntry);
        } else if (jsonBody.heartbeat) {
          // heartbeat
          await this.sock.send(JSON.stringify(healthCheck));
        }
      }
    } catch (err) { throw err; }
  }

  async startClient(jobClassResp: IGenericJob) {
    try {
      this.sock = new Dealer();
      //  generate unique id on socket for identification
      this.sock.routingId = randomUUID(cryptoOptions);
      this.sock.connect(`${this.protocol}://${this.domain}:${this.port}`);

      this.reqQueue = new SimpleQueueProvider(reqQueueEventName);
      this.reqQueueOn();
      
      MQProvider.setIntervalQueue(this.reqQueue);

      const healthCheck: IHeartBeat = { 
        routerId: this.sock.routingId, 
        healthy: 'Alive',
        status: this.machineStatus 
      }

      await this.sock.send(JSON.stringify(healthCheck));

      //  listen for response from worker
      for await (const [ message ] of this.sock) {
        const jsonMessage = JSON.parse(message.toString(strEncoding));
        if (jsonMessage.body) {
          // perform operation
          await jobClassResp.execute(jsonMessage.body);
        } else if (jsonMessage.heartbeat) {
          // heartbeat
          await this.sock.send(JSON.stringify(healthCheck));
        }
      }
    } catch (err) { throw err; }
  }

  pushClient(newMessage: any) {
    try {
      this.log.info('Pushing new message through dealer to worker...');
      //  this is how we can use http routes, pass request from http route on to the socket
      const message = JSON.stringify({ message: newMessage });
      this.reqQueue.enqueue(message);
    } catch (err) { throw err; }
  }

  //  jobFunction needs to be asynchronous
  private workerQueueOn(jobClassReq: IGenericJob) {
    this.workerQueue.queueUpdate.on(this.workerQueue.eventName, async () => {
      if (this.workerQueue.length > 0) {  
        const msg = { job: null }

        try {
          const job: IInternalJobQueueMessage = this.workerQueue.dequeue();
          msg.job = job;

          const inProg = MQProvider.formattedReturnObj(this.address, job.jobId, job.body, this.machineStatus, 'In Progress');
          this.reqQueue.enqueue(inProg);
          
          const results = await jobClassReq.execute(job.body.message);
          const currResult = MQProvider.formattedReturnObj(this.address, job.jobId, results, this.machineStatus, 'Finished');
          this.reqQueue.enqueue(currResult);

          this.log.info(`Finished job with hash: ${msg.job.body.message}`);
        } catch (err) { 
          this.log.error(`Job failed with hash: ${msg.job.body.message}`);

          const errMsg = MQProvider.formattedReturnObj(this.address, msg.job.jobId, { error: err.toString() }, this.machineStatus, 'Failed');
          this.reqQueue.enqueue(errMsg);
        }
      }
    });
  }

  private reqQueueOn() {
    this.reqQueue.queueUpdate.on(this.reqQueue.eventName, async () => {
      if (this.reqQueue.length > 0) {
        try {
          const jobUpdate = this.reqQueue.dequeue();
          const jobUpdateStr = JSON.stringify(jobUpdate);
        
          await this.sock.send(jobUpdateStr);
        } catch (err) { this.log.error('Return Queue failure on worker'); }
      }
    });
  }

  private formattedHealthCheck(): string {
    const heartbeat: IHeartBeat = {
      routerId: this.sock.routingId,
      healthy: 'Alive',
      status: this.machineStatus
    }

    return JSON.stringify(heartbeat);
  }

  static formattedReturnObj(node: string, job: string, jsonBody: any, status: MachineStatus, lifeCycle?: LifeCycle): IInternalLivelinessResponse {
    return {
      node,
      job,
      message: jsonBody,
      status,
      ...(lifeCycle ? { lifeCycle } : {})
    }
  }

  static setIntervalQueue(queue: SimpleQueueProvider, timeout: number = 200) {
    setInterval(() => queue.emitEvent(), timeout);
  }
}