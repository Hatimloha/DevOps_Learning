# Lesson 2 — Helm Chart Structure
In the previous lesson, you learned what Helm is and why it's used. Today you'll learn how a Helm chart is organized and the purpose of each file and directory. 

## Learning Objectives
By the end of this lesson, you will be able to:

- Understand the structure of a Helm chart
- Know the purpose of every important file
- Identify which files you edit most often
- Understand how Helm renders Kubernetes manifests

Think of it like this:
```bash
Application
    │
    ▼
Helm Chart
    │
    ├── Deployment
    ├── Service
    ├── ConfigMap
    ├── Secret
    ├── Ingress
    └── HPA
```
Instead of maintaining many YAML files individually, you package them into one reusable chart.

## Create Your First Chart
Run:
```bash
helm create my-app
```
This generates:
```
my-app/
├── Chart.yaml
├── values.yaml
├── charts/
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── serviceaccount.yaml
│   ├── hpa.yaml
│   ├── NOTES.txt
│   ├── _helpers.tpl
│   └── tests/
│       └── test-connection.yaml
└── .helmignore
```
Helm provides a ready-made starter chart.

## Directory Overview 
```bash
my-app/
│
├── Chart.yaml        ← Chart metadata
├── values.yaml       ← Default configuration
├── templates/        ← Kubernetes resource templates
├── charts/           ← Dependency charts
└── .helmignore       ← Files to ignore
```
These five components make up almost every Helm chart.

## 1. Chart.yaml
This file describes your chart.

#### Example:
```bash
apiVersion: v2
name: my-app
description: My first Helm chart
type: application
version: 0.1.0
appVersion: "1.0.0"
```

## Fields Explained

**apiVersion:** Helm chart specification version.
```bash
apiVersion: v2
```
For Helm 3, use v2

**name:** Chart name.
```
name: my-app
```

**description:** Human-readable description.
```
description: Helm chart for my application
```

**type:** Two types exist:
```
type: application
```
or
```
type: library
```
- application → Deployable chart
- library → Reusable templates only
> Most charts use application.


**version:** Chart version.
```
version: 0.1.0
```
This is the chart's version, not the application's.

**appVersion:** Version of your application.
```
appVersion: "2.5.1"
```
#### For example:
```bash
Chart Version: 1.2.0
Application Version: 5.7.4

# They are independent.
```

## Chart Version vs App Version
```bash
Chart
│
├── version = Package version
│
└── appVersion = Application version
```

### Example: 
```bash
Chart v2.1
        │
        ▼
Deploys Nginx 1.27
```

## 2. values.yaml
This is one of the most important files.

It contains the default values used by templates.

Example:
```bash
replicaCount: 2

image:
  repository: nginx
  tag: latest

service:
  type: ClusterIP
  port: 80
```
Instead of hardcoding values inside templates, Helm reads them from this file.

## Why values.yaml?
Without Helm: 
```bash
replicas: 3
```
- Need 5 replicas?
- Edit the YAML.

With Helm:
```
replicaCount: 5
```
No template changes required.

## Example
Template:
```bash
replicas: {{ .Values.replicaCount }}
```

values.yaml:
```
replicaCount: 4
```

Rendered manifest:
```
replicas: 4
```

## 3. templates/
This directory contains Kubernetes resource templates.

Example:
```bash
templates/
│
├── deployment.yaml
├── service.yaml
├── ingress.yaml
├── configmap.yaml
├── secret.yaml
└── hpa.yaml
```
These are templates, not final YAML.

### Example:
```
metadata:
  name: {{ .Release.Name }}
```
Helm replaces placeholders with actual values during installation.

## Rendering Process 
```bash
values.yaml
        │
        ▼
Template
        │
        ▼
Rendered Kubernetes YAML
        │
        ▼
Kubernetes API
```

## 4. charts/
This directory stores dependencies.

Example:
```bash
charts/

├── redis/
├── mysql/
└── prometheus/
```
- Suppose your application requires Redis.
- Instead of installing Redis separately, you can include it as a dependency.
> We'll cover this in detail later.

## 5. _helpers.tpl
This file contains reusable template functions.

Instead of repeating code:
```bash
name: my-app
```

in many files, define it once:
```
{{ define "my-app.name" }}
my-app
{{ end }}
```

Then reuse it:
```
{{ include "my-app.name" . }}
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


