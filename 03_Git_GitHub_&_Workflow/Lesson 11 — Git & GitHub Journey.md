# Lesson 11 — Git & GitHub Journey

# Advanced GitHub Actions

In the previous lesson, you built a simple CI/CD pipeline.

In this lesson, you'll learn enterprise-level GitHub Actions features commonly used in production environments.

You'll cover:

- Multiple Jobs
- Job Dependencies
- Matrix Builds
- Dependency Caching
- Workflow Artifacts
- Environments
- Approval Gates
- Self-Hosted Runners
- Secrets Best Practices
- Reusable Workflows
- Conditional Execution

---

# 1. Multiple Jobs

A GitHub Actions workflow can contain multiple jobs.

Example:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest

  build:
    runs-on: ubuntu-latest
```

### Workflow

```text
Workflow
├── test
└── build
```

By default, jobs run **in parallel**, which reduces the total workflow execution time.

---

# 2. Job Dependencies

Sometimes one job must complete successfully before another can begin.

Use the `needs` keyword.

Example:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest

  build:
    needs: test
    runs-on: ubuntu-latest
```

### Execution Flow

```text
test
 │
 ▼
build
```

If the **test** job fails:

- The **build** job is skipped.
- The workflow stops.

---

# 3. Real CI/CD Pipeline Structure

A production pipeline often follows this order:

```text
Lint
 │
 ▼
Test
 │
 ▼
Build
 │
 ▼
Push Docker Image
 │
 ▼
Deploy
```

GitHub Actions models this using `needs`.

Example:

```yaml
push-image:
  needs: build

deploy:
  needs: push-image
```

Each job waits until its dependency completes successfully.

---

# 4. Matrix Builds

Suppose your application supports multiple Node.js versions:

- Node.js 18
- Node.js 20
- Node.js 22

Instead of creating three separate jobs, use a **matrix strategy**.

Example:

```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]
```

Use the matrix value:

```yaml
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
```

GitHub automatically creates three jobs:

```text
Job 1 → Node.js 18
Job 2 → Node.js 20
Job 3 → Node.js 22
```

This is useful for testing compatibility across multiple versions.

---

# 5. Caching Dependencies

Without caching, every workflow executes:

```bash
npm install
```

This downloads dependencies every time, increasing build duration.

Enable caching:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: npm
```

### Benefits

- Faster builds
- Reduced network usage
- Lower CI execution time
- Improved developer productivity

---

# 6. Workflow Artifacts

Artifacts allow workflows to store generated files for later use.

Example:

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: build-output
    path: dist/
```

Another job can download the artifact later.

Common artifact types include:

- Build packages
- Compiled binaries
- Test reports
- Coverage reports
- Log files

---

# 7. Environments

GitHub provides **Environments** to separate deployments.

Common environments:

- Development
- Staging
- Production

Create them from:

```text
Repository
│
▼
Settings
│
▼
Environments
```

Example:

```yaml
environment: production
```

Before deployment, GitHub checks the rules configured for that environment.

---

# 8. Approval Gates

Production deployments should usually require manual approval.

Typical workflow:

```text
Developer Pushes Code
        │
        ▼
Build & Tests Pass
        │
        ▼
Manager Approval
        │
        ▼
Deploy to Production
```

Configure approvals under:

```text
Repository
│
▼
Settings
│
▼
Environments
│
▼
Required Reviewers
```

This helps protect production systems from accidental deployments.

---

# 9. Self-Hosted Runners

GitHub provides hosted runners such as:

- `ubuntu-latest`
- `windows-latest`
- `macos-latest`

You can also host your own runner.

Example infrastructure:

- AWS EC2
- Azure Virtual Machines
- Physical Servers
- On-Premises Infrastructure

Workflow example:

```yaml
runs-on: self-hosted
```

### Benefits

- Access to internal networks
- Custom software installation
- More CPU, RAM, or storage
- Compliance with company policies

---

# 10. Secrets Best Practices

Never store credentials directly in workflow files.

❌ Bad

```text
PASSWORD=admin123
```

✅ Good

```yaml
${{ secrets.DB_PASSWORD }}
```

GitHub provides several types of secrets:

- Repository Secrets
- Environment Secrets
- Organization Secrets

Using secrets keeps sensitive information secure.

---

# 11. Reusable Workflows

Large organizations avoid duplicating workflow definitions.

Instead, they reuse workflows.

Example:

```yaml
uses: ./.github/workflows/build.yml
```

Benefits:

- Less duplicated code
- Easier maintenance
- Standardized pipelines
- Consistent CI/CD across projects

---

# 12. Conditional Execution

Sometimes a job should only run under certain conditions.

Example:

```yaml
if: github.ref == 'refs/heads/main'
```

Used inside a job:

```yaml
deploy:
  if: github.ref == 'refs/heads/main'
```

Feature branches will execute tests and builds, but deployment only occurs from the `main` branch.

---

# 13. Enterprise Deployment Workflow

A typical enterprise deployment process looks like this:

```text
Pull Request
      │
      ▼
Lint
      │
      ▼
Unit Tests
      │
      ▼
Build
      │
      ▼
Docker Push
      │
      ▼
Approval
      │
      ▼
Production Deployment
```

This workflow minimizes deployment risks while maintaining fast feedback.

---

# Sample Enterprise Pipeline

```text
Job 1 → Lint
        │
        ▼
Job 2 → Unit Tests
        │
        ▼
Job 3 → Integration Tests
        │
        ▼
Job 4 → Docker Build
        │
        ▼
Job 5 → Security Scan
        │
        ▼
Job 6 → Push Container Registry
        │
        ▼
Job 7 → Deploy to Staging
        │
        ▼
Job 8 → Manual Approval
        │
        ▼
Job 9 → Deploy to Production
```

This is a common CI/CD architecture used in enterprise environments.

---

# Mini Practice

Create a GitHub Actions workflow with:

### Job 1

```text
test
```

### Job 2

```text
build
```

Requirements:

- `build` depends on `test`
- Enable dependency caching using `cache: npm`
- Create a `production` environment
- Require manual approval before deployment

---

# Key Takeaways

By the end of this lesson, you should understand:

- Multiple Jobs
- Job Dependencies (`needs`)
- Matrix Builds
- Dependency Caching
- Workflow Artifacts
- Environments
- Approval Gates
- Self-Hosted Runners
- Secrets Management
- Reusable Workflows
- Conditional Job Execution

---

# Summary

| Feature | Purpose |
|----------|---------|
| Multiple Jobs | Execute independent tasks concurrently |
| `needs` | Control job execution order |
| Matrix Builds | Test across multiple environments or versions |
| Cache | Speed up dependency installation |
| Artifacts | Share generated files between jobs |
| Environments | Separate deployment targets |
| Approval Gates | Require manual approval before deployment |
| Self-Hosted Runners | Run workflows on your own infrastructure |
| Secrets | Securely store sensitive information |
| Reusable Workflows | Share common CI/CD logic across repositories |
| Conditional Execution | Run jobs only when specific conditions are met |


.