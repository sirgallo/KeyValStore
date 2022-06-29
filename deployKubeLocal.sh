#!/bin/bash

readonly doesNotExistError="does not exist"
readonly bold=$(tput bold)
readonly regular=$(tput sgr0)

echo -e "\n${bold}\033[34mKUBERNETES\033[0m ${bold}Deployment Pipeline CLI"
echo -e "\n${bold}note:${regular} currently amd64 binaries on CentOS only\n"

if ! command docker &> /dev/null
then
  echo -e "\ninstalling docker engine and related packages"
  sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin
  sudo systemctl start docker

  echo -e "\nenabling on startup"
  sudo systemctl enable docker.service
  sudo systemctl enable containerd.service
else
  echo "docker already installed"
fi

if ! command kompose &> /dev/null
then
  echo -e "\ninstalling kompose"
  curl -L https://github.com/kubernetes/kompose/releases/download/v1.25.0/kompose-linux-amd64 -o kompose
  chmod +x kompose
  sudo mv ./kompose /usr/local/bin/compose
else 
  echo "kompose already installed"
fi

if ! command kubectl &> /dev/null
then
  echo -e "\ninstalling kubectl"
  curl -LO https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl
  sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
else 
  echo "kubectl already installed"
fi

if ! command minikube &> /dev/null
then
  echo -e "\ninstalling minikube"
  curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
  sudo install minikube-linux-amd64 /usr/local/bin/minikube
else 
  echo "minikube already installed"
fi

echo -e "\nconfigure minikube? ${bold}(yes or no)${regular}"
read minikubeconfig

if [ $minikubeconfig == "yes" ]
then
  if command minikube status | grep "Running" &> /dev/null
  then
    echo -e '\nremoving current minikube instance for configuration'
    minikube delete
  fi

  echo -e "\nenter minikube memory limit"
  read memlim
  echo -e "\nenter minikube allocated cpus"
  read cpus

  minikube config set memory $memlim
  minikube config set cpus $cpus
fi

echo -e "\nenter ingress host"
read ingresshost 

echo -e "\ncreate kubernetes service files using kompose? ${bold}(yes or no)${regular}"
read createServices

if [ $createServices == "yes" ]
then
  echo -e "\nenter docker-compose file name"
  read dockercomposefile

  kompose convert -f $dockercomposefile

  rm *-deployment.yaml
  rm *-service.yaml
else 
  echo -e "\nservice already created"
fi

echo -e "\nenter path to source dockerfile"
read dockerfile
if ! find $dockerfile &> /dev/null
then 
  exit "$dockerfile $doesNotExistError"
fi

echo -e "\nprovide source path"
read appsourcepath
if ! find $appsourcepath &> /dev/null
then
  exit "$appsourcepath $doesNotExistError"
fi

if ! cat /etc/hosts | grep "${ingresshost}" &> /dev/null
then
  echo -e "\nupdating /etc/hosts"
  readonly newhost="$(minikube ip) ${ingresshost}"
  sudo -- sh -c -e "echo -e ${newhost} >> /etc/hosts"
else
  echo -e "/etc/hosts already contains link for ${ingresshost}"
fi

echo -e "\nenter target dockerfile image name"
read dockerimage

echo -e "\nstarting minikube"
minikube start

echo -e "\nbuilding target docker image for app"
docker build -f $dockerfile -t $dockerimage $appsourcepath

echo -e "\nstarting persistant data volumes"
kubectl apply -f *-persistentvolumeclaim.yaml

echo -e "\ncreating network policy"
kubectl apply -f *-networkpolicy.yaml

echo -e "\npreparing ingress controllers"
minikube addons enable ingress
kubectl apply -f *-ingress.yaml

echo -e "\nenter replication controller name"
read replicationcontrollername

echo -e "\nenter port to expose"
read port

echo -e "\nenter service name"
read replicationservicename

echo -e "\nbeginning replication of app"
kubectl apply -f *$replicationcontrollername.yaml
kubectl expose replicationcontroller $replicationcontrollername --type=NodePort --port=$port --name=$replicationservicename
 
echo -e "\nservices launched...opening dashboard"
minikube dashboard