import { InitKeyValStoreService } from '@keyValStore/InitKeyValStoreService';
import { serverConfiguration } from '../ServerConfigurations';

const server = new InitKeyValStoreService(
  serverConfiguration.keyValStore.name,
  serverConfiguration.keyValStore.port,
  serverConfiguration.keyValStore.version,
  serverConfiguration.keyValStore.numOfCpus
);

try {
  server.startServer();
} catch (err) { console.log(err); }