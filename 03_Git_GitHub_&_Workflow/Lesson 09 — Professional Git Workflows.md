# Lesson 9 — Git & GitHub Journey

# Professional Git Workflows (GitFlow vs Trunk-Based Development)

Knowing Git commands is one thing.

Knowing **how development teams organize their work** is what companies care about.

In this lesson, you'll learn:

- GitFlow
- Trunk-Based Development
- Release Branches
- Hotfix Branches
- Which workflow modern companies prefer
- Best practices for real-world development

---

# Why Do We Need Workflows?

Imagine **50 developers** working on the same repository.

Without a proper workflow:

```text
main
├── random commits
├── random fixes
├── unfinished features
└── broken deployments
```

The result is chaos.

A **Git workflow** defines rules for how developers create branches, collaborate, review code, and deploy applications.

---

# Workflow 1 — GitFlow

GitFlow was one of the most popular Git workflows for many years and is still used in many enterprise environments.

## Branches

- `main`
- `develop`
- `feature/*`
- `release/*`
- `hotfix/*`

---

## GitFlow Structure

```text
main
│
└── develop
    ├── feature-login
    ├── feature-payment
    └── feature-profile
```

---

## Branch Purpose

### `main`

Production-ready code.

Everything inside `main` is considered stable and deployable.

---

### `develop`

The integration branch.

Completed features are merged here before being prepared for production.

---

### `feature/*`

Examples:

```text
feature-auth
feature-payment
feature-dashboard
```

Used for developing new features.

---

### `release/*`

Example:

```text
release-v1.0
```

Created when preparing a production release.

Only the following changes should occur here:

- Bug fixes
- QA testing
- Version updates

---

### `hotfix/*`

Example:

```text
hotfix-payment-bug
```

Used to fix urgent production issues without waiting for the next release.

---

## GitFlow Example

```text
main
│
└── develop
      │
      └── feature-login
```

Feature completed:

```text
feature-login
      │
      ▼
develop
```

Release preparation:

```text
develop
   │
   ▼
release-v1.0
   │
   ▼
main
```

---

## Advantages

- Excellent for large teams
- Well-defined release process
- Stable production workflow
- Common in enterprise environments

---

## Disadvantages

- Too many long-lived branches
- Complex workflow
- Slower releases
- More merge conflicts

Modern teams often consider GitFlow too heavy.

---

# Workflow 2 — Trunk-Based Development

Many modern companies use **Trunk-Based Development** because it is simple and fast.

Examples include teams at:

- Google
- Netflix
- Amazon

> **Note:** Every company customizes its workflow based on its own needs.

---

## Structure

```text
main
├── feature-a
├── feature-b
└── feature-c
```

Feature branches are short-lived.

---

## Development Workflow

```text
Create Branch
      │
      ▼
Develop Feature
      │
      ▼
Open Pull Request
      │
      ▼
Code Review
      │
      ▼
Merge into main
```

No `develop` branch is required.

---

## Example

Create a feature branch:

```bash
git switch -c feature-login
```

Commit your work:

```bash
git commit -m "feat: add login"
```

Push the branch:

```bash
git push origin feature-login
```

Then:

1. Open a Pull Request
2. Request a review
3. Merge into `main`
4. Delete the feature branch

Done.

---

# Why Modern Teams Prefer Trunk-Based Development

Benefits include:

- Simpler workflow
- Fewer branches
- Faster releases
- Easier CI/CD integration
- Supports Continuous Deployment

---

# Release Branch Strategy

Some organizations create temporary release branches.

Example:

```text
main
└── release-v2.0
```

Purpose:

- Final testing
- QA validation
- Release preparation

After deployment:

```text
release-v2.0
      │
      ▼
main
```

The release branch is then deleted.

---

# Hotfix Strategy

Suppose a production issue occurs:

> Payment service is down.

Create a hotfix branch:

```bash
git switch -c hotfix-payment
```

Fix the issue:

```bash
git commit -m "fix: payment timeout"
```

Then:

- Open a Pull Request
- Merge immediately
- Deploy the fix

---

# Feature Flags

Modern applications often merge unfinished features safely using **Feature Flags**.

Example:

```javascript
if (featureFlagEnabled) {
    showNewDashboard();
}
```

The code exists in production but remains hidden until the feature flag is enabled.

---

# Conventional Commits

Many teams follow a standard commit message format.

Examples:

```text
feat: add login API
fix: resolve payment timeout
docs: update README
refactor: cleanup auth service
test: add unit tests
```

Benefits:

- Better automation
- Automatic changelog generation
- Improved readability
- Easier release management

---

# Recommended Workflow for Full Stack + DevOps Engineers

```text
main
├── feature/*
├── bugfix/*
└── hotfix/*
```

Recommended practices:

- Pull Requests (PRs)
- Code Reviews
- GitHub Actions
- Docker-based CI/CD
- Automated Testing

This workflow closely matches what most modern software teams use.

---

# Key Takeaways

By the end of this lesson, you should understand:

- GitFlow Workflow
- Trunk-Based Development
- Feature Branches
- Release Branches
- Hotfix Branches
- Feature Flags
- Conventional Commits
- Modern Git Collaboration Practices

---

## Summary

| Workflow | Best For | Complexity | Release Speed |
|-----------|----------|------------|---------------|
| GitFlow | Enterprise projects | High | Moderate |
| Trunk-Based Development | Modern Agile teams | Low | Fast |
