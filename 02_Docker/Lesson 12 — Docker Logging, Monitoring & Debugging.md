# Lesson 12 — Docker Logging, Monitoring & Debugging

## Overview

Building containers is only half the job.

A professional DevOps engineer must also know how to troubleshoot real production issues:

- Why did the container crash?
- Why can't the application connect to the database?
- Why is CPU usage at 100%?
- Why is memory continuously increasing?
- Why is the container restarting?

This lesson covers Docker debugging techniques used in real-world environments.

---

# The Docker Debugging Workflow

Always follow a structured debugging process.

```text
1. Check if container is running
            │
            ▼
2. Check container logs
            │
            ▼
3. Check resource usage
            │
            ▼
4. Inspect container configuration
            │
            ▼
5. Verify networking
            │
            ▼
6. Verify storage and volumes
            │
            ▼
7. Enter container for investigation
```

Avoid randomly running commands.

---

# Step 1 — Check Container Status

## Running Containers

```bash
docker ps
```

Shows currently running containers.

---

## All Containers

```bash
docker ps -a
```

Includes stopped containers.

Example:

```text
CONTAINER ID   IMAGE   STATUS
abc123         nginx   Up 10 minutes
xyz789         node    Exited (1)
```

### Important

```text
Exited (1)
```

means the application inside the container failed.

---

# Step 2 — Check Container Logs

Logs are usually the first place to investigate.

## View Logs

```bash
docker logs myapp
```

---

## Follow Logs Live

```bash
docker logs -f myapp
```

Similar to:

```bash
tail -f logfile
```

---

## Show Last Lines

```bash
docker logs --tail 20 myapp
```

---

## Show Timestamps

```bash
docker logs -t myapp
```

---

# Common Log Errors

## Port Already Used

Example:

```text
bind: address already in use
```

Meaning:

Another process is already using that port.

---

## Missing File

Example:

```text
No such file or directory
```

Meaning:

The application cannot find a required file.

---

## Database Connection Failure

Example:

```text
Connection refused
```

Meaning:

The application cannot reach the database service.

---

## Permission Error

Example:

```text
Permission denied
```

Meaning:

The process does not have required permissions.

---

# Step 3 — Monitor Container Resources

View real-time resource usage:

```bash
docker stats
```

Displays:

- CPU usage
- Memory usage
- Network I/O
- Block I/O
- Process count (PIDs)

---

## What To Look For

### High CPU

```text
CPU: 100%
```

Possible causes:

- Infinite loops
- Heavy processing
- Application bugs

---

### Increasing Memory

Possible causes:

- Memory leaks
- Incorrect caching
- Large data processing

---

### Unexpected Network Usage

Possible causes:

- Excessive API calls
- Data transfer issues
- Security problems

---

# Step 4 — Inspect Container Configuration

Get detailed container information:

```bash
docker inspect myapp
```

Provides:

- IP address
- Mounted volumes
- Environment variables
- Restart policy
- Port mappings
- Network configuration

Important sections:

```text
NetworkSettings
Mounts
Config
State
```

---

# Step 5 — Enter the Container

Sometimes you need to investigate from inside the container.

## Open Bash Shell

```bash
docker exec -it myapp bash
```

---

## If Bash Is Not Available

Use:

```bash
docker exec -it myapp sh
```

---

# Useful Commands Inside Containers

## Current Directory

```bash
pwd
```

---

## List Files

```bash
ls -la
```

---

## Environment Variables

```bash
env
```

---

## Running Processes

```bash
ps aux
```

---

## Network Interfaces

```bash
ip addr
```

---

## Listening Ports

```bash
ss -tuln
```

---

# Check Running Processes

From the Docker host:

```bash
docker top myapp
```

Shows processes running inside the container.

Useful for:

- Finding stuck processes
- Checking application startup
- Debugging CPU usage

---

# Container Events

Monitor Docker activity in real time:

```bash
docker events
```

Shows events like:

- Container start
- Container stop
- Container deletion
- Network changes
- Volume changes

Useful for debugging automation problems.

---

# Docker Networking Troubleshooting

## List Networks

```bash
docker network ls
```

---

## Inspect a Network

```bash
docker network inspect mynet
```

Check:

- Subnet
- Gateway
- Connected containers
- Network configuration

---

# Test Container Connectivity

Enter a container:

```bash
docker exec -it backend bash
```

Test another container:

```bash
ping mysql
```

Test HTTP connection:

```bash
curl http://frontend
```

### Best Practice

Use container names:

```text
mysql
backend
frontend
```

Do not rely on container IP addresses.

---

# Port Troubleshooting

Check published ports:

```bash
docker ps
```

Example:

```text
0.0.0.0:8080->80/tcp
```

Meaning:

Host port:

```text
8080
```

maps to container port:

```text
80
```

If no port mapping exists, the application cannot be reached externally.

---

# Volume Troubleshooting

Inspect container mounts:

```bash
docker inspect myapp
```

Look for:

```text
Mounts
```

Verify:

- Source path
- Destination path
- Read-only/read-write permissions

---

# Check Docker Disk Usage

View Docker storage:

```bash
docker system df
```

Shows:

- Images
- Containers
- Volumes
- Build cache

---

# Docker Cleanup Commands

## Remove stopped containers

```bash
docker container prune
```

---

## Remove unused images

```bash
docker image prune
```

---

## Remove unused volumes

```bash
docker volume prune
```

---

## Remove unused networks

```bash
docker network prune
```

---

## Remove everything unused

```bash
docker system prune
```

---

# Restart Policies

Check restart configuration:

```bash
docker inspect myapp
```

Look for:

```text
RestartPolicy
```

Common policies:

| Policy | Meaning |
|--------|---------|
| no | Never restart |
| always | Always restart |
| unless-stopped | Restart unless manually stopped |
| on-failure | Restart only after failure |

---

# Health Checks

Inspect container health:

```bash
docker inspect myapp
```

Look for:

```text
Health
```

Possible states:

```text
healthy
unhealthy
starting
```

Health checks allow Docker and orchestrators to know whether an application is working correctly.

---

# Docker Exit Codes

Exit codes provide clues about failures.

| Exit Code | Meaning |
|-----------|---------|
| 0 | Successful execution |
| 1 | General error |
| 125 | Docker command failed |
| 126 | Command cannot execute |
| 127 | Command not found |
| 137 | Process killed (usually Out Of Memory) |
| 143 | Graceful termination (SIGTERM) |

Understanding exit codes speeds up debugging.

---

# Common Docker Problems

## Container Stops Immediately

### Cause

The application finished execution.

Example:

```bash
docker run ubuntu
```

Ubuntu exits because no foreground process keeps it alive.

### Solution

Run an application or long-running process.

---

# Port Already in Use

Error:

```text
Bind for 0.0.0.0:8080 failed
```

Find the process:

Linux:

```bash
ss -tuln
```

Solution:

- Stop the existing service
- Use another port

---

# Permission Denied

Common causes:

- Incorrect file permissions
- Running as non-root user
- Incorrect bind mount ownership

Check:

```bash
ls -la
```

Check user:

```bash
id
```

---

# Out Of Memory

Symptoms:

- Container restarts
- Exit code `137`

Check:

```bash
docker stats
```

Possible solutions:

- Increase memory limit
- Optimize application memory usage

---

# Cannot Connect To Database

Verify:

- Both containers are running
- Containers share the same Docker network
- Database hostname is correct
- Database service is ready

### Never use container IP addresses.

Use service/container names instead.

Example:

```text
database
backend
frontend
```

---

# Essential Docker Debugging Commands

```bash
docker ps
docker logs
docker inspect
docker exec
docker top
docker stats
docker events
docker network inspect
docker volume inspect
docker system df
```

These commands form your primary Docker troubleshooting toolkit.

---

# Professional Debugging Checklist

Before troubleshooting is complete:

```
✓ Is the container running?

✓ Check container logs

✓ Check exit code

✓ Inspect configuration

✓ Verify ports

✓ Verify networks

✓ Verify volumes

✓ Check environment variables

✓ Monitor CPU and memory

✓ Enter the container if required
```

---

# Key Takeaways

By the end of this lesson, you should understand:

- Docker logging
- Container monitoring
- Resource troubleshooting
- Container inspection
- Network debugging
- Volume debugging
- Exit code analysis
- Restart policies
- Health checks
- Production debugging workflow

A strong DevOps engineer doesn't just create containers — they know how to diagnose and fix them.