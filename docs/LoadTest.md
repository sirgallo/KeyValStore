# LoadTest

using `loadtest`

```bash
  loadtest -n <n-number-requests> -c <concurrency> --keepalive -H Content-Type:application/json -m POST --data <data> http://localhost:6789/<route>
```

loadtest -n 200 -c 10 -k -P '{}' -T 'application/json' http://localhost:8888/store/current/

loadtest -n 10000 -c 10 -k --data '{"topic": "hello", "findKey": [ "outerindex" ]}' -T 'application/json' -m POST http://localhost:8888/store/get/