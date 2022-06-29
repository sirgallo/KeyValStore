export interface IMqOpts {
  domain: string;
  port: string;
  topic: string;
}

export interface IInternalJobQueueMessage {
  jobId: string;
  header: string;
  body: ISockRequest;
}

export interface ISockRequest {
  message: any;
}

export interface IInternalLivelinessResponse {
  node: string;
  job: string;
  message: any;
  status: MachineStatus;
  lifeCycle?: LifeCycle;
}

export interface IAvailableMachine {
  status: MachineStatus;
  validated: Date;
  heartbeat: (machineId: string, machineType?: MachineTypes) => Promise<void>;
  connAttempts: number;
}

export interface IHeartBeat {
  routerId: string;
  healthy: Liveliness;
  status: MachineStatus;
}

export interface ILinkedNode {
  id: HashString;
  next: HashString;
  value: NodeValue;
  timestamp: Date;
}

export type HashString = string;
export type NodeValue = any;
export type Liveliness = 'Alive' | 'Dead';
export type MachineTypes = 'Client' | 'Worker' | 'Replica';
export type MachineStatus = 'Ready' | 'Busy';
export type LifeCycle = 'Not Started' | 'In Queue' | 'In Progress' | 'Finished' | 'Failed';