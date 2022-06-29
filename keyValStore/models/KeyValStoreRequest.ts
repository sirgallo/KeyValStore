import { KeyValStoreEntry, KeyValStoreEntryOpts } from '@core/models/store/KeyValStore';

export interface KeyValStoreTopicRequest {
  topic: string;
}

export interface KeyValStoreGetRequest extends KeyValStoreTopicRequest {
  findKey: string[];
  del?: boolean;
}

export interface KeyValStoreSetRequest {
  setOpts: KeyValStoreEntryOpts;
}

export interface KeyValStoreGetResponse {
  value: KeyValStoreEntry;
}