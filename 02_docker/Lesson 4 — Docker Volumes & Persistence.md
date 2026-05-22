# Lesson 4 — Docker Volumes & Persistence
This lesson fixes one of the biggest beginner problems.

## The Problem
Containers are:
```bash
ephemeral
```
Meaning:
- temporary
- disposable

if container removed: 
- internal data disappears

Example Problem

Run MySQL:
```bash
docker run -d --name mysql \ 
-e MYSQL_ROOT_PASSWORD=root \
mysql
```
Now database stores data.

But if container removed:

```bash
docker rm -f mysql
```
Everything gone.

Very dangerous.

## Solution → Volumes
Volumes store data OUTSIDE container lifecycle.

Meaning: 
- container deleted
- data survives

## Types of Persistence
1. Named Volumes

Managed by Docker.

2. Bind Mounts

Use real host directory.

3. tmpfs

Memory-only storage.


## Named Volumes
Create volume:
```bash
docker volumes create mysql_data
```

## Check:
```bash
docker volume ls
# Output: DRIVER    VOLUME NAME
#         local     mysql_data
```

## Inspect
```bash
docker volume inspect mysql_data
```

## Use Volume with Container
```bash
docker run -d \
--name mysql-cont \
-e MYSQL_ROOT_PASSWORD=root \
-v mysql_data:/var/lib/mysql \
mysql
```
Meaning:

```bash
volume_name:container_path

# Now DB survives container deletion.
```

## Bind Mounts
Mount host folder directly.
```bash
docker run -d \
-p 8080:80 \
-v $(pwd):/usr/share/nginx/html \
nginx
```
Meaning:
```bash
host_folder:container_folder
```
**Huge Benefit**

Edit local file →
container updates instantly.

Perfect for development.

## Windows Path Example
```bash
-v C:\project:/app
```

## Difference

### Named Volume: Managed by Docker
#### Best for:
- databases
- persistent app data

### Bind Mount: Managed by YOU.
Best for:
- development
- live code sync
- configs


## Where Docker Stores Volumes
Linux: 
```bash
/var/lib/docker/volumes/
```
Docker manages it internally.

## Read-Only Mounts
Prevent modification:
```bash
-v $(pwd):/app:ro

# ro = read-only
```

## Anonymous Volumes
If no volume name:
```bash
-v /app/data
```
Docker creates random volume.

Harder to manage.

Avoid unless needed.

## Volume Cleanup
Remove unused volumes:
```bash
docker volume prune
```

## Important Real-World Examples
MySQL Persistence
```bash
docker run -d \
--name mysql \
-e MYSQL_ROOT_PASSWORD=root \
-v mysql_data:/var/lib/mysql \
-p 3306:3306 \
mysql
```

## PostgreSQL Persistence
```bash
docker run -d \
--name postgres \
-e POSTGRES_PASSWORD=root \
-v postgres_data:/var/lib/postgresql/data \
-p 5432:5432 \
postgres
```

## Live Node.js Development
```bash
docker run -it \
-v $(pwd):/app \
node:20 bash
```
Now container sees your local files.

## Common Beginner Mistake
People store data INSIDE containers.

Wrong approach.

Container should be:
```bash
replaceable
```
Persistent data should live in:
- volumes
- databases
- object storage

## Important Mental Model
```bash
Container = compute
Volume = persistent storage
```

## Bind Mount vs COPY

### COPY
Files baked into image. => Static.

### Bind Mount
Live sync from host. => Dynamic.


## Real Development Workflow
Frontend dev:
```bash
docker run -it \
-v $(pwd):/app \
-p 3000:3000 \
node:20
```
Edit locally → app reloads instantly.

## Volume Backup
```bash
# docker run --rm tells Docker to automatically remove the container after it stops.

docker run --rm \
--name mysql_data:/data \
-v $(pwd):/backup \
ubuntu \
tar czf /backup/mysql.tar.gz /data
```

## Inspect Mounts
```bash
docker inspect mysql
```

## Check 
```bash
Mounts section.
```