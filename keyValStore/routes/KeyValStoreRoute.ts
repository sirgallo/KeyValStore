import { Request, Response, NextFunction } from 'express';

import { BaseRoute, RouteOpts } from '@core/baseServer/core/BaseRoute';
import { LogProvider } from '@core/providers/LogProvider';
import { KeyValStoreProvider } from '@core/providers/store/KeyValStoreProvider';
import { extractErrorMessage } from '@core/utils/Utils';

import { keyValStoreRouteMapping } from '@keyValStore/configs/KeyValStoreRouteMapping';
import { 
  KeyValStoreEntryOpts,
  KeyValStoreGetRequest,
  KeyValStoreTopicRequest
} from '@core/models/store/KeyValStore';
import { EventDrivenLogProvider } from '@core/providers/queue/EventDrivenLogProvider';

const NAME = 'Key Value Store Route';

export class KeyValStoreRoute extends BaseRoute {
  name = NAME;
  
  private log: LogProvider = new LogProvider(NAME);

  constructor(rootpath: string, private keyValStoreProv: KeyValStoreProvider, private eventLog: EventDrivenLogProvider) {
    super(rootpath);
    this.log.initFileLogger();

    this.router.post(keyValStoreRouteMapping.store.subRouteMapping.get.name, this.get.bind(this));
    this.router.post(keyValStoreRouteMapping.store.subRouteMapping.set.name, this.set.bind(this));
    this.router.post(keyValStoreRouteMapping.store.subRouteMapping.delete.name, this.delete.bind(this));
    this.router.post(keyValStoreRouteMapping.store.subRouteMapping.current.name, this.current.bind(this));
    this.router.post(keyValStoreRouteMapping.store.subRouteMapping.flush.name, this.flush.bind(this));
  }

  private async get(req: Request, res: Response, next: NextFunction) {
    const getReq: KeyValStoreGetRequest = req.body;
    await this.pipeRequest(
      { method: keyValStoreRouteMapping.store.subRouteMapping.get.key, customMsg: keyValStoreRouteMapping.store.subRouteMapping.get }, 
      req, res, next, 
      getReq
    );
  }

  private async set(req: Request, res: Response, next: NextFunction) {
    const setReq: KeyValStoreEntryOpts = req.body;
    await this.pipeRequest(
      { method: keyValStoreRouteMapping.store.subRouteMapping.set.key, customMsg: keyValStoreRouteMapping.store.subRouteMapping.set }, 
      req, res, next, 
      setReq
    );
  }

  private async delete(req: Request, res: Response, next: NextFunction) {
    const deleteReq: KeyValStoreGetRequest = req.body;
    await this.pipeRequest(
      { method: keyValStoreRouteMapping.store.subRouteMapping.delete.key, customMsg: keyValStoreRouteMapping.store.subRouteMapping.delete }, 
      req, res, next, 
      deleteReq
    );
  }

  private async current(req: Request, res: Response, next: NextFunction) {
    const topicReq: KeyValStoreTopicRequest | null = req.body || null;
    await this.pipeRequest(
      { method: keyValStoreRouteMapping.store.subRouteMapping.current.key, customMsg: keyValStoreRouteMapping.store.subRouteMapping.current }, 
      req, res, next, 
      topicReq
    );
  }

  private async flush(req: Request, res: Response, next: NextFunction) {
    const topicReq: KeyValStoreTopicRequest | null = req.body || null;
    await this.pipeRequest(
      { method: keyValStoreRouteMapping.store.subRouteMapping.flush.key, customMsg: keyValStoreRouteMapping.store.subRouteMapping.flush }, 
      req, res, next, 
      topicReq
    );
  }

  async validateRoute(req: Request, res: Response, next: NextFunction): Promise<boolean> {
    return true;
  }

  async performRouteAction(opts: RouteOpts, req: Request, res: Response, next: NextFunction, ...params) {
    try {
      const resp = await this.keyValStoreProv[opts.method](...params);
      this.log.custom(opts.customMsg.customConsoleMessages[0], true);

      this.eventLog.addLog({
        provider: 'Key Value Store Provider',
        method: opts.method,
        event: resp || null
      });

      res
        .status(200)
        .send({ status: 'success', resp });
    } catch (err) {
      res
        .status(404)
        .send({ err: extractErrorMessage(err as Error) });
    }
  }
}