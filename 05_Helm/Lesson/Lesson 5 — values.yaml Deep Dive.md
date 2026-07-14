Lesson 5 — values.yaml Deep Dive

This is one of the most important Helm lessons.

In real companies, you rarely modify templates when deploying to different environments. Instead, you keep the templates the same and only change the values.

One Chart → Multiple Environments

Learning Objectives

By the end of this lesson, you'll understand:

What values.yaml is
How Helm loads values
How to override values
--set
-f / --values
Multiple values files
Value precedence
Production best practices
Why values.yaml Exists

Suppose your deployment looks like this:

replicas: 2
image: nginx:1.27
service:
  type: ClusterIP

Now Production needs:

replicas: 10
image: nginx:1.28
service:
  type: LoadBalancer

Without Helm:

You edit the Deployment YAML.

Again.

And again.

For every environment.

That's error-prone.

Helm's Solution

Keep the template generic.

Template:

spec:
  replicas: {{ .Values.replicaCount }}

Development:

replicaCount: 2

Production:

replicaCount: 10

Same template.

Different values.

Default values.yaml

Example:

replicaCount: 2

image:
  repository: nginx
  tag: latest

service:
  type: ClusterIP
  port: 80

Template:

replicas: {{ .Values.replicaCount }}

image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"

Output:

replicas: 2

image: nginx:latest
Override Using --set

Instead of editing values.yaml:

helm template demo . \
  --set replicaCount=5

Output:

replicas: 5

Nothing inside values.yaml changes.

Override nested values:

helm template demo . \
  --set image.tag=1.28

Output:

image: nginx:1.28

Multiple values:

helm template demo . \
  --set replicaCount=4,image.tag=1.29

Result:

replicas: 4

image: nginx:1.29
Why --set Exists

Useful for:

Quick testing
CI/CD pipelines
One-time deployments
Automation scripts

Not ideal for large configurations.

Using Another Values File

Create:

values-dev.yaml
replicaCount: 1

image:
  tag: dev

Create:

values-prod.yaml
replicaCount: 8

image:
  tag: "1.28"

service:
  type: LoadBalancer

Render Development:

helm template demo . -f values-dev.yaml

Render Production:

helm template demo . -f values-prod.yaml

No template changes required.

Multiple Values Files

Helm allows multiple files.

Example:

helm template demo . \
  -f values.yaml \
  -f values-prod.yaml

The second file overrides the first.

Example:

Default:

replicaCount: 2

image:
  tag: latest

Production:

replicaCount: 8

Final output:

replicas: 8

image: nginx:latest

Only overridden fields change.

Value Precedence

This is frequently asked in interviews.

Suppose:

values.yaml

replicaCount: 2

values-prod.yaml

replicaCount: 5

Command:

helm template demo . \
  -f values-prod.yaml \
  --set replicaCount=10

Final result:

replicas: 10

Because Helm follows this order:

Lowest Priority
        │
        ▼
values.yaml
        │
        ▼
-f values-prod.yaml
        │
        ▼
--set
Highest Priority
Nested Values

Example:

database:
  host: mysql
  port: 3306

Template:

host: {{ .Values.database.host }}

port: {{ .Values.database.port }}

Override:

helm template demo . \
  --set database.host=postgres

Output:

host: postgres
Lists

Example:

ports:
  - 80
  - 443

Access:

{{ index .Values.ports 0 }}

{{ index .Values.ports 1 }}

Output:

80

443

We'll learn loops in the next lesson, which make working with lists much easier.

Maps

Example:

labels:
  app: nginx
  env: production

Access:

{{ .Values.labels.app }}

{{ .Values.labels.env }}

Output:

nginx

production
Environment Structure

A common production setup:

my-chart/

├── values.yaml
├── values-dev.yaml
├── values-stage.yaml
├── values-prod.yaml

Deploy:

Development:

helm install app-dev . \
  -f values-dev.yaml

Staging:

helm install app-stage . \
  -f values-stage.yaml

Production:

helm install app-prod . \
  -f values-prod.yaml

Same chart.

Different configuration.

Real Company Example

Suppose your application has:

Development:

replicas: 1

image:
  tag: dev

service:
  type: ClusterIP

Production:

replicas: 20

image:
  tag: "2.5.1"

service:
  type: LoadBalancer

Templates remain unchanged.

Only the values file changes.

Best Practices

✅ Keep templates generic.

✅ Put all configurable values in values.yaml.

✅ Use separate values files for each environment.

✅ Avoid large --set commands for production.

✅ Use meaningful names:

values-dev.yaml
values-stage.yaml
values-prod.yaml
Hands-on Lab

Create three files:

values-dev.yaml

replicaCount: 1

image:
  tag: dev

values-stage.yaml

replicaCount: 3

image:
  tag: stage

values-prod.yaml

replicaCount: 6

image:
  tag: "1.28"

service:
  type: LoadBalancer

Now compare:

Default:

helm template demo .

Development:

helm template demo . \
  -f values-dev.yaml

Production:

helm template demo . \
  -f values-prod.yaml

Finally test precedence:

helm template demo . \
  -f values-prod.yaml \
  --set replicaCount=12

Observe that the rendered Deployment uses:

replicas: 12

because --set has the highest priority.

Common Interview Questions
1. What is the purpose of values.yaml?

It stores the default configuration values used by Helm templates.

2. How do you override values without editing values.yaml?

Using:

--set

or

-f custom-values.yaml
3. What is the precedence order in Helm?

From lowest to highest:

values.yaml
Files specified with -f (processed left to right; later files override earlier ones)
--set
4. Why use separate values files?

To deploy the same chart to different environments with different configurations.

5. Should production deployments rely heavily on --set?

Generally no. Production deployments are easier to review, version-control, and reproduce when using dedicated values files. --set is great for quick overrides and automation.