# Design


##  Key-Value Store Design

The key-value store is separated into `topics`, where each topic is a collection of objects in mem.

```ts
{
  <topic>: {
    <key>: {
      <topic>: string,
      <value>: any
    }
  }
}
```


##  Persist to Cold Storage

```
  key-value store --> write json to mongo 

  Approach: 
    each store has topics, which will correlate 1 to 1 with a collection in mongo. This may take some time to implement.
```