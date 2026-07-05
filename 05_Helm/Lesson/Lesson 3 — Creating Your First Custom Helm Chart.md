# Lesson 3 — Creating Your First Custom Helm Chart

In the previous lesson, you learned the structure of a Helm chart. Today, you'll build and customize a Helm chart, understand how templating works, and deploy it to Kubernetes.

## Learning Objectives
By the end of this lesson, you will be able to:

- Create a Helm chart from scratch
- Understand how templates use values
- Customize a Deployment and Service
- Validate and preview a chart
- Deploy and remove a Helm release

## What Happens When You Run helm create?
```bash
helm create my-app
```
Helm generates a starter chart.
```
my-app/
├── Chart.yaml
├── values.yaml
├── templates/
├── charts/
└── .helmignore
```
This chart is fully deployable, but it contains many resources you may not need initially.

For learning, we'll simplify it.

## Step 1 — Create the Chart
```bash
helm create my-app
```
Move into the project:
```
cd my-app
```

## Step 2 — Clean Up the Starter Chart
Delete unnecessary files for now:
```bash
rm templates/hpa.yaml
rm templates/ingress.yaml
rm templates/serviceaccount.yaml
rm -rf templates/tests
rm templates/NOTES.txt
```

## Now your structure becomes:
```bash
my-app/
├── Chart.yaml
├── values.yaml
└── templates/
    ├── deployment.yaml
    ├── service.yaml
    └── _helpers.tpl
```
This is much easier to understand.

## Step 3 — Update Chart.yaml
Example: 
```
apiVersion: v2
name: my-app
description: Learning Helm from scratch
type: application

version: 0.1.0
appVersion: "1.0.0"
```
Nothing special yet—this just describes your chart.

## Step 4 — Understand values.yaml
Open it.

You'll see many settings. Focus on these:
```
replicaCount: 2

image:
  repository: nginx
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80
```
These are the default values used by the templates.

## Step 5 — How Templates Read Values
Open:
```
templates/deployment.yaml
```

You'll find something like:
```
replicas: {{ .Values.replicaCount }}
```

Helm reads:
```
replicaCount: 2
```

and renders:
```
replicas: 2
```

The same happens for the image:

Template:
```
image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
```

Values:
```bash
image:
  repository: nginx
  tag: latest
```

Rendered result:
```
image: nginx:latest
```
> This is the foundation of Helm templating.

## Step 6 — Change the Replica Count
Update:
```
replicaCount: 3
```
Don't install anything yet.

Preview the output:
```
helm template demo .
```

Find:
```
replicas: 3
```
No Kubernetes cluster changes have been made.

## Step 7 — Change the Image
Modify:
```
image:
  repository: httpd
  tag: "2.4"
```
Preview again:
```
helm template demo .
```
## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```


## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

## 
```

```

