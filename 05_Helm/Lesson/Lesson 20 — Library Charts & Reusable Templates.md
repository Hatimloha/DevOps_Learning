Lesson 20 — Library Charts & Reusable Templates

As your organization grows, you'll likely have many Helm charts:

frontend
backend
auth-service
payment-service
notification-service

Without reusable templates, every chart duplicates the same labels, annotations, naming logic, and helper functions.

Library Charts solve this problem by providing shared templates that other charts can reuse.

Learning Objectives

By the end of this lesson, you'll understand:

What Library Charts are
Application Chart vs Library Chart
Creating a Library Chart
Using reusable helper templates
Sharing labels and annotations
Using library charts as dependencies
Production best practices
The Problem

Suppose you have three charts:

frontend/

backend/

payment/

Each chart contains:

labels:

  app.kubernetes.io/name: ...

  app.kubernetes.io/version: ...

  app.kubernetes.io/managed-by: Helm

The same code is copied into every chart.

Problems:

Hard to maintain
Easy to make inconsistent
Repeated code
What is a Library Chart?

A Library Chart contains only reusable templates.

It does not create Kubernetes resources.

Think of it as a shared utility package.

Application Charts

↓

Use

↓

Library Chart

↓

Shared Templates
Application Chart vs Library Chart
Application Chart	Library Chart
Creates Deployments	❌ No
Creates Services	❌ No
Creates ConfigMaps	❌ No
Contains helper templates	✅ Yes
Can be installed	✅ Yes

A library chart cannot be installed directly.

Create a Library Chart
helm create common

Open:

Chart.yaml

Change:

type: application

to:

type: library

Now Helm treats it as a reusable library.

Typical Structure
common/

├── Chart.yaml

└── templates/

    ├── _helpers.tpl

    ├── _labels.tpl

    ├── _annotations.tpl

    └── _images.tpl

Notice:

There are no Deployment or Service YAML files.

Creating a Reusable Template

Example:

templates/_labels.tpl

{{- define "common.labels" -}}

app.kubernetes.io/managed-by: Helm

app.kubernetes.io/instance: {{ .Release.Name }}

app.kubernetes.io/version: {{ .Chart.AppVersion }}

{{- end }}
Using the Library

Parent chart:

metadata:

  labels:

{{ include "common.labels" . | nindent 4 }}

Output:

metadata:
  labels:
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/instance: ecommerce
    app.kubernetes.io/version: "2.1.0"
Add Library as Dependency

Chart.yaml

dependencies:

- name: common

  version: "1.0.0"

  repository: "file://../common"

Download:

helm dependency build

Now every template can use:

{{ include "common.labels" . }}
Reusable Naming Function

Example:

{{- define "common.fullname" -}}

{{ printf "%s-%s" .Release.Name .Chart.Name }}

{{- end }}

Usage:

metadata:

  name:
{{ include "common.fullname" . }}

Output:

demo-ecommerce
Reusable Image Function

Example:

{{- define "common.image" -}}

{{ .Values.image.repository }}:{{ .Values.image.tag }}

{{- end }}

Deployment:

image:
{{ include "common.image" . }}
Reusable Resources

Instead of repeating:

resources:

  limits:

    cpu: 500m

    memory: 512Mi

Create:

{{- define "common.resources" -}}

{{ toYaml .Values.resources }}

{{- end }}

Then:

resources:

{{ include "common.resources" . | nindent 2 }}
Reusable Labels

Instead of writing:

labels:

  app: frontend
labels:

  app: backend
labels:

  app: payment

Use:

{{ include "common.labels" . }}

Every chart stays consistent.

Enterprise Example

Company structure:

company-common/

frontend/

backend/

payment/

analytics/

notification/

Every application depends on:

company-common

One update in the library benefits all charts after they update the dependency.

Library Charts in CI/CD

Pipeline:

Update Library

↓

Release v1.2.0

↓

Application Updates Dependency

↓

helm dependency update

↓

Deploy
Best Practices
Keep Only Reusable Logic

Library charts should contain:

Labels
Names
Images
Selectors
Resources
Helper functions

Avoid application-specific resources.

Prefix Template Names

Good:

common.labels

Avoid:

labels

Prefixes reduce naming collisions.

Version Library Charts

Treat library charts like any other dependency.

Update versions when shared logic changes.

Document Shared Templates

Describe:

Expected input
Output
Required values

This makes them easier for teams to use.

Common Mistakes
❌ Putting Deployments in a Library Chart

Library charts should not define resources like:

kind: Deployment

Their purpose is reusable logic only.

❌ Forgetting type: library

If Chart.yaml uses:

type: application

Helm treats it as a normal installable chart.

❌ Using Generic Template Names

Bad:

labels

Good:

common.labels
❌ Copying Instead of Reusing

If multiple charts share the same template code, move it into the library chart instead of duplicating it.

Hands-on Lab
Step 1

Create a library chart:

helm create common
Step 2

Edit:

Chart.yaml
type: library
Step 3

Delete generated Kubernetes manifests:

templates/

Deployment

Service

Ingress

ServiceAccount

HPA

Keep only helper templates.

Step 4

Create:

templates/_labels.tpl
{{- define "common.labels" -}}

app.kubernetes.io/name: {{ .Chart.Name }}

app.kubernetes.io/instance: {{ .Release.Name }}

{{- end }}
Step 5

Add the library chart as a dependency:

dependencies:

- name: common
  version: "1.0.0"
  repository: "file://../common"
Step 6

Run:

helm dependency build
Step 7

Use the shared labels:

metadata:
  labels:
{{ include "common.labels" . | nindent 4 }}

Render the chart:

helm template demo .

Verify that the labels appear correctly.

Summary
Concept	Purpose
Library Chart	Shares reusable templates
type: library	Marks a chart as a library
include	Imports shared templates
_helpers.tpl	Stores helper templates
helm dependency build	Downloads/builds library dependencies
Interview Questions
1. What is a Helm Library Chart?

A chart that provides reusable templates and helper functions but does not create Kubernetes resources.

2. Can you install a library chart directly?

No. It is intended to be used as a dependency by application charts.

3. How do you declare a library chart?

Set the following in Chart.yaml:

type: library
4. Why use library charts?

To eliminate duplicate template code and maintain consistent logic across multiple charts.

5. Which Helm function is commonly used with library charts?
include

because it renders reusable templates defined in the library.

6. Should Deployments and Services exist in a library chart?

No. A library chart should contain reusable template logic only.