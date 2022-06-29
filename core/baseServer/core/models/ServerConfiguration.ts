export type ServerConfiguration<T> = {
  [ K in keyof T ]: IServerConfiguration
}

export interface IServerConfiguration {
  port: number;
  name: string;
  numOfCpus: number;
  version: string;
}