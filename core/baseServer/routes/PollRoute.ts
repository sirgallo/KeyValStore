import { Request, Response, NextFunction } from 'express';
import { LogProvider } from '@core/providers/LogProvider';
import { BaseRoute } from '@core/baseServer/core/BaseRoute';

import { routeMappings } from '@core/baseServer/configs/RouteMappings';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

/*
  Basic Health Check endpoint
  |
  ---> return response if alive
*/

const NAME = 'Poll Route'

export class PollRoute extends BaseRoute {
  name = NAME;
  private log: LogProvider = new LogProvider(NAME);
  constructor(rootpath: string) {
    super(rootpath);
    this.router.get(routeMappings.poll.subRouteMapping.root.name, this.poll.bind(this));
  }

  poll(req: Request, res: Response, next: NextFunction) {
    this.log.custom(routeMappings.poll.subRouteMapping.root.customConsoleMessages[0], true);
    res
      .status(200)
      .send({ alive: 'okay' });
  }

  async validateRoute(req: Request, res: Response, next: NextFunction): Promise<boolean> {
    return true;
  }

  async performRouteAction(opts, req: Request, res: Response, next: NextFunction) {
    return true;
  }
}