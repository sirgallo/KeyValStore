import lodash from 'lodash';
const { mergeWith, isArray, pick } = lodash;

import { extractErrorMessage, memo, wrapAsync } from '@core/utils/Utils';
import { 
  KeyValStore, KeyValStoreEntry, KeyValStoreEntryOpts,
  KeyValStoreGetRequest, KeysSearchResponse, KeyValEndpoints,
  KeyValStoreTopicRequest, KeyValStoreSeachTopicRequest, TopicsSearchResponse
} from '@core/models/store/KeyValStore';
import { LogProvider } from '@core/providers/LogProvider';
import { IndexProvider } from './IndexProvider';

const NAME = 'Key Value Store Provider';

export class KeyValStoreProvider implements KeyValEndpoints {
  private topicIndex: IndexProvider = new IndexProvider();
  private topicSet: Set<string> = new Set();

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

  async set(opts: KeyValStoreEntryOpts): Promise<KeyValStoreEntry> {
    const customMerge = (obj: any, src: any) => { if (isArray(obj)) return obj.concat(src); }
    if (! memo(this.store.store, opts.entry)) {
      this.store.store = mergeWith(this.store.store, opts.entry, customMerge);
      this.store.version++;

      for (const topic of Object.keys(opts.entry)) {
        try {
          if (! this.topicSet.has(topic)) { 
            this.store.topics[topic] = new IndexProvider();
            this.topicSet.add(topic);
            await this.topicIndex.insertOne(topic);
          }

          const keysForTopic = Object.keys(opts.entry[topic]);
          console.log(keysForTopic);

          await this.store.topics[topic].insertMany(keysForTopic);
        } catch (err) {
          this.keyValStoreLog.error(`Error inserting keys into index: ${extractErrorMessage(err as Error)}`)
          throw err;
        }
      }
    }

    return opts.entry || null;
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

  async searchKeys(opts: KeyValStoreSeachTopicRequest): Promise<KeysSearchResponse> {
    const resp: KeysSearchResponse = {
      keys: null,
      map: null
    }

    const keys = await this.store.topics[opts.topic].query(opts.search);

    resp.keys = keys
    resp.map = pick(this.store.store[opts.topic], keys);

    return resp;
  }

  async searchTopics(opts: KeyValStoreTopicRequest): Promise<TopicsSearchResponse> {
    const resp: TopicsSearchResponse = {
      topics: null
    }

    resp.topics = await this.topicIndex.query(opts.topic);

    return resp;
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