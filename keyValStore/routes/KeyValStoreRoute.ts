import { Request, Response, NextFunction } from 'express';

import { BaseRoute, RouteOpts } from '@core/baseServer/core/BaseRoute';
import { LogProvider } from '@core/providers/LogProvider';
import { KeyValStoreProvider } from '@core/providers/store/KeyValStoreProvider';

import { keyValStoreRouteMapping } from '@keyValStore/configs/KeyValStoreRouteMapping';
import { 
  KeyValStoreGetRequest,
  KeyValStoreSetRequest,
  KeyValStoreTopicRequest
} from '@keyValStore/models/KeyValStoreRequest';

const NAME = 'Key Value Store Route';

export class KeyValStoreRoute extends BaseRoute {
  private log: LogProvider = new LogProvider(NAME);

  constructor(rootpath: string, private keyValStoreProv: KeyValStoreProvider) {
    super(rootpath);
    this.log.initFileLogger();

    this.router.post(keyValStoreRouteMapping.store.subRouteMapping.get.name, this.get.bind(this));
    this.router.post(keyValStoreRouteMapping.store.subRouteMapping.set.name, this.set.bind(this));
    this.router.post(keyValStoreRouteMapping.store.subRouteMapping.delete.name, this.delete.bind(this));
    this.router.post(keyValStoreRouteMapping.store.subRouteMapping.current.name, this.current.bind(this));
    this.router.post(keyValStoreRouteMapping.store.subRouteMapping.flush.name, this.flush.bind(this));
  }

  async get(req: Request, res: Response, next: NextFunction) {
    const getReq: KeyValStoreGetRequest = req.body;
    await this.performRouteAction({ method: 'get', customMsg: keyValStoreRouteMapping.store.subRouteMapping.get }, req, res, next, getReq.topic, getReq.findKey);
  }

  async set(req: Request, res: Response, next: NextFunction) {
    const setReq: KeyValStoreSetRequest = req.body;
    await this.performRouteAction({ method: 'set', customMsg: keyValStoreRouteMapping.store.subRouteMapping.set }, req, res, next, setReq.setOpts);
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const deleteReq: KeyValStoreGetRequest = req.body;
    await this.performRouteAction({ method: 'delete', customMsg: keyValStoreRouteMapping.store.subRouteMapping.delete }, req, res, next, deleteReq.topic, deleteReq.findKey);
  }

  async current(req: Request, res: Response, next: NextFunction) {
    const topicReq: KeyValStoreTopicRequest | null = req.body || null;
    await this.performRouteAction({ method: 'current', customMsg: keyValStoreRouteMapping.store.subRouteMapping.current }, req, res, next, topicReq?.topic);
  }

  async flush(req: Request, res: Response, next: NextFunction) {
    const topicReq: KeyValStoreTopicRequest | null = req.body || null;
    await this.performRouteAction({ method: 'flush', customMsg: keyValStoreRouteMapping.store.subRouteMapping.flush }, req, res, next, topicReq?.topic);
  }

  async validateRoute(req: Request, res: Response, next: NextFunction): Promise<boolean> {
    return true;
  }

  async performRouteAction(opts: RouteOpts, req: Request, res: Response, next: NextFunction, ...params) {
    try {
      const resp = await this.keyValStoreProv[opts.method](...params);
      this.log.custom(opts.customMsg.customConsoleMessages[0], true);

      res
        .status(200)
        .send({ status: 'success', resp })
    } catch (err) {
      res
        .status(404)
        .send({ err: err.toString() })
    }
  }
}