# 🚀 Helm Tutorial — Lesson 3: Creating Your First Custom Helm Chart

> Learn how to create, customize, validate, preview, and deploy your first Helm Chart from scratch.

---

# 📚 Table of Contents

- [Learning Objectives](#-learning-objectives)
- [What Happens When You Run `helm create`?](#-what-happens-when-you-run-helm-create)
- [Step 1 — Create the Chart](#step-1--create-the-chart)
- [Step 2 — Clean Up the Starter Chart](#step-2--clean-up-the-starter-chart)
- [Step 3 — Update `Chart.yaml`](#step-3--update-chartyaml)
- [Step 4 — Understand `values.yaml`](#step-4--understand-valuesyaml)
- [Step 5 — How Templates Read Values](#step-5--how-templates-read-values)
- [Step 6 — Change the Replica Count](#step-6--change-the-replica-count)
- [Step 7 — Change the Image](#step-7--change-the-image)
- [Step 8 — Customize the Service](#step-8--customize-the-service)
- [Step 9 — Validate the Chart](#step-9--validate-the-chart)
- [Step 10 — Preview Before Deploying](#step-10--preview-before-deploying)
- [Step 11 — Install the Chart](#step-11--install-the-chart)
- [Step 12 — Verify the Deployment](#step-12--verify-the-deployment)
- [Step 13 — Uninstall the Release](#step-13--uninstall-the-release)
- [Rendering Flow](#-rendering-flow)
- [Common Helm Commands](#-common-helm-commands)
- [Best Practices](#-best-practices)
- [Mini Challenge](#-mini-challenge)
- [Interview Questions](#-interview-questions)
- [Key Takeaways](#-key-takeaways)

---

# 🎯 Learning Objectives

By the end of this lesson, you will be able to:

- ✅ Create a Helm Chart from scratch
- ✅ Understand how templates use values
- ✅ Customize a Deployment and Service
- ✅ Validate and preview a Helm Chart
- ✅ Deploy and remove a Helm Release

---

# 📦 What Happens When You Run `helm create`?

Create a new Helm Chart:

```bash
helm create my-app
```

Helm generates a complete starter chart.

```text
my-app/
├── Chart.yaml
├── values.yaml
├── templates/
├── charts/
└── .helmignore
```

This chart is fully deployable, but it includes several resources that are not required when you're first learning Helm.

---

# Step 1 — Create the Chart

Generate a new chart:

```bash
helm create my-app
```

Move into the project directory:

```bash
cd my-app
```

---

# Step 2 — Clean Up the Starter Chart

Delete unnecessary resources to simplify the project.

```bash
rm templates/hpa.yaml
rm templates/ingress.yaml
rm templates/serviceaccount.yaml
rm -rf templates/tests
rm templates/NOTES.txt
```

Your project structure now becomes:

```text
my-app/
├── Chart.yaml
├── values.yaml
└── templates/
    ├── deployment.yaml
    ├── service.yaml
    └── _helpers.tpl
```

This minimal structure is much easier to understand and customize.

---

# Step 3 — Update `Chart.yaml`

Example configuration:

```yaml
apiVersion: v2
name: my-app
description: Learning Helm from scratch
type: application

version: 0.1.0
appVersion: "1.0.0"
```

This file simply describes your Helm Chart and its metadata.

---

# Step 4 — Understand `values.yaml`

Open the `values.yaml` file.

Focus on the following configuration:

```yaml
replicaCount: 2

image:
  repository: nginx
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80
```

These values act as the default configuration used by your templates.

---

# Step 5 — How Templates Read Values

Open:

```text
templates/deployment.yaml
```

You'll find something similar to:

```yaml
replicas: {{ .Values.replicaCount }}
```

Helm reads the value:

```yaml
replicaCount: 2
```

and renders:

```yaml
replicas: 2
```

The same process applies to the container image.

### Template

```yaml
image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
```

### Values

```yaml
image:
  repository: nginx
  tag: latest
```

### Rendered Output

```yaml
image: nginx:latest
```

This value substitution is the foundation of Helm templating.

---

# Step 6 — Change the Replica Count

Update `values.yaml`:

```yaml
replicaCount: 3
```

Preview the generated manifests:

```bash
helm template demo .
```

Verify the rendered Deployment contains:

```yaml
replicas: 3
```

> **Note:** No resources are created in Kubernetes when using `helm template`.

---

# Step 7 — Change the Image

Modify the image configuration:

```yaml
image:
  repository: httpd
  tag: "2.4"
```

Render the templates again:

```bash
helm template demo .
```

You should now see:

```yaml
image: httpd:2.4
```

Helm simply replaces template placeholders with values from `values.yaml`.

---

# Step 8 — Customize the Service

Update the Service configuration:

```yaml
service:
  type: NodePort
  port: 8080
```

Preview the chart again:

```bash
helm template demo .
```

The rendered Service should now include:

```yaml
type: NodePort
```

and

```yaml
port: 8080
```

Again, these are only local changes until the chart is installed.

---

# Step 9 — Validate the Chart

Before deploying, validate your chart.

```bash
helm lint .
```

Example output:

```text
==> Linting .
1 chart(s) linted, 0 chart(s) failed
```

`helm lint` checks for:

- YAML syntax errors
- Missing values
- Invalid templates
- Common chart issues

---

# Step 10 — Preview Before Deploying

One of Helm's most useful commands:

```bash
helm template demo .
```

This renders Kubernetes manifests locally without creating any resources.

### Benefits

- ✅ No Kubernetes cluster required
- ✅ Safe testing
- ✅ Easy debugging
- ✅ Ideal for CI/CD pipelines

---

# Step 11 — Install the Chart

If your Kubernetes cluster is running:

```bash
helm install demo .
```

Example output:

```text
NAME: demo
STATUS: deployed
REVISION: 1
```

Your application is now deployed to the Kubernetes cluster.

---

# Step 12 — Verify the Deployment

List installed releases:

```bash
helm list
```

Check release status:

```bash
helm status demo
```

Verify Kubernetes resources:

```bash
kubectl get all
```

You should see resources similar to:

- Deployment
- ReplicaSet
- Pods
- Service

---

# Step 13 — Uninstall the Release

Remove the deployed application:

```bash
helm uninstall demo
```

Verify removal:

```bash
helm list
```

The release and all Kubernetes resources created by Helm are deleted.

---

# 🔄 Rendering Flow

```text
values.yaml
      │
      ▼
Helm Templates
      │
      ▼
helm template
      │
      ▼
Generated Kubernetes YAML
      │
      ▼
helm install
      │
      ▼
Kubernetes Cluster
```

### Remember

| Command | Action |
|----------|--------|
| `helm template` | Generate Kubernetes YAML only |
| `helm install` | Generate YAML and deploy it to Kubernetes |

---

# 🛠️ Common Helm Commands

| Command | Purpose |
|----------|---------|
| `helm create my-app` | Create a new Helm Chart |
| `helm lint .` | Validate the chart |
| `helm template demo .` | Render manifests locally |
| `helm install demo .` | Install the chart |
| `helm list` | List installed releases |
| `helm status demo` | Display release details |
| `helm uninstall demo` | Remove the release |

---

# ✅ Best Practices

- Always run `helm lint` before deployment.
- Use `helm template` to inspect generated manifests.
- Store configurable values in `values.yaml` instead of hardcoding them.
- Keep templates reusable and generic.
- Use meaningful release names such as `frontend-dev` or `backend-prod`.

---

# 🧪 Mini Challenge

Create a chart named **`web-app`** with the following configuration.

### Chart Details

**Description**

```text
Helm chart for web application
```

### Replica Count

```yaml
replicaCount: 4
```

### Image

```yaml
image:
  repository: nginx
  tag: "1.27"
```

### Service

```yaml
service:
  type: NodePort
  port: 80
```

Validate the chart:

```bash
helm lint web-app
```

Preview the rendered manifests:

```bash
helm template web-demo ./web-app
```

Verify the following values appear in the output:

```yaml
replicas: 4
```

```yaml
image: nginx:1.27
```

```yaml
type: NodePort
```

---

# 🎯 Interview Questions

### 1. What does `helm create` generate?

> A fully functional Helm Chart containing chart metadata, configuration values, templates, dependency directories, and supporting files.

---

### 2. What is the difference between `helm template` and `helm install`?

| `helm template` | `helm install` |
|-----------------|----------------|
| Generates Kubernetes manifests locally | Generates and deploys manifests to Kubernetes |
| Does not require a cluster | Requires a Kubernetes cluster |
| Used for previewing and debugging | Used for deployment |

---

### 3. Why should you run `helm lint`?

> To validate chart structure, detect YAML syntax issues, identify template errors, and catch common problems before deployment.

---

### 4. How are values from `values.yaml` used in templates?

> Templates reference values using the `.Values` object. During rendering, Helm replaces placeholders with the corresponding values from `values.yaml`.

---

### 5. What happens when you run `helm uninstall`?

> Helm removes the release and deletes all Kubernetes resources that were created by that release.

---

### 6. Why is previewing manifests before deployment considered a best practice?

> Previewing manifests with `helm template` helps identify configuration issues, validate generated YAML, and safely test changes before deploying to a Kubernetes cluster.

---

# 📌 Key Takeaways

- `helm create` generates a complete starter Helm Chart.
- `values.yaml` stores configurable settings for your application.
- Templates dynamically use values during rendering.
- `helm template` previews Kubernetes manifests without deploying them.
- `helm lint` validates your chart before installation.
- `helm install` deploys the application to Kubernetes.
- `helm uninstall` removes the release and all associated resources.
- Previewing and validating charts before deployment helps prevent production issues.