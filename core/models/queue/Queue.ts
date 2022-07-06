import { ILinkedNode, HashString } from '@core/models/infrastructure/IMq';

export type SimpleQueue = Record<HashString, ILinkedNode>;
export type LinkedNodeData = Pick<ILinkedNode, 'value' | 'timestamp'>

export interface SimpleQueueMethods {
  enqueue(insertValue: any): void;
  dequeue(): any;
  peek(): LinkedNodeData;
  all(): SimpleQueue; 
}