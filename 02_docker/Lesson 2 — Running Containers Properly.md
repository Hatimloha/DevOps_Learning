# Lesson 2 — Running Containers Properly

Now you’ll actually control containers.

> This lesson is ***extremely*** important.

# First Real Container
Run:
```bash
docker run nginx
```

## What happens:
- mage downloaded (if missing)
- container created
- nginx process starts
```
Terminal hangs because:

nginx runs in foreground
```
Stop it:
```bash
CTRL + C

# Container stops.
```

## See Running Containers
```bash
docker ps
```
Shows:
- container id
- image
- ports
- status
- names

## See All Containers (All Status)
```bash
docker ps -a
```
Includes: stopped containers

## Detached Mode (-d)
```bash
# Run container in background:
docker run -d nginx

# Now terminal is free.
# Docker prints: container id

# Check
docker ps
```

## Container Names
Docker auto-generates weird names.
> Example: sleepy_einstein

Add custom name:
```bash
docker run -d --name mynginx nginx

# Now easier to manage.
```

## Stop Container
```bash
docker stop mynginx
```
## Start Existing Container
```bash
# Check container 
docker ps - a

# Syntax: docker start <container id | name > 
docker start mynginx
```

## Remove Container
Container must be stopped first.
```bash
# Only Stop Container
docker rm mynginx

# Remove Running Container Forcefully
docker rm -f mynginx
```

## Port Mapping (-p)
Most important beginner concept.

Container has internal ports.

> Example: nginx listens on port 80 INSIDE container

Expose it:
```bash
docker run -d -p 8080:80 --name mynginx nginx

# Meaning: host_port:container_port
```
Now open: You’ll see nginx page.
```bash
# Browser: http://localhost:8080

# Linux: curl http://localhost:8080
```

## Understanding Port Mapping
```bash
Your PC Port 8080
        ↓
Container Port 80
```
## Multiple Containers with Different Ports
```bash
# Machine 1
docker run -d -p 8080:80 nginx
# Machine 2
docker run -d -p 8081:80 nginx
```

## Logs: What is hppening inside the container
```bash
docker logs mynginx
```
## Live logs: 
```bash
docker logs -f mynginx
```

## Execute Command Inside Container
Huge concept.
```bash
# Syntax: docker exex -it(interactive terminal) <container id | name> <type of shell Eg: Bash, Sh, Dash>
docker exec -it mynginx bash 

# Now you’re INSIDE container shell.
```

## Inspect Container
Detailed metadata:
```bash
# Syntax: docker inspect <container id | name>
docker inspect mynginx
```
Includes:
- IP address
- volumes
- network
- config
- ports

## Environment Variables
Pass env vars:
```bash
docker run -d -e APP_ENV=production nginx

# Very important later.
```

## Interactive Containers
Run Ubuntu interactively:
```bash
docker run -it ubuntu bash

# Now inside Ubuntu container.
# Try: ls, pwd, apt update

# To exit container from -it mode while deploying: Container stops. 
exit
```

## Container Lifecycle
Important concept.
```bash
created
running
stopped
removed

# Commands affect lifecycle.
```

## Restart Policy
Auto-restart container:
```bash 
docker run -d --restart always nginx

# Useful for production
```

```bash
## The Four Restart Policiesno 

1. (Default): The container will not automatically restart under any circumstances.

2. on-failure[:max-retries]: Restarts the container only if it exits with a non-zero exit code (indicating an error). You can optionally limit the number of attempts (e.g., on-failure:5).

3. always: Always restarts the container if it stops. If it is manually stopped, it will still restart when the Docker daemon restarts or when the container itself is manually started again.

4. unless-stopped: Similar to always, but with one key difference: if the container was manually stopped (e.g., via docker stop), it will not restart even after a Docker daemon or system reboot.
```

## Difference Between Image & Container
### Image
Static blueprint.

### Container
Running process created from image.

One image → many containers.

### Example:
```bash 
docker run -d nginx
docker run -d nginx
docker run -d nginx

# 3 containers from same image.
```

## Important Mental Model
A container is basically:
```bash 
Isolated Linux process

# NOT a full VM.
```

## Very Important Concept
Containers are ephemeral.

> Meaning: if container deleted
internal changes disappear

### Persistence comes later using:
- volumes
- bind mounts

