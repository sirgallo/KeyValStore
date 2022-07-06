import { Trie } from '@core/utils/TrieProvider';
import { LogProvider } from '@core/providers/LogProvider';
import { extractErrorMessage } from '@core/utils/Utils';

export interface insertEntry {
  word: string;
}

export interface insertRequest {
  insert: insertEntry | insertEntry[]
}

export interface IndexMethods {
  insertOne(word: string): Promise<boolean>;
  insertMany(words: string[]): Promise<boolean>;
  query(partialWord: string): Promise<string[]>;
}

const NAME = 'Index Provider';

export class IndexProvider implements IndexMethods {
  private indexLog: LogProvider = new LogProvider(NAME);
  private index: Trie = new Trie();

  constructor() {}

  async insertOne(word: string): Promise<boolean> {
    try {
      return await this.index.insertWord(word);
    } catch (err) { 
      this.indexLog.error(`Error inserting value into index: => ${extractErrorMessage(err as Error)}`);
    }
  }

  async insertMany(words: string[]) {
    try {
      return await this.index.bulkInsert(words);
    } catch (err) { 
      this.indexLog.error(`Error inserting values into index: => ${extractErrorMessage(err as Error)}`);
    }
  }

  async query(partialWord: string): Promise<string[]> {
    try {
      return await this.index.searchWord(partialWord);
    } catch (err) { 
      this.indexLog.error(`Error finding associated values for ${partialWord} in index: => ${extractErrorMessage(err as Error)}`);
    }
  }
}