# Lesson 7 — Advanced Dockerfiles
Now we move into professional Docker usage.

This lesson is VERY important for:
- production systems
- CI/CD
- optimization
- security


## CMD vs ENTRYPOINT
One of the most asked Docker interview topics.

## CMD
Default command - Can be overridden easily.

Example:
```bash
CMD ["nginx", "-g", "daemon off;"]
```
Run:
```bash
docker run myimage
```
Override:
```bash
docker run myimage ls
```
> **ls** replaces CMD.

## ENTRYPOINT
Main executable.

Example:
```bash
ENTRYPOINT ["nginx"]
```
Now
```bash
docker run myimage
```
always runs nginx.

Arguments append automatically.

## ENTRYPOINT + CMD Together
Best production practice.

```bash
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
```
```bash
# Meaning:
nginx -g "daemon off;"
```
Override only arguments:
```bash
docker run myimage -T
```
Becomes:
```bash
nginx -T
```

## Shell Form vs Exec Form

Shell Form
```bash
CMD npm start

# Runs inside shell: /bin/sh -c
```
Exec Form (Preferred)
```bash
CMD ["npm", "start"]
```
Better: Use exec form in production.
- signal handling
- PID 1 behavior
- production stability

## Multi-Stage Builds
Huge optimization concept.

Problem: Normal images become massive.

Example:
- build tools
- compilers
- node_modules
- caches

all remain inside image.

## Solution → Multi-Stage Builds
Use separate build stages.
```bash
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Building a small and lightweight image
FROM nginx-alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

## What Happens?
Stage 1: builds app

Stage 2: copies only final output

Final image becomes tiny.

## Huge Benefits
- smaller image
- faster deployment
- improved security
- reduced attack surface

## Build Arguments (ARG)
Used during build time.
```bash
ARG APP_VERSION=1.0
```

## Build:
```bash
docker build --build-arg APP_VERSION=2.0 .
```
Important: ARG exists only during build

## ENV Variables
Persist inside container.
```bash
ENV NODE_ENV=production

# Available at runtime.
```

### Difference
ARG: Build-time only.

ENV: Runtime environment.


## HEALTHCHECK

Production-grade feature.

Docker checks if app healthy.

Example:
```bash
HEALTHCHECK CMD curl --fail http://localhost || exit 1
```
Container status becomes:
- healthy
- unhealthy
> Very important for orchestration.

## USER (Security)
By default: containers run as root.

Dangerous.

Create Non-Root User
```bash
RUN useradd -m appuser
USER appuser

# Huge production best practice.
```

## WORKDIR
Avoid using cd.

Bad:
```bash
RUN cd /app
```
Good:
```bash
WORKDIR /app
```

## COPY vs ADD
Most beginners misuse ADD.

COPY: Simple file copy.
```bash
COPY . .
```
ADD

Extra features:
- auto extract tar
- remote URLs

> Usually avoid unless needed.


## Layer Optimization
Bad:
```bash
RUN apt update
RUN apt install -y curl

# Creates extra layer.
```

Better
```bash
RUN apt update && apt install -y curl
# Fewer layers.
```

## Clean Package Cache
Bad:
```bash
RUN apt install -y curl
# Cache remains.
```
Better
```bash
RUN apt update && \
    apt install -y curl && \
    rm -rf /var/lib/apt/lists/*
# Smaller image.
```

## Alpine Images
Tiny Linux distro.

Example:
```bash
node:20-alpine

# Very small image size.
```

## But Beware
Some packages may fail on Alpine due to:
> musl libc

Not always ideal.

## Distroless Images
Advanced production images.

Contain:
- only app runtime
- no shell
- no package manager

Extremely secure.

Used heavily in Kubernetes/cloud-native systems.

## .dockerignore
Critical optimization.

Example:
```bash
node_modules
.git
.env
dist
coverage

# Prevents huge build contexts.
```

## Cache Optimization Strategy
Best practice order:
```bash
COPY package*.json ./
RUN npm install

COPY . .
```
- Dependency layer reused.
- Massive speed improvement.

## Production Node.js Dockerfile
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json
RUN npm ci --only=production
COPY . .
EXPOSE 3000
USER node
CMD ["node", "server.js]
```

## Important Production Concepts
Immutable Containers: Never modify running containers manually.

Instead:
- rebuild image
- redeploy container

Infrastructure should be reproducible.

## One Process Per Container
Good:
```bash
nginx container
mysql container
redis container
```
Bad:
```bash
everything inside one container
```

## Small Images = Better
Benefits:
- faster pull
- lower bandwidth
- faster CI/CD
- fewer vulnerabilities

## Important Mental Model
Dockerfile quality affects:
- performance
- security
- cost
- deploy speed
- maintainability