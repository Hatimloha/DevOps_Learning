# Lesson 14 — Rootless Docker

## Overview

Traditional Docker runs with **root privileges**.

Example workflow:

```text
Docker CLI
      │
      ▼
Docker Daemon (root)
      │
      ▼
Containers
```

The Docker daemon has powerful access to the host system.

Rootless Docker changes this security model:

```text
Docker CLI
      │
      ▼
Docker Daemon (normal user)
      │
      ▼
Containers (non-root)
```

---

# Why Rootless Docker?

## Traditional Docker Security Risk

The Docker daemon runs as root:

```text
/usr/bin/dockerd
```

If an attacker gains access to the Docker daemon:

```text
Container
    │
    ▼
Docker Daemon
    │
    ▼
Host Root Access
```

This creates a major security concern.

---

# What Is Rootless Docker?

Rootless Docker allows:

- Docker daemon
- Container runtime
- Containers

to run without root privileges.

The normal user owns the complete Docker environment.

---

# Rootless Docker Architecture

## Normal Docker

```text
root user

dockerd
  │
  ▼
containerd
  │
  ▼
runc
  │
  ▼
container
```

---

## Rootless Docker

```text
normal user

dockerd
  │
  ▼
containerd
  │
  ▼
rootless runc
  │
  ▼
container
```

---

# Technologies Behind Rootless Docker

Rootless Docker depends on several Linux kernel features and tools.

---

# 1. User Namespace

The most important feature.

User namespaces map container users to different host users.

Example:

Inside container:

```text
root
UID 0
```

Host sees:

```text
UID 1000
```

Meaning:

Container root ≠ Host root

The container's root user does not have real root privileges on the host.

---

# 2. RootlessKit

RootlessKit creates the rootless environment.

It handles:

- User namespaces
- Network isolation
- Process isolation

---

# 3. slirp4netns

Provides networking without requiring root privileges.

Normal Docker networking:

```text
Container
    │
    ▼
Docker Bridge Network
    │
    ▼
Host
```

Rootless networking:

```text
Container
    │
    ▼
slirp4netns
    │
    ▼
Host
```

---

# Rootless Docker Installation

Example for Linux:

## Install Dependencies

```bash
sudo apt install uidmap
```

---

## Install Rootless Docker

```bash
dockerd-rootless-setuptool.sh install
```

---

## Enable Service

```bash
systemctl --user enable docker
```

---

## Start Service

```bash
systemctl --user start docker
```

---

# Check Rootless Mode

Run:

```bash
docker info
```

Look for:

```text
Security Options:
 rootless
```

---

# Running Containers With Rootless Docker

Docker commands remain the same.

Example:

```bash
docker run nginx
```

Check containers:

```bash
docker ps
```

---

# Rootless Docker Storage

## Normal Docker Storage

```text
/var/lib/docker
```

Owned by root.

---

## Rootless Docker Storage

```text
~/.local/share/docker
```

Each user has separate Docker storage.

Example:

```text
Developer A
   |
   └── Docker Storage

Developer B
   |
   └── Docker Storage
```

---

# Rootless Docker Networking

## Normal Docker

```text
Container
    │
    ▼
docker0 bridge
    │
    ▼
Host
```

---

## Rootless Docker

```text
Container
    │
    ▼
slirp4netns
    │
    ▼
Host
```

---

# Port Limitations

Normal Docker:

```bash
docker run -p 80:80 nginx
```

Works because Docker has root privileges.

---

Rootless Docker:

Ports below `1024` require additional permissions.

Examples:

```text
80
443
```

may not work directly.

Common alternatives:

```text
8080
8443
```

---

# Rootless Docker Advantages

## 1. Better Security

Reduces the impact of container escape vulnerabilities.

---

## 2. Multi-User Systems

Each user can manage their own containers.

Example:

```text
Developer A
      |
      ▼
  Containers


Developer B
      |
      ▼
  Containers
```

---

## 3. Safer Development

Developers do not require:

```bash
sudo docker
```

---

## 4. Reduced Host Impact

A compromised container has fewer privileges.

---

# Limitations of Rootless Docker

Rootless Docker improves security but has trade-offs.

---

# 1. Performance

Networking can be slightly slower.

Reason:

```text
slirp4netns overhead
```

---

# 2. Privileged Containers

Containers requiring:

```bash
--privileged
```

may not work properly.

---

# 3. Hardware Access

Some hardware features are difficult to access:

- GPUs
- Special devices
- Kernel modules

---

# 4. Low Ports

Ports:

```text
80
443
```

require extra configuration.

---

# Root Docker vs Rootless Docker

| Feature | Root Docker | Rootless Docker |
|---------|-------------|----------------|
| Docker Daemon | root | normal user |
| Security | Lower | Higher |
| Performance | Better | Slightly lower |
| Hardware Access | Easy | Limited |
| Multi-user Support | Difficult | Better |
| Production Usage | Common | Growing |

---

# Rootless Docker vs Non-Root Container

These concepts are different.

---

## Rootless Docker

Docker daemon itself runs without root.

```text
dockerd = user
```

---

## Non-Root Container

Only the application runs as a non-root user.

Example:

```dockerfile
USER appuser
```

Architecture:

```text
dockerd = root

container user = appuser
```

---

# Rootless Docker in CI/CD

Rootless Docker is useful for:

- GitHub Actions runners
- GitLab runners
- Shared development servers
- Secure build environments

Example:

```text
CI Runner
    │
    ▼
Rootless Docker
    │
    ▼
Build Image
    │
    ▼
Push Registry
```

---

# Security Model Comparison

## Traditional Docker

```text
Container Root
       │
       ▼
Docker Daemon Root
       │
       ▼
Host Root
```

---

## Rootless Docker

```text
Container Root
       │
       ▼
User Namespace
       │
       ▼
Normal User
```

The privilege boundary is much stronger.

---

# Common Interview Questions

## Why use Rootless Docker?

Rootless Docker reduces security risks by allowing the Docker daemon to run without root privileges.

---

## How does Rootless Docker work?

It uses:

- User namespaces
- RootlessKit
- slirp4netns

to run Docker without requiring root access.

---

## Difference between Rootless Docker and Non-Root Container?

| Rootless Docker | Non-Root Container |
|-----------------|-------------------|
| Removes root from Docker daemon | Changes application user |
| Protects Docker runtime | Protects application process |

---

## Does Rootless Docker remove all security risks?

No.

It reduces privilege exposure but does not replace:

- Secure images
- Proper permissions
- Network security
- Vulnerability scanning
- Runtime monitoring

---

# Key Takeaways

By the end of this lesson, you should understand:

- Why Docker traditionally uses root privileges
- Rootless Docker architecture
- User namespaces
- RootlessKit
- slirp4netns networking
- Rootless installation
- Storage differences
- Networking limitations
- Security benefits
- Rootless Docker vs non-root containers
- CI/CD use cases

Rootless Docker is an important security improvement for modern container environments.