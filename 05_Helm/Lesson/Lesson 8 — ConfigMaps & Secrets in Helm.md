Lesson 8 — ConfigMaps & Secrets in Helm

This is one of the most practical lessons in Helm.

Almost every Kubernetes application needs:

Configuration
Environment variables
Database credentials
API keys
Application settings

Instead of hardcoding them, we use ConfigMaps and Secrets.

Helm makes them reusable and environment-specific.

Learning Objectives

By the end of this lesson, you'll understand:

What ConfigMaps are
What Secrets are
ConfigMap vs Secret
Creating ConfigMaps using Helm
Creating Secrets using Helm
Injecting them into Pods
Mounting as environment variables
Mounting as volumes
Production best practices
ConfigMap vs Secret
ConfigMap	Secret
Non-sensitive data	Sensitive data
Application configuration	Passwords, API keys, tokens
Stored as plain text in etcd (unless encryption at rest is enabled)	Stored as Base64-encoded data (not encrypted by Base64 alone)
Examples: app settings	Examples: DB password

Important: Kubernetes Secrets are Base64-encoded, not encrypted by default. For stronger protection, clusters should enable etcd encryption at rest and use proper access controls.

Real World Example

Imagine an application.

Development:

DB_HOST=mysql-dev
DB_PORT=3306

Production:

DB_HOST=mysql-prod
DB_PORT=3306

Should you modify the Deployment every time?

No.

Use ConfigMaps.

ConfigMap Architecture
values.yaml
      │
      ▼
configmap.yaml
      │
      ▼
ConfigMap
      │
      ▼
Deployment
      │
      ▼
Container
Step 1 — Add Values

values.yaml

config:

  APP_NAME: ecommerce

  DB_HOST: mysql

  DB_PORT: "3306"

  LOG_LEVEL: info
Step 2 — Create ConfigMap Template

Create:

templates/configmap.yaml
apiVersion: v1
kind: ConfigMap

metadata:
  name: {{ include "my-app.fullname" . }}

data:

  APP_NAME: {{ .Values.config.APP_NAME | quote }}

  DB_HOST: {{ .Values.config.DB_HOST | quote }}

  DB_PORT: {{ .Values.config.DB_PORT | quote }}

  LOG_LEVEL: {{ .Values.config.LOG_LEVEL | quote }}

Render:

helm template demo .

Output:

kind: ConfigMap

data:

  APP_NAME: "ecommerce"

  DB_HOST: "mysql"

  DB_PORT: "3306"

  LOG_LEVEL: "info"
Step 3 — Use ConfigMap in Deployment

Inside:

templates/deployment.yaml

Container:

envFrom:

  - configMapRef:
      name: {{ include "my-app.fullname" . }}

Now every key becomes an environment variable.

Container receives:

APP_NAME=ecommerce

DB_HOST=mysql

DB_PORT=3306

LOG_LEVEL=info

No need to define each variable separately.

Alternative: Individual Environment Variables

Instead of envFrom:

env:

- name: DB_HOST

  valueFrom:

    configMapKeyRef:

      name: {{ include "my-app.fullname" . }}

      key: DB_HOST

Use this when you only need a few values.

Mount ConfigMap as Volume

Deployment:

volumes:

- name: config

  configMap:

    name: {{ include "my-app.fullname" . }}

Container:

volumeMounts:

- name: config

  mountPath: /etc/config

Inside the container:

/etc/config/

APP_NAME

DB_HOST

DB_PORT

Each key becomes a file.

Now Let's Learn Secrets

Suppose:

Database Password

API Token

JWT Secret

SMTP Password

These should not be stored in a ConfigMap.

Add Secret Values

values.yaml

secret:

  DB_USERNAME: admin

  DB_PASSWORD: mypassword
Secret Template

Create:

templates/secret.yaml
apiVersion: v1

kind: Secret

metadata:

  name: {{ include "my-app.fullname" . }}

type: Opaque

stringData:

  DB_USERNAME: {{ .Values.secret.DB_USERNAME | quote }}

  DB_PASSWORD: {{ .Values.secret.DB_PASSWORD | quote }}

Why stringData?

Because Kubernetes automatically converts it to Base64 when creating the Secret.

You don't need to encode it yourself.

Using data

Instead:

data:

  DB_PASSWORD: bXlwYXNzd29yZA==

This requires you to Base64 encode values manually.

For Helm templates, stringData is usually easier.

Using Secret in Deployment
envFrom:

- secretRef:

    name: {{ include "my-app.fullname" . }}

Container receives:

DB_USERNAME=admin

DB_PASSWORD=mypassword
Individual Secret Variable
env:

- name: DB_PASSWORD

  valueFrom:

    secretKeyRef:

      name: {{ include "my-app.fullname" . }}

      key: DB_PASSWORD
ConfigMap + Secret Together

Deployment:

envFrom:

- configMapRef:

    name: {{ include "my-app.fullname" . }}

- secretRef:

    name: {{ include "my-app.fullname" . }}

Application receives:

APP_NAME

DB_HOST

LOG_LEVEL

DB_USERNAME

DB_PASSWORD

Very common in production.

Using range for ConfigMaps

Instead of hardcoding every key:

values.yaml

config:

  APP_NAME: ecommerce

  LOG_LEVEL: debug

  CACHE: redis

Template:

apiVersion: v1
kind: ConfigMap

metadata:
  name: {{ include "my-app.fullname" . }}

data:
{{- range $key, $value := .Values.config }}
  {{ $key }}: {{ $value | quote }}
{{- end }}

Output:

data:

  APP_NAME: "ecommerce"

  LOG_LEVEL: "debug"

  CACHE: "redis"

Much cleaner.

Same for Secrets
stringData:
{{- range $key, $value := .Values.secret }}
  {{ $key }}: {{ $value | quote }}
{{- end }}

No repeated code.

Production Best Practices
✅ ConfigMap

Store:

Application configuration
URLs
Ports
Feature flags
Log levels
✅ Secret

Store:

Passwords
Tokens
API Keys
Certificates
Private Keys
❌ Never

Don't commit production secrets like this:

secret:

  password: mypassword

inside Git repositories.

Use:

External secret management tools
CI/CD secret injection
Environment-specific secret values
Kubernetes Secret management

We'll cover enterprise secret management later.

Complete Flow
values.yaml

│

├── config

│      │

│      ▼

│   ConfigMap

│

└── secret

       │

       ▼

    Secret

       │

       ▼

Deployment

       │

       ▼

Container
Hands-on Lab

Update values.yaml:

config:
  APP_NAME: ecommerce
  LOG_LEVEL: debug

secret:
  DB_USERNAME: admin
  DB_PASSWORD: password123

Create:

templates/configmap.yaml

Create:

templates/secret.yaml

Modify deployment.yaml to include:

envFrom:
  - configMapRef:
      name: {{ include "my-app.fullname" . }}
  - secretRef:
      name: {{ include "my-app.fullname" . }}

Preview:

helm template demo .

Verify that:

A ConfigMap is rendered.
A Secret is rendered.
The Deployment references both.
Common Interview Questions
1. What is the difference between a ConfigMap and a Secret?
ConfigMap stores non-sensitive configuration.
Secret stores sensitive configuration.
2. Is a Kubernetes Secret encrypted?

No. By default, it is Base64-encoded, not encrypted. Encryption at rest must be enabled separately.

3. Why use stringData?

It lets you provide plain text, and Kubernetes converts it to Base64 automatically.

4. What is the difference between env and envFrom?
env imports specific keys.
envFrom imports all keys from a ConfigMap or Secret.
5. How can ConfigMaps be consumed?
As environment variables
As mounted files in a volume