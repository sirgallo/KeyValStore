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

  async get(key: string): Promise<KeyValStoreEntry> {
    const getHelper = (key: string) => this.store[key];

    return await wrapAsync(getHelper, key) as KeyValStoreEntry;
  }

  async set(opts: KeyValStoreEntryOpts): Promise<KeyValStoreEntry> {
    const setHelper = (opts: KeyValStoreEntryOpts) => {
      this.store[opts.key] = opts.entry;
      return this.store[opts.key] || null;
    }
    
    return await wrapAsync(setHelper, opts) as KeyValStoreEntry;
  }

  async delete(key: string) {
    const deleteHelper = (key: string) => delete this.store[key];

    await wrapAsync(deleteHelper, key);
  }

  async flush() {
    const flushHelper = () => this.store = {};

    await wrapAsync(flushHelper, null);
  }
}