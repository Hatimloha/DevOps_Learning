Lesson 19 — RBAC (Role-Based Access Control), Service Accounts & Security Fundamentals

Security is one of the most important Kubernetes topics.

Question:

Can every user:
- Delete Pods?
- Create Deployments?
- Read Secrets?
- Access Production?

Obviously not.

Kubernetes controls access using:

RBAC
(Role Based Access Control)
1. What is RBAC?

RBAC determines:

Who
Can Do What
On Which Resource

Example:

Developer
   ↓
Can:
- View Pods
- View Services

Cannot:
- Delete Nodes
- Read Secrets
RBAC Components
Role
  ↓
RoleBinding
  ↓
User / ServiceAccount
2. Authentication vs Authorization
Authentication
Who are you?

Example:

hatim
admin
jenkins
github-actions
Authorization
What can you do?

Example:

View Pods ✅
Delete Nodes ❌
Read Secrets ❌

RBAC handles Authorization.

3. Role

A Role defines permissions inside a namespace.

Example:

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

Meaning:

Can:
get pods
list pods
watch pods

Cannot:
delete pods
create pods
4. Understanding Verbs

Common verbs:

Verb	Meaning
get	Read one object
list	List objects
watch	Monitor changes
create	Create resource
update	Update resource
patch	Partial update
delete	Delete resource
5. RoleBinding

Role alone does nothing.

Need:

Role
  +
User

Connected by:

RoleBinding

Example:

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

Flow:

Role
   ↓
RoleBinding
   ↓
ServiceAccount
6. ServiceAccount

Applications running inside Pods don't use human users.

They use:

ServiceAccounts

Create one:

apiVersion: v1
kind: ServiceAccount

metadata:
  name: developer

View:

kubectl get sa

or

kubectl get serviceaccounts
7. Pod Using ServiceAccount
apiVersion: v1
kind: Pod

metadata:
  name: nginx

spec:
  serviceAccountName: developer

  containers:
  - name: nginx
    image: nginx

Now the Pod receives permissions from that ServiceAccount.

Architecture
Pod
 ↓
ServiceAccount
 ↓
RoleBinding
 ↓
Role
 ↓
Permissions
8. ClusterRole

Role works only in one namespace.

Example:

dev namespace only

Sometimes permissions are cluster-wide.

Use:

ClusterRole

Example:

kind: ClusterRole

Can grant:

Nodes
Namespaces
PersistentVolumes

Cluster resources.

9. ClusterRoleBinding

Connects:

ClusterRole
    ↓
ServiceAccount/User

Across the entire cluster.

Example:

kind: ClusterRoleBinding
Role vs ClusterRole
Feature	Role	ClusterRole
Namespace scope	Yes	No
Cluster-wide	No	Yes
Nodes access	No	Yes
Namespaces access	No	Yes
10. Example Permission Flow

Developer Pod:

developer-sa

Role:

View Pods
View Services

Binding:

developer-sa
       ↓
RoleBinding
       ↓
pod-reader

Result:

kubectl get pods ✅
kubectl delete pod ❌
11. Check Permissions

Useful command:

kubectl auth can-i get pods

Output:

yes

Another:

kubectl auth can-i delete nodes

Output:

no

Check as ServiceAccount:

kubectl auth can-i get pods \
--as=system:serviceaccount:dev:developer
12. Common Production Roles
Read-Only
View resources
Developer
Pods
Deployments
Services
CI/CD
Deploy applications
Cluster Admin
Everything
13. Security Best Practices
Principle of Least Privilege

Give only required permissions.

Bad:

Admin Access

Good:

Read Pods Only
Avoid Cluster Admin

Never give:

cluster-admin

unless absolutely necessary.

Separate Service Accounts

Bad:

All apps use default account

Good:

frontend-sa
backend-sa
monitoring-sa
14. Common Mistakes
Using Default ServiceAccount

Every Pod gets:

default

automatically.

Create dedicated accounts instead.

Over-Permissive Roles
verbs:
- "*"
resources:
- "*"

Dangerous.

Forgetting Namespace

Role applies only to its namespace.

15. Useful Commands
View Roles
kubectl get roles
View RoleBindings
kubectl get rolebindings
View ClusterRoles
kubectl get clusterroles
View Service Accounts
kubectl get sa
Check Permissions
kubectl auth can-i get pods
Interview Questions
What is RBAC?

Role-Based Access Control used for Kubernetes authorization.

Difference between Role and ClusterRole?

Role is namespace-scoped.

ClusterRole is cluster-wide.

What is a ServiceAccount?

An identity used by Pods to communicate with the Kubernetes API.

What does RoleBinding do?

Connects a Role to a User or ServiceAccount.

What command checks permissions?
kubectl auth can-i