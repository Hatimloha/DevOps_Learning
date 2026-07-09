# Lesson 19 — RBAC (Role-Based Access Control), Service Accounts & Security Fundamentals

Security is one of the most important topics in Kubernetes.

A common question:

Can every user:

- Delete Pods?
- Create Deployments?
- Read Secrets?
- Access Production?

Obviously, the answer is **No**.

Kubernetes controls access using:

# RBAC

**Role-Based Access Control**

RBAC decides:

```text
Who
 ↓
Can Do What
 ↓
On Which Resource
```

Example:

```text
Developer

Can:
✅ View Pods
✅ View Services

Cannot:
❌ Delete Nodes
❌ Read Secrets
```

---

# 1. What is RBAC?

RBAC is Kubernetes' authorization mechanism that controls what actions users and applications can perform.

RBAC has four main components:

```text
Role
  ↓
RoleBinding
  ↓
User / ServiceAccount
```

---

# 2. Authentication vs Authorization

## Authentication

Authentication answers:

> Who are you?

Examples:

```text
hatim
admin
jenkins
github-actions
```

---

## Authorization

Authorization answers:

> What can you do?

Examples:

```text
View Pods       ✅
Delete Nodes    ❌
Read Secrets    ❌
```

RBAC handles **Authorization**.

---

# 3. Role

A **Role** defines permissions inside a specific namespace.

Example:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role

metadata:
  name: pod-reader
  namespace: dev

rules:
- apiGroups: [""]

  resources:
  - pods

  verbs:
  - get
  - list
  - watch
```

This allows:

```text
✅ get pods
✅ list pods
✅ watch pods
```

But denies:

```text
❌ delete pods
❌ create pods
```

---

# 4. Understanding RBAC Verbs

| Verb | Meaning |
|------|---------|
| get | Read one object |
| list | List objects |
| watch | Monitor changes |
| create | Create resources |
| update | Update resources |
| patch | Partial update |
| delete | Delete resources |

---

# 5. RoleBinding

A Role alone does nothing.

It needs to be connected to a user or ServiceAccount.

This connection is created using:

```text
Role
 +
User / ServiceAccount
 =
RoleBinding
```

Example:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding

metadata:
  name: pod-reader-binding
  namespace: dev

subjects:
- kind: ServiceAccount
  name: developer

roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

Flow:

```text
Role
 ↓
RoleBinding
 ↓
ServiceAccount
```

---

# 6. ServiceAccount

Applications running inside Pods do not use human users.

They use:

```text
ServiceAccounts
```

Create a ServiceAccount:

```yaml
apiVersion: v1
kind: ServiceAccount

metadata:
  name: developer
```

View ServiceAccounts:

```bash
kubectl get sa
```

or:

```bash
kubectl get serviceaccounts
```

---

# 7. Pod Using ServiceAccount

Example:

```yaml
apiVersion: v1
kind: Pod

metadata:
  name: nginx

spec:
  serviceAccountName: developer

  containers:
  - name: nginx
    image: nginx
```

Now this Pod receives permissions from the ServiceAccount.

Architecture:

```text
Pod
 ↓
ServiceAccount
 ↓
RoleBinding
 ↓
Role
 ↓
Permissions
```

---

# 8. ClusterRole

A **Role** works only inside one namespace.

Example:

```text
dev namespace only
```

But sometimes permissions need to apply across the whole cluster.

For this, Kubernetes provides:

```text
ClusterRole
```

Example:

```yaml
kind: ClusterRole
```

ClusterRoles can manage cluster-wide resources:

- Nodes
- Namespaces
- PersistentVolumes
- Cluster resources

---

# 9. ClusterRoleBinding

ClusterRoleBinding connects:

```text
ClusterRole
      ↓
User / ServiceAccount
```

across the entire cluster.

---

# Role vs ClusterRole

| Feature | Role | ClusterRole |
|----------|------|-------------|
| Namespace scope | ✅ Yes | ❌ No |
| Cluster-wide access | ❌ No | ✅ Yes |
| Access Nodes | ❌ No | ✅ Yes |
| Access Namespaces | ❌ No | ✅ Yes |

---

# 10. Example Permission Flow

Developer application:

```text
developer-sa
```

Role:

```text
View Pods
View Services
```

Binding:

```text
developer-sa
       ↓
RoleBinding
       ↓
pod-reader
```

Result:

```bash
kubectl get pods
```

✅ Allowed

```bash
kubectl delete pod nginx
```

❌ Denied

---

# 11. Check Permissions

Kubernetes provides:

```bash
kubectl auth can-i
```

Example:

```bash
kubectl auth can-i get pods
```

Output:

```text
yes
```

---

Check restricted actions:

```bash
kubectl auth can-i delete nodes
```

Output:

```text
no
```

---

Check permissions as a ServiceAccount:

```bash
kubectl auth can-i get pods \
--as=system:serviceaccount:dev:developer
```

---

# 12. Common Production Roles

## Read-Only User

Permissions:

```text
View resources only
```

---

## Developer

Usually allowed:

```text
Pods
Deployments
Services
ConfigMaps
```

---

## CI/CD Account

Used by:

- Jenkins
- GitHub Actions
- GitLab CI

Permissions:

```text
Deploy applications
Update workloads
```

---

## Cluster Admin

Full access:

```text
Everything
```

Should be used carefully.

---

# 13. Kubernetes Security Best Practices

## Principle of Least Privilege

Give only the permissions required.

Bad:

```text
Admin Access
```

Good:

```text
Read Pods Only
```

---

## Avoid Cluster Admin

Avoid giving:

```text
cluster-admin
```

unless absolutely necessary.

---

## Use Separate ServiceAccounts

Bad:

```text
All applications use default account
```

Good:

```text
frontend-sa
backend-sa
monitoring-sa
```

---

# 14. Common Mistakes

## Using Default ServiceAccount

Every Pod automatically gets:

```text
default
```

ServiceAccount.

Better approach:

Create dedicated accounts.

---

## Over-Permissive Roles

Dangerous example:

```yaml
verbs:
- "*"

resources:
- "*"
```

This gives unlimited access.

---

## Forgetting Namespace Scope

A Role only works inside its namespace.

Example:

```text
Role in dev namespace
```

cannot manage:

```text
production namespace
```

---

# 15. Useful Commands

## View Roles

```bash
kubectl get roles
```

---

## View RoleBindings

```bash
kubectl get rolebindings
```

---

## View ClusterRoles

```bash
kubectl get clusterroles
```

---

## View ServiceAccounts

```bash
kubectl get sa
```

---

## Check Permissions

```bash
kubectl auth can-i get pods
```

---

# Interview Questions

## What is RBAC?

RBAC (Role-Based Access Control) is Kubernetes authorization system used to control user and application permissions.

---

## Difference between Role and ClusterRole?

**Role:**

- Namespace-scoped
- Works inside one namespace

**ClusterRole:**

- Cluster-wide permissions
- Can access cluster resources

---

## What is a ServiceAccount?

A ServiceAccount is an identity used by Pods to communicate with the Kubernetes API.

---

## What does RoleBinding do?

RoleBinding connects a Role with:

- User
- Group
- ServiceAccount

---

## What command checks permissions?

```bash
kubectl auth can-i
```

---

# Summary

- RBAC controls **who can do what** in Kubernetes.
- Authentication identifies users; Authorization controls permissions.
- Roles define permissions inside namespaces.
- ClusterRoles provide cluster-wide permissions.
- RoleBindings connect permissions to users or ServiceAccounts.
- ServiceAccounts provide identities for Pods.
- Follow the principle of least privilege for production security.
- Avoid giving unnecessary `cluster-admin` access.