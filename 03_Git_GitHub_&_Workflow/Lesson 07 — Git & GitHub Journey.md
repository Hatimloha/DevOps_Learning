# Lesson 7 — Git & GitHub Journey
GitHub Actions & CI/CD Basics

Now you enter real DevOps workflow.

## You’ll learn:
- what CI/CD is
- GitHub Actions
- workflow files
- automated builds
- Docker automation basics

This is heavily used in production.

## 1. What is CI/CD?
CI → Continuous Integration

Automatically:
- run tests
- build app
- validate code

whenever code is pushed.

## CD → Continuous Deployment/Delivery
Automatically:
- deploy application
- publish Docker image
- release updates

## Real Flow
```bash
Developer Pushes Code
          ↓
GitHub Actions Runs
          ↓
Tests / Build / Deploy
```

## 2. What is GitHub Actions?
GitHub Actions is GitHub’s automation system.

Official docs: [GitHub Actions Documentation](https://docs.github.com/en/actions)

It runs workflows automatically.

## 3. Workflow Location
Inside repository:
```bash
.github/workflows/
```

## Example:
```bash
.github/workflows/build.yml
```

## 4. Your First Workflow
Create:
```bash
.github/workflows/hello.yml
```
Add:
```bash
name: Hello Workflow

on: push

jobs:
  hello:
    runs-on: ubuntu-latest

    steps:
      - name: Print Message
        run: echo "GitHub Actions Working!"
```

## Understanding Workflow Structure
### name
```bash
name:
```
Workflow name shown in GitHub UI

### on
```bash
# Trigger Event
on: push
```
Meaning:
```bash
Run workflow when code is pushed
```

### jobs 
```bash
# Container for tasks.
jobs:
```

### runs-on
```bash
# GitHub creates temporary Ubuntu VM.
runs-on: ubuntu-latest

# Local Computer
runs-on: self-hosted
```

### steps
Sequence of commands.

## 5. Push Workflow
Commit:
```bash
git add .
git commit -m "add github action"
git push
# GitHub automatically runs workflow.
```

## 6. View Workflow Runs
Go to:
```bash
Repository → Actions tab
```
You’ll see:
- logs
- success/failure
- execution detail

## 7. Using GitHub Actions Marketplace
Reusable actions: [GitHub Marketplace](https://github.com/marketplace)


## 8. Checkout Repository Action
Most common action:
```bash
- uses: actions/checkout@v4
# It downloads repository code into runner.
```

## 9. Example Node.js Workflow
```bash
name: CI
on: push
jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
      
      - run: npm install
      - run: npm test
```

## 10. Docker Build Workflow
Since you know Docker, this is important.

Example:
```bash
name: Docker Build
on: push
jobs:
  docker:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - run: docker build -t myapp .
```

## 11. GitHub Secrets
Never hardcode:
- passwords
- API keys
- tokens

Use
```bash
Repository Settings → Secrets and variables
```
Access in workflow:
```bash
${{ secret.MY_SECRET }}
```

## 12. Common Workflow Triggers
Push 
```bash
on: push
```

## Pull Request
```bash
on: pull_request
```

## Manual Trigger
```bash
on: workflow_dispatch
```

## 13. Real DevOps CI Pipeline
```bash
Push Code
   ↓
Run Tests
   ↓
Build Docker Image
   ↓
Push to Docker Hub
   ↓
Deploy Server
```

## 14. Important Concepts Today
```bash
workflow
runner
job
step
trigger
action
secret
```




