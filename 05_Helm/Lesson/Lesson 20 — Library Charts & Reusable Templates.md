````md id="l20h8w"
# 🚀 Helm Tutorial — Lesson 20: Library Charts & Reusable Templates

> Learn how **Library Charts** help eliminate duplicate template code across multiple Helm Charts. They provide reusable helper templates for labels, annotations, naming, images, resources, and other shared logic, making large-scale Helm deployments easier to maintain.

---

# 📚 Table of Contents

- [Learning Objectives](#-learning-objectives)
- [The Problem with Duplicate Templates](#-the-problem-with-duplicate-templates)
- [What is a Library Chart?](#-what-is-a-library-chart)
- [Application Chart vs Library Chart](#-application-chart-vs-library-chart)
- [Creating a Library Chart](#-creating-a-library-chart)
- [Typical Library Chart Structure](#-typical-library-chart-structure)
- [Creating Reusable Templates](#-creating-reusable-templates)
- [Using a Library Chart](#-using-a-library-chart)
- [Adding a Library Chart as a Dependency](#-adding-a-library-chart-as-a-dependency)
- [Reusable Naming Functions](#-reusable-naming-functions)
- [Reusable Image Functions](#-reusable-image-functions)
- [Reusable Resource Templates](#-reusable-resource-templates)
- [Reusable Labels](#-reusable-labels)
- [Enterprise Example](#-enterprise-example)
- [Library Charts in CI/CD](#-library-charts-in-cicd)
- [Best Practices](#-best-practices)
- [Common Mistakes](#-common-mistakes)
- [Hands-on Lab](#-hands-on-lab)
- [Summary](#-summary)
- [Interview Questions](#-interview-questions)
- [Key Takeaways](#-key-takeaways)

---

# 🎯 Learning Objectives

By the end of this lesson, you will be able to:

- ✅ Understand what Library Charts are
- ✅ Differentiate between Application Charts and Library Charts
- ✅ Create a Library Chart
- ✅ Build reusable helper templates
- ✅ Share labels, annotations, names, and resources
- ✅ Use Library Charts as dependencies
- ✅ Apply production-ready best practices

---

# 🚨 The Problem with Duplicate Templates

As organizations grow, they often manage many Helm Charts.

Example:

```text
frontend/

backend/

payment/

notification/

auth-service/
```

Each chart contains nearly identical template code.

Example:

```yaml
labels:

  app.kubernetes.io/name: ...

  app.kubernetes.io/version: ...

  app.kubernetes.io/managed-by: Helm
```

Problems:

- ❌ Duplicate code
- ❌ Difficult maintenance
- ❌ Inconsistent implementations
- ❌ Higher chance of errors

---

# 📚 What is a Library Chart?

A **Library Chart** contains **only reusable template logic**.

It **does not create Kubernetes resources**.

Think of it as a shared utility package.

```text
Application Charts
        │
        ▼
Use Shared Templates
        │
        ▼
Library Chart
```

Instead of copying template code into every application chart, all charts reuse the same helpers.

---

# ⚖️ Application Chart vs Library Chart

| Feature | Application Chart | Library Chart |
|----------|-------------------|---------------|
| Creates Deployments | ✅ | ❌ |
| Creates Services | ✅ | ❌ |
| Creates ConfigMaps | ✅ | ❌ |
| Contains Helper Templates | ✅ | ✅ |
| Can Be Installed as an Application | ✅ | ❌ |

> **Note:** A Library Chart cannot be installed by itself because it does not define deployable Kubernetes resources.

---

# 🏗️ Creating a Library Chart

Create a new chart:

```bash
helm create common
```

Open:

```text
Chart.yaml
```

Change:

```yaml
type: application
```

to:

```yaml
type: library
```

Helm now recognizes it as a reusable library.

---

# 📁 Typical Library Chart Structure

Example:

```text
common/

├── Chart.yaml
└── templates/
    ├── _helpers.tpl
    ├── _labels.tpl
    ├── _annotations.tpl
    └── _images.tpl
```

Notice:

- No Deployments
- No Services
- No ConfigMaps
- No Ingress resources

Only reusable template definitions are stored.

---

# 📝 Creating Reusable Templates

Example:

`templates/_labels.tpl`

```go
{{- define "common.labels" -}}

app.kubernetes.io/managed-by: Helm
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}

{{- end }}
```

This helper can now be reused by any chart that depends on the library.

---

# 🔄 Using a Library Chart

Application chart:

```yaml
metadata:

  labels:
{{ include "common.labels" . | nindent 4 }}
```

Rendered output:

```yaml
metadata:
  labels:
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/instance: ecommerce
    app.kubernetes.io/version: "2.1.0"
```

Every chart receives identical labels.

---

# 📦 Adding a Library Chart as a Dependency

Declare the dependency in `Chart.yaml`.

```yaml
dependencies:

- name: common

  version: "1.0.0"

  repository: "file://../common"
```

Download the dependency:

```bash
helm dependency build
```

The helper templates are now available.

Example:

```go
{{ include "common.labels" . }}
```

---

# 🏷️ Reusable Naming Functions

Example helper:

```go
{{- define "common.fullname" -}}

{{ printf "%s-%s" .Release.Name .Chart.Name }}

{{- end }}
```

Usage:

```yaml
metadata:
  name: {{ include "common.fullname" . }}
```

Output:

```text
demo-ecommerce
```

This ensures consistent naming across all charts.

---

# 🖼️ Reusable Image Functions

Example:

```go
{{- define "common.image" -}}

{{ .Values.image.repository }}:{{ .Values.image.tag }}

{{- end }}
```

Usage:

```yaml
image: {{ include "common.image" . }}
```

This centralizes image formatting logic.

---

# ⚙️ Reusable Resource Templates

Instead of repeating:

```yaml
resources:

  limits:
    cpu: 500m
    memory: 512Mi
```

Create a reusable helper:

```go
{{- define "common.resources" -}}

{{ toYaml .Values.resources }}

{{- end }}
```

Usage:

```yaml
resources:
{{ include "common.resources" . | nindent 2 }}
```

This keeps resource configuration consistent across services.

---

# 🏷️ Reusable Labels

Instead of writing:

```yaml
labels:
  app: frontend
```

```yaml
labels:
  app: backend
```

```yaml
labels:
  app: payment
```

Use:

```go
{{ include "common.labels" . }}
```

Benefits:

- Consistent labels
- Easier maintenance
- Reduced duplication

---

# 🏢 Enterprise Example

Typical company structure:

```text
company-common/

frontend/

backend/

payment/

analytics/

notification/
```

Dependency relationship:

```text
Application Charts
        │
        ▼
company-common
        │
        ▼
Shared Templates
```

Updating the library automatically benefits every application after updating its dependency version.

---

# 🚀 Library Charts in CI/CD

Typical workflow:

```text
Update Library Chart
        │
        ▼
Release v1.2.0
        │
        ▼
Application Updates Dependency
        │
        ▼
helm dependency update
        │
        ▼
Deploy
```

This promotes centralized template management across teams.

---

# ✅ Best Practices

## Keep Only Reusable Logic

Library charts should contain:

- Labels
- Names
- Selectors
- Image helpers
- Resource helpers
- Common annotations
- Shared template functions

Avoid application-specific Kubernetes resources.

---

## Prefix Template Names

Good:

```go
common.labels
```

Avoid:

```go
labels
```

Prefixes prevent naming collisions when multiple libraries are used.

---

## Version Library Charts

Treat Library Charts like any other dependency.

Increment versions whenever shared logic changes.

---

## Document Shared Templates

Describe:

- Expected input
- Output
- Required values
- Usage examples

Well-documented libraries are easier for teams to adopt.

---

## Reuse Instead of Copying

Whenever multiple charts share the same logic, move it into the library chart instead of duplicating it.

---

# ❌ Common Mistakes

## Putting Deployments Inside a Library Chart

Incorrect:

```yaml
kind: Deployment
```

Library Charts should contain reusable template logic only.

---

## Forgetting `type: library`

Incorrect:

```yaml
type: application
```

Correct:

```yaml
type: library
```

Otherwise Helm treats it as a normal application chart.

---

## Using Generic Template Names

Avoid:

```go
labels
```

Prefer:

```go
common.labels
```

This reduces naming conflicts.

---

## Copying Instead of Reusing

If multiple charts contain identical helper templates, move them into the Library Chart.

---

# 🧪 Hands-on Lab

## Step 1 — Create a Library Chart

```bash
helm create common
```

---

## Step 2 — Convert It into a Library

Edit `Chart.yaml`.

```yaml
type: library
```

---

## Step 3 — Remove Generated Resources

Delete generated manifests such as:

- Deployment
- Service
- Ingress
- ServiceAccount
- HorizontalPodAutoscaler (HPA)

Keep only helper templates.

---

## Step 4 — Create Shared Labels

Create:

```text
templates/_labels.tpl
```

```go
{{- define "common.labels" -}}

app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}

{{- end }}
```

---

## Step 5 — Add the Library as a Dependency

```yaml
dependencies:

- name: common
  version: "1.0.0"
  repository: "file://../common"
```

---

## Step 6 — Build Dependencies

```bash
helm dependency build
```

---

## Step 7 — Use the Shared Labels

```yaml
metadata:
  labels:
{{ include "common.labels" . | nindent 4 }}
```

Render the chart:

```bash
helm template demo .
```

Verify that the shared labels appear correctly in the rendered manifests.

---

# 📋 Summary

| Concept | Purpose |
|----------|---------|
| Library Chart | Share reusable template logic |
| `type: library` | Mark a chart as a Library Chart |
| `include` | Render reusable helper templates |
| `_helpers.tpl` | Store reusable helper functions |
| `helm dependency build` | Download/build Library Chart dependencies |

---

# 🎤 Interview Questions

### 1. What is a Helm Library Chart?

> A Library Chart is a Helm Chart that contains reusable template logic and helper functions but does not create Kubernetes resources.

---

### 2. Can you install a Library Chart directly?

> No. Library Charts are designed to be used as dependencies by application charts and are not deployable on their own.

---

### 3. How do you declare a Library Chart?

Set the following in `Chart.yaml`:

```yaml
type: library
```

---

### 4. Why use Library Charts?

> They eliminate duplicate template code, improve consistency, simplify maintenance, and enable reusable logic across multiple Helm Charts.

---

### 5. Which Helm function is commonly used with Library Charts?

> `include`

It renders reusable templates defined in the Library Chart.

---

### 6. Should Deployments and Services exist in a Library Chart?

> No. Library Charts should contain only reusable template logic and helper functions—not deployable Kubernetes resources.

---

# 📌 Key Takeaways

- Library Charts centralize reusable Helm template logic for multiple application charts.
- They do not create Kubernetes resources and cannot be installed independently.
- Set `type: library` in `Chart.yaml` to define a Library Chart.
- Common reusable helpers include labels, annotations, names, image references, and resource definitions.
- Use `include` to render templates from a Library Chart.
- Add Library Charts as dependencies to share logic across applications.
- Proper versioning and documentation make Library Charts easy to maintain and adopt across teams.