export interface IGenericJob {
  execute(argument: any): Promise<any>;
}