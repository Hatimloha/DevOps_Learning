Lesson 3 — Creating Your First Custom Helm Chart

In the previous lesson, you learned the structure of a Helm chart. Today, you'll build and customize a Helm chart, understand how templating works, and deploy it to Kubernetes.

Learning Objectives

By the end of this lesson, you will be able to:

Create a Helm chart from scratch
Understand how templates use values
Customize a Deployment and Service
Validate and preview a chart
Deploy and remove a Helm release
What Happens When You Run helm create?
helm create my-app

Helm generates a starter chart.

my-app/
├── Chart.yaml
├── values.yaml
├── templates/
├── charts/
└── .helmignore

This chart is fully deployable, but it contains many resources you may not need initially.

For learning, we'll simplify it.

Step 1 — Create the Chart
helm create my-app

Move into the project:

cd my-app
Step 2 — Clean Up the Starter Chart

Delete unnecessary files for now:

rm templates/hpa.yaml
rm templates/ingress.yaml
rm templates/serviceaccount.yaml
rm -rf templates/tests
rm templates/NOTES.txt

Now your structure becomes:

my-app/
├── Chart.yaml
├── values.yaml
└── templates/
    ├── deployment.yaml
    ├── service.yaml
    └── _helpers.tpl

This is much easier to understand.

Step 3 — Update Chart.yaml

Example:

apiVersion: v2
name: my-app
description: Learning Helm from scratch
type: application

version: 0.1.0
appVersion: "1.0.0"

Nothing special yet—this just describes your chart.

Step 4 — Understand values.yaml

Open it.

You'll see many settings. Focus on these:

replicaCount: 2

image:
  repository: nginx
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

These are the default values used by the templates.

Step 5 — How Templates Read Values

Open:

templates/deployment.yaml

You'll find something like:

replicas: {{ .Values.replicaCount }}

Helm reads:

replicaCount: 2

and renders:

replicas: 2

The same happens for the image:

Template:

image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"

Values:

image:
  repository: nginx
  tag: latest

Rendered result:

image: nginx:latest

This is the foundation of Helm templating.

Step 6 — Change the Replica Count

Update:

replicaCount: 3

Don't install anything yet.

Preview the output:

helm template demo .

Find:

replicas: 3

No Kubernetes cluster changes have been made.

Step 7 — Change the Image

Modify:

image:
  repository: httpd
  tag: "2.4"

Preview again:

helm template demo .

You'll now see:

image: httpd:2.4

Helm simply substitutes values into templates.

Step 8 — Customize the Service

Edit:

service:
  type: NodePort
  port: 8080

Run:

helm template demo .

The rendered Service will now include:

type: NodePort

and

port: 8080

Again, only the rendered output changes.

Step 9 — Validate the Chart

Before installing, always run:

helm lint .

Example output:

==> Linting .
1 chart(s) linted, 0 chart(s) failed

helm lint checks for:

YAML syntax errors
Missing values
Invalid templates
Common chart issues
Step 10 — Preview Before Deploying

One of Helm's best features:

helm template demo .

This renders the Kubernetes manifests locally.

Benefits:

No cluster required
Safe testing
Easy debugging
Great for CI pipelines
Step 11 — Install the Chart

If your Kubernetes cluster is running:

helm install demo .

Output:

NAME: demo
STATUS: deployed
REVISION: 1
Step 12 — Verify the Deployment

List releases:

helm list

Check status:

helm status demo

Check Kubernetes resources:

kubectl get all

You should see:

Deployment
ReplicaSet
Pods
Service
Step 13 — Uninstall

Remove everything created by the release:

helm uninstall demo

Verify:

helm list

The release is gone, and Helm removes the associated Kubernetes resources.

Understanding the Rendering Flow
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

Remember:

helm template = generate YAML only
helm install = generate YAML + apply it
Common Helm Commands
Command	Purpose
helm create my-app	Create a new chart
helm lint .	Validate the chart
helm template demo .	Render manifests locally
helm install demo .	Install the chart
helm list	List releases
helm status demo	Show release details
helm uninstall demo	Remove the release
Best Practices
Always run helm lint before deployment.
Use helm template to inspect rendered manifests.
Store configurable values in values.yaml, not directly in templates.
Keep templates reusable and avoid hardcoding.
Use meaningful release names (e.g., frontend-dev, backend-prod).
Mini Challenge

Create a chart named web-app with the following requirements:

Chart description: Helm chart for web application
replicaCount: 4

Image:

repository: nginx
tag: "1.27"

Service:

type: NodePort
port: 80

Then:

helm lint web-app
helm template web-demo ./web-app

Verify that:

replicas: 4
image: nginx:1.27
type: NodePort

appear in the rendered output.

Interview Questions
What does helm create generate?
What is the difference between helm template and helm install?
Why should you run helm lint?
How are values from values.yaml used in templates?
What happens when you run helm uninstall?
Why is previewing manifests before deployment considered a best practice?