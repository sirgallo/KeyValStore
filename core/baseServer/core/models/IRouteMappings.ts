import {
  ICustomMessage,
  CustomMessage
} from '@core/models/ILog';

export interface IBaseRoute {
  name: string;
  subRouteMapping?: subRouteMapping;
}

interface ISubRouteMap {
  name: string;
  customConsoleMessages?: CustomMessage<Record<string, ICustomMessage<Function>>>[];
}

type subRouteMapping = Record<string, ISubRouteMap>;