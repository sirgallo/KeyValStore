import { Request, Response, NextFunction } from 'express';

import { BaseRoute } from '@core/baseServer/core/BaseRoute';
import { LogProvider } from '@core/providers/LogProvider';
import { KeyValStoreProvider } from '@core/providers/store/KeyValStoreProvider';

import { keyValStoreRouteMapping } from '@keyValStore/configs/KeyValStoreRouteMapping';
import { 
  KeyValStoreGetRequest,
  KeyValStoreSetRequest
} from '@keyValStore/models/KeyValStoreRequest';
import { KeyValStore, KeyValStoreEntry } from '@core/models/store/KeyValStore';

const NAME = 'Key Value Store Route';

export class KeyValStoreRoute extends BaseRoute {
  name = NAME;
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

    console.log('get request', getReq);
    this.keyValStoreProv.printStore();

    try {
      const resp: KeyValStoreEntry = await this.keyValStoreProv.get(getReq.findKey);
      this.log.custom(keyValStoreRouteMapping.store.subRouteMapping.get.customConsoleMessages[0], true);

      res
        .status(200)
        .send({ status: 'Get Success', resp })
    } catch (err) {
      res
        .status(404)
        .send({ err: err.toString(), message: 'Error in Get Route' })
    }
  }

  async set(req: Request, res: Response, next: NextFunction) {
    const setReq: KeyValStoreSetRequest = req.body;

    console.log('set request', setReq);

    try {
      const resp: KeyValStoreEntry = await this.keyValStoreProv.set(setReq.setOpts);

      console.log('set resp', resp);
      this.keyValStoreProv.printStore();

      this.log.custom(keyValStoreRouteMapping.store.subRouteMapping.set.customConsoleMessages[0], true);

      res
        .status(200)
        .send({ status: 'Set Success', resp })
    } catch (err) {
      res
        .status(404)
        .send({ err: err.toString(), message: 'Error in Set Route' })
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const deleteReq: KeyValStoreGetRequest = req.body
    try {
      await this.keyValStoreProv.delete(deleteReq.findKey);
      this.log.custom(keyValStoreRouteMapping.store.subRouteMapping.delete.customConsoleMessages[0], true);

      this.keyValStoreProv.printStore();

      res
        .status(200)
        .send({ status: 'Delete Success', resp: `key-value with key ${deleteReq.findKey} deleted.` })
    } catch (err) {
      res
        .status(404)
        .send({ err: err.toString(), message: 'Error in Delete Route' })
    }
  }

  async current(req: Request, res: Response, next: NextFunction) {
    try {
      const resp: KeyValStore = await this.keyValStoreProv.current();
      this.log.custom(keyValStoreRouteMapping.store.subRouteMapping.delete.customConsoleMessages[0], true);

      console.log(JSON.stringify(resp, null, 2));

      res
        .status(200)
        .send({ status: 'Current Success', resp })
    } catch (err) {
      res
        .status(404)
        .send({ err: err.toString(), message: 'Error Fetching Current Store' })
    }
  }

  async flush(req: Request, res: Response, next: NextFunction) {
    try {
      await this.keyValStoreProv.flush()
      this.log.custom(keyValStoreRouteMapping.store.subRouteMapping.flush.customConsoleMessages[0], true);

      this.keyValStoreProv.printStore();

      res
        .status(200)
        .send({ status: 'Flush Success', resp: true })
    } catch (err) {
      res
        .status(404)
        .send({ err: err.toString(), message: 'Error in Flush Route' })
    }
  }
}