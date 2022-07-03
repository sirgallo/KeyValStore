import { asyncExponentialBackoff } from '@core/utils/AsyncExponentialBackoff';
import { 
  KeyValStore,
  KeyValEndpoints, 
  KeyValStoreEntry, 
  KeyValStoreEntryOpts, 
  KeyValStoreGetRequest,
  KeyValStoreTopicRequest
} from '@core/models/store/KeyValStore';

const HTTP_HEADERS = {
  'Content-Type': 'application/json'
}

const generatePostRequest = (opts: any) => {
  return {
    method: 'POST',
    header: HTTP_HEADERS,
    body: JSON.stringify(opts)
  }
}

export class CLIProvider implements KeyValEndpoints { 
  private endpoints: Record<string, string>;

  constructor(
    private storehost: string,
    private port?: number,
    private https?: boolean
  ) {
    this.parseUrl(); 
    this.setEndpoints();
  }

  async get(opts: KeyValStoreGetRequest): Promise<KeyValStoreEntry[]> {
    return await asyncExponentialBackoff(
      this.endpoints.get, 5, 500, { json: opts }
    );
  }

  async set(opts: KeyValStoreEntryOpts): Promise<KeyValStore> {
    return await asyncExponentialBackoff(
      this.endpoints.set, 5, 500, { json: opts }
    );
  }

  async delete(opts: KeyValStoreGetRequest): Promise<KeyValStoreEntry[]> {
    return await asyncExponentialBackoff(
      this.endpoints.delete, 5, 500, { json: opts }
    );
  }

  async current(opts: KeyValStoreTopicRequest): Promise<KeyValStore> {
    return await asyncExponentialBackoff(
      this.endpoints.current, 5, 500, { json: opts }
    );
  }

  async flush(opts: KeyValStoreTopicRequest): Promise<boolean> {
    return await asyncExponentialBackoff(
      this.endpoints.flush, 5, 500, { json: opts }
    );
  }

  private parseUrl() {
    const port = `${ this.port ? ':' + this.port : this.port }`
    if (! this.https) {
      this.storehost = ! this.storehost.includes('http://') 
        ? `http://${this.storehost}${port}/store` 
        : this.storehost + port
    } else {
      this.storehost = ! this.storehost.includes('https://') 
        ? `https://${this.storehost}${port}/store`
        : this.storehost + port
    }
  }

  private setEndpoints() {
    this.endpoints = {
      get: `${this.storehost}/get`,
      set: `${this.storehost}/set`,
      delete: `${this.storehost}/delete`,
      current: `${this.storehost}/current`,
      flush: `${this.storehost}/flush`
    }
  }
}