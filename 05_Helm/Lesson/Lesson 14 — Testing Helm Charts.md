Lesson 14 — Testing Helm Charts

A successful Helm installation does not necessarily mean your application works.

Your Pods may be running, but:

The application may not respond.
The database connection may fail.
The Service may not be reachable.
The API may return errors.

Helm provides helm test to verify that a deployed release is actually working.

Learning Objectives

By the end of this lesson, you'll understand:

What helm test is
Test hooks
Writing test Pods
Writing test Jobs
Viewing test logs
Cleaning up test resources
Integrating tests into CI/CD
Production best practices
What is helm test?

helm test runs Kubernetes resources (usually Pods or Jobs) that are marked with the test hook.

Flow:

helm install
      │
      ▼
Application Running
      │
      ▼
helm test
      │
      ▼
Run Test Pod/Job
      │
      ▼
PASS / FAIL
How Helm Knows It's a Test

A resource becomes a Helm test by adding this annotation:

metadata:
  annotations:
    "helm.sh/hook": test

Helm ignores it during normal installation and only runs it when you execute:

helm test <release-name>
Default Test Folder

A common structure is:

my-chart/

├── templates/
│
├── tests/
│   └── connection-test.yaml
│
├── Chart.yaml
└── values.yaml

Note: Helm templates any file inside the chart (except special ignored files). The tests/ folder is a common convention used by the default chart created with helm create, but test manifests can also live under templates/ as long as they have the test hook annotation.

Simple Test Pod
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

This Pod:

Starts
Prints a message
Exits successfully

Result:

PASS
Run the Test

Install:

helm install demo .

Run:

helm test demo

Example:

NAME: demo

Phase: Succeeded

TEST SUITE: demo-test
View Test Logs
helm test demo --logs

Output:

Helm Test Successful

Very useful for debugging.

Failed Test

Suppose:

command:
  - sh
  - -c
  - exit 1

Run:

helm test demo

Result:

FAILED

Helm reports that the test failed.

Real Example — Service Connectivity

Suppose your Service is:

backend-service

Test Pod:

command:
  - wget
  - backend-service:80

Flow:

Test Pod

↓

Connect Service

↓

Success?

↓

PASS

If the Service cannot be reached:

FAIL
Database Connection Test

Example:

Test Pod

↓

Connect PostgreSQL

↓

SELECT 1

↓

PASS

This verifies:

Service
DNS
Authentication
Database availability
API Health Check

Suppose your application exposes:

/health

Test:

wget http://backend-service/health

If HTTP 200 is returned:

PASS

Otherwise:

FAIL
Test Job

Instead of a Pod:

apiVersion: batch/v1

kind: Job

Jobs are useful for:

Database validation
Running scripts
Smoke tests
Integration tests
Multiple Tests

You can have:

tests/

├── api-test.yaml

├── database-test.yaml

├── redis-test.yaml

└── ingress-test.yaml

Running:

helm test demo

executes all test resources associated with the release.

Test Lifecycle
Install

↓

Application Running

↓

helm test

↓

Create Test Pod

↓

Run Tests

↓

Delete Test Pod (optional)

↓

PASS / FAIL
Delete Test Resources

Like hooks, tests support delete policies.

Example:

annotations:

  "helm.sh/hook": test

  "helm.sh/hook-delete-policy": hook-succeeded

Result:

Run Test

↓

Success

↓

Delete Pod

Keeps the cluster clean.

CI/CD Example

Pipeline:

Build Image

↓

helm upgrade

↓

helm test

↓

PASS?

↓

Deploy Production

If tests fail:

Pipeline Failed

No promotion to production.

Combining with --atomic

Example:

helm upgrade ecommerce . \
    --atomic \
    --wait

Then:

helm test ecommerce

Flow:

Upgrade

↓

Resources Ready

↓

Run Tests

↓

PASS

↓

Deployment Complete
Best Practices
Test Actual Functionality

Don't only test that a Pod starts.

Test:

HTTP endpoints
Database connectivity
Redis connectivity
DNS resolution
Keep Tests Fast

Avoid:

20-minute integration tests

Use lightweight validation.

One Purpose Per Test

Good:

api-test.yaml

database-test.yaml

redis-test.yaml

Instead of one huge test covering everything.

Clean Up Test Pods

Use:

hook-delete-policy: hook-succeeded

Otherwise Pods accumulate over time.

Run Tests in CI/CD

A recommended deployment pipeline:

helm lint

↓

helm template

↓

helm upgrade --atomic

↓

helm test

↓

Production Approval
Common Mistakes
❌ Forgetting the Test Hook

Without:

annotations:

  helm.sh/hook: test

Helm treats the resource as a normal manifest instead of a test.

❌ Using RestartPolicy Always

Test Pods should use:

restartPolicy: Never
❌ Long Running Tests

Tests should finish quickly.

Long-running tests can cause pipeline delays or timeouts.

❌ Ignoring Test Logs

Use:

helm test demo --logs

to inspect failures instead of guessing.

Hands-on Lab

Create:

tests/connection-test.yaml
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

Install:

helm install demo .

Run:

helm test demo

View logs:

helm test demo --logs
Summary
Command	Purpose
helm test	Run Helm test resources
helm test --logs	Show test output
helm.sh/hook: test	Mark a resource as a test
hook-delete-policy	Clean up completed tests
Interview Questions
1. What is helm test?

It runs Pods or Jobs marked with the test hook to verify that a deployed application works correctly.

2. Which annotation defines a Helm test?
helm.sh/hook: test
3. Can tests be Pods or Jobs?

Yes. Both are commonly used.

4. How do you view test output?
helm test <release-name> --logs
5. Why use hook-delete-policy with tests?

To automatically remove completed test resources and avoid cluttering the cluster.

6. Give three real-world Helm tests.
Verify the application's /health endpoint
Test PostgreSQL connectivity
Test Redis connectivity