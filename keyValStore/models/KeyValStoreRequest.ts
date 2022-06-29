import { KeyValStoreEntry, KeyValStoreEntryOpts } from "@core/models/store/KeyValStore";

export interface KeyValStoreGetRequest {
  findKey: string;
}

export interface KeyValStoreSetRequest {
  setOpts: KeyValStoreEntryOpts;
}

export interface KeyValStoreGetResponse {
  value: KeyValStoreEntry;
}