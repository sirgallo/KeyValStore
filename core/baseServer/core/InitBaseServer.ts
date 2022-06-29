import { BaseServer } from '@core/baseServer/core/BaseServer';

/*
  BaseServer is built to be extended

  Add a socket server on top? 
  Add additional providers?

  Up to you
*/
export class InitBaseServer extends BaseServer {
  startServer() {
    //  Any additional providers can be placed here
    //  Or in a top level driver that imports BaseServer
    this.run();
  }
}