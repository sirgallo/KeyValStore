import { 
  ServerConfiguration,
  IServerConfiguration
} from '@core/baseServer/core/models/ServerConfiguration';

export const serverConfiguration: ServerConfiguration<Record<string, IServerConfiguration>> = {
  keyValStore: {
    port: 9876,
    name: 'Key Value Store API',
    numOfCpus: 3,
    version: '0.0.1-dev'
  }
}