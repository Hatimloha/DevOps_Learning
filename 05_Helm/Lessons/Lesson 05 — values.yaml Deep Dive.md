# 🚀 Helm Tutorial — Lesson 5: `values.yaml` Deep Dive

> Learn how `values.yaml` makes Helm Charts reusable across multiple environments by separating configuration from templates.

---

# 📚 Table of Contents

- [Learning Objectives](#-learning-objectives)
- [Why `values.yaml` Exists](#-why-valuesyaml-exists)
- [Helm's Solution](#-helms-solution)
- [Default `values.yaml`](#-default-valuesyaml)
- [Override Values Using `--set`](#-override-values-using---set)
- [Using Another Values File](#-using-another-values-file)
- [Using Multiple Values Files](#-using-multiple-values-files)
- [Value Precedence](#-value-precedence)
- [Working with Nested Values](#-working-with-nested-values)
- [Working with Lists](#-working-with-lists)
- [Working with Maps](#-working-with-maps)
- [Environment-Based Configuration](#-environment-based-configuration)
- [Real-World Example](#-real-world-example)
- [Best Practices](#-best-practices)
- [Hands-on Lab](#-hands-on-lab)
- [Interview Questions](#-interview-questions)
- [Key Takeaways](#-key-takeaways)

---

# 🎯 Learning Objectives

By the end of this lesson, you will be able to:

- ✅ Understand the purpose of `values.yaml`
- ✅ Learn how Helm loads configuration values
- ✅ Override values using `--set`
- ✅ Use custom values files with `-f` or `--values`
- ✅ Work with multiple values files
- ✅ Understand Helm value precedence
- ✅ Apply production-ready configuration practices

---

# 📖 Why `values.yaml` Exists

Suppose your Kubernetes Deployment contains:

```yaml
replicas: 2

image: nginx:1.27

service:
  type: ClusterIP
```

Now your production environment requires:

```yaml
replicas: 10

image: nginx:1.28

service:
  type: LoadBalancer
```

Without Helm, you would need to edit the Deployment YAML every time you deploy to a different environment.

This approach becomes difficult to maintain and is prone to errors.

---

# 💡 Helm's Solution

Helm separates **configuration** from **templates**.

Template:

```yaml
spec:
  replicas: {{ .Values.replicaCount }}
```

Development configuration:

```yaml
replicaCount: 2
```

Production configuration:

```yaml
replicaCount: 10
```

The template never changes—only the values do.

---

# 📄 Default `values.yaml`

Example:

```yaml
replicaCount: 2

image:
  repository: nginx
  tag: latest

service:
  type: ClusterIP
  port: 80
```

Template:

```yaml
replicas: {{ .Values.replicaCount }}

image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
```

Rendered output:

```yaml
replicas: 2

image: nginx:latest
```

---

# ⚙️ Override Values Using `--set`

Instead of editing `values.yaml`, you can override values directly from the command line.

Example:

```bash
helm template demo . \
  --set replicaCount=5
```

Rendered output:

```yaml
replicas: 5
```

The original `values.yaml` file remains unchanged.

---

## Override Nested Values

```bash
helm template demo . \
  --set image.tag=1.28
```

Output:

```yaml
image: nginx:1.28
```

---

## Override Multiple Values

```bash
helm template demo . \
  --set replicaCount=4,image.tag=1.29
```

Rendered output:

```yaml
replicas: 4

image: nginx:1.29
```

---

## When Should You Use `--set`?

Ideal for:

- Quick testing
- CI/CD pipelines
- One-time deployments
- Automation scripts

> **Note:** Avoid using large `--set` commands for production deployments.

---

# 📂 Using Another Values File

Create a development configuration:

### `values-dev.yaml`

```yaml
replicaCount: 1

image:
  tag: dev
```

Create a production configuration:

### `values-prod.yaml`

```yaml
replicaCount: 8

image:
  tag: "1.28"

service:
  type: LoadBalancer
```

Render the development configuration:

```bash
helm template demo . -f values-dev.yaml
```

Render the production configuration:

```bash
helm template demo . -f values-prod.yaml
```

The templates remain unchanged while the configuration changes.

---

# 📚 Using Multiple Values Files

Helm can merge multiple values files.

Example:

```bash
helm template demo . \
  -f values.yaml \
  -f values-prod.yaml
```

The second file overrides values from the first.

### Example

Default values:

```yaml
replicaCount: 2

image:
  tag: latest
```

Production overrides:

```yaml
replicaCount: 8
```

Final rendered output:

```yaml
replicas: 8

image: nginx:latest
```

Only the overridden values change.

---

# 🏆 Value Precedence

This is a very common interview question.

Suppose the default configuration contains:

```yaml
replicaCount: 2
```

Production values:

```yaml
replicaCount: 5
```

Command:

```bash
helm template demo . \
  -f values-prod.yaml \
  --set replicaCount=10
```

Final output:

```yaml
replicas: 10
```

Helm applies values in the following order:

```text
Lowest Priority
        │
        ▼
values.yaml
        │
        ▼
Custom values files (-f)
        │
        ▼
--set
        │
        ▼
Highest Priority
```

---

# 📂 Working with Nested Values

Example configuration:

```yaml
database:
  host: mysql
  port: 3306
```

Template:

```yaml
host: {{ .Values.database.host }}

port: {{ .Values.database.port }}
```

Override the host:

```bash
helm template demo . \
  --set database.host=postgres
```

Rendered output:

```yaml
host: postgres
```

---

# 📋 Working with Lists

Example:

```yaml
ports:
  - 80
  - 443
```

Access list elements:

```gotemplate
{{ index .Values.ports 0 }}
```

```gotemplate
{{ index .Values.ports 1 }}
```

Rendered output:

```text
80
```

```text
443
```

> **Note:** In the next lesson, you'll learn how to iterate through lists using loops (`range`).

---

# 🗂️ Working with Maps

Example:

```yaml
labels:
  app: nginx
  env: production
```

Access map values:

```gotemplate
{{ .Values.labels.app }}
```

```gotemplate
{{ .Values.labels.env }}
```

Rendered output:

```text
nginx
```

```text
production
```

---

# 🌍 Environment-Based Configuration

A common production structure:

```text
my-chart/
├── values.yaml
├── values-dev.yaml
├── values-stage.yaml
├── values-prod.yaml
```

Deploy to different environments using the same chart.

### Development

```bash
helm install app-dev . \
  -f values-dev.yaml
```

### Staging

```bash
helm install app-stage . \
  -f values-stage.yaml
```

### Production

```bash
helm install app-prod . \
  -f values-prod.yaml
```

One chart, multiple environments.

---

# 🏢 Real-World Example

Development configuration:

```yaml
replicaCount: 1

image:
  tag: dev

service:
  type: ClusterIP
```

Production configuration:

```yaml
replicaCount: 20

image:
  tag: "2.5.1"

service:
  type: LoadBalancer
```

The Helm templates remain exactly the same.

Only the configuration changes.

---

# ✅ Best Practices

- Keep templates generic and reusable.
- Store configurable settings in `values.yaml`.
- Use dedicated values files for each environment.
- Avoid large `--set` commands in production.
- Use meaningful filenames such as:
  - `values-dev.yaml`
  - `values-stage.yaml`
  - `values-prod.yaml`

---

# 🧪 Hands-on Lab

Create the following configuration files.

### `values-dev.yaml`

```yaml
replicaCount: 1

image:
  tag: dev
```

---

### `values-stage.yaml`

```yaml
replicaCount: 3

image:
  tag: stage
```

---

### `values-prod.yaml`

```yaml
replicaCount: 6

image:
  tag: "1.28"

service:
  type: LoadBalancer
```

Compare the rendered output.

### Default Configuration

```bash
helm template demo .
```

---

### Development Configuration

```bash
helm template demo . \
  -f values-dev.yaml
```

---

### Production Configuration

```bash
helm template demo . \
  -f values-prod.yaml
```

Test value precedence:

```bash
helm template demo . \
  -f values-prod.yaml \
  --set replicaCount=12
```

Verify the rendered Deployment contains:

```yaml
replicas: 12
```

because `--set` has the highest priority.

---

# 🎯 Interview Questions

### 1. What is the purpose of `values.yaml`?

> It stores the default configuration values that Helm templates use during rendering.

---

### 2. How can you override values without editing `values.yaml`?

Using:

```bash
--set
```

or

```bash
-f custom-values.yaml
```

---

### 3. What is the value precedence order in Helm?

From **lowest** to **highest** priority:

1. `values.yaml`
2. Values files specified with `-f` (processed left to right; later files override earlier ones)
3. `--set`

---

### 4. Why use separate values files?

> Separate values files allow the same Helm Chart to be deployed across multiple environments with different configurations.

---

### 5. Should production deployments rely heavily on `--set`?

> Generally, no. Production deployments are easier to review, version-control, and reproduce when using dedicated values files. `--set` is best suited for quick overrides, testing, and automation.

---

# 📌 Key Takeaways

- `values.yaml` stores the default configuration for a Helm Chart.
- Templates remain unchanged while configuration varies by environment.
- `--set` provides quick command-line overrides.
- The `-f` option allows environment-specific configuration files.
- Multiple values files can be merged, with later files overriding earlier ones.
- `--set` always has the highest precedence.
- Production deployments should use dedicated values files for maintainability and version control.