import { 
  KeyValStoreGetRequest, 
  KeyValStoreTopicRequest, 
  KeyValStoreEntryOpts
} from '@core/models/store/KeyValStore';
import { KeyValOperations } from '@core/models/store/KeyValStore';

type CLIRequestPayload = 
  KeyValStoreGetRequest 
  | KeyValStoreEntryOpts 
  | KeyValStoreTopicRequest 
  | null;

export interface CLIRequest {
  method: KeyValOperations
  payload: CLIRequestPayload
}