# Key Val Store CLI/Provider

`A command line tool for interacting with the key-val store`
*performed within main project directory*


## Building

**currently using node 18**

```bash
  cd ./cli
  npm install
  npm run build:all
```


## Operations - DB OPS

**fields denoted with < > are dynamic. The spread op (...) denotes 0-n values.**

`Get - One or Multiple Keys on Single Topic`
```bash
  npm run cli <host> <port> get '{"topic": "<topic>", "findKey": [..."<keys>"]}'
```

`Set - One or Many Topics And Documents`
```bash
  npm run cli <host> <port> set '{"entry": { ..."<topic>": {"<docKey>": <inner-document-object>}}}'
```

`Delete - One or Many Keys on Single Topic`
```bash
  npm run cli <host> <port> delete '{"topic": "<topic>", "findKey": [..."<keys>"]}' 
```

`Current - All Topics`
```bash
  npm run cli <host> <port> current '{}'
```

`Current - Single Topic`
```bash
  npm run cli localhost 6789 current '{"topic": "<topic>"}'
```

`Flush - All Topics`
```bash
  npm run cli <host> <port> flush '{}'
```

`Flush - Single Topic`
```bash
  npm run cli localhost 6789 flush '{"topic": "<topic>"}'
```


## Operations - Index Ops

`SearchKeys - Single Topic`
```bash
  npm run cli localhost 6789 searchKeys '{"topic": "<topic>", "search": "<partialWord>" }'
```

`SearchTopics`
```bash
  npm run cli localhost 6789 searchTopics '{"topic": "<partialWord>"}'
```


## Importing into Project

```ts
import { CLIProvider } from '@cli/providers/CLIProvider';

const resp = await this.cliProv[<method>](<payload>);
```