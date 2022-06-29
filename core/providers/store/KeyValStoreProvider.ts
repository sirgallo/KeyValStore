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

  async get(topic: string, keys: string[]): Promise<KeyValStoreEntry[]> {
    return wrapAsync(this.multiValReducer.bind(this), topic, keys) as Promise<KeyValStoreEntry[]>;
  }

  async set(opts: KeyValStoreEntryOpts): Promise<KeyValStore> {
    const setHelper = (opts: KeyValStoreEntryOpts) => {
      this.store = { ...this.store, ...opts.entry };
      return opts.entry || null;
    }
  
    return wrapAsync(setHelper, opts) as Promise<KeyValStore>;
  }

  async delete(topic: string, keys: string[]): Promise<KeyValStoreEntry[]> {
    return wrapAsync(this.multiValReducer.bind(this), topic, keys, true) as Promise<KeyValStoreEntry[]>;
  }

  async current(topic?: string): Promise<KeyValStore> {
    const curHelper = (topic?: string) => {
      return topic ? { [topic]: this.store[topic] } : this.store;
    }

    return wrapAsync(curHelper, topic) as Promise<KeyValStore>;
  }

  async flush(topic?: string): Promise<boolean> {
    const flushHelper = (topic?: string) => topic ? this.store[topic] = {} : this.store = {};
    await wrapAsync(flushHelper, topic);

    return true;
  }

  private multiValReducer(topic: string, keys: string[], del?: boolean): KeyValStoreEntry[] {
    return keys.reduce( (acc: KeyValStoreEntry[], key) => { 
      if (this.store[topic][key]) {
        const val = this.store[topic][key];
        if (del) delete this.store[topic][key];
        return acc.concat({ [key]: val });
      };

      return acc;
    }, []);
  }
}