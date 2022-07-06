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
  protected c: Record<string, TrieNode> = {};
  protected end: boolean = false;
  
  constructor(protected e: string) {}

  getValue(): string { return this.e; }

  getChildren(): Record<string, TrieNode> { return this.c; }

  getChild(field: string) { return this.c[field]; }

  setChild(field: string) { this.c[field] = new TrieNode(field); }

  getEnd(): boolean { return this.end; }

  setEnd(setField: boolean) { this.end = setField; }
}

/*
  The Trie data structure, which is built using individual nodes
*/
export class Trie extends TrieNode {
  private words: string[];

  constructor() { super(null); }

  print() {
    console.log('##############################\n');
    console.log('Current Trie State\n');
    console.log(JSON.stringify(this.getAttributes(), null, 2));
    console.log('\n##############################\n');
  }

  getAttributes(): Record<string, string | Record<string, TrieNode>> {
    return {
      value: this.e,
      children: this.c
    }
  }

  async bulkInsert(words: string[]): Promise<boolean> {
    try {
      for (const word of words) { await this.insertWord(word); }
      return true;
    } catch (err) { throw err; }
  }

  async insertWord(word: string): Promise<boolean> {
    console.log('here?')
    const insertHelper = (str: string) => {
      const recursiveInsert = (node: TrieNode, str: string) => {
        console.log('node:', node);
        console.log('str', str);
        if (! node.getChild(str[0])) node.setChild(str[0]);
        
        if (str.length > 1 ) recursiveInsert(node.getChild(str[0]), str.slice(1));
        else if(str.length === 1) node.getChild(str[0]).setEnd(true);
      }

      recursiveInsert(this, str);
    }
    
    return await wrapAsync(insertHelper.bind(this), word) as Promise<boolean>;
  }

  async searchWord(word: string): Promise<string[]> {
    const words = [];
    
    const searchHelper = (word: string) => {
      const remainingTreeHelper = (node: TrieNode, word: string) => {
        if (word) return remainingTreeHelper(node.getChild(word[0]), word.substring(1));
        else return node;
      }

      const allWordsHelper = (wordSoFar: string, tree: TrieNode) => {
        for (const field in tree.getChildren()) {
          const child = tree.getChildren()[field];
          const newStr = wordSoFar + child.getValue();
    
          if (child.getEnd()) words.push(newStr)
          allWordsHelper(newStr, child);
        }
      };

      const remainingTree = remainingTreeHelper(this, word);
      
      if (remainingTree) allWordsHelper(word, remainingTree);
      

      return words;
    }

    return wrapAsync(searchHelper.bind(this), word) as Promise<string[]>;
  }

  private insertWordHelper(node: TrieNode, str: string) {
    console.log('str', str);
    console.log('node', node.getChildren());
    if (! this.getChild(str[0])) this.setChild(str[0]);
    if (str.length === 1) node.getChild(str[0]).setEnd(true);
    if (str.length > 1 ) this.insertWordHelper(node.getChild(str[0]), str.slice(1));
  }

  private getRemainingTree(word: string): TrieNode {
    let node: TrieNode = this;
    
    while (word) {
      node = node.getChild(word[0]);
      word = word.substring(1);
    }

    return node;
  }
}