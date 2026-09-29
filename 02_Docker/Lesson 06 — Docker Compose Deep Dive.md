# Lesson 6 — Docker Compose Deep Dive
```bash
# Now we move from:
single containers

# to:
real applications
```

## The Problem Without Compose
Imagine starting app manually:
```bash
docker run -d --name mysql ...
docker run -d --name redis ...
docker run -d --name backend ...
docker run -d --name frontend ...
```
- Very messy.
- Hard to maintain.

## Solution 
**Docker Compose:** Compose lets you define entire infrastructure in ONE file.
```bash
# **Main File**

# Usually:
compose.yaml

# or
docker-compose.yml
```

## Basic Structure
```yml
services:
    app:
     image: nginx
```

## First Compose Example
```yml
services:
    nginx:
      image: nginx
    ports:
      - "8080:80" 
```
Run:
```bash
docker-compose up 

# Now nginx starts.

# Open: http://localhost:8080
```

## Detached Mode
```yml
docker-compose up -d
```

## Stop Everything
```yml
docker-compose down

# Huge advantage: one command controls entire stack.
```

## Services
Each container = service.

Example:
```yml
services:
    frontend:
    backend:
    mysql:
    redis:
```

## Real Multi-Container Example
```yml
services:
    frontend:
      image: nginx
      ports:
        - "8080:80"

    backend:
      image: node:20

    db:
      image: mysql
      environment:
        MYSQL_ROOT_PASSWORD: root
```
Service Discovery Inside compose:
> service name = hostname

Backend connects to DB using: NOT IP address.
> db

## Environment Variables
```yml
environment:
  NODE_ENV: production
  PORT: 3000

# or 
environment:
  - NODE_ENV=production
  - PORT=3000
```

## Port Mapping
```yml
ports:
 - "8080:80"

# Meaning: host:container
```

## Volumes in Compose
```yml
services:
  mysql:
    image: mysql
  volumes:
    - mysql_data:/var/lib/mysql

volumes:
  mysql_data:

# Persistent DB storage.
```

## Bind Mount Example
```yml
services:
  mysql:
    image: mysql
  volumes:
    - ./:/var/lib/mysql

# Live code sync: Perfect for development.
```

## Networks in Compose
Compose automatically creates network.

All services communicate internally.

Custom network:
```yml
networks:
  backend
```

## Example with Network
```yml
services:
  app: 
    image: node:20
    networks:
      - backend

  db: 
    image: mysql
    networks:
      - backend

networks:
  backend:
```

## depends_on
Control startup order.
```yml
services:
    backend:
      depends_on:
        - mysql
```
**NOTE - (Important production detail):** does NOT wait for DB readiness
- only container startup (Read more about this online)

## Build Custom Images
Instead of image:
```yml 
build: .

# or 

build:
  context: .    # path
  dockerfile: Dockerfile
```

## Real Node.js Example
Projects:
```yml
project/
 ├── Dockerfile
 ├── compose.yaml
 ├── package.json
 └── app.js
```

Dockerfile
```dockerfile
FROM node:20
WORKDIR /app
COPY package*.json
RUN npm install
COPY . .
CMD ["npm","start"]
```
compose.yaml
```yml
services:
  app:
    build:
     context: .
     dockerfile: Dockerfile
    ports:
     - "3000:3000"
    volumes:
     - ./:/app
```
Build + Run
```bash
docker-compose up --build 
```

## Check Running Services
```yml
docker-compose ps
```

## Logs
```yml
docker-compose logs

# live logs
docker-compose logs -f

# Specific service:
docker-compose ps
docker-compose logs <service-name>
```

## Execute Into Service
```yml
docker-compose exec <service-name> bash
```

## Scale Services
```yml
docker-compose up --scale <service-name>=3

# Creates multiple containers.
# Note: If container is expose scale will not work in compose
```

## Remove Everything
```yml
docker-compose down -v
```
Removes:
- containers
- networks
- anonymous volumes

## Important Production Practice
Never hardcode secrets in compose files.

Bad:
```yml
MYSQL_PASSWORD: mypassword
```
Use:
- .env
- secret managers
- vault systems

## .env File
Example
```yml
DB_PASSWORD=root
PORT=3000
```
Compose auto-loads it.
```yml
environment:
  DB_PASSWORD: ${DB_PASSWORD}
```

## Common Compose Workflow

Development:
```yml
docker compose up
```

Stop:
```yml
docker compose down
```
Rebuild:
```yml
docker compose up --build
```

## Important Mental Model
- Dockerfile = how to build one container
- Compose = how containers work together

## Real Full Stack Architecture
```yml
Frontend
   ↓
Backend API
   ↓
Redis Cache
   ↓
PostgreSQL
```
> Compose manages all together.