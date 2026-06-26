# Lesson 1 — Why Docker Exists
Before Docker, developers had a huge problem:

## The Classic Problem
Developer says: 
```sh 
It works on my machine
```

## But:
- production fails
- dependencies differ
- OS versions differ
- package versions differ

## Example:
Your laptop:
- Node.js 20
- Ubuntu 24
- Redis 7

Production server:
- Node.js 16
- Ubuntu 20
- Redis 5

> Result => App breaks.


# Old Solution → Virtual Machines
People used: VirtualBox and VMware

## Each app got:
- full OS
- own RAM
- own kernel

## Problem:
- heavy
- slow
- large size
- high resource usage

## Docker Solution
Docker introduced: Containers

## A container packages:
- application
- dependencies
- libraries
- runtime
- configs
> into one portable unit.

# VM vs Container
Virtual Machine
```sh
# Each VM has full OS.

Hardware
 └── Hypervisor
      └── Guest OS
           └── App
```
> Heavy.

Docker Container
```sh
Hardware
 └── Host OS
      └── Docker Engine
           └── Containers

# Important: Containers share host kernel.
```
> Very lightweight.

# Why Containers Are Fast
Because containers:
- do NOT boot full OS
- share kernel
- isolate processes only

## Startup:
```sh
VM → minutes
Container → seconds/ms
```

# Core Docker Concepts
## 1. Image
Blueprint/template.

Like:
```js
Class in programming
```

Contains:
- app code
- runtime
- dependencies

Example: 
- nginx
- ubuntu
- node:20
- mysql

## 2. Container
Running instance of image.

Like:
```js
Object from class
```

Example:
```go
docker run nginx
```

Docker:
- downloads image
- creates container
- starts process

## 3. Docker Engine
Main service running Docker.

Handles:
- containers
- images
- networking
- volumes

## 4. Docker Hub
Public image registry.

Like GitHub for images.

# Important Internal Technologies
Docker uses Linux features:

## Namespaces
Isolation:
- processes
- network
- filesystem


## Cgroups
Resource limits:
- CPU
- RAM
- IO

## Union Filesystem
- Layered images.

# Simple Real Example
Without Docker:
- Install Node
- Install MongoDB
- Install Redis
- Fix versions
- Fix conflicts

With Docker: 
- docker run mongo
- docker run redis
- docker run node-app
> Everything isolated.

# Install Docker
1. Windows / Mac
Install: [Docker Desktop](https://www.docker.com/products/docker-desktop/?utm_source=chatgpt.com)


2. Linux
Install Docker Engine: 
```sh
# Debian
apt install docker.io 

# Red Hat-based .rpm
yum install docker.io
```

3. Official docs: 

Install Docker Engine: [Official Docs](https://docs.docker.com/engine/install/?utm_source=chatgpt.com)


# Your First Commands
After installation:

## Check version
```bash
docker version
```

## System information
```bash
docker info
```

## Run first container
```bash
docker run hello-world
```

## What happens internally:
- Docker checks local image
- If missing → pulls from Docker Hub
- Creates container
- Runs it
- Shows output
- Container exits

## Pull image manually
```bash
docker pull nginx

# Default latest version will pull
```

## Run nginx server
```bash #ffffff
docker run nginx
```

> [!NOTE] Problem: You cannot access website yet.

> Because: container port not exposed

# We’ll fix that next lesson.
