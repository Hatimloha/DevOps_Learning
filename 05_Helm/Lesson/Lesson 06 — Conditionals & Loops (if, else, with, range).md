# 🚀 Helm Tutorial — Lesson 6: Conditionals & Loops (`if`, `else`, `with`, `range`)

> Learn how to make Helm templates dynamic using conditionals, loops, and context switching to build production-ready Kubernetes manifests.

---

# 📚 Table of Contents

- [Learning Objectives](#-learning-objectives)
- [Why Do We Need Conditionals?](#-why-do-we-need-conditionals)
- [The `if` Statement](#-the-if-statement)
- [Real-World Example](#-real-world-example)
- [`if` + `else`](#-if--else)
- [Nested `if`](#-nested-if)
- [Comparison Functions](#-comparison-functions)
- [The `with` Statement](#-the-with-statement)
- [The `range` Loop](#-the-range-loop)
- [Looping Through Maps](#-looping-through-maps)
- [Variables Inside `range`](#-variables-inside-range)
- [Combining `if` and `range`](#-combining-if-and-range)
- [Production Example](#-production-example)
- [Common Mistakes](#-common-mistakes)
- [Hands-on Lab](#-hands-on-lab)
- [Summary](#-summary)
- [Interview Questions](#-interview-questions)
- [Homework](#-homework)
- [Key Takeaways](#-key-takeaways)

---

# 🎯 Learning Objectives

By the end of this lesson, you will be able to:

- ✅ Use `if`
- ✅ Use `else`
- ✅ Use `with`
- ✅ Use `range`
- ✅ Iterate through lists and maps
- ✅ Conditionally create Kubernetes resources

---

# ❓ Why Do We Need Conditionals?

Imagine your application uses an **Ingress**.

### Development

```text
No Ingress
```

### Production

```text
Ingress Enabled
```

Should you maintain two separate `ingress.yaml` files?

**No.**

Instead, use one template that creates the resource only when required.

```text
Ingress Enabled?
        │
   Yes  ▼
Create Ingress

   No
        ▼
Do Nothing
```

---

# 🔀 The `if` Statement

### Syntax

```gotemplate
{{ if CONDITION }}

...

{{ end }}
```

---

## Example

### `values.yaml`

```yaml
ingress:
  enabled: true
```

### Template

```gotemplate
{{ if .Values.ingress.enabled }}

kind: Ingress

{{ end }}
```

Render the chart:

```bash
helm template demo .
```

Output:

```yaml
kind: Ingress
```

Disable Ingress:

```yaml
ingress:
  enabled: false
```

Output:

```text
(No output)
```

The resource is completely omitted.

---

# 🌍 Real-World Example

### `values.yaml`

```yaml
autoscaling:
  enabled: true
```

### `templates/hpa.yaml`

```gotemplate
{{ if .Values.autoscaling.enabled }}

apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler

...

{{ end }}
```

Disable autoscaling:

```yaml
autoscaling:
  enabled: false
```

The HorizontalPodAutoscaler is no longer generated.

This pattern is used in almost every production Helm Chart.

---

# 🔄 `if` + `else`

Example:

```gotemplate
{{ if .Values.production }}

replicas: 10

{{ else }}

replicas: 2

{{ end }}
```

### Development

```yaml
production: false
```

Output:

```yaml
replicas: 2
```

---

### Production

```yaml
production: true
```

Output:

```yaml
replicas: 10
```

---

# 🪆 Nested `if`

Example:

```gotemplate
{{ if .Values.ingress.enabled }}

{{ if .Values.ingress.tls }}

TLS Enabled

{{ end }}

{{ end }}
```

Execution flow:

```text
Ingress Enabled?
        │
       Yes
        │
        ▼
TLS Enabled?
        │
       Yes
        │
        ▼
Generate TLS Configuration
```

---

# ⚖️ Comparison Functions

Helm does **not** use operators like:

```text
==
!=
>
<
```

Instead, it uses built-in template functions.

---

## `eq`

```gotemplate
{{ if eq .Values.environment "prod" }}

Production

{{ end }}
```

---

## `ne`

```gotemplate
{{ if ne .Values.environment "dev" }}

Not Development

{{ end }}
```

---

## `and`

```gotemplate
{{ if and .Values.ingress.enabled .Values.ingress.tls }}

TLS Enabled

{{ end }}
```

Both conditions must evaluate to `true`.

---

## `or`

```gotemplate
{{ if or .Values.dev .Values.stage }}

Non Production

{{ end }}
```

At least one condition must be `true`.

---

## `not`

```gotemplate
{{ if not .Values.debug }}

Debug Disabled

{{ end }}
```

---

# 📂 The `with` Statement

Without `with`:

```gotemplate
{{ .Values.image.repository }}

{{ .Values.image.tag }}

{{ .Values.image.pullPolicy }}
```

This becomes repetitive.

---

Using `with`:

```gotemplate
{{ with .Values.image }}

repository: {{ .repository }}

tag: {{ .tag }}

pullPolicy: {{ .pullPolicy }}

{{ end }}
```

Inside the `with` block:

```text
.
```

now points directly to:

```text
.Values.image
```

Instead of writing:

```gotemplate
.Values.image.repository
```

You simply write:

```gotemplate
.repository
```

This makes templates cleaner and easier to maintain.

---

# 🔁 The `range` Loop

Suppose `values.yaml` contains:

```yaml
ports:
  - 80
  - 443
  - 8080
```

Template:

```gotemplate
{{ range .Values.ports }}

- containerPort: {{ . }}

{{ end }}
```

Rendered output:

```yaml
- containerPort: 80

- containerPort: 443

- containerPort: 8080
```

Inside a `range` loop:

```text
.
```

represents the current item.

---

## Another Example

### `values.yaml`

```yaml
env:
  - DEV
  - TEST
  - PROD
```

Template:

```gotemplate
{{ range .Values.env }}

- {{ . }}

{{ end }}
```

Output:

```text
- DEV

- TEST

- PROD
```

---

# 🗂️ Looping Through Maps

### `values.yaml`

```yaml
labels:
  app: nginx
  env: prod
```

Template:

```gotemplate
{{ range $key, $value := .Values.labels }}

{{ $key }}: {{ $value }}

{{ end }}
```

Rendered output:

```yaml
app: nginx

env: prod
```

---

# 📌 Variables Inside `range`

Example:

```gotemplate
{{ range $index, $port := .Values.ports }}

Port {{ $index }} = {{ $port }}

{{ end }}
```

Output:

```text
Port 0 = 80

Port 1 = 443

Port 2 = 8080
```

---

# 🔗 Combining `if` and `range`

Example:

```gotemplate
{{ if .Values.ingress.enabled }}

{{ range .Values.ingress.hosts }}

- host: {{ . }}

{{ end }}

{{ end }}
```

If Ingress is disabled, the host entries are not generated.

---

# 🏢 Production Example

### `values.yaml`

```yaml
env:
  - name: DB_HOST
    value: mysql

  - name: DB_PORT
    value: "3306"
```

Template:

```gotemplate
env:

{{ range .Values.env }}

  - name: {{ .name }}
    value: {{ .value | quote }}

{{ end }}
```

Rendered output:

```yaml
env:

- name: DB_HOST
  value: "mysql"

- name: DB_PORT
  value: "3306"
```

This pattern is extremely common in production Helm Charts.

---

# ❌ Common Mistakes

## Forgetting `end`

Incorrect:

```gotemplate
{{ if .Values.enabled }}

kind: Service
```

Correct:

```gotemplate
{{ if .Values.enabled }}

kind: Service

{{ end }}
```

---

## Using `.Values` Inside `with`

Incorrect:

```gotemplate
{{ with .Values.image }}

{{ .Values.image.tag }}

{{ end }}
```

Correct:

```gotemplate
{{ with .Values.image }}

{{ .tag }}

{{ end }}
```

Inside a `with` block, `.` already points to the selected object.

---

## Forgetting the Current Context in `range`

Incorrect:

```gotemplate
{{ range .Values.ports }}

{{ .Values }}

{{ end }}
```

Correct:

```gotemplate
{{ range .Values.ports }}

{{ . }}

{{ end }}
```

Inside `range`, `.` represents the current list element.

---

# 🧪 Hands-on Lab

Add the following to `values.yaml`:

```yaml
ingress:
  enabled: true

ports:
  - 80
  - 443

image:
  repository: nginx
  tag: latest
```

Create a test template:

```gotemplate
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
```

Render the chart:

```bash
helm template demo .
```

Observe how:

- `if` controls conditional rendering.
- `with` changes the current context.
- `range` repeats output for each list item.

---

# 📋 Summary

| Statement | Purpose |
|-----------|---------|
| `if` | Render content conditionally |
| `else` | Provide an alternative branch |
| `with` | Change the current context |
| `range` | Iterate over lists or maps |
| `eq`, `ne` | Compare values |
| `and`, `or`, `not` | Combine logical conditions |

---

# 🎯 Interview Questions

### 1. What is the purpose of `if` in Helm templates?

> `if` conditionally renders content based on whether an expression evaluates to `true`.

---

### 2. How does `with` change the meaning of `.`?

> Inside a `with` block, `.` becomes the specified object, allowing shorter and cleaner template expressions.

---

### 3. What does `range` iterate over?

> `range` iterates through lists, arrays, and maps, rendering content for each item.

---

### 4. How do you compare two values in Helm?

> Helm uses comparison functions such as `eq`, `ne`, `lt`, `gt`, `le`, and `ge` instead of traditional comparison operators.

---

### 5. Why is `range` useful for Kubernetes resources?

> It allows repetitive resources like ports, environment variables, labels, annotations, and volume mounts to be generated dynamically from configuration values.

---

### 6. What happens if an `if` condition evaluates to `false`?

> Helm skips the entire block, and no YAML is generated for that section.

---

# 📝 Homework

Complete the following exercises:

- Add an `ingress.enabled` flag to `values.yaml` and conditionally render an Ingress resource.
- Create a list of ports and generate `containerPort` entries using `range`.
- Use `with` to simplify access to `.Values.image`.
- Create a `labels` map and render each key/value pair using `range`.

After each change, render your chart to inspect the generated YAML:

```bash
helm template demo .
```

---

# 📌 Key Takeaways

- `if` conditionally renders Kubernetes resources.
- `else` provides an alternative rendering path.
- `with` simplifies access to nested values by changing the current context.
- `range` iterates through lists and maps to generate repeated YAML sections.
- Comparison functions such as `eq`, `ne`, `and`, `or`, and `not` are used instead of traditional operators.
- These template features are fundamental for building reusable, dynamic, and production-ready Helm Charts.