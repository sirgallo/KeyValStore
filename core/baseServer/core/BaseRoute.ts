import { 
  Response, Router, 
  Request, NextFunction 
} from 'express';

/*
  All routes need to extend this class
*/

export interface RouteOpts {
  method: string;
  customMsg: any;
}


export abstract class BaseRoute {
  protected router: Router;
  protected name: string;
  protected rootpath: string;
  
  constructor(rootpath: string) {
    this.rootpath = rootpath;
    this.router = Router();
  }

  abstract performRouteAction(opts: RouteOpts, req: Request, res: Response, next: NextFunction, ...params);
}