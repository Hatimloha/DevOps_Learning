Lesson 6 — Conditionals & Loops (if, else, with, range)

This lesson is where Helm templates become dynamic.

Until now, your templates have only replaced placeholders. Now you'll learn how to:

Create resources only when needed
Iterate over lists
Simplify nested values
Build reusable production-ready templates

These concepts are used in almost every real-world Helm chart.

Learning Objectives

By the end of this lesson, you'll be able to:

Use if
Use else
Use with
Use range
Loop through lists and maps
Conditionally create Kubernetes resources
Why Do We Need Conditionals?

Suppose your application has an Ingress.

Development:

No Ingress

Production:

Ingress Enabled

Should you maintain two different ingress.yaml files?

No.

Use one template:

If enabled
    ↓
Create Ingress

Else
    ↓
Don't create it
The if Statement

Syntax:

{{ if CONDITION }}

...

{{ end }}
Example 1

values.yaml

ingress:
  enabled: true

Template:

{{ if .Values.ingress.enabled }}

kind: Ingress

{{ end }}

Run:

helm template demo .

Output:

kind: Ingress

Now change:

ingress:
  enabled: false

Output:

Nothing

The resource disappears completely.

Real Production Example

values.yaml

autoscaling:
  enabled: true

templates/hpa.yaml

{{ if .Values.autoscaling.enabled }}

apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler

...

{{ end }}

If disabled:

autoscaling:
  enabled: false

Helm doesn't generate the HPA.

This is exactly how many production charts work.

if + else

Example:

{{ if .Values.production }}

replicas: 10

{{ else }}

replicas: 2

{{ end }}

Development:

production: false

Output:

replicas: 2

Production:

production: true

Output:

replicas: 10
Nested if

Example:

{{ if .Values.ingress.enabled }}

{{ if .Values.ingress.tls }}

TLS Enabled

{{ end }}

{{ end }}

Meaning:

Ingress Enabled?

       Yes
        │
        ▼
TLS Enabled?

       Yes
        │
        ▼
Generate TLS Configuration
Comparison Functions

Helm doesn't use operators like:

==
!=
>
<

Instead, it uses functions.

eq
{{ if eq .Values.environment "prod" }}

Production

{{ end }}
ne
{{ if ne .Values.environment "dev" }}

Not Development

{{ end }}
and
{{ if and .Values.ingress.enabled .Values.ingress.tls }}

TLS Enabled

{{ end }}

Both must be true.

or
{{ if or .Values.dev .Values.stage }}

Non Production

{{ end }}

Only one needs to be true.

not
{{ if not .Values.debug }}

Debug Disabled

{{ end }}
The with Statement

Without with:

{{ .Values.image.repository }}

{{ .Values.image.tag }}

{{ .Values.image.pullPolicy }}

Repeated .Values.image becomes noisy.

Using with:

{{ with .Values.image }}

repository: {{ .repository }}

tag: {{ .tag }}

pullPolicy: {{ .pullPolicy }}

{{ end }}

Inside the with block:

.

now points to:

image

instead of the whole chart context.

Think of it like changing directories:

Before:

.Values.image.repository

After entering with:

.repository

Cleaner and easier to read.

The range Loop

Suppose:

values.yaml

ports:
  - 80
  - 443
  - 8080

Loop:

{{ range .Values.ports }}

- containerPort: {{ . }}

{{ end }}

Output:

- containerPort: 80

- containerPort: 443

- containerPort: 8080

Here:

.

represents the current item in the list.

Another Example
env:
  - DEV
  - TEST
  - PROD

Template:

{{ range .Values.env }}

- {{ . }}

{{ end }}

Output:

- DEV

- TEST

- PROD
Looping Through Maps

values.yaml

labels:
  app: nginx
  env: prod

Template:

{{ range $key, $value := .Values.labels }}

{{ $key }}: {{ $value }}

{{ end }}

Output:

app: nginx

env: prod
Variables Inside range
{{ range $index, $port := .Values.ports }}

Port {{ $index }} = {{ $port }}

{{ end }}

Output:

Port 0 = 80

Port 1 = 443

Port 2 = 8080
Combining if + range

Example:

{{ if .Values.ingress.enabled }}

{{ range .Values.ingress.hosts }}

- host: {{ . }}

{{ end }}

{{ end }}

If ingress is disabled:

No hosts are generated.

Real Project Example

values.yaml

env:

  - name: DB_HOST
    value: mysql

  - name: DB_PORT
    value: "3306"

Template:

env:

{{ range .Values.env }}

  - name: {{ .name }}

    value: {{ .value | quote }}

{{ end }}

Output:

env:

- name: DB_HOST
  value: "mysql"

- name: DB_PORT
  value: "3306"

This pattern is extremely common in production charts.

Common Mistakes
❌ Forgetting end

Wrong:

{{ if .Values.enabled }}

kind: Service

Correct:

{{ if .Values.enabled }}

kind: Service

{{ end }}
❌ Using .Values inside with

Inside:

{{ with .Values.image }}

Don't write:

{{ .Values.image.tag }}

Write:

{{ .tag }}

because . already refers to .Values.image.

❌ Forgetting . in range

Wrong:

{{ range .Values.ports }}

{{ .Values }}

{{ end }}

Correct:

{{ range .Values.ports }}

{{ . }}

{{ end }}

Inside range, . becomes the current element.

Hands-on Lab

Add to values.yaml:

ingress:
  enabled: true

ports:
  - 80
  - 443

image:
  repository: nginx
  tag: latest

Create a test template:

{{ if .Values.ingress.enabled }}
Ingress Enabled
{{ end }}

{{ with .Values.image }}
Repository: {{ .repository }}
Tag: {{ .tag }}
{{ end }}

Ports:

{{ range .Values.ports }}
- {{ . }}
{{ end }}

Run:

helm template demo .

Observe:

if controls whether content is rendered.
with changes the current context.
range repeats output for each list item.
Summary
Statement	Purpose
if	Render content conditionally
else	Alternative branch
with	Change the current context
range	Iterate over lists or maps
eq, ne	Compare values
and, or, not	Combine conditions
Interview Questions
What is the purpose of if in Helm templates?
How does with change the meaning of .?
What does range iterate over?
How do you compare two values in Helm?
Why is range useful for Kubernetes resources?
What happens if an if condition evaluates to false?
Homework
Add an ingress.enabled flag to values.yaml and conditionally render a simple Ingress resource.
Create a list of ports and use range to generate containerPort entries.
Use with to simplify access to .Values.image.
Create a labels map and use range to render each key/value pair.

Render your chart after each change with:

helm template demo .

and inspect the generated YAML.