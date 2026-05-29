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
name
```bash
name:
```
Workflow name shown in GitHub UI

## 
```bash

```

## 
```bash

```

## 
```bash

```

## 
```bash

```

## 
```bash

```

## 
```bash

```
- 
## 
```bash

```

## 
```bash

```

## 
```bash

```

## 
```bash

```

## 
```bash

```

## 
```bash

```





