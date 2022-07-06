import lodash from 'lodash';
const { mergeWith, isArray } = lodash;

import { memo, wrapAsync } from '@core/utils/Utils';
import { 
  KeyValStore, 
  KeyValStoreEntry, 
  KeyValStoreEntryOpts,
  KeyValStoreGetRequest,
  KeyValEndpoints,
  KeyValStoreTopicRequest
} from '@core/models/store/KeyValStore';
import { LogProvider } from '@core/providers/LogProvider';

const NAME = 'Key Value Store Provider';

export class KeyValStoreProvider implements KeyValEndpoints {
  private store: KeyValStore = {
    store: {},
    topics: {},
    version: 0
  };

  private keyValStoreLog: LogProvider = new LogProvider(NAME);

  constructor() {}

  async get(opts: KeyValStoreGetRequest): Promise<KeyValStoreEntry[]> {
    return wrapAsync(this.multiValReducer.bind(this), opts.topic, opts.findKey) as Promise<KeyValStoreEntry[]>;
  }

  async set(opts: KeyValStoreEntryOpts): Promise<KeyValStore> {
    const customMerge = (obj: any, src: any) => { if (isArray(obj)) return obj.concat(src); }
    const setHelper = (opts: KeyValStoreEntryOpts) => {
      if (! memo(this.store.store, opts.entry)) {
        this.store.store = mergeWith(this.store.store, opts.entry, customMerge);
        this.store.version++;
  
        return opts.entry || null;
      }
    }
  
    return wrapAsync(setHelper, opts) as Promise<KeyValStore>;
  }

  async delete(opts: KeyValStoreGetRequest): Promise<KeyValStoreEntry[]> {
    return wrapAsync(this.multiValReducer.bind(this), opts.topic, opts.findKey, true) as Promise<KeyValStoreEntry[]>;
  }

  async current(opts: KeyValStoreTopicRequest): Promise<KeyValStore> {
    const curHelper = (topic?: string) => {
      return topic 
        ? { 
          store: { [topic]: this.store.store[topic] }, 
          topic: this.store.topics[topic], 
          version: this.store.version 
        } 
        : this.store;
    }

    return wrapAsync(curHelper, opts.topic) as Promise<KeyValStore>;
  }

  async flush(opts: KeyValStoreTopicRequest): Promise<boolean> {
    const flushHelper = (topic?: string) => topic ? this.store.store[topic] = {} : this.store.store = {};
    await wrapAsync(flushHelper, opts.topic);

    return true;
  }

  private validateSchemaType(incomingEntry: any): boolean {
    return false;
  }

  private multiValReducer(topic: string, keys: string[], del?: boolean): KeyValStoreEntry[] {
    return keys.reduce( (acc: KeyValStoreEntry[], key: string) => { 
      if (this.store?.store?.[topic]?.[key]) {
        const val = this.store.store[topic][key];
        if (del) delete this.store.store[topic][key];
        
        return acc.concat({ [key]: val });
      };

      return acc;
    }, []);
  }
}