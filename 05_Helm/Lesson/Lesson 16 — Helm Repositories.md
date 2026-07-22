Lesson 16 — Helm Repositories

Until now, you’ve been working with Helm charts locally and packaging them into .tgz files.

In real DevOps workflows, charts are shared, stored, and installed from remote repositories, just like Docker images from Docker Hub.

This lesson explains how Helm repositories work and how to use them in real environments.

Learning Objectives

By the end of this lesson, you'll understand:

What a Helm repository is
How index.yaml works
helm repo add
helm repo list
helm repo update
helm search repo
Installing charts from repositories
Hosting your own Helm repository (conceptually)
What is a Helm Repository?

A Helm repository is a location that stores packaged Helm charts (.tgz files) along with an index file.

Think of it like:

Docker Hub → Docker Images
Helm Repo → Helm Charts
Repository Structure

A Helm repository is just a web server with files:

index.yaml
ecommerce-0.1.0.tgz
redis-20.0.0.tgz
postgresql-15.0.0.tgz
What is index.yaml?

This is the most important file in a Helm repo.

It contains:

Chart names
Versions
Download URLs
Metadata

Example:

apiVersion: v1
entries:
  ecommerce:
    - version: 0.1.0
      urls:
        - https://example.com/charts/ecommerce-0.1.0.tgz

Helm uses this file to find charts.

Add a Helm Repository

Example: Bitnami repo

helm repo add bitnami https://charts.bitnami.com/bitnami

What happens:

Helm stores repo URL locally

↓

Downloads index.yaml

↓

Caches it
List Repositories
helm repo list

Example output:

NAME      URL
bitnami   https://charts.bitnami.com/bitnami
Update Repositories
helm repo update

This command:

Refreshes index.yaml
Gets latest chart versions
Updates local cache
Search for Charts
helm search repo nginx

Example output:

NAME                  CHART VERSION   APP VERSION
bitnami/nginx        15.0.0          1.25.0
Install from Repository

Instead of local charts:

helm install my-nginx bitnami/nginx

Flow:

Helm Repo → Find Chart → Download → Install
Install Specific Version
helm install my-nginx bitnami/nginx \
    --version 15.0.0

Useful for stability in production.

Upgrade from Repository
helm upgrade my-nginx bitnami/nginx

Helm pulls latest chart version from repo cache.

How Helm Uses Cache

After adding a repo:

~/.cache/helm/repository/

Contains:

index files
downloaded metadata

This improves performance.

Remove a Repository
helm repo remove bitnami
Updating Single Repo

Instead of updating all:

helm repo update bitnami
Installing Your Own Chart Repository (Concept)

You can host your own repo using:

Option 1 — Simple HTTP server
Nginx / Apache / S3

Upload:

index.yaml
*.tgz charts
Option 2 — GitHub Pages

Structure:

docs/
  index.yaml
  ecommerce-0.1.0.tgz
Option 3 — Cloud Storage (Best Practice)
AWS S3
GCS (Google Cloud Storage)
Azure Blob Storage
Creating Your Own Repo (Workflow)

Step 1: Package chart

helm package ecommerce

Step 2: Generate index file

helm repo index .

This creates:

index.yaml

Step 3: Upload to server

upload index.yaml + .tgz files

Step 4: Add repo

helm repo add myrepo https://my-server/charts

Step 5: Install

helm install ecommerce myrepo/ecommerce
Real-World Example

Enterprise architecture:

Dev Team → Helm Chart Repo → CI/CD Pipeline → Kubernetes Cluster

Flow:

Developer updates chart
CI builds .tgz
Uploads to repo
Teams install from repo
Versioning in Repos

Repo can store multiple versions:

ecommerce-0.1.0
ecommerce-0.2.0
ecommerce-1.0.0

Install specific version:

helm install app myrepo/ecommerce --version 1.0.0
Helm Repo vs Local Chart
Feature	Local Chart	Helm Repo
Sharing	❌ Manual	✅ Easy
Versioning	Limited	Strong
CI/CD	Hard	Easy
Production use	❌	✅
Common Mistakes
❌ Not Running helm repo update

You may install outdated charts.

Fix:

helm repo update
❌ Forgetting Version Pinning

Bad:

helm install app bitnami/nginx

Good:

helm install app bitnami/nginx --version 15.0.0
❌ Using Untrusted Repositories

Only use trusted sources or internal company repos.

❌ Not Managing Cache

Old cached indexes may cause confusion.

Fix:

helm repo update
Hands-on Lab
Step 1: Add repo
helm repo add bitnami https://charts.bitnami.com/bitnami
Step 2: Update repo
helm repo update
Step 3: Search chart
helm search repo nginx
Step 4: Install chart
helm install my-nginx bitnami/nginx
Step 5: Verify
helm list
Summary
Command	Purpose
helm repo add	Add repository
helm repo list	Show repos
helm repo update	Refresh repo data
helm search repo	Search charts
helm install <repo/chart>	Install from repo
helm repo remove	Delete repo
Interview Questions
1. What is a Helm repository?

A storage location that hosts packaged Helm charts along with an index.yaml file.

2. What is index.yaml used for?

It contains metadata and download URLs for charts in a repository.

3. How do you add a Helm repository?
helm repo add <name> <url>
4. Why run helm repo update?

To refresh cached chart metadata from remote repositories.

5. Can you install specific chart versions from a repo?

Yes, using:

--version <chart-version>
6. Where is Helm repo data stored locally?

In Helm’s local cache directory (~/.cache/helm/repository).