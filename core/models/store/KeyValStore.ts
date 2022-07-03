export type DeepPartialSchema<T> = {
  [ K in keyof T ]?: T[K] extends object
    ? DeepPartialSchema<T[K]>
    : T[K]
};

export type KeyValStoreEntry = DeepPartialSchema<any>;
export type Topic = string;
export type Key = string;

export interface KeyValStoreEntryOpts {
  entry: Record<Topic, Record<Key, KeyValStoreEntry>>;
}

export interface KeyValStore { 
  store: Record<Topic, Record<Key, KeyValStoreEntry>>;
  topics: Record<Topic, DeepPartialSchema<any>>;
  version: number;
};

export interface KeyValStoreTopicRequest {
  topic: string;
}

export interface KeyValStoreGetRequest extends KeyValStoreTopicRequest {
  findKey: string[];
}

export interface KeyValStoreGetResponse {
  value: KeyValStoreEntry;
}

export type KeyValOperations = 'GET' | 'SET' | 'DELETE' | 'CURRENT' | 'FLUSH';

export interface KeyValEndpoints {
  get(opts: KeyValStoreGetRequest): Promise<KeyValStoreEntry[]>
  set(opts: KeyValStoreEntryOpts): Promise<KeyValStore>
  delete(opts: KeyValStoreGetRequest): Promise<KeyValStoreEntry[]>
  current(opts: KeyValStoreTopicRequest): Promise<KeyValStore>
  flush(opts: KeyValStoreTopicRequest): Promise<boolean>
}