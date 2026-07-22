Lesson 12 — Rollbacks & Release History

This lesson is one of the most important production skills in Helm.

No matter how carefully you deploy, failures happen:

A bad image
A configuration mistake
An application bug
A failed database migration

Helm allows you to quickly return to a previously working version.

Learning Objectives

By the end of this lesson, you'll understand:

Release revisions
helm history
helm status
helm rollback
Rollback options
Viewing release manifests
Viewing release values
Production rollback strategy
What is a Revision?

Every successful install or upgrade creates a new revision.

Example:

Revision 1
│
├── Image: nginx:1.27
│
▼
Revision 2
│
├── Image: nginx:1.28
│
▼
Revision 3
│
├── Replica Count: 5
│
▼
Revision 4
│
├── ConfigMap Updated

Helm keeps track of each revision.

Check Installed Releases
helm list

Example:

NAME         NAMESPACE   REVISION   STATUS     CHART
ecommerce    default     4          deployed   ecommerce-0.1.0

Current revision:

4
View Release History
helm history ecommerce

Example:

REVISION   UPDATED                  STATUS      CHART
1          2026-07-01 09:30         deployed    ecommerce-0.1.0
2          2026-07-01 10:00         superseded  ecommerce-0.1.0
3          2026-07-01 11:00         superseded  ecommerce-0.1.0
4          2026-07-01 12:00         deployed    ecommerce-0.1.0
Status Meanings
Status	Meaning
deployed	Current active revision
superseded	Replaced by a newer revision
failed	Upgrade or install failed
pending-install	Installation in progress
pending-upgrade	Upgrade in progress
pending-rollback	Rollback in progress
uninstalled	Release removed
View Release Status
helm status ecommerce

Example:

NAME: ecommerce
STATUS: deployed
REVISION: 4
NAMESPACE: default

This gives a quick summary of the current release.

View Values Used

Sometimes you forget which values were deployed.

Show user-supplied values:

helm get values ecommerce

Example:

replicaCount: 5

image:
  tag: "2.6.0"
Show All Values

Including defaults:

helm get values ecommerce --all

Useful when debugging.

View Rendered Manifests
helm get manifest ecommerce

Shows the exact YAML that Helm deployed.

Example:

apiVersion: apps/v1
kind: Deployment
...

Great for troubleshooting.

View Release Notes

If your chart includes release notes:

helm get notes ecommerce

Example:

Application URL:

http://my-app.example.com
Roll Back to a Previous Revision

Suppose:

Revision 1 → Stable

Revision 2 → Stable

Revision 3 → Broken

Current = Revision 3

Return to Revision 2:

helm rollback ecommerce 2

Helm restores:

Deployment
Service
ConfigMaps
Secrets
Any other managed resources
What Happens Internally?
Revision 1

↓

Revision 2

↓

Revision 3 (Broken)

↓

helm rollback 2

↓

Revision 4 (Same content as Revision 2)

Notice something important:

Helm doesn't go back to Revision 2.

Instead, it creates a new revision.

History becomes:

Revision	Status
1	superseded
2	superseded
3	superseded
4	deployed (rollback to revision 2)

This preserves a complete audit trail.

Verify Rollback

Run:

helm history ecommerce

You'll see:

REVISION   STATUS

1          superseded

2          superseded

3          superseded

4          deployed

Revision 4 contains the configuration from Revision 2.

Rollback with --wait
helm rollback ecommerce 2 \
    --wait

Helm waits until Pods are healthy before completing.

Rollback with --timeout
helm rollback ecommerce 2 \
    --wait \
    --timeout 10m

Wait up to 10 minutes for resources to become ready.

Rollback with --dry-run

Preview the rollback:

helm rollback ecommerce 2 \
    --dry-run

No changes are applied.

View Specific Revision Values

Compare deployed values:

helm get values ecommerce --revision 2

Then compare with:

helm get values ecommerce --revision 4

Useful when auditing changes.

View Specific Revision Manifest
helm get manifest ecommerce --revision 2

You can compare it with the current manifest to understand what changed.

Production Rollback Workflow
Developer

↓

Deploy Revision 5

↓

Application Fails

↓

Check Status

↓

helm history

↓

Identify Stable Revision

↓

helm rollback

↓

Application Restored
Using --atomic

Remember from Lesson 11:

helm upgrade ecommerce . \
    --atomic

If the upgrade fails:

Upgrade

↓

Failure

↓

Automatic Rollback

In many cases, you won't need to run helm rollback manually because --atomic already handled it.

Common Production Commands

Check releases:

helm list

History:

helm history ecommerce

Status:

helm status ecommerce

Values:

helm get values ecommerce

Manifest:

helm get manifest ecommerce

Rollback:

helm rollback ecommerce 3
Common Mistakes
❌ Rolling Back Without Checking History

Wrong:

helm rollback ecommerce 2

without knowing which revision is stable.

Always check:

helm history ecommerce

first.

❌ Assuming Rollback Deletes History

It doesn't.

Every rollback creates a new revision.

History is always preserved.

❌ Forgetting --wait

Use:

helm rollback ecommerce 2 --wait

to ensure resources become ready before considering the rollback successful.

❌ Assuming Database Changes Are Reverted

Helm manages Kubernetes resources, not your database contents.

If Revision 3 ran a migration that changed database data, a Helm rollback does not automatically undo that migration.

Database rollback strategies should be handled separately.

Hands-on Lab
Install your chart:
helm install ecommerce .
Change:
image:
  tag: "2.0"
Upgrade:
helm upgrade ecommerce .
Change:
replicaCount: 5
Upgrade again:
helm upgrade ecommerce .
View history:
helm history ecommerce
Roll back to Revision 2:
helm rollback ecommerce 2 --wait
Verify:
helm history ecommerce
Inspect the deployed values:
helm get values ecommerce --all
Summary
Command	Purpose
helm history	Show release revision history
helm status	Show current release status
helm get values	Display deployed values
helm get manifest	Show rendered manifests
helm get notes	Show release notes
helm rollback	Roll back to a previous revision
Interview Questions
1. What is a Helm revision?

A numbered version of a Helm release created after each successful install, upgrade, or rollback.

2. Does a rollback remove release history?

No. A rollback creates a new revision while preserving all previous revisions.

3. Which command shows release history?
helm history <release-name>
4. How do you roll back to Revision 3?
helm rollback <release-name> 3
5. What is the purpose of helm get manifest?

It displays the exact Kubernetes manifests that Helm deployed.

6. Does Helm rollback undo database schema or data changes?

No. It only restores Kubernetes resources managed by the release.