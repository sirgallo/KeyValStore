import { IndexProvider } from '@core/providers/store/IndexProvider';

export type DeepPartialSchema<T> = {
  [ K in keyof T ]?: T[K] extends object
    ? DeepPartialSchema<T[K]>
    : T[K]
};

export type Topic = string;
export type Key = string;

export type KeyValStoreEntry<T> = DeepPartialSchema<T>;

export type TopicsStore<T> = {
  [ K in keyof T ]: { schema: DeepPartialSchema<T[K]>, index: IndexProvider }
}

export type PartialKeyValStore<T, U> = Pick<KeyValStore<T, U>, 'store' | 'version'>;

export interface KeyValStoreEntryOpts {
  entry: Record<Topic, Record<Key, KeyValStoreEntry<any>>>;
}

export type KeyValStore<T, U> = { 
  store: Record<Topic, Record<Key, KeyValStoreEntry<U>>>;
  topics: TopicsStore<T>;
  version: number;
}

export interface KeyValStoreTopicRequest {
  topic: string;
}

export interface KeyValStoreSeachTopicRequest extends KeyValStoreTopicRequest {
  search: string;
}

export interface KeyValStoreGetRequest extends KeyValStoreTopicRequest {
  findKey: string[];
}

export interface KeyValStoreGetResponse {
  value: KeyValStoreEntry<any>;
}

export interface KeysSearchResponse {
  keys: string[];
  map: Record<Key, KeyValStoreEntry<any>>;
}

export interface TopicsSearchResponse {
  topics: string[];
}

export interface KeyValEndpoints {
  get(opts: KeyValStoreGetRequest): Promise<KeyValStoreEntry<any>[]>;
  set(opts: KeyValStoreEntryOpts): Promise<KeyValStoreEntry<any>>;
  delete(opts: KeyValStoreGetRequest): Promise<KeyValStoreEntry<any>[]>;
  current(opts: KeyValStoreTopicRequest): Promise<PartialKeyValStore<any, any>>;
  flush(opts: KeyValStoreTopicRequest): Promise<boolean>;
  searchKeys(opts: KeyValStoreSeachTopicRequest): Promise<KeysSearchResponse>
  searchTopics(opts: KeyValStoreTopicRequest): Promise<TopicsSearchResponse>
}