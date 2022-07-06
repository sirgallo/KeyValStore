# Key Val Store CLI/Provider

`A command line tool for interacting with the key-val store`


## Operations

**fields denoted with < > are dynamic. The spread op (...) denotes 0-n values.**

`Get - One or Multiple Keys on Single Topic`
```bash
  npm run cli <host> <port> GET '{"topic": "<topic>", "findKey": [..."<keys>"]}'
```

`Set - One or Many Topics And Documents`
```bash
  npm run cli <host> <port> SET '{"entry": { ..."<topic>": {"<docKey>": <inner-document-object>}}}'
```

`Delete - One or Many Keys on Single Topic`
```bash
  npm run cli <host> <port> DELETE '{"topic": "<topic>", "findKey": [..."<keys>"]}' 
```

`Current - All Topics`
```bash
  npm run cli <host> <port> CURRENT '{}'
```

`Current - Single Topic`
```bash
  npm run cli localhost 6789 CURRENT '{"topic": "<topic>"}'
```

`Flush - All Topics`
```bash
  npm run cli <host> <port> FLUSH '{}'
```

`Flush - Single Topic`
```bash
  npm run cli localhost 6789 FLUSH '{"topic": "<topic>"}'
```

`
