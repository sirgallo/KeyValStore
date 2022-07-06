# Middleware and API creation

the `core` module imports a submodule called `baseServer`, which includes all of the necessary components to scaffold a new API, built on top of `express 4`.

## Base Server

The Base Server can operate in both single cpu mode or cluster mode, but in situations where memory state needs to be preserved the system should be run in single cpu mode since node.js does not have a shared memory model. However, in most situations the single thread should be performant under situations with high `I/O` activity, since node.js is just an event loop.

Every Base server ships with a `/poll` route, which can be used as an optional healthcheck route. The system can be configured by creating a configuration of the following structure:

```ts
  export type ServerConfiguration<T> = {
    [ K in keyof T ]: IServerConfiguration
  }

  export interface IServerConfiguration {
    port: number;
    name: string;
    numOfCpus: number;
    version: string;
  }
```

This can be representative of multiple different services in a microarchitecture environment.

The Base Server can be extended, as such:

```ts
  import { BaseServer } from '@core/baseServer/core/BaseServer';

  export class InitBaseServer extends BaseServer {
    startServer() {
      //  Any additional providers can be placed here
      //  Or in a top level driver that imports BaseServer
      this.run();
    }
  }
```

Any additional middleware, including additional routes, auth guards, or sockets, can be added, and then the `run()` method starts the underlying server component.


## Base Route

Every route in a service should follow the following formula. The following interface is a simplification of the underlying abstract class used.

```ts
  import { 
    Response, Router, Request, NextFunction 
  } from 'express';

  export interface BaseRoute {
    name: string;
    router: Router;
    rootpath: string;
    pipeRequest(opts: RouteOpts, req: Request, res: Response, next: NextFunction, ...params);

    validateRoute(req: Request, res: Response, next: NextFunction): Promise<boolean>;
    performRouteAction(opts: RouteOpts, req: Request, res: Response, next: NextFunction, ...params);
  }
```

`pipeRequest`

--> acts as a pipeline for incoming requests to the route

```ts
  async pipeRequest(opts: RouteOpts, req: Request, res: Response, next: NextFunction, ...params): Promise<boolean> {
    const validated = await this.validateRoute(req, res, next);
    if (validated) { 
      await this.performRouteAction(opts, req, res, next, ...params);
      return true;
    }

    return false;
  }
```

`validateRoute`

--> needs to be implemented, but validates the incoming request object, returning true if the request if valid and false otherwise

`performRouteAction`

--> needs to be implemented, but performs the associated method on the service provider for the given route and request


## MQProvider

The MQProvider provides a simple way to sequentially order messages/tasks from asynchronous requests but creating a simple queue. The queue has `O(1)` push and pop and follows `first in/first out` principal. The MQProvider can be found in `core/providers` and is instantiated before the routes in the middleware. This way, the MQ can be passed to each route, and each route shares the same queue instance. Great for job distribution tasks as well.