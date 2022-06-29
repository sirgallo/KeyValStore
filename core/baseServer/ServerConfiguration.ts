import { 
  ServerConfiguration,
  IServerConfiguration
} from '@core/baseServer/core/models/ServerConfiguration';

export const serverConfiguration: ServerConfiguration<Record<string, IServerConfiguration>> = {
  baseServer: {
    port: 7890,
    name: 'Base Server',
    numOfCpus: 1,
    version: '0.1'
  }
}