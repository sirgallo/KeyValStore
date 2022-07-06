import { ILinkedNode, HashString } from '@core/models/infrastructure/IMq';

export interface MirLinkedNode extends ILinkedNode {
  authTag: string;
}