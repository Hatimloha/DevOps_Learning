Lesson 4 — Helm Template Engine Basics (Go Templates)

This is the lesson where Helm starts becoming powerful.

Up to now, you've changed values in values.yaml. From this lesson onward, you'll learn how Helm templates work—how placeholders are replaced with actual values during rendering.

Learning Objectives

By the end of this lesson, you'll understand:

Template syntax {{ }}
.Values
.Release
.Chart
Variables
Pipelines (|)
Common template functions
How Helm Works Internally

When you run:

helm install demo .

Helm does three things:

Step 1
Read values.yaml
        │
        ▼
Step 2
Replace template placeholders
        │
        ▼
Step 3
Generate Kubernetes YAML
        │
        ▼
Send to Kubernetes API

The replacement happens using the Go Template Engine.

What is a Template?

Suppose you have:

replicas: {{ .Values.replicaCount }}

and values.yaml contains:

replicaCount: 3

Helm renders:

replicas: 3

The part inside:

{{ ... }}

is a Go template expression.

Template Syntax

Everything inside:

{{ }}

is executed by Helm.

Example:

name: {{ .Release.Name }}

If the release name is:

demo

Output becomes:

name: demo
The Dot (.)

The most confusing symbol for beginners is:

.

Think of it as:

"Current object" or "Current context"

Just like in JavaScript:

user.name

or Python:

user.name

Helm uses:

.Values.image.repository

Meaning:

Current Object
      │
      ▼
Values
      │
      ▼
image
      │
      ▼
repository
.Values

Reads data from:

values.yaml

Example:

image:
  repository: nginx
  tag: latest

Template:

image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"

Output:

image: nginx:latest
.Release

Contains information about the Helm release.

Run:

helm install demo .

Now:

{{ .Release.Name }}

becomes:

demo

Useful fields:

.Release.Name

.Release.Namespace

.Release.Service

Example:

metadata:
  name: {{ .Release.Name }}

Output:

metadata:
  name: demo
.Chart

Reads information from:

Chart.yaml

Example:

name: my-app

version: 0.1.0

appVersion: "1.0"

Template:

{{ .Chart.Name }}

Result:

my-app

Another example:

{{ .Chart.Version }}

Result:

0.1.0
.Release vs .Chart
.Release	.Chart
Runtime information	Chart metadata
Changes every installation	Usually fixed
Example: demo	Example: my-app

Example:

Chart Name
    my-app

Release Name
    demo

Deployment name:

demo-my-app
Accessing Nested Values

Suppose:

image:

  repository: nginx

  tag: latest

  pullPolicy: IfNotPresent

Access:

{{ .Values.image.repository }}

Access:

{{ .Values.image.tag }}

Access:

{{ .Values.image.pullPolicy }}
Variables

Instead of repeating:

{{ .Values.image.repository }}

{{ .Values.image.repository }}

{{ .Values.image.repository }}

Store it:

{{- $repo := .Values.image.repository }}

Use later:

image: "{{ $repo }}"

Variables begin with:

$
Pipelines (|)

Pipelines send the output of one function into another.

Example:

{{ .Chart.Name | upper }}

Suppose:

my-app

Result:

MY-APP

Another example:

{{ .Chart.Name | lower }}

Output:

my-app
Useful Functions
upper
{{ "nginx" | upper }}

Result:

NGINX
lower
{{ "NGINX" | lower }}

Result:

nginx
quote

Without:

version: 1.0

With:

version: {{ "1.0" | quote }}

Output:

version: "1.0"

Very useful for strings.

default

Suppose:

replicas:

is missing.

Template:

replicas: {{ .Values.replicas | default 2 }}

Output:

replicas: 2
repeat
{{ repeat 3 "Hi" }}

Output:

HiHiHi

Mostly useful for learning; less common in production.

Chaining Functions

You can chain multiple functions.

Example:

{{ .Chart.Name | upper | quote }}

Result:

"MY-APP"

Execution:

my-app

↓

upper

↓

MY-APP

↓

quote

↓

"MY-APP"
Example Template
metadata:

  name: {{ .Release.Name }}

  labels:

    app: {{ .Chart.Name }}

    version: {{ .Chart.AppVersion | quote }}

Suppose:

Release = demo

Chart = my-app

Version = 1.0

Output:

metadata:

  name: demo

  labels:

    app: my-app

    version: "1.0"
Render Before Installing

Always use:

helm template demo .

This shows exactly what Kubernetes will receive.

This is the safest way to debug templates.

Real Project Example

Suppose your application changes images frequently.

Instead of editing templates:

image: nginx:latest

Use:

image:

  repository: nginx

  tag: latest

Template:

image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"

Now changing versions only requires editing:

tag: 1.28

No template changes.

Best Practices
Keep templates simple.
Put configurable values in values.yaml.
Use .Values instead of hardcoding.
Use quote for string values where appropriate.
Use default to handle optional values.
Use variables to avoid repeating long expressions.
Always verify output with helm template.
Hands-on Lab

In templates/deployment.yaml, try these examples:

Display the release name:

metadata:
  name: {{ .Release.Name }}

Display the chart name:

labels:
  chart: {{ .Chart.Name }}

Display the image repository:

image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"

Display the chart version as a quoted string:

labels:
  version: {{ .Chart.Version | quote }}

Then run:

helm template demo .

Observe how each template expression is replaced.

Interview Questions
What are Go Templates in Helm?
What does .Values represent?
What is the difference between .Chart and .Release?
What is the purpose of the . (dot)?
Why are pipelines (|) useful?
What does the default function do?
Why should you use variables in templates?