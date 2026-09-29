# Lesson 8 — Docker Internals Deep Dive
Now we go under the hood.

This separates:
- Docker users

    from

- engineers who truly understand containers

## Big Picture
When you run: **docker run nginx**

Many things happen internally.

Docker is NOT **magic**.

It uses Linux kernel features.

## Docker Architecture
High-level flow:
```bash
Docker CLI
    ↓
Docker Daemon
    ↓
containerd
    ↓
runc
    ↓
Linux Kernel
```

## Docker CLI
Command you type:
```bash
docker run nginx
```
- CLI only sends API requests.
- It does NOT create containers itself.

## Docker Daemon (dockerd)
Responsible for:
- images
- containers
- networks
- volumes
- API handling

Check daemon:
```bash
docker info
```

## containerd
Core container runtime manager.

Handles:
- image pulling
- storage
- lifecycle
- low-level container operations

> Modern Docker depends heavily on: containerd

## runc
Actually starts containers.

Implements: Open Container Initiative runtime spec.

Responsible for:
- namespaces
- cgroups
- process isolation

> Very low-level.

## OCI (Open Container Initiative)
Standardization project.

Defines:
- image format
- runtime standards

This allows compatibility between:
- Docker
- Kubernetes
- Podman
- CRI-O
- containerd

# What Is Actually a Container?
Most important concept:
```bash
Container = isolated Linux process

# NOT a VM.
```

## Linux Namespaces
Provide isolation.

This is core container technology.

### 1. Types of Namespaces
#### PID Namespace

Isolates processes.

Container sees its own process tree.

Inside container:
```bash
ps aux

# looks isolated.
```

#### Network Namespace
Each container gets:

- own IP
- own interfaces
- own routing table

Like mini virtual machine networking.

#### Mount Namespace
Isolated filesystem view.

Container sees its own filesystem.

#### UTS Namespace
Hostname isolation.

Container hostname differs from host.

#### IPC Namespace
Isolates shared memory/process communication.

#### User Namespace
Maps container users separately from host users.

Security feature.

### 2. cgroups (Control Groups)
Limit resources.

Docker uses cgroups for:
- CPU limits
- memory limits
- IO limits
- process limits

Example Memory Limit
```bash
docker run -m 256m nginx

## Container max RAM: 256 MB
```

Example CPU Limit
```bash
docker run ---cpus=1 nginx

# Container limited to 1 CPU core.
```

## Why cgroups Matter
Prevents one container from:

- crashing host
- consuming all RAM
- exhausting CPU

Critical in production.

### 3. Filesystem Layers
Docker uses: 
```bash
Union Filesystem
```

## overlay2 Storage Driver
Most common Docker storage driver.

Layers combine into unified filesystem.

Example Layers:
```bash
ubuntu base
   +
node runtime
   +
npm packages
   +
app code
```
> Container sees merged filesystem.

## Writable Layer
When container starts:

Docker adds:
```bash
thin writable layer
```
on top of image layers.

Changes go there.

## Why Containers Start Fast- 
Because:
- no full OS boot
- no kernel startup
- only process startup

Container startup:
```bash
milliseconds
```

## Docker Networking Internals
Bridge network uses:
- virtual ethernet pairs
- Linux bridge
- iptables/NAT

> Docker manipulates Linux networking automatically.

Example

Container gets: **eth0**

Host gets paired interface.

Traffic routed through Docker bridge.

## Port Publishing Internally
When using:
```bash
docker run -p 8080:80 nginx
```
Docker configures:
- NAT
- iptables forwarding

Traffic:
```bash
host:8080 → container:80
```

## Docker Image Internals
Image contains:
- layers
- metadata
- manifest

Stored locally.

## Where Images Stored
```bash
Linux: /var/lib/docker
```
Contains:
- images
- containers
- volumes
- networks

## Inspect Low-Level Details
Container Metadata
```bash
docker inspect nginx
```

## Process Tree
```bash
docker top nginx
```

## Resource Usage
```bash
docker stats
```
Real-time:
- CPU
- RAM
- network usage

## Events Stream
```bash
docker events
```
- Live Docker events.
- Very useful for debugging.

## Logs Path (Linux)
```bash
/var/lib/docker/containers/
```

## Rootless Containers
- Advanced security feature.
- Docker can run without root privileges.
- Reduces attack surface.

## Security Isolation Limits
- Containers are NOT perfect V- Ms.
- They share host kernel.
- Kernel exploit could escape container.

This is why:
- updates
- seccomp
- AppArmor
- SELinux

> matter.

## Container Runtime Ecosystem
Beyond Docker:
- Podman
- CRI-O
- containerd

> All rely on OCI standards.

## Docker vs Kubernetes
```bash
# Docker:
single host container management

# Kubernetes:
large-scale orchestration
```

## Important Mental Model
```bash
Docker is mostly:
Linux kernel features
+ tooling
+ automation
```
