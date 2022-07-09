import { wrapAsync } from '@core/utils/Utils';
 
/*
  Individual nodes within the trie data structure
  
  Each is built to hold 
    - a value, in this case a single character
    - a child object, which holds nested nodes. The end of the word is empty
    - end, a truthy value to assign the end of a word
  Methods are getters and setters
*/

class TrieNode {
  protected ctn: Record<string, TrieNode> = {};
  protected end?: boolean;
  
  constructor(protected vtn: string) {}

  getValue(): string { return this.vtn; }

  getChildren(): Record<string, TrieNode> { return this.ctn; }

  getChild(field: string) { return this.ctn[field]; }

  setChild(field: string) { this.ctn[field] = new TrieNode(field); }

  getEnd(): boolean { return this?.end; }

  setEnd(setField: boolean) { this.end = setField; }
}

/*
  The Trie data structure, which is built using individual nodes
*/

export class Trie extends TrieNode {
  constructor() { super(null); }

  async bulkInsert(words: string[]): Promise<boolean> {
    try {
      for (const word of words) { await this.insertWord(word); }
      return true;
    } catch (err) { throw err; }
  }

  async insertWord(word: string): Promise<boolean> {
    const insertHelper = (str: string) => {
      const recursiveInsert = (node: TrieNode, str: string) => {
        if (! node.getChild(str[0])) node.setChild(str[0]);
        
        str.length > 1 
          ? recursiveInsert(node.getChild(str[0]), str.slice(1))
          : str.length === 1
          ? node.getChild(str[0]).setEnd(true)
          : {};
      }

      recursiveInsert(this, str);
    }
    
    return await wrapAsync(insertHelper.bind(this), word) as Promise<boolean>;
  }

  async searchWord(word: string): Promise<string[]> {
    const words = [];

    const searchHelper = (word: string) => {
      const remainingTreeHelper = (node: TrieNode, partialWord: string) => {
        return partialWord 
          ? remainingTreeHelper(node.getChild(word[0]), partialWord.substring(1))
          : node;
      }

      const allWordsHelper = (wordSoFar: string, tree: TrieNode) => {
        for (const field in tree.getChildren()) {
          const child = tree.getChildren()[field];
          const newStr = wordSoFar + child.getValue();
    
          if (child.getEnd()) words.push(newStr);
          allWordsHelper(newStr, child);
        }
      }

      const remainingTree = remainingTreeHelper(this, word);

      remainingTree 
        ? allWordsHelper(word, remainingTree)
        : allWordsHelper(word, this);

      return words;
    }

    return wrapAsync(searchHelper.bind(this), word) as Promise<string[]>;
  }
}