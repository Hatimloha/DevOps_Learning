Lesson 17 — OCI Registry Support

Starting with Helm 3.8+, Helm has first-class support for OCI (Open Container Initiative) registries.

This means you can store Helm charts in the same type of registry used for Docker images.

Instead of hosting:

index.yaml
chart.tgz

you can push your charts to:

Docker Hub
GitHub Container Registry (GHCR)
Amazon ECR
Google Artifact Registry
Azure Container Registry

This is becoming the preferred approach in many organizations.

Learning Objectives

By the end of this lesson, you'll understand:

What OCI is
Helm OCI workflow
helm registry login
helm push
helm pull
helm install
OCI vs Helm Repository
Enterprise best practices
What is OCI?

OCI stands for:

Open Container Initiative

It defines standards for storing and distributing artifacts.

Originally:

Docker Image

↓

OCI Registry

Now Helm also uses OCI registries.

Traditional Helm Repository
Developer

↓

helm package

↓

index.yaml

↓

HTTP Server

↓

helm repo add

↓

helm install
OCI Workflow
Developer

↓

helm package

↓

OCI Registry

↓

helm pull

↓

helm install

No index.yaml is required.

Supported Registries
Registry	Supports OCI
Docker Hub	✅
GitHub Container Registry	✅
Amazon ECR	✅
Google Artifact Registry	✅
Azure Container Registry	✅
OCI URL Format

OCI charts use:

oci://registry/repository/chart

Example:

oci://ghcr.io/company/charts/ecommerce
Login to Registry

Example:

helm registry login ghcr.io

Helm prompts for:

Username
Password or access token

For Docker Hub:

helm registry login registry-1.docker.io
Package the Chart

Before pushing:

helm package .

Output:

ecommerce-0.1.0.tgz
Push Chart

Example:

helm push ecommerce-0.1.0.tgz \
    oci://ghcr.io/company/charts

Flow:

Package

↓

Push

↓

Stored in Registry
Pull Chart

Download:

helm pull \
    oci://ghcr.io/company/charts/ecommerce

Result:

ecommerce-0.1.0.tgz
Install Directly

Instead of pulling first:

helm install ecommerce \
    oci://ghcr.io/company/charts/ecommerce

Helm downloads and installs automatically.

Install Specific Version
helm install ecommerce \
    oci://ghcr.io/company/charts/ecommerce \
    --version 1.2.0
Upgrade
helm upgrade ecommerce \
    oci://ghcr.io/company/charts/ecommerce
OCI Registry Layout

Example:

ghcr.io/

└── company/

      └── charts/

            ├── ecommerce

            ├── backend

            ├── frontend

            └── monitoring
OCI vs Helm Repository
Feature	Helm Repo	OCI Registry
index.yaml	✅ Required	❌ Not required
HTTP Hosting	✅	❌
Docker Registry	❌	✅
Authentication	Basic	Registry authentication
Modern Standard	Older	Recommended
Why OCI?

Benefits:

Uses existing container registries
Better authentication
No repository index to maintain
Works well with CI/CD
Easier permission management
One registry for images and charts
CI/CD Example

Pipeline:

Developer

↓

Git Push

↓

CI Pipeline

↓

helm lint

↓

helm package

↓

helm push

↓

OCI Registry

↓

Production Deployment
Docker Images + Helm Charts

Example:

Docker Hub

├── backend:2.0

├── frontend:2.0

└── ecommerce-chart:1.3.0

Everything lives in one registry.

Version Management

Registry:

ecommerce

├── 1.0.0

├── 1.1.0

├── 1.2.0

Install:

helm install app \
    oci://registry/charts/ecommerce \
    --version 1.1.0
Authentication

Public registries:

Read

↓

Anonymous (sometimes allowed)

Private registries:

Login

↓

Token

↓

Push/Pull
Best Practices
Package Before Push
helm lint .

helm package .

helm push ...
Keep Chart and App Versions Clear

Example:

version: 1.2.0

appVersion: "2.5.1"

Don't confuse chart version with application version.

Use Private Registries

For company applications:

GHCR
ECR
ACR
GAR

instead of public repositories.

Version Every Release

Avoid overwriting existing chart versions.

Publish a new version for every release.

Use OCI in CI/CD

A typical pipeline:

Build

↓

Test

↓

helm package

↓

helm push

↓

Deploy
Common Mistakes
❌ Forgetting to Login

Wrong:

helm push ...

Result:

Unauthorized

Fix:

helm registry login
❌ Pushing Without Packaging

Wrong:

helm push .

Correct:

helm package .

helm push chart.tgz ...
❌ Reusing Chart Versions

Don't publish different chart contents with the same chart version.

Always increment the chart version before pushing.

❌ Confusing OCI URLs

Wrong:

https://ghcr.io/company/charts

Correct:

oci://ghcr.io/company/charts
Hands-on Lab

This lab assumes you have access to an OCI-compatible registry such as Docker Hub, GHCR, or another supported registry.

Step 1: Package chart
helm lint .

helm package .
Step 2: Login

Example:

helm registry login ghcr.io
Step 3: Push
helm push ecommerce-0.1.0.tgz \
    oci://ghcr.io/<username>/charts
Step 4: Pull
helm pull \
    oci://ghcr.io/<username>/charts/ecommerce
Step 5: Install
helm install ecommerce \
    oci://ghcr.io/<username>/charts/ecommerce
Summary
Command	Purpose
helm registry login	Authenticate with an OCI registry
helm package	Package a chart
helm push	Push a chart to an OCI registry
helm pull	Download a chart from an OCI registry
helm install oci://...	Install directly from an OCI registry
Interview Questions
1. What is OCI?

OCI (Open Container Initiative) is a standard for storing and distributing container-related artifacts, including Helm charts.

2. What is the main advantage of OCI over traditional Helm repositories?

OCI stores charts in container registries and does not require an index.yaml file.

3. Which command logs in to an OCI registry?
helm registry login <registry>
4. Can Helm charts and Docker images share the same registry?

Yes. OCI registries can store both.

5. What URL scheme is used for OCI charts?
oci://
6. Do you need to package a chart before pushing it to an OCI registry?

Yes. helm push uploads a packaged chart (.tgz).