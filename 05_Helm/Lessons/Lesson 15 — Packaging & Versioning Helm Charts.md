# 🚀 Helm Tutorial — Lesson 15: Packaging & Versioning Helm Charts

> Learn how to package Helm Charts into distributable artifacts, manage chart and application versions using Semantic Versioning (SemVer), and prepare charts for production repositories and CI/CD pipelines.

---

# 📚 Table of Contents

- [Learning Objectives](#-learning-objectives)
- [What is a Packaged Chart?](#-what-is-a-packaged-chart)
- [Why Package Helm Charts?](#-why-package-helm-charts)
- [Understanding `Chart.yaml`](#-understanding-chartyaml)
- [Chart Version vs Application Version](#-chart-version-vs-application-version)
- [Semantic Versioning (SemVer)](#-semantic-versioning-semver)
- [Packaging a Helm Chart](#-packaging-a-helm-chart)
- [Packaging to a Different Directory](#-packaging-to-a-different-directory)
- [Inspecting Packaged Charts](#-inspecting-packaged-charts)
- [Updating Chart Versions](#-updating-chart-versions)
- [Packaging Workflow](#-packaging-workflow)
- [Enterprise Versioning Example](#-enterprise-versioning-example)
- [Best Practices](#-best-practices)
- [Common Mistakes](#-common-mistakes)
- [Hands-on Lab](#-hands-on-lab)
- [Summary](#-summary)
- [Interview Questions](#-interview-questions)
- [Key Takeaways](#-key-takeaways)

---

# 🎯 Learning Objectives

By the end of this lesson, you will be able to:

- ✅ Understand what a packaged Helm Chart is
- ✅ Package Helm Charts using `helm package`
- ✅ Understand the purpose of `Chart.yaml`
- ✅ Differentiate between `version` and `appVersion`
- ✅ Apply Semantic Versioning (SemVer)
- ✅ Follow the Helm packaging workflow
- ✅ Update chart versions correctly
- ✅ Follow production-ready packaging best practices

---

# 📦 What is a Packaged Chart?

Suppose your Helm Chart looks like this:

```text
ecommerce/

├── Chart.yaml
├── values.yaml
├── templates/
└── charts/
```

This is the **source chart**.

Package it:

```bash
helm package ecommerce
```

Output:

```text
Successfully packaged chart and saved it to:

ecommerce-0.1.0.tgz
```

Instead of a directory, you now have a compressed archive:

```text
ecommerce-0.1.0.tgz
```

A `.tgz` file contains the complete Helm Chart, including templates, metadata, values, and dependencies.

---

# 🚀 Why Package Helm Charts?

Without packaging:

```text
Developer
     │
     ▼
Copy Chart Folder
     │
     ▼
Deploy
```

With packaging:

```text
Developer
     │
     ▼
Package Chart
     │
     ▼
Upload to Repository
     │
     ▼
Install Anywhere
```

### Benefits

- Versioned
- Portable
- Easy to distribute
- Easy to store
- Immutable release artifact

---

# 📄 Understanding `Chart.yaml`

Every Helm Chart contains a `Chart.yaml` file.

Example:

```yaml
apiVersion: v2

name: ecommerce

description: E-Commerce Application

type: application

version: 0.1.0

appVersion: "1.0.0"
```

The two most important fields are:

- `version`
- `appVersion`

---

# 🔢 Chart Version vs Application Version

## `version`

Represents the **Helm Chart version**.

Example:

```yaml
version: 0.1.0
```

Increment this value whenever the chart itself changes.

Examples:

- New template
- Updated helper template
- Added ConfigMap
- Improved labels
- Modified chart logic

The application code may remain exactly the same.

---

## `appVersion`

Represents the version of the deployed application.

Example:

```yaml
appVersion: "2.5.0"
```

This typically corresponds to your container image.

```text
Docker Image
      │
      ▼
my-app:2.5.0
```

---

## Difference

| Field | Represents |
|--------|------------|
| `version` | Helm Chart version |
| `appVersion` | Application version |

Example:

```yaml
version: 1.2.0

appVersion: "2.6.3"
```

Meaning:

- Chart version is **1.2.0**
- Application version is **2.6.3**

---

# 🔖 Semantic Versioning (SemVer)

Helm follows **Semantic Versioning (SemVer)**.

Format:

```text
MAJOR.MINOR.PATCH
```

Example:

```text
1.4.7
```

Breakdown:

- Major = **1**
- Minor = **4**
- Patch = **7**

---

## Major Version

Increase the **Major** version for breaking changes.

Example:

```text
1.2.0
   │
   ▼
2.0.0
```

Examples:

- Removing values
- Redesigning templates
- Breaking backward compatibility
- Significant chart restructuring

---

## Minor Version

Increase the **Minor** version for new features.

Example:

```text
1.2.0
   │
   ▼
1.3.0
```

Examples:

- New ConfigMap
- Optional Ingress
- Additional Service
- New templates
- Feature enhancements

---

## Patch Version

Increase the **Patch** version for fixes.

Example:

```text
1.2.5
   │
   ▼
1.2.6
```

Examples:

- Fixed labels
- Corrected indentation
- Updated helper templates
- Documentation updates that affect chart behavior

---

# 📦 Packaging a Helm Chart

Package the current chart:

```bash
helm package .
```

or

```bash
helm package ecommerce
```

Output:

```text
Successfully packaged chart

ecommerce-0.1.0.tgz
```

---

# 📁 Packaging to a Different Directory

Specify the output location:

```bash
helm package ecommerce \
    --destination ./packages
```

Result:

```text
packages/

└── ecommerce-0.1.0.tgz
```

This is commonly used in CI/CD pipelines.

---

# 🔍 Inspecting Packaged Charts

List generated files:

```bash
ls
```

Example:

```text
Chart.yaml

values.yaml

templates/

ecommerce-0.1.0.tgz
```

---

## View Chart Metadata

```bash
helm show chart ecommerce-0.1.0.tgz
```

Example:

```text
name: ecommerce

version: 0.1.0

appVersion: 1.0.0
```

---

## View Default Values

```bash
helm show values ecommerce-0.1.0.tgz
```

Displays the packaged `values.yaml`.

---

## View README

```bash
helm show readme ecommerce-0.1.0.tgz
```

Displays the packaged documentation if a `README.md` file exists.

---

## View Everything

```bash
helm show all ecommerce-0.1.0.tgz
```

Displays:

- Metadata
- Values
- README
- Templates (where applicable)

---

# 🔄 Updating Chart Versions

Suppose your chart currently contains:

```yaml
version: 0.1.0

appVersion: "1.0.0"
```

---

## Scenario 1 — Application Update Only

The application changes from **1.0.0** to **1.1.0**, but the Helm Chart remains unchanged.

Update:

```yaml
version: 0.1.0

appVersion: "1.1.0"
```

Only the application version changes.

---

## Scenario 2 — Chart Update

You add an Ingress template.

Update:

```yaml
version: 0.2.0

appVersion: "1.1.0"
```

The chart version increases because the chart structure changed.

---

# 🔄 Packaging Workflow

A typical production workflow:

```text
Modify Chart
     │
     ▼
Update Version
     │
     ▼
helm lint
     │
     ▼
helm package
     │
     ▼
Upload to Repository
     │
     ▼
helm install
```

---

# 🏢 Enterprise Versioning Example

| Chart Version | App Version | Reason |
|---------------|-------------|--------|
| 1.0.0 | 2.0.0 | Initial release |
| 1.0.1 | 2.0.0 | Chart bug fix |
| 1.1.0 | 2.0.0 | Added Ingress support |
| 1.1.1 | 2.0.0 | Fixed chart templates |
| 1.2.0 | 2.1.0 | New application release and chart updates |

---

# ✅ Best Practices

## Lint Before Packaging

Always validate the chart first:

```bash
helm lint .
```

Only package charts after lint succeeds.

---

## Follow Semantic Versioning

Use:

- Major → Breaking changes
- Minor → New features
- Patch → Bug fixes

---

## Update the Correct Version Field

- Update `version` when the chart changes.
- Update `appVersion` when the application changes.

---

## Store Packaged Charts as Release Artifacts

Use packaged charts in:

- Helm repositories
- OCI registries
- Artifact repositories
- CI/CD pipelines

---

## Never Modify Packaged Archives

Always edit the source chart and generate a new package.

Treat `.tgz` files as immutable release artifacts.

---

# ❌ Common Mistakes

## Forgetting to Update `version`

Example:

Chart templates change, but:

```yaml
version: 0.1.0
```

remains unchanged.

Users cannot distinguish between old and new chart releases.

---

## Confusing `version` and `appVersion`

Incorrect:

```yaml
version: 2.6.0
```

because only the Docker image changed.

Correct:

```yaml
version: 0.2.0

appVersion: "2.6.0"
```

---

## Packaging Without Linting

Avoid:

```bash
helm package .
```

Instead:

```bash
helm lint .

helm package .
```

---

## Editing Packaged Files

Never modify:

```text
ecommerce-0.1.0.tgz
```

Update the source chart and create a new package.

---

# 🧪 Hands-on Lab

Check `Chart.yaml`:

```yaml
version: 0.1.0

appVersion: "1.0.0"
```

Lint the chart:

```bash
helm lint .
```

Package the chart:

```bash
helm package .
```

Inspect the package:

```bash
helm show chart ecommerce-0.1.0.tgz
```

Update the versions:

```yaml
version: 0.2.0

appVersion: "1.1.0"
```

Package again:

```bash
helm package .
```

Notice the new archive:

```text
ecommerce-0.2.0.tgz
```

---

# 📋 Summary

| Command | Purpose |
|----------|---------|
| `helm package` | Create a packaged chart (`.tgz`) |
| `helm lint` | Validate a Helm Chart |
| `helm show chart` | Display chart metadata |
| `helm show values` | Display packaged values |
| `helm show readme` | Display packaged README |
| `helm show all` | Display all packaged chart information |

---

# 🎤 Interview Questions

### 1. What does `helm package` do?

> It packages a Helm Chart into a compressed `.tgz` archive that can be distributed and installed from repositories or registries.

---

### 2. What is the difference between `version` and `appVersion`?

- `version` is the Helm Chart version.
- `appVersion` is the version of the application that the chart deploys.

---

### 3. Why should you run `helm lint` before packaging?

> To detect template errors and validate the chart before creating a production-ready release artifact.

---

### 4. Which file contains Helm Chart metadata?

> `Chart.yaml`

---

### 5. What versioning standard does Helm follow?

> Semantic Versioning (SemVer): **MAJOR.MINOR.PATCH**

---

### 6. Can two chart packages have the same version but different contents?

> Technically yes, but it is considered a bad practice. Every chart modification should be accompanied by an appropriate chart version increment to maintain consistency and traceability.

---

# 📌 Key Takeaways

- Packaged Helm Charts are compressed `.tgz` archives used for distribution and deployment.
- `Chart.yaml` defines the chart's metadata, including `version` and `appVersion`.
- `version` tracks changes to the Helm Chart, while `appVersion` tracks the deployed application version.
- Helm follows Semantic Versioning (SemVer) for chart versions.
- Always validate charts with `helm lint` before packaging.
- Use `helm show` commands to inspect packaged charts without extracting them.
- Treat packaged charts as immutable release artifacts and generate a new package for every chart update.