Lesson 10 — Dependencies & Subcharts

This lesson covers how Helm manages multiple applications as a single deployment.

In production, applications rarely run alone.

For example, an e-commerce application might need:

Frontend
Backend
Redis
PostgreSQL
NGINX Ingress

Instead of installing each one separately, Helm lets you package them together using dependencies and subcharts.

Learning Objectives

By the end of this lesson, you'll understand:

What subcharts are
What dependencies are
Parent vs child charts
Chart.yaml dependencies
The charts/ directory
helm dependency update
Passing values to subcharts
Enabling/disabling dependencies
Why Do We Need Dependencies?

Imagine an application:

E-Commerce Application

├── Frontend
├── Backend
├── Redis
├── PostgreSQL
└── Prometheus

Without Helm:

helm install frontend ./frontend

helm install backend ./backend

helm install redis bitnami/redis

helm install postgres bitnami/postgresql

helm install prometheus prometheus-community/prometheus

Five different installations.

With Dependencies
E-Commerce Chart

│

├── Frontend

├── Backend

├── Redis

└── PostgreSQL

Install once:

helm install ecommerce .

Everything gets installed.

Parent Chart

Suppose:

ecommerce/

This is the parent chart.

Structure:

ecommerce/

├── Chart.yaml

├── values.yaml

├── templates/

└── charts/

The parent controls everything.

Child Chart (Subchart)

Inside:

charts/
ecommerce/

└── charts/

    ├── redis/

    └── postgresql/

Both are independent Helm charts.

These are called subcharts.

Parent vs Child
Parent Chart	Child Chart
Main application	Dependency
Controls deployment	Provides a service
Has dependencies	Used by parent

Example:

Parent

↓

Backend

↓

Redis

Backend depends on Redis.

Adding Dependencies

Open:

Chart.yaml

Example:

apiVersion: v2

name: ecommerce

version: 0.1.0

dependencies:

  - name: redis

    version: 20.6.0

    repository: https://charts.bitnami.com/bitnami

  - name: postgresql

    version: 16.7.4

    repository: https://charts.bitnami.com/bitnami

This tells Helm:

Download Redis and PostgreSQL charts before installation.

Tip: The exact chart versions change over time. Always check the repository for current versions.

Download Dependencies

Run:

helm dependency update

Helm:

Reads Chart.yaml

↓

Downloads Charts

↓

Stores Them

↓

charts/

Result:

charts/

├── redis-20.6.0.tgz

└── postgresql-16.7.4.tgz
What is Chart.lock?

After running:

helm dependency update

Helm creates:

Chart.lock

Example:

dependencies:

- name: redis

  version: 20.6.0

- name: postgresql

  version: 16.7.4

Purpose:

Lock dependency versions.

Just like:

package-lock.json (npm)
Pipfile.lock (Python)
Cargo.lock (Rust)

This ensures everyone installs the same dependency versions.

Install Everything

Once dependencies are downloaded:

helm install ecommerce .

Helm installs:

Parent Chart

↓

Redis

↓

PostgreSQL

↓

Application

One command.

Passing Values to a Subchart

Parent:

redis:

  architecture: standalone

  auth:

    enabled: false

Redis chart reads:

.Values.redis

Helm automatically passes:

Parent Values

↓

Child Values
Example

values.yaml

redis:

  replica:

    replicaCount: 2

Redis chart receives:

replica:

  replicaCount: 2

No modification to the Redis chart is required.

Disabling a Dependency

Suppose Redis is optional.

values.yaml

redis:

  enabled: false

In Chart.yaml:

dependencies:

- name: redis

  condition: redis.enabled

Now:

enabled = true

↓

Redis Installed
enabled = false

↓

Redis Skipped

This pattern is widely used.

Importing Existing Charts

Instead of writing a Redis chart yourself:

helm repo add bitnami https://charts.bitnami.com/bitnami

helm dependency update

Helm downloads the official chart.

Huge time saver.

Local Subcharts

Not every dependency comes from a repository.

Example:

ecommerce/

charts/

    frontend/

    backend/

Both are local Helm charts.

Directory:

charts/

├── frontend/

│     ├── Chart.yaml

│     └── templates/

└── backend/

      ├── Chart.yaml

      └── templates/

Helm packages them together.

Dependency Flow
Parent Chart

│

├── templates/

│

├── values.yaml

│

└── charts/

       │

       ├── Redis

       │

       └── PostgreSQL

↓

helm install

↓

Everything Deploys
Common Enterprise Example
company-platform/

├── frontend/

├── backend/

├── redis/

├── kafka/

├── postgresql/

├── monitoring/

└── ingress/

One Helm release.

Many components.

Best Practices
Keep Parent Lightweight

The parent should orchestrate dependencies rather than duplicate their logic.

Use Official Charts

Instead of creating your own Redis chart:

Use trusted, maintained community charts when appropriate.

Lock Dependency Versions

Always commit:

Chart.lock

This ensures consistent deployments.

Don't Modify Downloaded Charts

Configure them through:

values.yaml

instead of editing files inside:

charts/

Otherwise your changes may be lost when dependencies are updated.

Disable Optional Components

Example:

redis:

  enabled: false

Install only what's needed.

Hands-on Lab

Create a parent chart:

helm create ecommerce

Open:

Chart.yaml

Add:

dependencies:
  - name: redis
    version: <current-version>
    repository: https://charts.bitnami.com/bitnami

Replace <current-version> with the latest compatible version from the repository.

Download dependencies:

helm dependency update

Verify:

charts/

└── redis-<version>.tgz

Render:

helm template demo .

Observe that Redis resources are included along with your application's resources.

Common Interview Questions
1. What is a subchart?

A Helm chart used as a dependency of another chart.

2. Where are dependencies defined?

In the dependencies section of Chart.yaml.

3. What does helm dependency update do?

It downloads the required dependency charts and creates or updates Chart.lock.

4. What is the purpose of Chart.lock?

It locks dependency versions to ensure reproducible installations.

5. Can a parent chart override a subchart's values?

Yes. The parent chart can configure a subchart by providing values under the subchart's name in its values.yaml.

6. Why use dependencies?

To package and deploy multiple related applications with a single Helm release.

Homework
Create a parent chart named ecommerce.
Add Redis as a dependency.
Run:
helm dependency update
Inspect:
charts/
Chart.lock
Override one Redis configuration value (for example, disabling authentication if supported by the chart) from the parent values.yaml.
Render the chart:
helm template ecommerce .

and verify that both your application and the Redis resources are included.