export interface KeyValStoreEntry {
  topic: string;
  value: any;
}

export interface KeyValStoreEntryOpts {
  key: string
  entry: KeyValStoreEntry;
}

export type KeyValStore = Record<string, KeyValStoreEntry>;