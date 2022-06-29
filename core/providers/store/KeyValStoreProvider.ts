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

  printStore() {
    this.keyValStoreLog.debug(JSON.stringify(this.store, null, 2));
  }

  async get(topic: string, key: string): Promise<KeyValStoreEntry> {
    const getHelper = (topic: string, key: string) => this.store[topic][key];
    return await wrapAsync(getHelper, topic, key) as KeyValStoreEntry;
  }

  async set(opts: KeyValStoreEntryOpts): Promise<KeyValStoreEntry> {
    const setHelper = (opts: KeyValStoreEntryOpts) => {
      if (! this.store[opts.entry.topic]) this.store[opts.entry.topic] = {};
      this.store[opts.entry.topic][opts.entry.key] = opts.entry;
      return this.store[opts.entry.topic][opts.entry.key] || null;
    }
  
    return await wrapAsync(setHelper, opts) as KeyValStoreEntry;
  }

  async delete(topic: string, key: string) {
    const deleteHelper = (topic: string, key: string) => delete this.store[topic][key];
    await wrapAsync(deleteHelper, topic, key);
  }

  async current(): Promise<KeyValStore> {
    const curHelper = () => this.store;
    return await wrapAsync(curHelper, null) as KeyValStore;
  }

  async flush() {
    const flushHelper = () => this.store = {};
    await wrapAsync(flushHelper, null);
  }
}