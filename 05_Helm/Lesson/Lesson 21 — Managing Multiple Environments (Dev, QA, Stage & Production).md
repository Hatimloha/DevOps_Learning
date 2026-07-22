Lesson 21 — Managing Multiple Environments (Dev, QA, Stage & Production)

In real companies, the same application is deployed into multiple environments:

Developer Machine

↓

Dev Environment

↓

QA Environment

↓

Staging Environment

↓

Production Environment

Each environment needs different configurations:

Replica count
Database connection
Image tag
Resource limits
Domain names
Secrets
Debug settings

Helm solves this using multiple values files.

Learning Objectives

By the end of this lesson, you will understand:

Environment-based Helm configuration
Multiple values files
Values override priority
Dev/QA/Stage/Prod structure
Production deployment workflow
Best practices for managing environments
The Problem

Without Helm values:

You create separate YAML files:

deployment-dev.yaml

deployment-qa.yaml

deployment-prod.yaml

Problems:

❌ Duplicate YAML
❌ Hard maintenance
❌ Configuration drift
❌ More chances for mistakes

Helm Approach

Keep one template:

templates/
    deployment.yaml

Change only values:

values-dev.yaml

values-qa.yaml

values-prod.yaml

Structure:

application/

├── Chart.yaml

├── values.yaml

├── values-dev.yaml

├── values-qa.yaml

├── values-prod.yaml

└── templates/

    └── deployment.yaml
Base values.yaml

Default configuration:

replicaCount: 1

image:
  repository: nginx
  tag: latest

resources:
  limits:
    cpu: 500m
    memory: 512Mi
Dev Environment

File:

values-dev.yaml

Example:

replicaCount: 1

image:
  tag: dev

resources:
  limits:
    cpu: 200m
    memory: 256Mi

environment: development
QA Environment

File:

values-qa.yaml

Example:

replicaCount: 2

image:
  tag: qa

resources:
  limits:
    cpu: 500m
    memory: 512Mi

environment: qa
Production Environment

File:

values-prod.yaml

Example:

replicaCount: 5

image:
  tag: v1.0.0

resources:
  limits:
    cpu: 2
    memory: 2Gi

environment: production
Using Environment Values
Development
helm install app . \
-f values-dev.yaml
QA
helm install app . \
-f values-qa.yaml
Production
helm install app . \
-f values-prod.yaml
Values Override Priority

Helm has an order:

values.yaml

↓

values-dev.yaml

↓

--set values

The last value wins.

Example:

values.yaml:

replicaCount: 1

values-prod.yaml:

replicaCount: 5

Command:

helm install app . \
-f values-prod.yaml \
--set replicaCount=10

Final:

replicaCount: 10
Multiple Values Files

You can combine files:

helm install app . \
-f values.yaml \
-f values-prod.yaml

Order matters:

First file

↓

Second file overrides first
Example Deployment Template

templates/deployment.yaml

apiVersion: apps/v1

kind: Deployment

metadata:

  name: {{ .Release.Name }}

spec:

  replicas:

    {{ .Values.replicaCount }}

  template:

    spec:

      containers:

      - name: app

        image:

          {{ .Values.image.repository }}:{{ .Values.image.tag }}

Same template for all environments.

Environment Variables

values-dev.yaml:

env:

  NODE_ENV: development

values-prod.yaml:

env:

  NODE_ENV: production

Template:

env:

- name: NODE_ENV

  value: {{ .Values.env.NODE_ENV }}
Database Example

Development:

database:

  host: dev-postgres

  name: devdb

Production:

database:

  host: prod-postgres

  name: proddb

Same chart.

Different configuration.

Image Management

Dev:

image:

  repository: ecommerce

  tag: develop

Production:

image:

  repository: ecommerce

  tag: 2.0.1
Kubernetes Namespaces

Deploy different environments into different namespaces:

Dev:

helm install ecommerce . \
-n dev

Production:

helm install ecommerce . \
-n production

Result:

dev namespace

↓

ecommerce-dev


production namespace

↓

ecommerce-prod
Helm Release Naming

Dev:

helm install ecommerce-dev .

Production:

helm install ecommerce-prod .

Helm tracks them separately:

helm list -A

Output:

NAME              NAMESPACE

ecommerce-dev     dev

ecommerce-prod    production
CI/CD Environment Flow

Real production flow:

Git Push

↓

CI Build Image

↓

Push Image

↓

Deploy Dev

↓

Testing

↓

Deploy QA

↓

Approval

↓

Deploy Production

Each stage uses:

values-dev.yaml

values-qa.yaml

values-prod.yaml
Git Repository Structure

Common enterprise structure:

helm-charts/

├── ecommerce/

│
├── values/

│   ├── dev/

│   │   └── values.yaml
│
│   ├── qa/

│   │   └── values.yaml
│
│   └── prod/

│       └── values.yaml
Best Practices
1. Keep Templates Same

Avoid:

deployment-dev.yaml

deployment-prod.yaml

Use:

deployment.yaml

with values.

2. Store Environment Files Separately

Good:

values-prod.yaml

Avoid mixing everything in one file.

3. Pin Production Versions

Production:

image:
  tag: v1.5.2

Avoid:

tag: latest
4. Protect Production Values

Do not store:

Passwords
API keys
Tokens

in Git.

Use:

External Secrets
Vault
SOPS
Common Mistakes
❌ Changing Templates Per Environment

Bad:

deployment-prod.yaml
deployment-dev.yaml

Creates maintenance problems.

❌ Using latest Image

Bad:

image:
 tag: latest

Production should use fixed versions.

❌ Wrong Values File Order

Example:

-f values-prod.yaml \
-f values-dev.yaml

Dev values override production.

❌ Storing Secrets in values.yaml

Bad:

password: admin123

Use secret management tools.

Hands-on Lab

Create:

values-dev.yaml

values-prod.yaml

Dev:

replicaCount: 1

image:
  tag: dev

Production:

replicaCount: 5

image:
  tag: v1.0.0

Render Dev:

helm template app . \
-f values-dev.yaml

Render Production:

helm template app . \
-f values-prod.yaml

Compare:

replicas
image
resources
Summary
Concept	Purpose
values-dev.yaml	Development configuration
values-qa.yaml	Testing configuration
values-prod.yaml	Production configuration
-f	Load custom values
--set	Override values temporarily
Namespace	Separate environments
Same templates	Avoid duplication
Interview Questions
1. How do you manage multiple environments with Helm?

Using separate values files with the same chart templates.

2. Which value wins if multiple files define the same key?

The last loaded value overrides previous values.

3. Why use different values files?

To keep environment-specific configuration separate while maintaining one chart.

4. Should production use latest Docker images?

No. Use immutable version tags.

5. Where should secrets be stored?

Outside Helm values, using tools like Vault, SOPS, or External Secrets.