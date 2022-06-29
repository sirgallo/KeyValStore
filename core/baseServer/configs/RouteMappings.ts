import { ROUTE, STATUSOK, INFO } from '@core/models/ILog';
import { IBaseRoute } from '@core/baseServer/core/models/IRouteMappings';

/*
  Global Route Mapping

  Single Source of truth for all routes, with all subRoutes and custom Logs defined here

  Can have multiple routeMappings per project

  Base project will always have a poll route for health checks
*/
export const routeMappings: Record<string, IBaseRoute>= {
  poll: {
    name: "/poll",
    subRouteMapping: {
      root: {
        name: "/",
        customConsoleMessages: [
          {
            1: { 
              text: '/poll', 
              color: ROUTE 
            },
            2: { 
              text: '200', 
              color: STATUSOK 
            },
            3: { 
              text: 'Healthcheck success...', 
              color: INFO 
            }
          }
        ]
      }
    }
  }
}