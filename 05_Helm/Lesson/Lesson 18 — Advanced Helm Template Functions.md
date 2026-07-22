Lesson 18 — Advanced Helm Template Functions

Till now, you learned:

Chart structure
Values
Templates
Upgrades
Rollbacks
Hooks
Testing
Packaging
Repositories
OCI distribution

Now we move into real production Helm templating.

Most professional Helm charts are not simple YAML files. They use template functions to make charts:

Dynamic
Reusable
Configurable
Environment-independent
Learning Objectives

By the end of this lesson, you will understand:

Helm template engine
Go template syntax
Sprig functions
default
required
include
tpl
lookup
toYaml
fromYaml
nindent
Encoding functions
String functions
Dictionary and list functions
How Helm Templates Work

Helm uses:

Template File
      |
      |
      v
values.yaml
      |
      |
      v
Rendered Kubernetes YAML

Example:

deployment.yaml

containers:
- name: app
  image: {{ .Values.image.repository }}

values.yaml

image:
  repository: nginx

After rendering:

containers:
- name: app
  image: nginx
Template Syntax

Helm uses:

{{ }}

Example:

name: {{ .Release.Name }}
Important Built-in Objects
.Values

Reads values.yaml

Example:

replicas: {{ .Values.replicaCount }}
.Release

Contains release information.

Example:

name: {{ .Release.Name }}

Output:

name: ecommerce
.Chart

Chart metadata.

Example:

version: {{ .Chart.Version }}
1. default Function

Provides a fallback value.

Example:

replicas: {{ default 1 .Values.replicaCount }}

If:

replicaCount: 3

Output:

replicas: 3

If missing:

replicas: 1
Real Example

values.yaml:

image:
  tag: ""

Template:

image: nginx:{{ default "latest" .Values.image.tag }}

Output:

image: nginx:latest
2. required Function

Makes values mandatory.

Example:

image: {{ required "Image name is required" .Values.image }}

If missing:

Helm fails:

Error: Image name is required

Useful for:

Database passwords
API keys
Critical configuration
Example

values.yaml:

database:
  password:

Template:

password:
{{ required "Database password required" .Values.database.password }}

Without password:

Deployment stops.

3. include Function

Used for reusable templates.

Example:

_helpers.tpl

{{- define "app.name" -}}
ecommerce
{{- end }}

Use:

name:
{{ include "app.name" . }}

Output:

name: ecommerce
Why include?

Avoid repeating:

app.kubernetes.io/name

everywhere.

Example Helper

_helpers.tpl

{{- define "common.labels" }}

app: ecommerce
team: devops

{{- end }}

Deployment:

labels:
{{ include "common.labels" . | nindent 4 }}
4. nindent Function

Adds indentation.

Without:

labels:
{{ include "labels" . }}

Problem:

labels:
app: ecommerce

Invalid YAML.

With:

labels:
{{ include "labels" . | nindent 2 }}

Output:

labels:
  app: ecommerce
5. toYaml Function

Converts objects into YAML.

values.yaml:

resources:
  limits:
    cpu: 500m
    memory: 512Mi

Template:

resources:
{{ toYaml .Values.resources | nindent 2 }}

Output:

resources:
  limits:
    cpu: 500m
    memory: 512Mi
6. fromYaml Function

Reverse operation.

YAML:

config:
  key: value

Convert into object:

fromYaml

Useful when processing generated YAML.

7. tpl Function

Allows evaluating templates stored inside values.

Example:

values.yaml:

message: "Hello {{ .Release.Name }}"

Template:

{{ tpl .Values.message . }}

Output:

Hello ecommerce
8. lookup Function

Very powerful function.

It queries existing Kubernetes resources.

Syntax:

lookup apiVersion kind namespace name

Example:

{{ lookup "v1" "Secret" "default" "db-secret" }}

Helm checks:

Does db-secret exist?
Example Use Case

Create Secret only if it doesn't exist.

Check Secret

↓

Exists?

YES → Use it

NO → Create it
9. String Functions

Helm provides many string functions.

upper
{{ upper "hello" }}

Output:

HELLO
lower
{{ lower "HELLO" }}

Output:

hello
quote
{{ quote .Values.version }}

Output:

"1.0"
replace
{{ replace "_" "-" "my_app" }}

Output:

my-app
10. Encoding Functions
b64enc

Base64 encode.

Example:

password:
{{ "admin123" | b64enc }}

Output:

YWRtaW4xMjM=

Used in:

Kubernetes Secrets
b64dec

Decode:

{{ "YWRtaW4xMjM=" | b64dec }}

Output:

admin123
11. List Functions

Create lists:

{{ list "nginx" "redis" "mysql" }}

Result:

[nginx redis mysql]

Access item:

{{ index .Values.list 0 }}
12. Dictionary Functions

Create maps:

{{ dict "name" "nginx" "port" 80 }}

Output:

name: nginx
port: 80
Pipeline Operator

Helm heavily uses:

|

Example:

Without pipeline:

{{ quote (upper "hello") }}

With pipeline:

{{ "hello" | upper | quote }}

Output:

"HELLO"

Much cleaner.

Real Production Example

values.yaml:

app:
  name: ecommerce

labels:
  team: devops

Template:

metadata:

  name:
    {{ .Values.app.name }}

  labels:
    {{ toYaml .Values.labels | nindent 4 }}

Rendered:

metadata:
  name: ecommerce
  labels:
    team: devops
Debugging Templates

Always use:

helm template demo .

before installing.

Check with values:

helm template demo . -f production.yaml

Debug mode:

helm install demo . --dry-run --debug
Common Mistakes
❌ Wrong indentation

Bad:

labels:
{{ toYaml .Values.labels }}

Good:

labels:
{{ toYaml .Values.labels | nindent 2 }}
❌ Missing required values

Use:

required

for critical fields.

❌ Hardcoding values

Bad:

replicas: 3

Good:

replicas: {{ .Values.replicaCount }}
Hands-on Practice

Create:

values.yaml

app:
  name: ecommerce

replicaCount: 3

image:
  repository: nginx
  tag: latest

Deployment:

metadata:
  name: {{ .Values.app.name }}

spec:
  replicas:
    {{ .Values.replicaCount }}

containers:

- name: app

  image:
    {{ .Values.image.repository }}:{{ .Values.image.tag }}

Test:

helm template demo .
Summary
Function	Purpose
default	Provide fallback values
required	Force required values
include	Reuse templates
tpl	Evaluate templates inside values
lookup	Query Kubernetes resources
toYaml	Convert objects to YAML
fromYaml	Convert YAML to objects
nindent	Format indentation
b64enc	Encode data
b64dec	Decode data
Interview Questions
1. Why use Helm template functions?

To create dynamic, reusable, and configurable Kubernetes manifests.

2. Difference between include and template?

include returns output that can be passed through pipelines like nindent.

3. Why use required?

To stop deployment when critical values are missing.

4. What does lookup do?

It retrieves existing Kubernetes resources during rendering.

5. Why is nindent commonly used with toYaml?

Because YAML requires correct indentation.