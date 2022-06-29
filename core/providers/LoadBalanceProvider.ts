import { Router } from 'zeromq';
import { randomUUID } from 'crypto';

import { cryptoOptions } from '@core/crypto/CryptoOptions';
import { LogProvider } from '@core/providers/LogProvider';
import { SimpleQueueProvider } from '@core/providers/SimpleQueueProvider';
import {
  IAvailableMachine,
  IInternalJobQueueMessage,
  IInternalLivelinessResponse,
  ISockRequest,
  MachineTypes,
} from '@core/models/IMq';
import { MQProvider } from '@core/providers/MQProvider';
import { sleep, toMs } from '@core/utils/Utils';

const NAME = 'Load Balance Provider';

const MAXRETRIES = 5;

const ONSTARTUP = 45; // in sec
const TIMEOUT = 500; // in ms
const INTERVAL = 30; // in sec

const strEncoding = 'utf-8';

const loadBalanceEventName = 'lbQueueUpdate';
const retEventName = 'retEventName';

/*
  Custom Load Balancer

  Design:

            clients ...
                |
                |
  add to known clients if not discovered yet
            add job to queue
      distribute to known workers

  Utilizing 2 separate sockets, with the frontend socket
  relaying to the backend socket

  Worker and Client unique identifiers are stored in memory

  Workers and Clients express if they are busy or not, and if 
  available, are selected at random to either begin a new job
  or return a response
*/

export class LoadBalanceProvider {
  clientsock: Router;
  workersock: Router;

  private jobQueue: SimpleQueueProvider;
  private retQueue: SimpleQueueProvider;

  private knownClientMachines: Set<string> = new Set();
  private knownWorkerMachines: Set<string> = new Set();

  private knownClientsMap: Record<string, IAvailableMachine> = {};
  private knownWorkersMap: Record<string, IAvailableMachine> = {};
  
  private lbLog = new LogProvider(NAME)
  constructor(
    private address: string,
    private clientPort: string,
    private workerPort: string,
    private protocol = 'tcp'
  ) {}

  //  Start both frontend and backend facing sockets and associated queues
  async start() {
    try {
      this.clientsock = new Router();
      this.workersock = new Router();

      this.jobQueue = new SimpleQueueProvider(loadBalanceEventName);
      this.retQueue = new SimpleQueueProvider(retEventName);

      this.jobQueueOn();
      this.retQueueOn();
     
      MQProvider.setIntervalQueue(this.jobQueue);
      MQProvider.setIntervalQueue(this.retQueue);

      this.startClientRouter();
      this.startWorkerRouter();
    } catch (err) {
      this.lbLog.error(err);
      throw err;
    }
  }

  /*
    Client facing socket that picks up requests from the gateway apis. Requests are then fed into the job pipeline
    and fed into the worker router. Any number of clients can connect to the client side.

    The load balancer saves client ids in a map and then heartbeats every system in the map to validate that it is alive.
    If the system fails, it is removed from the map of validated systems. Responses from the worker machines are routed
    to a randomly selected available client machine
  */
  async startClientRouter() {
    this.clientsock.routingId = randomUUID(cryptoOptions);
    
    await this.clientsock.bind(`${this.protocol}://*:${this.clientPort}`);
   
    for await (const [ header, body ] of this.clientsock) {
      const strHeader = header.toString(strEncoding);
      const jsonBody = JSON.parse(body.toString(strEncoding));
      const queueEntry: IInternalJobQueueMessage = {
        jobId: jsonBody?.message,
        header: strHeader,
        body: jsonBody
      }

      this.lbLog.info(body.toString(strEncoding));

      this.knownClientMachines.add(strHeader);
      if (! this.knownClientsMap[strHeader]) { 
        this.knownClientsMap[strHeader] = {
          status: 'Ready',
          validated: new Date(),
          heartbeat: this.heartbeat.bind(this),
          connAttempts: 0
        }

        this.knownClientsMap[strHeader].heartbeat(strHeader, 'Client')
      } else {
        this.knownClientsMap[strHeader].status = jsonBody?.status || 'Ready';
        this.knownClientsMap[strHeader].validated = new Date();
        this.knownClientsMap[strHeader].connAttempts = 0;
      }

      if (queueEntry.jobId) {
        const returnObj: IInternalLivelinessResponse = {
          node: this.address,
          job: queueEntry.jobId,
          message: queueEntry.body,
          status: 'Ready',
          lifeCycle: 'In Queue'
        }

        const body = { body: returnObj }

        this.retQueue.enqueue(body);
        this.jobQueue.enqueue(queueEntry);
      }
    }
  }

  /*
    Requests on job queue are picked up by worker router and distributed to worker machines. Machines are picked 
    randomly from a pool of available machines, with status: 'Ready' .This evenly distributes work to available 
    machines. Any number of workers can connect to the worker facing load balancer.
  */
  async startWorkerRouter() {
    this.workersock.routingId = randomUUID(cryptoOptions);

    await this.workersock.bind(`${this.protocol}://*:${this.workerPort}`);

    for await (const [ header, body ] of this.workersock) {
      const strHeader = header.toString(strEncoding);
      const jsonBody = JSON.parse(body.toString(strEncoding));
      
      this.lbLog.info(body.toString(strEncoding));

      this.knownWorkerMachines.add(strHeader);
      if (! this.knownWorkersMap[strHeader]) {
        this.knownWorkersMap[strHeader] = {
          status: 'Ready',
          validated: new Date(),
          heartbeat: this.heartbeat.bind(this),
          connAttempts: 0
        }
        
        this.knownWorkersMap[strHeader].heartbeat(strHeader, 'Worker');
      } else {
        this.knownWorkersMap[strHeader].status = jsonBody?.status;
        this.knownWorkersMap[strHeader].validated = new Date();
        this.knownWorkersMap[strHeader].connAttempts = 0;
      }
      
      if (jsonBody.job) {
        const retEntry = { body: jsonBody }
        this.retQueue.enqueue(retEntry);
      }
    }
  }

  //  handle randomly distributing jobs on new job event and stale jobs
  private jobQueueOn() {
    this.jobQueue.queueUpdate.on(this.jobQueue.eventName, async () => {
      if (this.jobQueue.length > 0) {
        const msg = { job: null }

        try {
          const workerIndex = this.selectMachine(this.knownWorkersMap);
          if (workerIndex) {
            const job: IInternalJobQueueMessage = await this.jobQueue.dequeue();;
            const strBody = JSON.stringify(job.body);

          //  need to pass identity in first frame
          //  router stores id of dealer in hash table
            await this.workersock.send([ 
              [...this.knownWorkerMachines][workerIndex],
              strBody 
            ]);
          } else { this.lbLog.warn('Waiting for available Worker Machines...'); }
        } catch (err) { this.lbLog.error(`Failed pushing job with hash: ${msg.job.jobId} to a Worker Machine.`); }
      }
    });
  }

  //  handle randomly distributing a response to a gateway machine
  private retQueueOn() {
    this.retQueue.queueUpdate.on(this.retQueue.eventName, async () => {
      //  read one message at a time from the queue, solves timing issue on responses
      if (this.retQueue.length > 0) {
        try {
          const clientIndex = this.selectMachine(this.knownClientsMap);
          
          if(clientIndex) {
            const returnObj = JSON.stringify(this.retQueue.dequeue());

            await this.clientsock.send([
              [...this.knownClientMachines][clientIndex],
              returnObj
            ]);
          } else {
            this.lbLog.warn('Waiting for available Client machines...');
          }
        } catch (err) { this.lbLog.error('Error Pushing Updates to Client'); }
      }
    });
  }

  /*
    Heartbeat:

      LB selects all machines on the known machines dictionary and checks if the validation date is within the 
      timeframe.

      A heartbeat is sent to all machines and a response is returned.

      The response is handled in the socket event listener for both the client and backend facing sockets

      On response, the map is updated to reflect the machine health
  */
  private async heartbeat(machineId: string, machineType: MachineTypes) {
    this.lbLog.info(`Sleep on Startup for: ${ONSTARTUP}s`);
    await sleep(toMs.sec(ONSTARTUP));
    this.lbLog.info(`Begin Heartbeating for machine ${machineId}...`);
    
    while (true) {
      if (machineType === 'Worker') {
        const previousConnectionAttempts = this.knownWorkersMap[machineId].connAttempts;
        
        if (previousConnectionAttempts > MAXRETRIES) {
          this.lbLog.info(`Removing Worker Machine with Id: ${machineId}`);
          this.knownWorkerMachines.delete(machineId);
          delete this.knownWorkersMap[machineId];

          break;
        } else {
          this.knownWorkersMap[machineId].connAttempts++;
          const currTimeout = this.getCurrentTimeout(previousConnectionAttempts);
          
          await this.workersock.send([
            machineId,
            JSON.stringify({ heartbeat: true })
          ]);

          await sleep(toMs.sec(currTimeout));
        }
      } else {
        const previousConnectionAttempts = this.knownClientsMap[machineId].connAttempts;

        if (previousConnectionAttempts > MAXRETRIES) {
          this.lbLog.info(`Removing Client Machine with Id: ${machineId}`);
          this.knownClientMachines.delete(machineId);
          delete this.knownClientsMap[machineId];

          break;
        } else {
          this.knownClientsMap[machineId].connAttempts++;
          const currTimeout = this.getCurrentTimeout(previousConnectionAttempts);

          await this.clientsock.send([
            machineId,
            JSON.stringify({ heartbeat: true })
          ]);

          await sleep(toMs.sec(currTimeout));
        }
      }
    }
  }

  //  Get a random machine index from the available machines
  private selectMachine(machines: Record<string, IAvailableMachine>): number {
    const totalAvailableMachines = Object.keys(machines)
      .map(key => {
        if (machines[key].status === 'Ready' && ! this.outsideTimeout(machines[key].validated, INTERVAL)) {
          return key
        }
      })
      .filter(el => el)
      .length;
    
    if (totalAvailableMachines > 0) {
      const randomValue = Math.random() * totalAvailableMachines;
      const roundedIndex = Math.floor(randomValue);
      
      return roundedIndex;
    }
  }

  private outsideTimeout(dateToTest: Date, timeout: number): boolean {
    const now = new Date();
    const pastTimeout = dateToTest.getTime() + timeout;

    if (now.getTime() > pastTimeout) return true;
    else return false;
  }

  //  calculate current timeout based on current attempt
  private getCurrentTimeout(connAttempts: number): number {
    if (connAttempts === 0) return INTERVAL;
    else return this.exponentialBackoffTimeout(connAttempts);
  }

  //  exponentially back off for each machine retry
  private exponentialBackoffTimeout(connAttempts: number): number {
    return (2 * connAttempts * TIMEOUT) / 1000;
  }
}