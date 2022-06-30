import { randomUUID } from 'crypto';
import { Router } from 'zeromq';

import { cryptoOptions } from '@core/crypto/CryptoOptions';
import { EventDrivenLogProvider } from '@core/providers/queue/EventDrivenLogProvider';
import { KeyValStoreProvider } from '@core/providers/store/KeyValStoreProvider';

import { SessionMap } from '@core/models/replication/Gossip';
import { IAvailableMachine } from '@core/models/infrastructure/IMq';

export class GossipProtocolProvider {
  private client = new Router();
  private replicate = new Router();

  private bucket: SessionMap = {};
  private connectedPeers: Record<string, IAvailableMachine> = {};
  private knownPeersSet: Set<string> = new Set();

  private knownPeerCount: number = 0;

  constructor(
    private eventLog: EventDrivenLogProvider,
    private keyValProv: KeyValStoreProvider,
    private numOfReplicas: number,
    private clientPort: number = 9875,
    private repPort: number = 9876,
    private protocol: string = 'tcp',
    private systemUUID: string = randomUUID(cryptoOptions)
  ) {}

  async start() {
    this.client.routingId = this.systemUUID;
    this.replicate.routingId = this.systemUUID;
    this.intializeBucket();
    this.initializeRandomPeers();
  }

  async runSocket() {

  }

  intializeBucket() {
    this.bucket = {
      [this.systemUUID]: this.eventLog.getInternalQueueRef()
    }
  }

  initializeRandomPeers() {

  }
 
  broadcast() {}
}