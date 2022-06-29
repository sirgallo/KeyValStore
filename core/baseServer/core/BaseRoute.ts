import { Router } from 'express';

/*
  All routes need to extend this class
*/

export class BaseRoute {
  router: Router;
  name: string;
  rootpath: string;
  constructor(rootpath: string) {
    this.rootpath = rootpath;
    this.router = Router();
  }

  async authenticate() {}
}