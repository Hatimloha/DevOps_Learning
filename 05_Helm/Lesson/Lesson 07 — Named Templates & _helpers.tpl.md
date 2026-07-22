# 🚀 Helm Tutorial — Lesson 7: Named Templates & `_helpers.tpl`

> Learn how to create reusable template functions using `_helpers.tpl` to eliminate duplication and build maintainable Helm Charts.

---

# 📚 Table of Contents

- [Learning Objectives](#-learning-objectives)
- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [What is `_helpers.tpl`?](#-what-is-_helperstpl)
- [Using `define`](#-using-define)
- [Using `include`](#-using-include)
- [Passing Context (`.`)](#-passing-context-)
- [Using `.Chart` in Helpers](#-using-chart-in-helpers)
- [Using `.Release` in Helpers](#-using-release-in-helpers)
- [A Real `_helpers.tpl` Example](#-a-real-_helperstpl-example)
- [Using `printf`](#-using-printf)
- [Creating Reusable Labels](#-creating-reusable-labels)
- [`indent` vs `nindent`](#-indent-vs-nindent)
- [`template` vs `include`](#-template-vs-include)
- [Production Project Structure](#-production-project-structure)
- [Common Mistakes](#-common-mistakes)
- [Hands-on Lab](#-hands-on-lab)
- [Summary](#-summary)
- [Interview Questions](#-interview-questions)
- [Key Takeaways](#-key-takeaways)

---

# 🎯 Learning Objectives

By the end of this lesson, you will be able to:

- ✅ Understand the purpose of `_helpers.tpl`
- ✅ Create reusable templates using `define`
- ✅ Reuse templates with `include`
- ✅ Understand `template`
- ✅ Pass the current context using `.`
- ✅ Generate consistent resource names and labels
- ✅ Reduce duplication across Helm Charts

---

# ❓ The Problem

Suppose your application contains multiple Kubernetes resources.

### `deployment.yaml`

```yaml
metadata:
  name: my-app
```

### `service.yaml`

```yaml
metadata:
  name: my-app
```

### `configmap.yaml`

```yaml
metadata:
  name: my-app
```

### `secret.yaml`

```yaml
metadata:
  name: my-app
```

Now imagine the application name changes.

You must edit every template individually.

With dozens of templates, this quickly becomes difficult to maintain.

---

# 💡 The Solution

Define the name once.

Reuse it everywhere.

Instead of hardcoding:

```text
deployment.yaml
    my-app

service.yaml
    my-app

configmap.yaml
    my-app

secret.yaml
    my-app
```

Use a helper:

```text
_helpers.tpl
        │
        ▼
Application Name
        │
        ├── Deployment
        ├── Service
        ├── ConfigMap
        └── Secret
```

One definition.

Many uses.

---

# 📄 What is `_helpers.tpl`?

`_helpers.tpl` stores reusable template functions.

Default location:

```text
templates/
└── _helpers.tpl
```

Unlike `deployment.yaml` or `service.yaml`, this file **does not generate Kubernetes resources**.

Instead, it defines reusable snippets that other templates can call.

---

# 🛠️ Using `define`

Syntax:

```gotemplate
{{ define "my-app.name" }}

my-app

{{ end }}
```

Nothing is rendered immediately.

This simply creates a reusable template named:

```text
my-app.name
```

---

# 📥 Using `include`

To use the helper:

```yaml
metadata:
  name: {{ include "my-app.name" . }}
```

Rendered output:

```yaml
metadata:
  name: my-app
```

Think of `include` as calling a function.

---

# 💻 JavaScript Analogy

### JavaScript

```javascript
function appName() {
    return "my-app";
}

console.log(appName());
```

### Helm

```gotemplate
{{ define "my-app.name" }}

my-app

{{ end }}
```

Call it:

```gotemplate
{{ include "my-app.name" . }}
```

Both return the same value.

---

# 🔄 Passing Context (`.`)

Notice the helper call:

```gotemplate
{{ include "my-app.name" . }}
```

The dot (`.`) passes the current template context into the helper.

Without it:

```gotemplate
{{ include "my-app.name" }}
```

the helper cannot access objects such as:

- `.Values`
- `.Chart`
- `.Release`

> **Best Practice:** Always pass `.` to `include` unless you intentionally want a different context.

---

# 📦 Using `.Chart` in Helpers

Helper:

```gotemplate
{{ define "my-app.chartName" }}

{{ .Chart.Name }}

{{ end }}
```

Usage:

```yaml
metadata:
  labels:
    app: {{ include "my-app.chartName" . }}
```

If `Chart.yaml` contains:

```yaml
name: ecommerce
```

Rendered output:

```yaml
labels:
  app: ecommerce
```

---

# 🚀 Using `.Release` in Helpers

Helper:

```gotemplate
{{ define "my-app.fullname" }}

{{ .Release.Name }}-{{ .Chart.Name }}

{{ end }}
```

Install:

```bash
helm install demo .
```

Rendered output:

```text
demo-my-app
```

Install again:

```bash
helm install production .
```

Rendered output:

```text
production-my-app
```

No template modifications are required.

---

# 📄 A Real `_helpers.tpl` Example

Helper:

```gotemplate
{{ define "my-app.fullname" }}

{{ printf "%s-%s" .Release.Name .Chart.Name }}

{{ end }}
```

Deployment:

```yaml
metadata:
  name: {{ include "my-app.fullname" . }}
```

Service:

```yaml
metadata:
  name: {{ include "my-app.fullname" . }}
```

ConfigMap:

```yaml
metadata:
  name: {{ include "my-app.fullname" . }}
```

Every resource now follows the same naming convention.

---

# 📝 Using `printf`

The `printf` function formats strings.

Example:

```gotemplate
{{ printf "%s-%s" "demo" "nginx" }}
```

Output:

```text
demo-nginx
```

Another example:

```gotemplate
{{ printf "%s:%s" "nginx" "1.27" }}
```

Output:

```text
nginx:1.27
```

---

# 🏷️ Creating Reusable Labels

Helper:

```gotemplate
{{ define "my-app.labels" }}

app: {{ .Chart.Name }}
release: {{ .Release.Name }}

{{ end }}
```

Usage:

```yaml
metadata:
  labels:
{{ include "my-app.labels" . | indent 4 }}
```

Rendered output:

```yaml
metadata:
  labels:
    app: my-app
    release: demo
```

---

# 📏 `indent` vs `nindent`

Without indentation:

```yaml
metadata:
  labels:
app: my-app
release: demo
```

The YAML is invalid.

---

Using `indent`:

```gotemplate
{{ include "my-app.labels" . | indent 4 }}
```

Output:

```yaml
metadata:
  labels:
    app: my-app
    release: demo
```

---

Using `nindent`:

```gotemplate
labels:
{{ include "my-app.labels" . | nindent 2 }}
```

Output:

```yaml
labels:
  app: my-app
  release: demo
```

### Difference

| Function | Purpose |
|-----------|---------|
| `indent` | Adds spaces before each line |
| `nindent` | Adds a newline **and** indentation |

In most Helm Charts, `nindent` is preferred for multi-line YAML blocks.

---

# ⚖️ `template` vs `include`

Both execute named templates.

Example:

```gotemplate
{{ template "my-app.name" . }}
```

works correctly.

However, `include` returns a string, making it compatible with pipelines.

Example:

```gotemplate
{{ include "my-app.name" . | upper }}
```

Output:

```text
MY-APP
```

This flexibility is why `include` is recommended.

---

## Recommendation

Use:

```gotemplate
include
```

for almost every helper invocation.

It is the modern Helm best practice.

---

# 🏗️ Production Project Structure

```text
my-app/

templates/
├── deployment.yaml
├── service.yaml
├── configmap.yaml
├── secret.yaml
└── _helpers.tpl
```

Every resource uses:

```gotemplate
{{ include "my-app.fullname" . }}
```

If the naming convention changes, you only update `_helpers.tpl`.

---

# ❌ Common Mistakes

## Forgetting the Context (`.`)

Incorrect:

```gotemplate
{{ include "my-app.fullname" }}
```

Correct:

```gotemplate
{{ include "my-app.fullname" . }}
```

---

## Duplicating Logic

Incorrect:

```text
Deployment
demo-my-app

Service
demo-my-app

ConfigMap
demo-my-app
```

Correct:

```text
One Helper

↓

Reuse Everywhere
```

---

## Incorrect Indentation

Without `indent` or `nindent`, generated YAML may be invalid.

Always verify the output:

```bash
helm template demo .
```

---

# 🧪 Hands-on Lab

Replace the default helper with:

```gotemplate
{{ define "my-app.fullname" }}
{{ printf "%s-%s" .Release.Name .Chart.Name }}
{{ end }}

{{ define "my-app.labels" }}
app: {{ .Chart.Name }}
release: {{ .Release.Name }}
{{ end }}
```

Update `deployment.yaml`:

```yaml
metadata:
  name: {{ include "my-app.fullname" . }}

  labels:
{{ include "my-app.labels" . | nindent 4 }}
```

Update `service.yaml` using the same helpers.

Render the chart:

```bash
helm template demo .
```

Verify:

- Deployment and Service use the same generated name.
- Labels are identical across resources.
- YAML indentation is correct.

---

# 📋 Summary

| Function | Purpose |
|-----------|---------|
| `define` | Create a reusable named template |
| `include` | Execute a named template and return its output |
| `template` | Execute a named template (less flexible) |
| `printf` | Format strings |
| `indent` | Add spaces for YAML indentation |
| `nindent` | Add a newline and indentation |

---

# 🎯 Interview Questions

### 1. What is `_helpers.tpl`?

> `_helpers.tpl` is a file used to define reusable template snippets and helper functions that can be shared across multiple Helm templates.

---

### 2. What is the difference between `define` and `include`?

- `define` creates a named template.
- `include` executes that template and returns its output as a string.

---

### 3. Why is `include` preferred over `template`?

> Because `include` returns a string, allowing it to be combined with functions such as `quote`, `upper`, `indent`, and `nindent` using pipelines.

---

### 4. Why do we pass `.` to `include`?

> Passing `.` provides the current context so the helper can access objects such as `.Values`, `.Chart`, and `.Release`.

---

### 5. Why are helpers useful?

> Helpers eliminate duplicated template logic, improve consistency, and make Helm Charts easier to maintain.

---

# 📌 Key Takeaways

- `_helpers.tpl` stores reusable template functions.
- `define` creates reusable named templates.
- `include` executes helpers and returns their output.
- Always pass the current context (`.`) when calling helpers.
- `printf` is useful for building dynamic names and strings.
- `indent` and `nindent` ensure generated YAML maintains correct formatting.
- Centralizing naming and labeling logic in `_helpers.tpl` greatly improves maintainability in production Helm Charts.