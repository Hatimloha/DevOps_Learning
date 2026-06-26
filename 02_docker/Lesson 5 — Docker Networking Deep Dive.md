# Lesson 5 — Docker Networking Deep Dive
This is where Docker becomes truly powerful.

You’ll learn how containers communicate.

## Why Networking Matters
Real applications need communication.

Example:
```bash
Frontend → Backend → Database → Redis

# Containers must talk to each other.
```

## Docker Networking Basics
Every container gets:
- network interface
- IP address
- DNS entry

> Docker creates virtual networks internally.

## Check Networks
```bash
docker network ls
```

## Default networks usually:
```bash
bridge
host
none
```

## Default Bridge Network
When you run:
```bash
docker run -d nginx

# Container joins: bridge
```
> network automatically.

## Inspect Bridge Network
```bash
docker network inspect bridge
```
You’ll see:
- subnet
- gateway
- connected containers

## Container IP Address
```bash
# Syntax docker inspect <container id / name>
docker inspect mynginx
```
Search: IPAddress
```bash
docker inspect mynginx | grep -i IPAddress
```

## Problem with Default Bridge
Containers CANNOT resolve each other by name automatically on default bridge.

This is why custom networks are important.

## Create Custom Network
```bash
docker network create mynet

# Check:
docker network ls
```

## Run Containers on Same Network
```bash 
# Terminal 1
docker run -dit \
--name ubuntu1 \
--network mynet \
ubuntu bash
```

```bash 
# Terminal 2
docker run -dit \
--name ubuntu2 \
--network mynet \
ubuntu bash
```

**Test Communication**
```bash
docker exec -it ubuntu1 bash

# Ping
ping ubuntu2
```
Works because Docker provides internal DNS.

Huge concept.


## Important Mental Model
Inside Docker network:
```bash
container name = hostname
```

## Real Example
Backend container connects to DB:
```bash
mysql://mysql:3306
```
Where: "mysql" is container name.
> No hardcoded IP needed.

## Network Drivers
Important types:

### 1. Bridge Network
Default for standalone containers. **"Most common"**

### 2. Host Network
Container shares host networking. **"No isolation"**
```bash
# Example
docker run --network host nginx
```
Container uses host ports directly. **"Mostly Linux"**

### 3. None Network
No networking.
```bash
# Example: Container isolated completely.
docker run --network none ubuntu
```

### 4. Overlay Network
Used in:
- Docker Swarm
- Kubernetes
> **Advanced topic:** Connects containers across multiple hosts.

## Port Publishing vs Internal Networking
Very important distinction.

### Internal Container Communication
Containers on same network communicate directly.
> NO -p needed.

### External Access
Use:
```bash
-p host:container
# to expose app outside Docker.
```

## Example Architecture
```bash
Browser
   ↓
Host Port 8080
   ↓
Frontend Container
   ↓
Backend Container
   ↓
Database Container
```

## Connect Existing Container to Network
```bash
docker network connect mynet mynginx
```

## Disconnect:
```bash
docker network disconnect mynet mynginx
```

## Remove Network
No containers attached first.
```bash
docker network rm mynet
```

## DNS Inside Docker
Docker has built-in DNS server.

Containers resolve: Automatically.
- container names
- service names

Real Backend Example: Run Mysql
```bash
docker run -d \
--name mysql-app \
--network mynet \
-e MYSQL_ROOT_PASSWORD=root \
mysql
```
Run app:
```bash
docker run -it \
--network mynet \
node:20 bash
```
> App connects using: NOT IP address.
```bahs
mysql
```

## Inspect Container Network 
```bash
docker inspect mynginx
```
> Check: Networks Section

## Important Production Concept
Never expose DB publicly unless necessary.
```bash
# Good:
backend ↔ mysql (internal network only)

# Bad:
mysql exposed to internet
```

## Multi-Container Architecture
Typical setup:
```bash
frontend_net
backend_net
db_net

# Segmentation improves security.
```
