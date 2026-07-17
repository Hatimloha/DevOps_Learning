# Lesson 10 — Git & GitHub Journey

# Building a Real CI/CD Pipeline with GitHub Actions & Docker

In this lesson, you'll combine everything you've learned so far into a real-world DevOps workflow.

```text
Git
 ↓
GitHub
 ↓
Pull Requests
 ↓
GitHub Actions
 ↓
Docker
 ↓
Deployment Ready
```

This is the foundation of a modern **CI/CD (Continuous Integration & Continuous Delivery/Deployment)** pipeline used by software teams worldwide.

---

# Project Structure

Example project:

```text
my-app/
├── app.js
├── package.json
├── Dockerfile
└── .github/
    └── workflows/
        └── ci.yml
```

---

# Goal

Whenever code is pushed to GitHub, the pipeline should automatically:

```text
Push Code
    │
    ▼
Run Tests
    │
    ▼
Build Docker Image
    │
    ▼
Push Image to Docker Hub
```

No manual intervention required.

---

# Step 1 — Create a Dockerfile

Example:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]
```

### Explanation

- Uses the lightweight **Node.js 20 Alpine** image.
- Sets the working directory to `/app`.
- Copies dependency files.
- Installs project dependencies.
- Copies the remaining application code.
- Starts the application using `npm start`.

---

# Step 2 — Create a GitHub Actions Workflow

Create the following file:

```text
.github/workflows/ci.yml
```

Example workflow:

```yaml
name: CI Pipeline

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Build Docker Image
        run: docker build -t my-app .
```

---

# Workflow Breakdown

## Trigger

```yaml
on:
  push:
    branches:
      - main
```

The workflow runs whenever code is pushed to the **main** branch.

---

## Runner

```yaml
runs-on: ubuntu-latest
```

GitHub automatically creates a temporary Ubuntu virtual machine to execute the workflow.

---

## Checkout Source Code

```yaml
- uses: actions/checkout@v4
```

Downloads the repository contents into the runner.

---

## Build Docker Image

```yaml
docker build -t my-app .
```

Builds a Docker image named **my-app** from the current project directory.

---

# Step 3 — Add Automated Testing

For a Node.js application:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20

- run: npm install

- run: npm test
```

If any test fails, the entire pipeline stops.

---

# Updated Pipeline

```text
Push Code
    │
    ▼
Install Dependencies
    │
    ▼
Run Tests
    │
    ▼
Build Docker Image
```

---

# Step 4 — Push Image to Docker Hub

## Create a Docker Hub Account

Create a free account on Docker Hub if you don't already have one.

---

## Add Repository Secrets

Navigate to:

```text
Repository
    │
    ▼
Settings
    │
    ▼
Secrets and Variables
    │
    ▼
Actions
```

Create the following secrets:

- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`

> **Never hardcode usernames or passwords inside your workflow files.**

---

## Login to Docker Hub

```yaml
- name: Docker Login
  run: |
    echo "${{ secrets.DOCKER_PASSWORD }}" | \
    docker login -u "${{ secrets.DOCKER_USERNAME }}" \
    --password-stdin
```

This securely authenticates with Docker Hub.

---

## Build and Push the Docker Image

```yaml
- name: Build Image
  run: |
    docker build \
      -t ${{ secrets.DOCKER_USERNAME }}/my-app:latest .

- name: Push Image
  run: |
    docker push \
      ${{ secrets.DOCKER_USERNAME }}/my-app:latest
```

The image is uploaded to your Docker Hub repository.

---

# Complete CI/CD Pipeline

```text
Push Code
    │
    ▼
Checkout Repository
    │
    ▼
Install Dependencies
    │
    ▼
Run Tests
    │
    ▼
Build Docker Image
    │
    ▼
Login to Docker Hub
    │
    ▼
Push Docker Image
```

---

# Pull Request Validation

Instead of running only when code reaches the `main` branch, you can validate every Pull Request.

```yaml
on:
  pull_request:
```

Now every PR is automatically tested before merging.

---

# Recommended Production Workflow

```yaml
on:
  push:
    branches:
      - main

  pull_request:
```

Workflow:

```text
Pull Request Created
        │
        ▼
Run Validation
        │
        ▼
Code Review
        │
        ▼
Merge to Main
        │
        ▼
Deployment Pipeline
```

This helps prevent broken code from reaching production.

---

# Workflow Artifacts

GitHub Actions can upload generated files during a workflow.

Example:

```yaml
- uses: actions/upload-artifact@v4
```

Artifacts commonly include:

- Test reports
- Build binaries
- Coverage reports
- Log files
- Generated documentation

---

# Environment Variables

Define environment variables inside a workflow:

```yaml
env:
  APP_ENV: production
```

Access them in a shell:

```bash
echo $APP_ENV
```

Environment variables make workflows reusable and configurable.

---

# Common CI/CD Pipeline Stages

A typical production pipeline looks like this:

```text
Lint
 │
 ▼
Unit Tests
 │
 ▼
Integration Tests
 │
 ▼
Build Application
 │
 ▼
Build Docker Image
 │
 ▼
Push to Container Registry
 │
 ▼
Deploy
```

Each stage must succeed before the next one begins.

---

# Real DevOps Interview Question

## What is the difference between CI and CD?

### Continuous Integration (CI)

- Automatically builds the application.
- Runs tests after every change.
- Detects issues early.
- Ensures code can always be integrated safely.

```text
Code
 │
 ▼
Build
 │
 ▼
Test
```

---

### Continuous Delivery (CD)

The application is automatically prepared for release, but deployment usually requires manual approval.

```text
Code
 │
 ▼
Build
 │
 ▼
Test
 │
 ▼
Ready for Deployment
```

---

### Continuous Deployment

Every successful pipeline automatically deploys the application to production without manual intervention.

```text
Code
 │
 ▼
Build
 │
 ▼
Test
 │
 ▼
Deploy Automatically
```

---

# Key Takeaways

By the end of this lesson, you should understand:

- GitHub Actions workflows
- Workflow triggers
- GitHub-hosted runners
- Docker image creation
- Docker Hub authentication
- Secure GitHub Secrets
- Pull Request validation
- Workflow artifacts
- Environment variables
- CI vs Continuous Delivery vs Continuous Deployment

---

# Summary

| Concept | Purpose |
|----------|---------|
| GitHub Actions | Automates development workflows |
| Dockerfile | Builds container images |
| GitHub Secrets | Stores sensitive credentials securely |
| Docker Hub | Hosts container images |
| Pull Request Workflow | Validates code before merging |
| Artifacts | Stores workflow outputs |
| CI | Build and test automatically |
| Continuous Delivery | Prepare releases automatically |
| Continuous Deployment | Deploy automatically after successful tests |
