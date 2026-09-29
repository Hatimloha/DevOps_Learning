# 🚀 Helm Tutorial — Lesson 4: Helm Template Engine Basics (Go Templates)

> Learn how Helm uses Go Templates to generate Kubernetes manifests dynamically using values, chart metadata, and release information.

---

# 📚 Table of Contents

- [Learning Objectives](#-learning-objectives)
- [How Helm Works Internally](#-how-helm-works-internally)
- [What is a Template?](#-what-is-a-template)
- [Template Syntax](#-template-syntax)
- [Understanding the Dot (`.`)](#-understanding-the-dot-)
- [Using `.Values`](#-using-values)
- [Using `.Release`](#-using-release)
- [Using `.Chart`](#-using-chart)
- [`.Release` vs `.Chart`](#-release-vs-chart)
- [Accessing Nested Values](#-accessing-nested-values)
- [Variables](#-variables)
- [Pipelines (`|`)](#-pipelines-)
- [Common Template Functions](#-common-template-functions)
- [Chaining Functions](#-chaining-functions)
- [Template Example](#-template-example)
- [Preview Before Installing](#-preview-before-installing)
- [Real-World Example](#-real-world-example)
- [Best Practices](#-best-practices)
- [Hands-on Lab](#-hands-on-lab)
- [Interview Questions](#-interview-questions)
- [Key Takeaways](#-key-takeaways)

---

# 🎯 Learning Objectives

By the end of this lesson, you will be able to:

- ✅ Understand Go Template syntax (`{{ }}`)
- ✅ Use `.Values` to access configuration values
- ✅ Use `.Release` for release information
- ✅ Use `.Chart` to access chart metadata
- ✅ Create variables in templates
- ✅ Use pipelines (`|`)
- ✅ Apply common Helm template functions

---

# 🔄 How Helm Works Internally

When you install a chart:

```bash
helm install demo .
```

Helm performs the following steps:

```text
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
```

The placeholder replacement is performed by the **Go Template Engine**.

---

# 📖 What is a Template?

Suppose your Deployment contains:

```yaml
replicas: {{ .Values.replicaCount }}
```

And your `values.yaml` contains:

```yaml
replicaCount: 3
```

Helm renders:

```yaml
replicas: 3
```

Everything inside:

```gotemplate
{{ ... }}
```

is evaluated by the Go Template Engine before the manifest is sent to Kubernetes.

---

# 📝 Template Syntax

Every expression enclosed in:

```gotemplate
{{ }}
```

is executed by Helm.

Example:

```yaml
name: {{ .Release.Name }}
```

If the release name is:

```text
demo
```

The rendered output becomes:

```yaml
name: demo
```

---

# 🔹 Understanding the Dot (`.`)

The **dot (`.`)** is one of the most important concepts in Helm templates.

Think of it as the **current object** or **current context**.

Similar to other programming languages:

```python
user.name
```

or

```javascript
user.name
```

Helm uses:

```gotemplate
.Values.image.repository
```

which represents:

```text
Current Context
      │
      ▼
Values
      │
      ▼
image
      │
      ▼
repository
```

---

# 📂 Using `.Values`

The `.Values` object reads configuration from:

```text
values.yaml
```

Example:

```yaml
image:
  repository: nginx
  tag: latest
```

Template:

```yaml
image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
```

Rendered output:

```yaml
image: nginx:latest
```

---

# 🚀 Using `.Release`

The `.Release` object contains information about the current Helm release.

Example:

```bash
helm install demo .
```

Then:

```gotemplate
{{ .Release.Name }}
```

becomes:

```text
demo
```

### Common Fields

| Field | Description |
|--------|-------------|
| `.Release.Name` | Release name |
| `.Release.Namespace` | Kubernetes namespace |
| `.Release.Service` | Service managing the release (usually Helm) |

Example:

```yaml
metadata:
  name: {{ .Release.Name }}
```

Rendered output:

```yaml
metadata:
  name: demo
```

---

# 📦 Using `.Chart`

The `.Chart` object retrieves metadata from `Chart.yaml`.

Example:

```yaml
name: my-app
version: 0.1.0
appVersion: "1.0"
```

Template:

```gotemplate
{{ .Chart.Name }}
```

Output:

```text
my-app
```

Another example:

```gotemplate
{{ .Chart.Version }}
```

Output:

```text
0.1.0
```

---

# ⚖️ `.Release` vs `.Chart`

| `.Release` | `.Chart` |
|-------------|----------|
| Runtime information | Chart metadata |
| Changes with every installation | Usually remains fixed |
| Example: `demo` | Example: `my-app` |

Example:

```text
Chart Name
    my-app

Release Name
    demo

Deployment Name
    demo-my-app
```

---

# 📁 Accessing Nested Values

Given the following configuration:

```yaml
image:
  repository: nginx
  tag: latest
  pullPolicy: IfNotPresent
```

Access individual values using:

```gotemplate
{{ .Values.image.repository }}
```

```gotemplate
{{ .Values.image.tag }}
```

```gotemplate
{{ .Values.image.pullPolicy }}
```

---

# 💡 Variables

Instead of repeating long expressions:

```gotemplate
{{ .Values.image.repository }}

{{ .Values.image.repository }}

{{ .Values.image.repository }}
```

Store the value in a variable:

```gotemplate
{{- $repo := .Values.image.repository }}
```

Use it later:

```yaml
image: "{{ $repo }}"
```

> Variables in Helm templates always begin with `$`.

---

# 🔗 Pipelines (`|`)

Pipelines pass the output of one function as the input to another.

Example:

```gotemplate
{{ .Chart.Name | upper }}
```

If the chart name is:

```text
my-app
```

Output:

```text
MY-APP
```

Another example:

```gotemplate
{{ .Chart.Name | lower }}
```

Output:

```text
my-app
```

---

# 🛠️ Common Template Functions

## `upper`

```gotemplate
{{ "nginx" | upper }}
```

Output:

```text
NGINX
```

---

## `lower`

```gotemplate
{{ "NGINX" | lower }}
```

Output:

```text
nginx
```

---

## `quote`

Without quotes:

```yaml
version: 1.0
```

Template:

```gotemplate
version: {{ "1.0" | quote }}
```

Output:

```yaml
version: "1.0"
```

Useful for ensuring values are treated as strings.

---

## `default`

Suppose the value is missing.

Template:

```gotemplate
replicas: {{ .Values.replicas | default 2 }}
```

Output:

```yaml
replicas: 2
```

Provides a fallback value when no configuration exists.

---

## `repeat`

```gotemplate
{{ repeat 3 "Hi" }}
```

Output:

```text
HiHiHi
```

Mostly useful for learning and demonstrations.

---

# 🔄 Chaining Functions

You can combine multiple functions using pipelines.

Example:

```gotemplate
{{ .Chart.Name | upper | quote }}
```

Output:

```text
"MY-APP"
```

Execution flow:

```text
my-app
   │
   ▼
upper
   │
   ▼
MY-APP
   │
   ▼
quote
   │
   ▼
"MY-APP"
```

---

# 📄 Template Example

Template:

```yaml
metadata:
  name: {{ .Release.Name }}
  labels:
    app: {{ .Chart.Name }}
    version: {{ .Chart.AppVersion | quote }}
```

Suppose:

- Release Name: `demo`
- Chart Name: `my-app`
- App Version: `1.0`

Rendered output:

```yaml
metadata:
  name: demo
  labels:
    app: my-app
    version: "1.0"
```

---

# 👀 Preview Before Installing

Always preview your manifests before deployment.

```bash
helm template demo .
```

This command shows the exact Kubernetes YAML that Helm generates.

### Benefits

- Safe debugging
- No Kubernetes cluster required
- Verify templates before deployment
- Detect configuration issues early

---

# 🌍 Real-World Example

Suppose your application image changes frequently.

Instead of hardcoding:

```yaml
image: nginx:latest
```

Use configurable values:

```yaml
image:
  repository: nginx
  tag: latest
```

Template:

```yaml
image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
```

When a new version is released, simply update:

```yaml
tag: "1.28"
```

No template modifications are required.

---

# ✅ Best Practices

- Keep templates simple and readable.
- Store configurable values in `values.yaml`.
- Use `.Values` instead of hardcoding values.
- Use `quote` for string values when appropriate.
- Use `default` for optional configurations.
- Store repeated expressions in variables.
- Always verify generated manifests using `helm template`.

---

# 🧪 Hands-on Lab

In `templates/deployment.yaml`, try the following examples.

### Display the Release Name

```yaml
metadata:
  name: {{ .Release.Name }}
```

---

### Display the Chart Name

```yaml
labels:
  chart: {{ .Chart.Name }}
```

---

### Display the Image Repository

```yaml
image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
```

---

### Display the Chart Version

```yaml
labels:
  version: {{ .Chart.Version | quote }}
```

Render the chart:

```bash
helm template demo .
```

Observe how Helm replaces every template expression with actual values.

---

# 🎯 Interview Questions

### 1. What are Go Templates in Helm?

> Go Templates allow Helm to dynamically generate Kubernetes manifests by replacing placeholders with actual values during rendering.

---

### 2. What does `.Values` represent?

> `.Values` contains configuration values loaded from `values.yaml` or user-provided values files.

---

### 3. What is the difference between `.Chart` and `.Release`?

| `.Chart` | `.Release` |
|-----------|------------|
| Chart metadata | Runtime installation information |
| Defined in `Chart.yaml` | Created during `helm install` |
| Usually remains constant | Changes with every installation |

---

### 4. What is the purpose of the dot (`.`)?

> The dot (`.`) represents the current context or current object from which Helm accesses values and metadata.

---

### 5. Why are pipelines (`|`) useful?

> Pipelines allow the output of one function to be passed as input to another, making templates cleaner and more readable.

---

### 6. What does the `default` function do?

> It provides a fallback value when the requested configuration value is missing.

---

### 7. Why should you use variables in templates?

> Variables reduce repetition, improve readability, and simplify template maintenance.

---

# 📌 Key Takeaways

- Helm uses the Go Template Engine to render Kubernetes manifests.
- Everything inside `{{ }}` is evaluated during template rendering.
- `.Values` accesses configuration from `values.yaml`.
- `.Release` provides runtime information about the Helm release.
- `.Chart` retrieves metadata from `Chart.yaml`.
- Variables (`$`) help eliminate repeated expressions.
- Pipelines (`|`) allow multiple template functions to be chained together.
- Always preview rendered manifests using `helm template` before deployment.