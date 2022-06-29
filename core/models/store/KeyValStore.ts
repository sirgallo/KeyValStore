export type KeyValStoreEntry = any;
export type Topic = string;
export type Key = string;

export interface KeyValStoreEntryOpts {
  entry: Record<Topic, Record<Key, KeyValStoreEntry>>;
}

export type KeyValStore = Record<Topic, Record<Key, KeyValStoreEntry>>;