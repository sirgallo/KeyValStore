import { 
  Response, Router, Request, NextFunction 
} from 'express';

/*
  All routes need to extend this class
*/

export interface RouteOpts {
  method: string;
  customMsg: any;
}


export abstract class BaseRoute {
  protected name: string;
  protected router: Router;
  protected rootpath: string;
  
  constructor(rootpath: string) {
    this.rootpath = rootpath;
    this.router = Router();
  }

  protected async pipeRequest(opts: RouteOpts, req: Request, res: Response, next: NextFunction, ...params): Promise<boolean> {
    const validated = await this.validateRoute(req, res, next);
    if (validated) { 
      await this.performRouteAction(opts, req, res, next, ...params);
      return true;
    }

    return false;
  }

  abstract validateRoute(req: Request, res: Response, next: NextFunction): Promise<boolean>;
  abstract performRouteAction(opts: RouteOpts, req: Request, res: Response, next: NextFunction, ...params);
}