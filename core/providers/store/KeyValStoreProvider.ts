import { wrapAsync } from '@core/utils/Utils';
import { 
  KeyValStore, 
  KeyValStoreEntry, 
  KeyValStoreEntryOpts 
} from '@core/models/store/KeyValStore';
import { LogProvider } from '@core/providers/LogProvider';

const NAME = 'Key Value Store Provider';

export class KeyValStoreProvider {
  private store: KeyValStore = {};
  private keyValStoreLog: LogProvider = new LogProvider(NAME);

  constructor() {}
  
  async get(topic: string, key: string): Promise<KeyValStoreEntry> {
    const getHelper = (topic: string, key: string) => this.store[topic][key];
    return await wrapAsync(getHelper, topic, key) as KeyValStoreEntry;
  }

  async set(opts: KeyValStoreEntryOpts): Promise<KeyValStore> {
    const setHelper = (opts: KeyValStoreEntryOpts) => {
      this.store = { ...this.store, ...opts.entry };
      return opts.entry || null;
    }
  
    return await wrapAsync(setHelper, opts) as KeyValStoreEntry;
  }

  async delete(topic: string, key: string): Promise<KeyValStoreEntry> {
    const deleteHelper = (topic: string, key: string) => { 
      const deletedElem = this.store[topic][key];
      delete this.store[topic][key];
      return deletedElem;
    }

    return await wrapAsync(deleteHelper, topic, key);
  }

  async current(topic?: string): Promise<KeyValStore> {
    const curHelper = (topic?: string) => {
      return topic ? { [topic]: this.store[topic] } : this.store;
    }

    return await wrapAsync(curHelper, topic) as KeyValStore;
  }

  async flush(topic?: string): Promise<boolean> {
    const flushHelper = (topic?: string) => topic ? this.store[topic] = {} : this.store = {};
    await wrapAsync(flushHelper, topic);

    return true;
  }
}