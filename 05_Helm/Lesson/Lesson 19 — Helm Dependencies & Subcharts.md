Lesson 19 — Helm Dependencies & Subcharts

In real-world applications, you rarely deploy just one application.

For example, an e-commerce application might require:

Frontend
Backend
PostgreSQL
Redis

Instead of writing everything yourself, Helm allows you to reuse existing charts by declaring them as dependencies.

Learning Objectives

By the end of this lesson, you'll understand:

What dependencies are
Parent and subcharts
Chart.yaml dependencies
helm dependency update
helm dependency build
Enabling/disabling dependencies
Overriding dependency values
Production best practices
Why Dependencies?

Suppose your application needs:

Frontend
Backend
PostgreSQL
Redis

Without dependencies:

Write PostgreSQL chart ❌
Write Redis chart ❌
Maintain everything yourself ❌

With dependencies:

Your Chart
      │
      ├── PostgreSQL (Bitnami)
      └── Redis (Bitnami)

Reuse trusted community charts.

Parent Chart

Your application chart:

ecommerce/

This is called the parent chart.

Subcharts

Dependencies become subcharts.

Example:

ecommerce/

├── Chart.yaml
├── values.yaml
├── charts/
│
├── postgresql/
│
└── redis/
Declaring Dependencies

Open:

Chart.yaml

Example:

apiVersion: v2

name: ecommerce

version: 1.0.0

dependencies:

  - name: postgresql
    version: "16.7.0"
    repository: "https://charts.bitnami.com/bitnami"

  - name: redis
    version: "21.2.3"
    repository: "https://charts.bitnami.com/bitnami"

Tip: Use versions that actually exist in the repository. Chart versions change over time, so verify them with helm search repo before pinning.

Download Dependencies

After updating Chart.yaml:

helm dependency update

Helm:

Downloads charts
Creates charts/
Generates Chart.lock

Result:

ecommerce/

├── charts/

│   ├── postgresql-16.7.0.tgz

│   └── redis-21.2.3.tgz

├── Chart.lock
What is Chart.lock?

Example:

dependencies:

- name: redis
  version: 21.2.3

- name: postgresql
  version: 16.7.0

Purpose:

Locks dependency versions
Ensures reproducible builds
Similar to:
package-lock.json
go.sum
Cargo.lock
Install Parent Chart
helm install ecommerce .

Helm installs:

ecommerce

↓

Frontend

↓

Backend

↓

PostgreSQL

↓

Redis

Everything is installed together.

Overriding Dependency Values

Every dependency has its own values.

Example:

postgresql:

  auth:
    username: admin

    password: mypassword

    database: shopdb

redis:

  architecture: standalone

Helm automatically passes these values to the subcharts.

Disable a Dependency

Suppose Redis isn't needed.

redis:

  enabled: false

In Chart.yaml:

dependencies:

- name: redis

  condition: redis.enabled

When:

redis:
  enabled: false

Helm skips installing Redis.

Dependency Conditions

Example:

dependencies:

- name: redis

  condition: redis.enabled

- name: postgresql

  condition: postgresql.enabled

This lets you enable or disable components per environment.

Dependency Tags

Instead of conditions, you can group dependencies.

Example:

dependencies:

- name: redis
  tags:
    - cache

- name: memcached
  tags:
    - cache

Disable all cache services:

tags:
  cache: false
helm dependency update

Purpose:

Downloads missing dependencies
Updates to versions specified in Chart.yaml
Regenerates Chart.lock
helm dependency update
helm dependency build

Purpose:

Rebuilds the charts/ directory from the existing Chart.lock
Does not resolve newer versions from Chart.yaml
helm dependency build
Difference
Command	Purpose
helm dependency update	Resolve/download dependencies from Chart.yaml and update Chart.lock
helm dependency build	Recreate charts/ using the existing Chart.lock
Production Example

Company chart:

shopping-platform/

├── frontend

├── backend

├── ingress

├── monitoring

├── redis

└── postgresql

Instead of maintaining every service yourself:

shopping-platform

↓

Bitnami Redis

↓

Bitnami PostgreSQL

↓

Your Application
Viewing Dependencies
helm dependency list

Example:

NAME          VERSION

postgresql    16.7.0

redis         21.2.3
Updating Dependency Versions

Suppose PostgreSQL releases:

16.8.0

Update:

dependencies:

- name: postgresql

  version: "16.8.0"

Run:

helm dependency update
Local Dependencies

Subcharts don't have to come from remote repositories.

Example:

dependencies:

- name: common

  repository: "file://../common"

Useful for internal reusable charts.

Best Practices
Pin Versions

Good:

version: "16.7.0"

Avoid broad ranges unless you intentionally want automatic updates.

Use Trusted Charts

Examples:

Bitnami
Internal company charts

Avoid unknown repositories.

Don't Modify Downloaded Charts

Never edit:

charts/postgresql-16.7.0.tgz

Override behavior using values instead.

Commit Chart.lock

Keep Chart.lock in version control so all developers and CI pipelines use the same dependency versions.

Common Mistakes
❌ Forgetting helm dependency update

After editing Chart.yaml, always run:

helm dependency update
❌ Editing Subcharts Directly

Wrong:

charts/redis/

Changes will be lost when dependencies are updated.

❌ Forgetting to Override Values

If you don't provide required values, subcharts will use their defaults, which may not match your application requirements.

❌ Using Floating Versions

Prefer fixed versions for predictable deployments.

Hands-on Lab
Step 1

Create a new chart:

helm create ecommerce
Step 2

Add dependencies:

dependencies:

- name: redis
  version: "<verified-version>"
  repository: "https://charts.bitnami.com/bitnami"

- name: postgresql
  version: "<verified-version>"
  repository: "https://charts.bitnami.com/bitnami"
Step 3

Download dependencies:

helm dependency update
Step 4

Verify:

ls charts/

Expected:

postgresql-<version>.tgz
redis-<version>.tgz
Step 5

Install:

helm install ecommerce .
Step 6

View resources:

kubectl get pods

You should see Pods created for your application and its dependencies.

Summary
Command	Purpose
helm dependency update	Download/update dependencies
helm dependency build	Rebuild dependencies from Chart.lock
helm dependency list	List chart dependencies
Interview Questions
1. What is a Helm dependency?

A chart that is included and managed by another (parent) chart.

2. What is the purpose of Chart.lock?

It locks dependency versions to ensure reproducible builds.

3. What is the difference between helm dependency update and helm dependency build?
update resolves and downloads dependencies based on Chart.yaml.
build recreates the charts/ directory using the existing Chart.lock.
4. How do you disable a dependency?

Use a condition in Chart.yaml and set the corresponding value (for example, redis.enabled: false) in values.yaml.

5. Why shouldn't you edit downloaded subcharts?

They will be overwritten the next time dependencies are updated or rebuilt.

6. Can a dependency come from a local directory?

Yes, by using a file:// repository path.