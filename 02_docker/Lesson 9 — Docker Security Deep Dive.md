# Lesson 9 — Docker Security Deep Dive
Security is often ignored by beginners, but in production it's a core responsibility.

## Why Docker Security Matters
A container is:
```bash
an isolated process
```
Not a full VM.

If a container is compromised:
- data may be exposed
- other containers may be affected
- host resources may be abused
- attackers may attempt container escape

## Security Layers
Think of Docker security as:
```bash
Image Security
     ↓
Container Security
     ↓
Host Security
     ↓
Network Security
```

## Principle of Least Privilege
Containers should only have:
```bash
minimum permissions required
```
Nothing more.

## Problem #1 — Running as Root
Most images run as:
```bash
root
```

## Check:
docker exec -it mycontainer id
```bash
uid=0(root)
```
This is dangerous.

## Run as Non-Root User
Dockerfile:
```bash
RUN useradd -m appuser

USER appuser

# Or:

docker run --user 1000:1000 nginx
```

## Production best practice:
```bash
Never run application containers as root.
```

## Linux Capabilities
Root normally has many powers.

Docker removes some by default.

Examples:
- mount filesystems
- modify kernel settings
- network administration

## View Capabilities
Inside container:
```bash
cat /proc/self/status
```
Look for: CapEff


## Drop Capabilities
Remove unnecessary permissions:
```bash
docker run \
--cap-drop ALL \
nginx
```

## Add only what you need:
```bash
docker run \
--cap-drop ALL \
--cap-add NET_BIND_SERVICE \
nginx
```

## Dangerous Flag: Privileged Mode
Avoid:
```bash
docker run --privileged
```
This gives near-host-level access.

Think:
```bash
container ≈ host access

# Only use when absolutely necessary.
```

## Read-Only Filesystem
Prevent writes inside container:
```bash
docker run \
--read-only \
nginx
```
Benefits:
- blocks many attacks
- prevents accidental changes

## Limit Resources
Use cgroups.

Memory:
```bash
docker run -m 256m nginx
```

## CPU:
```bash
docker run --cpus=1 nginx

# Prevents resource abuse.
```

## Security Profiles
Docker supports:

### Seccomp
- Filters dangerous system calls.
- Default profile blocks many risky operations.

Custom profile:
```bash
docker run \
--security-opt seccomp=myprofile.json
```

## AppArmor
Linux Mandatory Access Control.

Restricts:
- file access
- capabilities
- system interactions

Common on Ubuntu.

## SELinux
Common on enterprise Linux distributions.

Provides strong container isolation.

Frequently used with:
- Red Hat
- Rocky Linux
- AlmaLinux

## Protect the Docker Socket
Very important.

Docker daemon socket:
```bash
/var/run/docker.sock
```
Anyone with access can control Docker.

Equivalent to:
```bash
root-level power
```
Avoid mounting it casually.

## Bad:
Unless you fully understand the risks
```bash
-v /var/run/docker.sock:/var/run/docker.sock
```

## Image Security
Security starts before container runs.

### Use Trusted Images
Prefer official images.

Examples:
- official nginx
- official postgres
- official node

Avoid random unknown images.

## Pin Versions
Bad:
```bash
FROM node:latest
```
Good:
```
FROM node:20.19-alpine
```
Predictable deployments.

## Scan Images
Use:
- Trivy

Example:
```bash
trivy image myapp
```
Finds:
- CVEs
- vulnerable packages
- secrets

## Docker Scout
Built into the Docker ecosystem.

Provides:
- vulnerability reports
- remediation suggestions
- dependency insights

## Reduce Attack Surface
Smaller image:
```bash
fewer packages
fewer vulnerabilities
```
Prefer:
```bash
node:20-alpine
```
or distroless images.

## Secrets Management
Never do:
```bash
ENV DB_PASSWORD=root123

# or

password: root123
```
in source control.

## Better Options
Use:
- environment variables from CI/CD
- secret managers
- orchestrator secrets

Examples:
- HashiCorp Vault
- Kubernetes Secrets

## Network Security
Only expose required ports.

Bad:
```bash
-p 3306:3306
# for public databases.
```
Good:
```bash
backend ↔ database
# on internal Docker network.
```

## Use Custom Networks
Separate services:
```bash
frontend_net
backend_net
database_net
```
Limits blast radius.

## Container Immutability
Never SSH into containers and manually fix things.

Bad:
```bash
container
  ↓
manual changes
```
Good:
```bash
update Dockerfile
  ↓
build image
  ↓
deploy
```
> Everything reproducible.

## Health Checks
Detect broken containers automatically.

Dockerfile:
```bash
HEALTHCHECK CMD curl --fail http://localhost || exit 1
```

Container becomes:
```bash
healthy
```
or
```bash
unhealthy
```

## Rootless Docker
Advanced feature.
```bash
Run Docker without root privileges.
```
Benefits:
- smaller attack surface
- stronger isolation

Useful in multi-user environments.

## Security Checklist
```bash
Before deploying:

✅ Non-root user

✅ Specific image version

✅ No secrets in image

✅ Resource limits

✅ Health checks

✅ Image scanning

✅ Read-only filesystem where possible

✅ Minimal capabilities

✅ Custom networks

✅ Updated base image
```

## Common Interview Questions
Why is running containers as root dangerous?
```bash
Because a compromised application gets root privileges inside the container, increasing the risk of host impact.
```

What is seccomp?
```bash
A Linux syscall filtering mechanism that restricts what system calls a container can make.
```

Why use Trivy?
```bash
To scan images for vulnerabilities, secrets, and misconfigurations.
```

Why avoid --privileged?
```bash
It removes many isolation boundaries and gives the container extensive host access.
```

Why use a read-only filesystem?
```bash
To reduce attack surface and prevent unauthorized modifications.
```

## Mental Model
```bash
Security is not one feature.

It is many small protections working together.
```
A secure container is built through:
- hardened images
- least privilege
- limited resources
- controlled networking
- continuous scanning