# Kubernetes 

## Basics and Local Deployment --> Testing


## Download Minikube on Linux

`Check out the documents for different systems at -->`

<a href="https://minikube.sigs.k8s.io/docs/start/">https://minikube.sigs.k8s.io/docs/start/</a>


## Tagging a Docker Image (General Syntax)

```bash
  docker build -f <docker-compose-file> -t <image-tag-from-docker-compose-file> <source-path>
```


## Convert docker-compose Files to Kubernetes Services

```bash
  kompose convert -f <docker-compose-file>
```

The `kompose` command is used to convert an existing docker-compose file into kubernetes services, where the underlying containers are running the docker runtime. Only major versions of docker-compose are supported and some features may not be compatible


## Minikube

For local testing, use `minikube`, the official test platform for running a local kubernetes cluster within docker. 

`Configure`

```bash
  minikube delete //  only if you need to delete the current running instance
  minikube config set memory <memory-limit>
  minikube config set cpus <num-cpus>
  minikube start

  eval $(minikube docker-env) //  set docker environment
  docker build -f <docker-file> -t <image-tag-from-docker-compose-file> <source-path> //  need to rebuild image after local docker img repo is set
```

`Dashboard`

```bash
  minikube dashboard
```

## Enable Ingress Controller

The `NGINX` ingress controller defines rules that allow external requests to access services in the cluster.

```bash
  minikube addons enable ingress
```

`Get the external IP of minikube`

```bash
  minikube ip
```

`Modify /etc/hosts on your local machine with the ip and domain`

```
  <ip-from-minikube> <domain-in-ingress-file>
```

`Create self-signed cert (local only)`

```bash
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout <name>.key -out <name>.crt -subj "/CN=<host>/O=<host>"
  
  cat <name>.key <name>.crt > <name>.pem
```

`Create Kubernetes Secret`

`-->` The convention is to use the domain name, with dots replaced with hypens and appended with `-tls`

```bash
  kubectl create secret tls <secret-name> --cert=<name>.crt --key=<name>.key
```

`Review`

```bash
  kubectl get secret <secret-name> -o yaml
```

Create a `*-ingress.yaml` file, like below:

```yaml
  apiVersion: <api-version>
  kind: Ingress
  metadata:
    name: <name>-ingress
  spec:
    tls:
      - hosts:
        - '<domain-name>'
      - secretName: <secret-name>
    rules:
      - host: <domain-name>
        http:
          paths:
            - path: /
              pathType: Prefix
              backend:
                service:
                  name: <service-name>
                  port:
                    number: <port>
```

`Apply yaml file`

```bash
  kubectl apply -f <ingress-yaml-file>
```

`Verify`

```bash
  kubectl get ingress
```


## Deploying to Minikube using Kubectl

In `*-deployment.yaml`, add:

```yaml
  imagePullPolicy: Never
```

```bash
for each kubernetes.yaml file, minus service file

  kubectl apply -f <name-of-service-file>
  kubectl expose deployment <deployment-name> --type=NodePort --port=<port-of-pods-to-expose> --name=<name-of-service>   // only if replication controller is not used
```


## Basic Replica Sets

In the `*-deployment.yaml` file, add this field to the ruleset:

```yaml
...
rules:
  replicas: <n-number-of-replicas>
...
```


## Replication Controller (Recommended over replica sets)

This automatically starts new containers if not enough are available, and removes containers if there are too many. Use this instead of a typical deployment to add rolling updates to pods.

example replication controller for a nodejs service

```yaml
apiVersion: v1
kind: ReplicationController
metadata:
  name: <app-name>
spec:
  replicas: <n-number-of-replicas>
  selector:
    app: <app-name>
  template:
    metadata:
      labels:
        app: <app-name>
    spec:
      containers:
      - env:
            - name: NODE_ENV
              value: docker
            - name: NODE_OPTIONS
              value: '"--max-old-space-size=4096"'
        image: <container-image>
        imagePullPolicy: Never      //  only for local
        name: <container-name>
        ports:
          - containerPort: <port>
        resources: {}
          volumeMounts:
            - mountPath: <mount-path-from-docker-compose>
              name: <volume-name>
        restartPolicy: Always
        volumes:
          - name: <volume-name>
            persistentVolumeClaim:
              claimName: <volume-name>
```

`Apply new replication manifest`

```bash
  kubectl apply -f <replication.yaml>
```

`Expose as a service`

```bash
  kubectl expose replicationcontroller <replication-name> --type=NodePort --port=<port> --name=<service-name>
```


## List Pods

```bash
  kubectl get pods -A
```


## Get a Service

```bash
  kubectl get services <service-name>
```


## Get Service URL

```bash
  minikube service <service-name> --url
```


## Delete a Service

```bash
  kubectl delete svc <service-name>
```


## Replace a Service

```bash
  kubectl replace -f <service-deployment-yaml>
```