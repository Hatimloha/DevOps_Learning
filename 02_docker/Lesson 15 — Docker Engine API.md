# Lesson 15 — Docker Engine API

## Overview

Until now, you have interacted with Docker using the CLI:

```bash
docker run nginx
docker ps
docker stop container
```

But internally, the Docker CLI is only a **client**.

The actual communication happens through the:

# Docker Engine API

---

# Docker Architecture Reminder

The complete Docker workflow:

```text
User

 ↓

Docker CLI

 ↓

Docker Engine API

 ↓

Docker Daemon (dockerd)

 ↓

containerd

 ↓

runc

 ↓

Container
```

The Docker CLI sends API requests to the Docker daemon.

---

# What Is Docker Engine API?

The **Docker Engine API** is a REST API that allows applications and automation tools to control Docker programmatically.

You can perform operations such as:

- Create containers
- Start containers
- Stop containers
- Pull images
- Create networks
- Manage volumes
- Inspect resources
- Monitor containers

without using Docker CLI commands.

---

# REST API Concept

Docker Engine API uses HTTP-based REST communication.

Common HTTP methods:

| Method | Purpose |
|--------|---------|
| GET | Read data |
| POST | Create actions |
| DELETE | Remove resources |
| PUT | Update resources |

---

# API Examples

## Get Running Containers

HTTP request:

```http
GET /containers/json
```

Equivalent CLI:

```bash
docker ps
```

---

## Create Container

HTTP request:

```http
POST /containers/create
```

Equivalent:

```bash
docker run nginx
```

---

## Start Container

HTTP request:

```http
POST /containers/{id}/start
```

---

# Docker Socket Communication

By default, Docker communicates through:

```text
/var/run/docker.sock
```

Example:

Running:

```bash
docker ps
```

Actually performs:

```text
Docker CLI
    │
    ▼
docker.sock
    │
    ▼
dockerd
```

---

# Check Docker Socket

Linux:

```bash
ls -l /var/run/docker.sock
```

Example:

```text
srw-rw---- root docker docker.sock
```

The socket is owned by:

```text
root
docker group
```

---

# Why Docker Socket Is Dangerous

Anyone with access to:

```text
/var/run/docker.sock
```

can control Docker.

Example:

```bash
docker run -v /:/host alpine
```

This mounts the host filesystem inside a container.

The user could potentially access the entire host system.

Therefore:

```text
Docker Socket = Root-Level Docker Control
```

Protect it carefully.

---

# Enable Docker API Over TCP

Docker can expose the API through TCP.

Example:

```text
tcp://localhost:2375
```

Secure version:

```text
tcp://localhost:2376
```

---

# Security Warning

Never expose:

```text
2375
```

without TLS.

Because:

```text
Anyone
   │
   ▼
Docker API
   │
   ▼
Host Control
```

---

# Docker API Version

Check Docker API version:

```bash
docker version
```

Example:

```text
API version: 1.52
```

Docker maintains API versions to provide compatibility between clients and daemon versions.

---

# Using Docker API With curl

Example: List containers

```bash
curl --unix-socket /var/run/docker.sock \
http://localhost/containers/json
```

Response:

```json
[
 {
   "Id":"abc123",
   "Image":"nginx"
 }
]
```

---

# Create Container Using API

CLI equivalent:

```bash
docker run nginx
```

API request:

```http
POST /containers/create
```

Request body:

```json
{
 "Image":"nginx"
}
```

Response:

```json
{
 "Id":"container_id"
}
```

---

# Start Container Using API

Request:

```http
POST /containers/container_id/start
```

Result:

```text
Container starts running
```

---

# Docker SDKs

Instead of manually sending REST requests, developers use Docker SDKs.

Popular languages:

- Python
- Go
- Java
- Node.js

---

# Python Docker SDK Example

Install:

```bash
pip install docker
```

Example:

```python
import docker

client = docker.from_env()

container = client.containers.run(
    "nginx",
    detach=True
)

print(container.id)
```

This creates and starts an nginx container.

---

# Go Docker SDK

Docker itself is written in Go.

Go Docker SDK is commonly used in:

- Kubernetes tools
- DevOps automation
- Infrastructure software
- Container management systems

---

# Practical Automation Examples

## 1. Automatic Container Recovery

Example:

```text
Server Restart

      ↓

Automation Script

      ↓

Docker API

      ↓

Start Required Containers
```

---

## 2. Monitoring System

Example:

```text
Monitoring Application

        ↓

Docker API

        ↓

Collect Container Statistics

        ↓

Create Dashboard
```

---

## 3. Custom Deployment Platform

Instead of:

```bash
docker run
```

A company can build:

```text
Internal Deployment Platform

        ↓

Docker Engine API

        ↓

Containers
```

---

# Container Management API Examples

## List Containers

API:

```http
GET /containers/json
```

CLI:

```bash
docker ps
```

---

## Inspect Container

CLI:

```bash
docker inspect nginx
```

API:

```http
GET /containers/nginx/json
```

---

## Stop Container

CLI:

```bash
docker stop nginx
```

API:

```http
POST /containers/nginx/stop
```

---

## Remove Container

CLI:

```bash
docker rm nginx
```

API:

```http
DELETE /containers/nginx
```

---

# Image API

## Pull Image

CLI:

```bash
docker pull nginx
```

API:

```http
POST /images/create
```

---

## List Images

API:

```http
GET /images/json
```

---

## Remove Image

API:

```http
DELETE /images/{name}
```

---

# Volume API

## Create Volume

```http
POST /volumes/create
```

---

## List Volumes

```http
GET /volumes
```

---

## Remove Volume

```http
DELETE /volumes/{name}
```

---

# Network API

## Create Network

```http
POST /networks/create
```

---

## List Networks

```http
GET /networks
```

---

# Docker API Security Best Practices

## 1. Protect Docker Socket

Avoid:

```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock
```

unless absolutely required.

---

## 2. Use TLS

For remote Docker API access:

```text
2376 + TLS
```

---

## 3. Authentication

Use:

- TLS certificates
- Firewall restrictions
- VPN access
- Limited permissions

---

# Docker API vs Kubernetes API

Important DevOps comparison:

| Docker API | Kubernetes API |
|------------|----------------|
| Controls containers on one host | Controls containers across clusters |
| Single Docker daemon | Cluster control plane |
| Container-level management | Application orchestration |

---

# Real-World Usage

Docker Engine API is used by:

- CI/CD systems
- Monitoring platforms
- Developer platforms
- Container management tools

Examples:

- Jenkins
- GitLab Runner
- Portainer
- Internal deployment systems

---

# Common Interview Questions

## What does Docker CLI communicate with?

Docker CLI communicates with the Docker daemon through the Docker Engine API.

---

## What is docker.sock?

`docker.sock` is a Unix socket used for communication between Docker CLI and Docker daemon.

---

## Why is mounting docker.sock dangerous?

Because it gives access to control the Docker daemon, which can often provide equivalent privileges to host root access.

---

## Can Docker be controlled without CLI?

Yes.

Docker can be controlled using:

- Docker Engine API
- Docker SDKs
- Automation tools

---

## Which protocol does Docker API use?

Docker Engine API uses:

```text
REST API over HTTP
```

---

# Key Takeaways

By the end of this lesson, you should understand:

- Docker Engine API architecture
- Docker CLI vs API communication
- REST API operations
- Docker socket communication
- API security risks
- Docker SDK usage
- Container automation
- Docker API vs Kubernetes API

The Docker Engine API is the foundation behind many automation systems and container management platforms.