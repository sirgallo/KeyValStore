import { cloneDeep, mergeWith, isArray } from 'lodash';

import { memo, mergeDeep, wrapAsync } from '@core/utils/Utils';
import { 
  KeyValStore, 
  KeyValStoreEntry, 
  KeyValStoreEntryOpts 
} from '@core/models/store/KeyValStore';
import { LogProvider } from '@core/providers/LogProvider';

const NAME = 'Key Value Store Provider';

export class KeyValStoreProvider {
  private store: KeyValStore = {
    store: {},
    version: 0
  };

  private keyValStoreLog: LogProvider = new LogProvider(NAME);

  constructor() {}

  async get(topic: string, keys: string[]): Promise<KeyValStoreEntry[]> {
    return wrapAsync(this.multiValReducer.bind(this), topic, keys) as Promise<KeyValStoreEntry[]>;
  }

  async set(opts: KeyValStoreEntryOpts): Promise<KeyValStore> {
    const setHelper = (opts: KeyValStoreEntryOpts) => {
      if (! memo(this.store.store, opts.entry)) {
        this.store.store = mergeWith(this.store.store, opts.entry, (obj, src) => { 
          if(isArray(obj)) return obj.concat(src) 
        });
  
        this.store.version++;
  
        return opts.entry || null;
      } else {
        console.log('memoized')
      }
    }
  
    return wrapAsync(setHelper, opts) as Promise<KeyValStore>;
  }

  async delete(topic: string, keys: string[]): Promise<KeyValStoreEntry[]> {
    return wrapAsync(this.multiValReducer.bind(this), topic, keys, true) as Promise<KeyValStoreEntry[]>;
  }

  async current(topic?: string): Promise<KeyValStore> {
    const curHelper = (topic?: string) => {
      return topic ? { store: { [topic]: this.store.store[topic] }, version: this.store.version } : this.store;
    }

    return wrapAsync(curHelper, topic) as Promise<KeyValStore>;
  }

  async flush(topic?: string): Promise<boolean> {
    const flushHelper = (topic?: string) => topic ? this.store.store[topic] = {} : this.store.store = {};
    await wrapAsync(flushHelper, topic);

    return true;
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