Lesson 15 — Packaging & Versioning Helm Charts

In the previous lessons, you created and deployed Helm charts from your local directory.

In real projects, you don't deploy directly from source folders. Instead, you package charts into versioned archives and distribute them through Helm repositories or OCI registries.

This lesson teaches you how Helm packages charts and how chart versioning works.

Learning Objectives

By the end of this lesson, you'll understand:

What a packaged chart is
helm package
Chart.yaml
version
appVersion
Semantic Versioning (SemVer)
Packaging workflow
Updating chart versions
Production best practices
What is a Packaged Chart?

Suppose your chart looks like this:

ecommerce/

├── Chart.yaml
├── values.yaml
├── templates/
└── charts/

This is your source chart.

Package it:

helm package ecommerce

Output:

Successfully packaged chart and saved it to:

ecommerce-0.1.0.tgz

Now instead of a folder, you have:

ecommerce-0.1.0.tgz

A .tgz file is a compressed archive containing the complete chart.

Why Package Charts?

Without packaging:

Developer

↓

Copy Folder

↓

Deploy

With packaging:

Developer

↓

Package Chart

↓

Upload Repository

↓

Install Anywhere

Benefits:

Versioned
Portable
Easy to distribute
Easy to store
Immutable release artifact
Chart.yaml

Every chart contains:

Chart.yaml

Example:

apiVersion: v2

name: ecommerce

description: E-Commerce Application

type: application

version: 0.1.0

appVersion: "1.0.0"

The two most important fields are:

version
appVersion
version

This is the Helm chart version.

Example:

version: 0.1.0

It tracks changes to the chart itself.

Examples of chart changes:

New template
Better helper function
Fixed labels
Improved values
Added ConfigMap

Application code may remain unchanged.

appVersion

Example:

appVersion: "2.5.0"

This represents the version of your application.

Example:

Docker Image

↓

my-app:2.5.0
Difference
Field	Represents
version	Helm chart version
appVersion	Application version

Example:

version: 1.2.0

appVersion: "2.6.3"

Meaning:

Chart version is 1.2.0
Application version is 2.6.3
Semantic Versioning (SemVer)

Helm follows Semantic Versioning:

MAJOR.MINOR.PATCH

Example:

1.4.7

Breakdown:

Major = 1

Minor = 4

Patch = 7
Major Version

Increase when making breaking changes.

Example:

1.2.0

↓

2.0.0

Examples:

Removing values
Template redesign
Breaking compatibility
Minor Version

Increase when adding new features.

1.2.0

↓

1.3.0

Examples:

New ConfigMap
New Service
Optional Ingress
New templates
Patch Version

Increase for bug fixes.

1.2.5

↓

1.2.6

Examples:

Fixed labels
Fixed indentation
Fixed helper template
Documentation updates affecting chart behavior
Packaging Command

Package current chart:

helm package .

Or:

helm package ecommerce

Output:

Successfully packaged chart

ecommerce-0.1.0.tgz
Package to Another Directory
helm package ecommerce \
    --destination ./packages

Result:

packages/

└── ecommerce-0.1.0.tgz

Useful for CI/CD pipelines.

Verify Package

List files:

ls

Output:

Chart.yaml

values.yaml

templates/

ecommerce-0.1.0.tgz
Inspect Package

Without extracting:

helm show chart ecommerce-0.1.0.tgz

Example:

name: ecommerce

version: 0.1.0

appVersion: 1.0.0
Show Values
helm show values ecommerce-0.1.0.tgz

Displays the packaged values.yaml.

Show Readme
helm show readme ecommerce-0.1.0.tgz

Displays the packaged documentation if a README.md exists.

Show All Information
helm show all ecommerce-0.1.0.tgz

Includes:

Metadata
Values
README
Templates (where applicable)
Updating Versions

Suppose:

version: 0.1.0

appVersion: "1.0.0"

You release application version 1.1.0 without changing the chart structure.

Update:

version: 0.1.0

appVersion: "1.1.0"

Only the application version changes.

Now suppose you modify the chart by adding an Ingress template.

Update:

version: 0.2.0

appVersion: "1.1.0"

The chart version changes because the chart itself changed.

Packaging Workflow
Modify Chart

↓

Update Version

↓

helm lint

↓

helm package

↓

Upload Repository

↓

helm install
Lint Before Packaging

Always validate the chart:

helm lint .

Example:

1 chart(s) linted, 0 chart(s) failed

Only package after lint succeeds.

Enterprise Release Example

Version history:

Chart Version	App Version	Reason
1.0.0	2.0.0	Initial release
1.0.1	2.0.0	Chart bug fix
1.1.0	2.0.0	Added Ingress support
1.1.1	2.0.0	Fixed templates
1.2.0	2.1.0	New application release + chart updates
Common Mistakes
❌ Forgetting to Update version

Changed chart:

templates/

But:

version: 0.1.0

still unchanged.

Users can't distinguish the new chart from the old one.

❌ Confusing version and appVersion

Wrong:

version: 2.6.0

because the Docker image changed.

Correct:

version: 0.2.0

appVersion: "2.6.0"
❌ Packaging Without Linting

Don't do:

helm package .

First:

helm lint .

Then:

helm package .
❌ Editing Packaged Files

Never modify:

ecommerce-0.1.0.tgz

Make changes in the source chart and package again.

Hands-on Lab
Check Chart.yaml:
version: 0.1.0

appVersion: "1.0.0"
Lint the chart:
helm lint .
Package it:
helm package .
Inspect the package:
helm show chart ecommerce-0.1.0.tgz
Update:
version: 0.2.0

appVersion: "1.1.0"
Package again:
helm package .

Notice the new archive name:

ecommerce-0.2.0.tgz
Summary
Command	Purpose
helm package	Create a packaged chart (.tgz)
helm lint	Validate a chart
helm show chart	Show chart metadata
helm show values	Show packaged values
helm show readme	Show packaged README
helm show all	Display all packaged information
Interview Questions
1. What does helm package do?

It packages a Helm chart into a compressed .tgz archive for distribution.

2. What is the difference between version and appVersion?
version is the Helm chart version.
appVersion is the version of the application the chart deploys.
3. Why should you run helm lint before packaging?

To catch template errors and validate the chart before creating a release artifact.

4. What file contains chart metadata?
Chart.yaml
5. What versioning standard does Helm use?

Semantic Versioning (SemVer): MAJOR.MINOR.PATCH.

6. Can two chart packages have the same version but different contents?

They technically can, but it's a bad practice. Every chart change should be accompanied by an appropriate chart version increment.