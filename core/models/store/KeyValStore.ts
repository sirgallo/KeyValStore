export type KeyValStoreEntry = any;
export type Topic = string;
export type Key = string;

export interface KeyValStoreEntryOpts {
  entry: Record<Topic, Record<Key, KeyValStoreEntry>>;
}

export interface KeyValStore { 
  store: Record<Topic, Record<Key, KeyValStoreEntry>>;
  version: number;
};