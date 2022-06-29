import {
  ICustomMessage,
  CustomMessage
} from '@core/models/ILog';

export interface IBaseRoute {
  key: string;
  name: string;
  subRouteMapping?: subRouteMapping;
}

interface ISubRouteMap {
  key: string;
  name: string;
  customConsoleMessages?: CustomMessage<Record<string, ICustomMessage<Function>>>[];
}

type subRouteMapping = Record<string, ISubRouteMap>;