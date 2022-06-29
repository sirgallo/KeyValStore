export interface KeyValStoreEntry {
  topic: string;
  key: string;
  value: any;
}

export interface KeyValStoreEntryOpts {
  entry: KeyValStoreEntry;
}

export type KeyValStore = Record<string, Record<string, KeyValStoreEntry>>;