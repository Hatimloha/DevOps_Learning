Lesson 7 — Named Templates & _helpers.tpl

This lesson covers one of the most important concepts in Helm: reusable templates.

If Lesson 6 taught you how to make templates dynamic, Lesson 7 teaches you how to avoid duplication.

Every production Helm chart uses _helpers.tpl.

Learning Objectives

By the end of this lesson, you'll understand:

What _helpers.tpl is
Why named templates exist
define
include
template
Template scope
Passing context (.)
How Helm generates consistent resource names and labels
The Problem

Suppose you have:

deployment.yaml

metadata:
  name: my-app

service.yaml

metadata:
  name: my-app

configmap.yaml

metadata:
  name: my-app

secret.yaml

metadata:
  name: my-app

Now the application name changes.

You must edit every file.

Imagine doing this across 30 templates.

Not practical.

The Solution

Store the name once.

Reuse it everywhere.

Instead of:

deployment.yaml

my-app

service.yaml

my-app

configmap.yaml

my-app

Use:

_helpers.tpl

↓

Application Name

↓

Deployment

↓

Service

↓

ConfigMap

↓

Secret

One definition.

Many uses.

What is _helpers.tpl?

It is a file that stores reusable template functions.

Default location:

templates/
└── _helpers.tpl

Unlike deployment.yaml, _helpers.tpl does not generate Kubernetes resources.

It only defines reusable snippets.

define

Syntax:

{{ define "my-app.name" }}

my-app

{{ end }}

Nothing is rendered yet.

You've simply created a reusable template called:

my-app.name
include

To use the template:

metadata:
  name: {{ include "my-app.name" . }}

Output:

metadata:
  name: my-app

Think of it like calling a function.

JavaScript Analogy

JavaScript:

function appName() {
    return "my-app";
}

console.log(appName());

Helm:

{{ define "my-app.name" }}

my-app

{{ end }}

Use:

{{ include "my-app.name" . }}

Both return the same value.

Passing Context (.)

Notice:

{{ include "my-app.name" . }}

What is the .?

It passes the current context into the helper.

Without it:

{{ include "my-app.name" }}

many helpers won't have access to .Values, .Release, .Chart, and other objects.

Rule:

Almost always pass . to include.

Example Using .Chart

Helper:

{{ define "my-app.chartName" }}

{{ .Chart.Name }}

{{ end }}

Use:

metadata:
  labels:
    app: {{ include "my-app.chartName" . }}

If:

name: ecommerce

Output:

labels:
  app: ecommerce
Helper That Uses .Release

Helper:

{{ define "my-app.fullname" }}

{{ .Release.Name }}-{{ .Chart.Name }}

{{ end }}

Install:

helm install demo .

Output:

demo-my-app

If you install:

helm install production .

Output:

production-my-app

No template changes required.

Real _helpers.tpl

A simplified version:

{{ define "my-app.fullname" }}

{{ printf "%s-%s" .Release.Name .Chart.Name }}

{{ end }}

Deployment:

metadata:
  name: {{ include "my-app.fullname" . }}

Service:

metadata:
  name: {{ include "my-app.fullname" . }}

ConfigMap:

metadata:
  name: {{ include "my-app.fullname" . }}

Everything now uses the same naming logic.

printf

printf formats strings.

Example:

{{ printf "%s-%s" "demo" "nginx" }}

Output:

demo-nginx

Another example:

{{ printf "%s:%s" "nginx" "1.27" }}

Output:

nginx:1.27
Helper Returning Labels

Helper:

{{ define "my-app.labels" }}

app: {{ .Chart.Name }}

release: {{ .Release.Name }}

{{ end }}

Use:

metadata:
  labels:

{{ include "my-app.labels" . | indent 4 }}

Output:

metadata:
  labels:
    app: my-app
    release: demo
Why indent?

Without indent:

metadata:
  labels:
app: my-app
release: demo

Invalid YAML.

With:

{{ include "my-app.labels" . | indent 4 }}

Output:

metadata:
  labels:
    app: my-app
    release: demo

Correct indentation.

nindent

Difference:

indent

↓

Adds spaces

nindent

↓

Adds a newline
+
Spaces

Example:

labels:
{{ include "my-app.labels" . | nindent 2 }}

Result:

labels:
  app: my-app
  release: demo

In practice, nindent is often preferred when inserting multi-line helper output into YAML.

template vs include

Both execute named templates.

Example:

{{ template "my-app.name" . }}

works.

But include returns a string, so it works with pipelines.

Example:

{{ include "my-app.name" . | upper }}

Output:

MY-APP

This does not work well with template.

Recommendation

Use:

include

almost all the time.

It's the modern Helm best practice.

Real Production Structure
my-app/

templates/

├── deployment.yaml
├── service.yaml
├── configmap.yaml
├── secret.yaml
└── _helpers.tpl

Every resource uses:

{{ include "my-app.fullname" . }}

Now if naming rules change, update only _helpers.tpl.

Common Mistakes
Forgetting .

Wrong:

{{ include "my-app.fullname" }}

Correct:

{{ include "my-app.fullname" . }}
Duplicating Logic

Wrong:

deployment:

demo-my-app

service:

demo-my-app

configmap:

demo-my-app

Correct:

One helper.

Reuse everywhere.

Wrong Indentation

Without indent or nindent, YAML can become invalid.

Always preview:

helm template demo .
Hands-on Lab

Replace the default helper with:

{{ define "my-app.fullname" }}
{{ printf "%s-%s" .Release.Name .Chart.Name }}
{{ end }}

{{ define "my-app.labels" }}
app: {{ .Chart.Name }}
release: {{ .Release.Name }}
{{ end }}

Now update deployment.yaml:

metadata:
  name: {{ include "my-app.fullname" . }}

  labels:
{{ include "my-app.labels" . | nindent 4 }}

Update service.yaml in the same way.

Run:

helm template demo .

Verify:

Both Deployment and Service have the same generated name.
Both have identical labels.
The YAML indentation is correct.
Summary
Function	Purpose
define	Create a reusable named template
include	Call a named template and return its output
template	Execute a named template (less flexible)
printf	Format strings
indent	Add spaces for YAML indentation
nindent	Add a newline and indentation
Interview Questions
1. What is _helpers.tpl?

A file used to define reusable template snippets and helper functions.

2. What is the difference between define and include?
define creates a named template.
include executes it and returns its output.
3. Why is include preferred over template?

Because include returns a string that can be piped into functions like quote, upper, indent, or nindent.

4. Why do we pass . to include?

To provide the current context so the helper can access objects like .Values, .Chart, and .Release.

5. Why are helpers useful?

They eliminate duplication and make charts easier to maintain.