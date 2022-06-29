import { ROUTE, STATUSOK, INFO } from '@core/models/ILog'
import { IBaseRoute } from '@core/baseServer/core/models/IRouteMappings'

export const eventDrivenLogRouteMapping: Record<string, IBaseRoute>= {
  store: {
    key: 'store',
    name: '/store',
    subRouteMapping: {
      countLogs: {
        key: 'countLogs',
        name: '/countlogs',
        customConsoleMessages: [
          {
            1: { 
              text: '/countlogs', 
              color: ROUTE 
            },
            2: { 
              text: '200', 
              color: STATUSOK 
            },
            3: { 
              text: 'log count retrieved', 
              color: INFO 
            }
          }
        ]
      },
      getAllLogs: {
        key: 'getAllLogs',
        name: '/getalllogs',
        customConsoleMessages: [
          {
            1: { 
              text: '/getalllogs', 
              color: ROUTE 
            },
            2: { 
              text: '200', 
              color: STATUSOK 
            },
            3: { 
              text: 'all event logs retrieved', 
              color: INFO 
            }
          }
        ]
      },
      getLatestLog: {
        key: 'getLatestLog',
        name: '/getlatestlog',
        customConsoleMessages: [
          {
            1: { 
              text: '/getlatestlog', 
              color: ROUTE 
            },
            2: { 
              text: '200', 
              color: STATUSOK 
            },
            3: { 
              text: 'latest log entry retrieved', 
              color: INFO 
            }
          }
        ]
      }
    }
  }
}