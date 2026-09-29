# Lesson 3 — Docker Images Deep Dive
This is one of the MOST important Docker topics.

If you understand images deeply:
- Dockerfiles become easy
- optimization becomes easy
- debugging becomes easy

## What Is a Docker Image?
Image = read-only template.

## Contains:
- OS filesystem
- dependencies
- runtime
- app code
- configs

Example images:
- nginx
- ubuntu
- node:20
- python:3.12
- mysql

## Check Local Images
```bash 
# Both commands are for same purpose
docker images

docker image ls
```
Shows:
- repository
- tag
- image id
- size

## Image Tags
```bash 
Example: node:20

# Meaning: image:tag
```

## Pull Specific Version
```bash 
docker pull nginx:1.27
```
Never rely blindly on: latest (In production)

## Image Layers (VERY IMPORTANT)
Docker images are layered.
```Dockerfile 
FROM ubuntu
RUN apt udpdate
RUN apt install nginx
COPY . .

# Each instruction creates a new layer.
```

## Layer Visualization
```bash 
Layer 4 → App files
Layer 3 → nginx installed
Layer 2 → apt update
Layer 1 → ubuntu base
```
> Important: Docker reuses unchanged layers.

**This is why builds become fast.**

## Why Layers Matter
Benefits:
- caching
- smaller downloads
- faster builds
- layer reuse

## Check Image History
```bash 
docker history nginx

# Shows image layers. (Very usefull)
```
---
## Container Layer
When container starts:

Docker adds:
```bash 
thin writable layer
```
on top of image.

Image itself stays immutable.

---
## Important: Copy-On-Write
When file changes:

Docker copies file to writable layer

original image unchanged
--- 

## Dockerfile
Blueprint for building custom images.

### Your First Dockerfile
**Create:**
```bash 
# D must be capital
touch Dockerfile
vim Dockerfile
```
**Content**
```Dockerfile 
FROM nginx
COPY . /usr/share/nginx/html

# Meaning:
# start from nginx image
# copy website files
```

## Build Image
Inside project folder:
```bash 
docker build -t mysite . 

# Meaning:
# -t → tag name
# . → current directory build context
```

## Run Custom Image
```bash 
docker run -d -p 8080:80 --name firstProject mysite

# Now your own website runs. http://localhost:8080
```

## Build Context
Important concept.

When running:
```bash
docker build .
```
Docker sends current folder to daemon.

Large folders = slow builds.

## .dockerignore
Prevent unnecessary files.
> Like .gitignore

Example: Very important.
```bash
node_modules
.git
.env
dist
```

## Docker Build Cache
Docker caches unchanged layers.
```dockerfile
COPY package.json .
RUN npm install
COPY . .
```
> If app code changes:
- npm install layer reused
- Huge speed improvement.

## BAD Dockerfile
```dockerfile
COPY . .
RUN npm install
```
> Any file change:
- npm install reruns
- Slow.

## GOOD Dockerfile
```dockerfile
COPY package*.json
RUN npm install

COPY . .

# Efficient caching.
```

## Common Dockerfile Instructions

### FROM
Base image.
```dockerfile
FROM ubuntu
```

### WORKDIR
Set working directory.
```dockerfile
WORKDIR /app
```

### COPY
Copy files.
```dockerfile
COPY . .
```

### RUN
Execute during build (Image)
```dockerfile
RUN npm install
```

### CMD
Default startup command.
```dockerfile
CMD ["npm", "start"]

# Runs when container starts.
```

### EXPOSE
Document/Container port.
```dockerfile
EXPOSE 3000

# Does NOT publish port automatically.
```

### ENV
Environment variable.
```dockerfile
ENV NODE_ENV=production
```

### Real Node.js Example
```dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Build & Run
**Build:**
```bash
docker build -t nodeapp .
```
**Run:**
```bash
docker run -d -p 3000:3000 nodeapp
```

## Image Size Matters
Large images:
- slow deploys
- slow CI/CD
- higher storage cost

## Smaller Base Images
Example:
```bash
node:20-alpine
```
> Alpine Linux is tiny.

## Compare Sizes
```bash
docker images
```
Observe:
- ubuntu huge
- alpine tiny

## Remove Images
```bash
docker rmi nginx
```

## Force remove:
```bash
# When image is used by running container
docker rmi -f nginx
```

## Dangling Images
Unused intermediate layers.

clean
```bash
docker image prune
```

Important Mental Model
```
Dockerfile → builds Image
Image → creates Container
Container → runs Process
```