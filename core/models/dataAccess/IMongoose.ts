export interface IMongoCredentials {
  host: string;
  port: number;
  db?: string;
  user?: string;
  password?: string;
}