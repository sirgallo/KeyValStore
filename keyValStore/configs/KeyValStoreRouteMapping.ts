import { ROUTE, STATUSOK, INFO } from '@core/models/ILog'
import { IBaseRoute } from '@core/baseServer/core/models/IRouteMappings'

export const keyValStoreRouteMapping: Record<string, IBaseRoute>= {
  store: {
    name: '/store',
    subRouteMapping: {
      get: {
        name: '/get',
        customConsoleMessages: [
          {
            1: { 
              text: '/get', 
              color: ROUTE 
            },
            2: { 
              text: '200', 
              color: STATUSOK 
            },
            3: { 
              text: 'value retrieved successfully for given key', 
              color: INFO 
            }
          }
        ]
      },
      set: {
        name: '/set',
        customConsoleMessages: [
          {
            1: { 
              text: '/set', 
              color: ROUTE 
            },
            2: { 
              text: '200', 
              color: STATUSOK 
            },
            3: { 
              text: 'value set for given key', 
              color: INFO 
            }
          }
        ]
      },
      delete: {
        name: '/delete',
        customConsoleMessages: [
          {
            1: { 
              text: '/delete', 
              color: ROUTE 
            },
            2: { 
              text: '200', 
              color: STATUSOK 
            },
            3: { 
              text: 'value for given key removed', 
              color: INFO 
            }
          }
        ]
      },
      current: {
        name: '/current',
        customConsoleMessages: [
          {
            1: { 
              text: '/current', 
              color: ROUTE 
            },
            2: { 
              text: '200', 
              color: STATUSOK 
            },
            3: { 
              text: 'current store retrieved', 
              color: INFO 
            }
          }
        ]
      },
      flush: {
        name: '/flush',
        customConsoleMessages: [
          {
            1: { 
              text: '/flush', 
              color: ROUTE 
            },
            2: { 
              text: '200', 
              color: STATUSOK 
            },
            3: { 
              text: 'store flushed', 
              color: INFO 
            }
          }
        ]
      }
    }
  }
}