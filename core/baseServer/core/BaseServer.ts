const cluster = require('cluster');
const path = require('path');
const express = require('express');

import { config } from 'dotenv';
import * as os from 'os';

import createError from 'http-errors';
import * as e from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';

import { LogProvider } from '@core/providers/LogProvider';
import { ITimerMap, elapsedTimeInMs } from'@core/utils/Timer';
import { PollRoute } from '@core/baseServer/routes/PollRoute';

import { routeMappings } from '@core/baseServer/configs/RouteMappings';

config({ path: '.env' });

/*
Base Server

  --> initialize express app
  --> if primary 
      --> fork workers
  --> if worker
      --> initialize routes
      --> start service
      --> listen on default port
*/

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class BaseServer {
  name: string;
  private app: e.Application;
  private ip: string;
  private numOfCpus: number = os.cpus().length;

  private log: LogProvider;
  private timerMap: ITimerMap;

  private routes: any[] = [ new PollRoute(routeMappings.poll.name) ];

  constructor(
    name: string,
    private port?: number, 
    private version?: string,
    numOfCpus?: number
  ) {
    this.name = name;
    this.log = new LogProvider(this.name);
    this.log.initFileLogger(process.cwd());
    //  default values
    if (! port) this.port = 8000;
    if (! version) this.version = '0.1';
    if (numOfCpus) this.numOfCpus = numOfCpus;
  }

  getIp() {
    return this.ip;
  }

  setRoutes(routes: any[]) {
    this.routes = this.routes.concat(routes);
  }

  async run() {
    if (cluster.isMaster) {
      this.timerMap = {
        baseName: 'Base Server Timer',
        timerMap: {
          startService: {
            start: new Date(),
            stop: null,
            elapsedInMs: null
          }
        }
      }
    }

    try { 
      if (this.numOfCpus > 1) {
        if (cluster.isMaster) {
          await this.log.getFileSystem().writeLogToFile(`Welcome to ${this.name}, version ${this.version}, forking workers...`, this.name);

          this.ip = BaseServer.setIp(this.log);
          this.app = express();
          this.setUpWorkers();

          this.timerMap.timerMap.startService.stop = new Date();
          this.timerMap.timerMap.startService.elapsedInMs = elapsedTimeInMs(
            this.timerMap.timerMap.startService.start, 
            this.timerMap.timerMap.startService.stop
          );
        } else if (cluster.isWorker) {
          this.app = express();
          this.initApp();
          this.initRoutes();
          this.setUpServer();
        }
      } else if (this.numOfCpus === 1) {
        await this.log.getFileSystem().writeLogToFile(`Welcome to ${this.name}, version ${this.version}`, this.name);

        this.app = express();
        this.initApp();
        this.initRoutes();
        this.setUpServer();
      } else {
        throw new Error('Number of cpus must be greater than 1.');
      }
    } catch (err) {
      this.log.getFileSystem().error(JSON.stringify({ err }, null, 2));
      
      this.timerMap.timerMap.startService.stop = new Date();
      this.timerMap.timerMap.startService.elapsedInMs = elapsedTimeInMs(
        this.timerMap.timerMap.startService.start, 
        this.timerMap.timerMap.startService.stop
      );
      
      this.log.getFileSystem().debug(`Timer: ${this.timerMap.timerMap.startService.elapsedInMs}`);
      process.exit(1);
    }
  }

  private initApp() {
    this.ip = BaseServer.setIp(this.log);
    this.app.set('port', this.port);

    this.app.use(e.json());
    this.app.use(e.urlencoded({ extended: false }));
    this.app.use(cookieParser());
    this.app.use(e.static(path.join(__dirname, 'public')));
    this.app.use(compression());
    this.app.use(helmet());
  }

  private initRoutes() {
    for (const route of this.routes) {
      this.app.use(route.rootpath, route.router);
      this.log.getFileSystem().writeLogToFile(`Route: ${route.name} initialized on Worker ${process.pid}.`, this.name);
    }

    this.app.use( (req, res, next) => {
      next(createError(404));
    });

    this.app.use( (err, req, res, next) => {
      res.locals.message = err.message;
      res.locals.error = req.this.app.get('env') === 'development' ? err : {};
      
      res.status(err.status || 500).json({ error: err.message });
    });
  }

  private setUpServer() {
    this.app.listen(this.port, () => {
      this.log.getFileSystem().writeLogToFile(`Server ${process.pid} @${this.ip} listening on port ${this.port}...`, this.name);
    });
  }

  private setUpWorkers() {
    this.log.getFileSystem().writeLogToFile(`Server @${this.ip} setting up ${this.numOfCpus} CPUs as workers.\n`, this.name);

    for(let cpu = 0; cpu < this.numOfCpus; cpu++) {
      const fork = cluster.fork();
      fork.on('message', message => {
        this.log.getFileSystem().debug(message);
      });
    }

    cluster.on('online', worker => {
      this.log.getFileSystem().writeLogToFile(`Worker ${worker.process.pid} is online.`, this.name);
    });

    cluster.on('exit', (worker, code, signal) => {
      this.log.getFileSystem().error(`Worker ${worker.process.pid} died with code ${code} and ${signal}.`);
      this.log.getFileSystem().warn('Starting new worker...');

      const fork = cluster.fork()
      fork.on('message', message => {
        this.log.getFileSystem().writeLogToFile(message, this.name);
      });
    })
  }

  static setIp(log: LogProvider): string {
    try {
      return Object.keys(os.networkInterfaces()).map(key => {
        if (/(eth[0-9]{1}|enp[0-9]{1}s[0-9]{1})/.test(key)) {
          return os.networkInterfaces()[key][0].address;
        }
      }).filter(el => el)[0];
    } catch (err) {
      log.getFileSystem().error(`Unable to select network interface: ${err}`);
      process.exit(3);
    }
  }
}