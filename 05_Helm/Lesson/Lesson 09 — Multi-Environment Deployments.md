Lesson 9 — Multi-Environment Deployments

This is how Helm is used in almost every company.

The application code doesn't change.

The Helm chart doesn't change.

Only the configuration changes for each environment.

Learning Objectives

By the end of this lesson, you'll understand:

Why multiple environments are needed
Environment-specific values files
Release naming strategy
Namespace strategy
Merging values files
Environment overrides
Best practices for production
Why Multiple Environments?

A typical software development lifecycle looks like this:

Developer
    │
    ▼
Development
    │
    ▼
Testing
    │
    ▼
Staging
    │
    ▼
Production

Each environment has different requirements.

Example

Suppose you're deploying an e-commerce application.

Development
replicas: 1

image:
  tag: dev

service:
  type: ClusterIP

resources:
  requests:
    cpu: 100m
    memory: 128Mi
Staging
replicas: 2

image:
  tag: release-candidate

service:
  type: ClusterIP

resources:
  requests:
    cpu: 300m
    memory: 512Mi
Production
replicas: 10

image:
  tag: "2.5.1"

service:
  type: LoadBalancer

resources:
  requests:
    cpu: "1"
    memory: 2Gi

Notice:

Same application
Same templates
Different configuration
Folder Structure

A common structure:

my-app/

├── Chart.yaml
├── values.yaml
├── values-dev.yaml
├── values-stage.yaml
├── values-prod.yaml
└── templates/
Base Configuration

values.yaml

This contains values common to every environment.

Example:

image:
  repository: nginx

service:
  port: 80

config:
  APP_NAME: ecommerce

These rarely change.

Development Configuration

values-dev.yaml

replicaCount: 1

image:
  tag: dev

config:
  LOG_LEVEL: debug
Staging Configuration

values-stage.yaml

replicaCount: 3

image:
  tag: rc

config:
  LOG_LEVEL: info
Production Configuration

values-prod.yaml

replicaCount: 8

image:
  tag: "2.5.1"

service:
  type: LoadBalancer

config:
  LOG_LEVEL: warn
Deploy Development
helm install ecommerce-dev . \
    -f values-dev.yaml

Helm loads:

values.yaml
        │
        ▼
values-dev.yaml
        │
        ▼
Merged Values
Deploy Staging
helm install ecommerce-stage . \
    -f values-stage.yaml
Deploy Production
helm install ecommerce-prod . \
    -f values-prod.yaml

Notice:

Different release names.

Same chart.

Release Naming Strategy

Bad:

my-app

Good:

frontend-dev

frontend-stage

frontend-prod

or

backend-dev

backend-stage

backend-prod

This makes it immediately clear which release belongs to which environment.

Namespace Strategy

Instead of putting everything in the default namespace:

default

Use dedicated namespaces:

development

staging

production

Create namespaces:

kubectl create namespace development

kubectl create namespace staging

kubectl create namespace production

Deploy:

Development

helm install ecommerce-dev . \
    -f values-dev.yaml \
    -n development

Production

helm install ecommerce-prod . \
    -f values-prod.yaml \
    -n production

Now each environment is isolated.

Values Merging

Suppose:

values.yaml

replicaCount: 2

image:
  repository: nginx
  tag: latest

service:
  type: ClusterIP

values-prod.yaml

replicaCount: 8

image:
  tag: "1.27"

Helm merges them.

Final values:

replicaCount: 8

image:
  repository: nginx
  tag: "1.27"

service:
  type: ClusterIP

Notice:

Only overridden fields change.

Multiple Override Files

Example:

values.yaml

values-common.yaml

values-prod.yaml

Deploy:

helm install ecommerce . \
    -f values-common.yaml \
    -f values-prod.yaml

Order matters.

Helm processes:

values-common.yaml

↓

values-prod.yaml

The last file wins if the same key exists.

Example

values-common.yaml

replicaCount: 3

values-prod.yaml

replicaCount: 10

Result:

replicas: 10
Using --set

Temporary override:

helm install ecommerce . \
    -f values-prod.yaml \
    --set image.tag=2.6.0

Final tag:

2.6.0

--set always has higher priority than values files.

Common Enterprise Structure
helm/

├── charts/
│     └── ecommerce/
│
├── values/
│     ├── dev.yaml
│     ├── stage.yaml
│     └── prod.yaml
│
└── scripts/

This keeps charts and environment configurations separate.

Real Deployment Example

Development:

helm install ecommerce-dev ./charts/ecommerce \
    -f values/dev.yaml \
    -n development

Staging:

helm install ecommerce-stage ./charts/ecommerce \
    -f values/stage.yaml \
    -n staging

Production:

helm install ecommerce-prod ./charts/ecommerce \
    -f values/prod.yaml \
    -n production

One chart.

Three environments.

Environment Comparison
Setting	Development	Staging	Production
Replicas	1	3	10
Image Tag	dev	rc	2.5.1
Service	ClusterIP	ClusterIP	LoadBalancer
Log Level	debug	info	warn
Namespace	development	staging	production
Best Practices
Keep Common Values in values.yaml

Example:

image:
  repository: nginx

service:
  port: 80
Override Only What's Different

Bad:

values-prod.yaml

contains everything.

Good:

replicaCount: 10

image:
  tag: "2.5.1"

Only include differences.

Use Separate Namespaces

Avoid deploying every environment into the same namespace.

Use Meaningful Release Names

Good:

frontend-prod

backend-prod

payments-prod

Avoid generic names like:

app

demo

test
Store Values Files in Git

Environment configuration should be version-controlled.

Exception: Do not store production secrets in plain text. Use secret management solutions or encrypted secret workflows instead.

Hands-on Lab

Create:

values-dev.yaml

replicaCount: 1

image:
  tag: dev

config:
  LOG_LEVEL: debug

values-stage.yaml

replicaCount: 3

image:
  tag: rc

config:
  LOG_LEVEL: info

values-prod.yaml

replicaCount: 8

image:
  tag: "2.5.1"

service:
  type: LoadBalancer

config:
  LOG_LEVEL: warn

Render each environment:

Development

helm template ecommerce-dev . \
    -f values-dev.yaml

Staging

helm template ecommerce-stage . \
    -f values-stage.yaml

Production

helm template ecommerce-prod . \
    -f values-prod.yaml

Compare the generated YAML.

Mini Challenge

Assume you need to release version 2.6.0 only to production.

Without editing values-prod.yaml, render the chart using:

helm template ecommerce-prod . \
    -f values-prod.yaml \
    --set image.tag=2.6.0

Verify that:

The image tag is 2.6.0.
All other production settings remain unchanged.
Interview Questions
1. Why do we use multiple values files?

To deploy the same Helm chart to different environments with different configurations.

2. What is the benefit of separate namespaces?

They isolate resources and reduce the risk of conflicts between environments.

3. What happens when multiple values files define the same key?

The value from the later file overrides the earlier one.

4. Which has higher priority: -f or --set?

--set has the highest priority.

5. Should each environment have its own Helm chart?

No. The recommended approach is to maintain a single reusable chart and use different values files for each environment.