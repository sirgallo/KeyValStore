import { EventEmitter } from 'events';
import { randomBytes } from 'crypto';

import { LogProvider } from '@core/providers/LogProvider';
import { MirLinkedNode } from '@core/models/queue/MirQueue';
import { 
  LinkedNodeData, 
  SimpleQueue
} from '@core/models/queue/Queue';
import { encrypt, decrypt } from '@core/utils/Encryption';
import Base256 from 'base256-encoding';

const encodeBase256 = async (inputdata: string): Promise<string> => {
  //const Base256 = (await import('base256-encoding')).default;
  console.log('here? Input data:', inputdata);
  const encodedArr = new TextEncoder().encode(inputdata);
  const encoded256 = Base256.encode(encodedArr);
  console.log('encoded', encoded256);

  return encoded256;
}

const decodeBase256 = async (inputdata: string): Promise<string> => {
  //const Base256 = (await import('base256-encoding')).default;
  const decoded256 = Base256.decodeStr(inputdata);
  console.log('decoded', decoded256);

  return decoded256;
}

const NAME = 'Mir Queue Provider';

const MAX_256_BIT = 99999999999999999999999999999999n;
const BYTES_32 = 32;

export class MirQueueProvider  {
  eventName: string;
  queueUpdate = new EventEmitter();
  length: bigint = BigInt(0);

  private headNode: MirLinkedNode;
  private iv: Buffer;

  private queueLog: LogProvider = new LogProvider(NAME);
  
  constructor(
    eventName: string, 
    private key: Buffer = randomBytes(BYTES_32)
  ) { this.eventName = eventName; }

  async insert(insertValue: any) {
    try {
      const timestamp = new Date();
      
      if (! this.headNode) {
        this.headNode = {
          id: this.length.toString(),
          next: null,
          value: insertValue,
          timestamp,
          authTag: null
        }
      } else {
        //  const 
        const { authTag, encryptedString } = encrypt(this.headNode, this.key, this.iv);
        const encoded256 = await encodeBase256(encryptedString);
        this.headNode = {
          id: this.length.toString(),
          next: encoded256,
          value: insertValue,
          timestamp,
          authTag: authTag
        }
      }

      ++this.length;
      
      this.updateInitVector();
      this.emitEvent();
    } catch (err) {
      this.queueLog.error('Issue pushing headNode on to queue');
      throw err;
    }
  }

  peekTop(): LinkedNodeData {
    try {
      return { value: this.headNode, timestamp: this.headNode?.timestamp } || null;
    } catch (err) {
      this.queueLog.error('Unable to peek first headNode in queue.');
      throw err;
    }
  }

  async unwindEvents(): Promise<SimpleQueue> {
    const unwind = async (headElem: MirLinkedNode, accList: SimpleQueue) => {
      if (headElem.next === null) { 
        accList[headElem.id] = headElem;
        return accList;
      }
      else {
        const decoded = await decodeBase256(headElem.next);
        headElem.next = decoded;
        accList[headElem.id] = headElem;
        const nextElem = JSON.parse(decrypt(decoded, this.key, this.generateInitVector(headElem.id), headElem.authTag));
    
        return await unwind(nextElem, accList);
      }
    }

    const allEvents = await unwind(this.headNode, {});

    return allEvents;
  }

  emitEvent(...args) {
    this.queueUpdate.emit(this.eventName, ...args);
  }

  private updateInitVector() {
    if (this.length < MAX_256_BIT) {
      const lengthAsString = this.length.toString()
      this.iv = this.generateInitVector(lengthAsString);
    } else {
      console.log('max init vector reached');
    }
  }

  private generateInitVector(valAsString: string) {
    const initVec = Buffer.from(`${ '0'.repeat(BYTES_32 - valAsString.length) }${valAsString}`);
    return initVec;
  }
}