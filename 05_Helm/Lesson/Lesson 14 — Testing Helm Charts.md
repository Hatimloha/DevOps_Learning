# 🚀 Helm Tutorial — Lesson 14: Testing Helm Charts

> Learn how to validate your Helm deployments using **`helm test`**, ensuring your application is not only deployed successfully but also functioning correctly in Kubernetes.

---

# 📚 Table of Contents

- [Learning Objectives](#-learning-objectives)
- [Why Testing is Important](#-why-testing-is-important)
- [What is `helm test`?](#-what-is-helm-test)
- [How Helm Identifies Tests](#-how-helm-identifies-tests)
- [Test File Structure](#-test-file-structure)
- [Creating a Simple Test Pod](#-creating-a-simple-test-pod)
- [Running Tests](#-running-tests)
- [Viewing Test Logs](#-viewing-test-logs)
- [Handling Failed Tests](#-handling-failed-tests)
- [Real-World Testing Examples](#-real-world-testing-examples)
- [Using Test Jobs](#-using-test-jobs)
- [Running Multiple Tests](#-running-multiple-tests)
- [Test Lifecycle](#-test-lifecycle)
- [Cleaning Up Test Resources](#-cleaning-up-test-resources)
- [CI/CD Integration](#-cicd-integration)
- [Combining Tests with `--atomic`](#-combining-tests-with---atomic)
- [Best Practices](#-best-practices)
- [Common Mistakes](#-common-mistakes)
- [Hands-on Lab](#-hands-on-lab)
- [Summary](#-summary)
- [Interview Questions](#-interview-questions)
- [Key Takeaways](#-key-takeaways)

---

# 🎯 Learning Objectives

By the end of this lesson, you will be able to:

- ✅ Understand what `helm test` is
- ✅ Create Helm test hooks
- ✅ Write test Pods and Jobs
- ✅ View test execution logs
- ✅ Automatically clean up test resources
- ✅ Integrate Helm testing into CI/CD pipelines
- ✅ Apply production-ready testing practices

---

# ❓ Why Testing is Important

A successful Helm installation **does not always mean your application is working**.

Your Kubernetes resources may be healthy while the application itself has problems.

Common issues include:

- Application not responding
- Database connection failures
- Services not reachable
- API returning errors
- DNS resolution issues
- Authentication failures

Helm provides **`helm test`** to verify that the deployed application is actually functioning.

---

# 🧪 What is `helm test`?

`helm test` executes Kubernetes resources (typically Pods or Jobs) that are marked as **test hooks**.

Workflow:

```text
helm install
      │
      ▼
Application Running
      │
      ▼
helm test
      │
      ▼
Run Test Pod / Job
      │
      ▼
PASS / FAIL
```

If all tests succeed, Helm reports the release as successfully tested.

---

# 🏷️ How Helm Identifies Tests

A Kubernetes resource becomes a Helm test by adding the following annotation:

```yaml
metadata:
  annotations:
    "helm.sh/hook": test
```

Helm ignores this resource during normal installation.

It executes the resource only when:

```bash
helm test <release-name>
```

is run.

---

# 📁 Test File Structure

A common project structure:

```text
my-chart/

├── templates/
│
├── tests/
│   └── connection-test.yaml
│
├── Chart.yaml
└── values.yaml
```

> **Note:** The `tests/` directory is a common convention created by `helm create`. Helm renders any manifest within the chart (except ignored files), so test resources may also be placed under `templates/` as long as they include the `helm.sh/hook: test` annotation.

---

# 📝 Creating a Simple Test Pod

Example:

```yaml
apiVersion: v1
kind: Pod

metadata:
  name: "{{ .Release.Name }}-test"

  annotations:
    "helm.sh/hook": test

spec:
  restartPolicy: Never

  containers:
    - name: test
      image: busybox
      command:
        - sh
        - -c
        - echo "Helm Test Successful"
```

This Pod:

- Starts
- Prints a success message
- Exits successfully

Result:

```text
PASS
```

---

# ▶️ Running Tests

Install the chart:

```bash
helm install demo .
```

Run the test:

```bash
helm test demo
```

Example output:

```text
NAME: demo

Phase: Succeeded

TEST SUITE: demo-test
```

---

# 📜 Viewing Test Logs

View test output:

```bash
helm test demo --logs
```

Example:

```text
Helm Test Successful
```

This is extremely useful for troubleshooting failed tests.

---

# ❌ Handling Failed Tests

Suppose the test exits with an error.

```yaml
command:
  - sh
  - -c
  - exit 1
```

Run:

```bash
helm test demo
```

Result:

```text
FAILED
```

Helm reports the failure, allowing you to investigate before promoting the deployment.

---

# 🌍 Real-World Testing Examples

## Service Connectivity Test

Suppose your Service is:

```text
backend-service
```

Test command:

```yaml
command:
  - wget
  - backend-service:80
```

Workflow:

```text
Test Pod
     │
     ▼
Connect to Service
     │
     ▼
Success?
     │
     ▼
PASS / FAIL
```

This validates:

- Service availability
- DNS resolution
- Network connectivity

---

## Database Connection Test

Example workflow:

```text
Test Pod
     │
     ▼
Connect PostgreSQL
     │
     ▼
SELECT 1
     │
     ▼
PASS
```

Validates:

- Database availability
- Authentication
- Network connectivity
- DNS resolution

---

## API Health Check

Suppose the application exposes:

```text
/health
```

Test:

```bash
wget http://backend-service/health
```

Expected response:

```text
HTTP 200
```

If successful:

```text
PASS
```

Otherwise:

```text
FAIL
```

---

# ⚙️ Using Test Jobs

Instead of a Pod:

```yaml
apiVersion: batch/v1
kind: Job
```

Jobs are useful for:

- Database validation
- Running scripts
- Smoke tests
- Integration tests
- Multi-step verification

---

# 🧪 Running Multiple Tests

A project may contain several test resources.

Example:

```text
tests/

├── api-test.yaml
├── database-test.yaml
├── redis-test.yaml
└── ingress-test.yaml
```

Running:

```bash
helm test demo
```

executes all test resources associated with the release.

---

# 🔄 Test Lifecycle

```text
Install
   │
   ▼
Application Running
   │
   ▼
helm test
   │
   ▼
Create Test Pod
   │
   ▼
Run Tests
   │
   ▼
Delete Test Pod (optional)
   │
   ▼
PASS / FAIL
```

---

# 🧹 Cleaning Up Test Resources

Like Hooks, tests support delete policies.

Example:

```yaml
annotations:
  "helm.sh/hook": test
  "helm.sh/hook-delete-policy": hook-succeeded
```

Workflow:

```text
Run Test
    │
    ▼
Success
    │
    ▼
Delete Test Pod
```

This keeps the cluster clean.

---

# 🚀 CI/CD Integration

A typical deployment pipeline:

```text
Build Image
      │
      ▼
helm upgrade
      │
      ▼
helm test
      │
      ▼
PASS?
      │
      ▼
Deploy to Production
```

If tests fail:

```text
Pipeline Failed
```

No production promotion occurs.

---

# 🛡️ Combining Tests with `--atomic`

Deploy safely:

```bash
helm upgrade ecommerce . \
    --atomic \
    --wait
```

Then run:

```bash
helm test ecommerce
```

Workflow:

```text
Upgrade
   │
   ▼
Resources Ready
   │
   ▼
Run Tests
   │
   ▼
PASS
   │
   ▼
Deployment Complete
```

This provides an additional layer of confidence after deployment.

---

# ✅ Best Practices

## Test Real Functionality

Avoid testing only whether Pods start.

Instead, verify:

- HTTP endpoints
- Database connectivity
- Redis connectivity
- DNS resolution
- External dependencies

---

## Keep Tests Fast

Avoid long-running integration tests.

Good tests complete within seconds or a few minutes.

---

## One Purpose Per Test

Good example:

```text
api-test.yaml

database-test.yaml

redis-test.yaml
```

Avoid one massive test covering every component.

---

## Clean Up Test Resources

Use:

```yaml
hook-delete-policy: hook-succeeded
```

Otherwise completed Pods accumulate over time.

---

## Integrate Tests into CI/CD

Recommended deployment workflow:

```text
helm lint
     │
     ▼
helm template
     │
     ▼
helm upgrade --atomic
     │
     ▼
helm test
     │
     ▼
Production Approval
```

---

# ❌ Common Mistakes

## Forgetting the Test Hook

Without:

```yaml
annotations:
  "helm.sh/hook": test
```

Helm treats the resource as a normal Kubernetes manifest instead of a test.

---

## Using `restartPolicy: Always`

Incorrect:

```yaml
restartPolicy: Always
```

Correct:

```yaml
restartPolicy: Never
```

Test Pods should terminate after completion.

---

## Writing Long-Running Tests

Tests should complete quickly.

Long-running tests delay deployments and may cause CI/CD timeouts.

---

## Ignoring Test Logs

Always inspect logs when a test fails.

```bash
helm test demo --logs
```

Logs often reveal the root cause immediately.

---

# 🧪 Hands-on Lab

Create:

```text
tests/connection-test.yaml
```

```yaml
apiVersion: v1
kind: Pod

metadata:
  name: "{{ .Release.Name }}-connection-test"

  annotations:
    "helm.sh/hook": test
    "helm.sh/hook-delete-policy": hook-succeeded

spec:
  restartPolicy: Never

  containers:
    - name: test
      image: busybox
      command:
        - sh
        - -c
        - echo "Connection Test Passed"
```

Install the chart:

```bash
helm install demo .
```

Run the test:

```bash
helm test demo
```

View the logs:

```bash
helm test demo --logs
```

If configured with:

```yaml
hook-delete-policy: hook-succeeded
```

the test Pod will automatically be removed after successful execution.

---

# 📋 Summary

| Command / Annotation | Purpose |
|----------------------|---------|
| `helm test` | Execute Helm test resources |
| `helm test --logs` | Display test output |
| `helm.sh/hook: test` | Mark a resource as a Helm test |
| `hook-delete-policy` | Automatically clean up completed test resources |

---

# 🎤 Interview Questions

### 1. What is `helm test`?

> `helm test` executes Pods or Jobs marked with the test hook to verify that a deployed application is functioning correctly.

---

### 2. Which annotation defines a Helm test?

```yaml
helm.sh/hook: test
```

---

### 3. Can Helm tests use Pods or Jobs?

> Yes. Both Pods and Jobs are commonly used depending on the complexity of the test.

---

### 4. How do you view test output?

```bash
helm test <release-name> --logs
```

---

### 5. Why use `hook-delete-policy` with tests?

> It automatically removes completed test resources, keeping the Kubernetes cluster clean and preventing resource accumulation.

---

### 6. Give three real-world Helm tests.

- Verify the application's `/health` endpoint
- Test PostgreSQL connectivity
- Test Redis connectivity

---

# 📌 Key Takeaways

- `helm test` validates that a deployed application actually works—not just that Kubernetes resources exist.
- Test resources are standard Kubernetes Pods or Jobs marked with the `helm.sh/hook: test` annotation.
- Multiple test resources can be executed for a single release.
- `helm test --logs` helps troubleshoot failed tests by displaying execution output.
- Use `hook-delete-policy` to automatically clean up completed test resources.
- Keep tests fast, focused, and automate them within CI/CD pipelines.
- Combine `helm upgrade --atomic --wait` with `helm test` for safer, production-ready deployments.