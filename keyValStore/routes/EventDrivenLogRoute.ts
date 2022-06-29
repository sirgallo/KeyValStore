import { Request, Response, NextFunction } from 'express';

import { BaseRoute, RouteOpts } from '@core/baseServer/core/BaseRoute';
import { LogProvider } from '@core/providers/LogProvider';
import { KeyValStoreProvider } from '@core/providers/store/KeyValStoreProvider';
import { extractErrorMessage } from '@core/utils/Utils';

import { eventDrivenLogRouteMapping } from '@keyValStore/configs/EventDrivenLogRouteMapping';
import { EventDrivenLog } from '@core/providers/queue/EventDrivenLog';

const NAME = 'Event Driven Log Route';

export class EventDrivenLogRoute extends BaseRoute {
  private log: LogProvider = new LogProvider(NAME);

  constructor(rootpath: string, private eventLog: EventDrivenLog) {
    super(rootpath);
    this.log.initFileLogger();

    this.router.post(eventDrivenLogRouteMapping.store.subRouteMapping.getAllLogs.name, this.getAllLogs.bind(this));
    this.router.post(eventDrivenLogRouteMapping.store.subRouteMapping.getLatestLog.name, this.getLatestLog.bind(this));
  }

  private async getAllLogs(req: Request, res: Response, next: NextFunction) {
    await this.pipeRequest(
      { method: eventDrivenLogRouteMapping.store.subRouteMapping.getAllLogs.key, customMsg: eventDrivenLogRouteMapping.store.subRouteMapping.getAllLogs }, 
      req, res, next
    );
  }

  private async getLatestLog(req: Request, res: Response, next: NextFunction) {
    await this.pipeRequest(
      { method: eventDrivenLogRouteMapping.store.subRouteMapping.getLatestLog.key, customMsg: eventDrivenLogRouteMapping.store.subRouteMapping.getLatestLog }, 
      req, res, next
    );
  }

  async validateRoute(req: Request, res: Response, next: NextFunction): Promise<boolean> {
    return true;
  }

  async performRouteAction(opts: RouteOpts, req: Request, res: Response, next: NextFunction, ...params) {
    try {
      const resp = await this.eventLog[opts.method](...params);
      this.log.custom(opts.customMsg.customConsoleMessages[0], true);

      res
        .status(200)
        .send({ status: 'success', resp })
    } catch (err) {
      res
        .status(404)
        .send({ err: extractErrorMessage(err as Error) })
    }
  }
}