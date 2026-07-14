# Lesson 24 — Kubernetes Security Deep Dive (Production Security)

## 📖 Overview

Kubernetes security is much more than just **RBAC**. A production-ready cluster secures every layer of the environment—from the infrastructure to the applications running inside containers.

```
Cluster
   ↓
Nodes
   ↓
Pods
   ↓
Containers
   ↓
Applications
```

> **Think in layers, not just one security feature.**

---

# 1. Kubernetes Security Layers

A secure Kubernetes cluster protects multiple layers:

```text
+--------------------------------------+
| API Security (RBAC, Authentication)  |
+--------------------------------------+
| Network Security (Network Policies)  |
+--------------------------------------+
| Pod Security                         |
+--------------------------------------+
| Container Security                   |
+--------------------------------------+
| Node Security                        |
+--------------------------------------+
| Infrastructure                       |
+--------------------------------------+
```

A production environment should secure **every layer**, not just the Kubernetes API.

---

# 2. Security Context

A **SecurityContext** defines how a Pod or container should run.

It controls:

- User ID (UID)
- Group ID (GID)
- Privileged mode
- Filesystem permissions
- Linux capabilities
- Privilege escalation
- seccomp profile

### Example

```yaml
apiVersion: v1
kind: Pod

metadata:
  name: secure-nginx

spec:
  securityContext:
    runAsUser: 1000
    runAsGroup: 1000

  containers:
    - name: nginx
      image: nginx
```

### Meaning

The container runs as:

- **UID:** `1000`
- **GID:** `1000`

instead of the default **root user (UID 0)**.

---

# 3. Running as Non-Root

Many container images run as **root** by default.

This increases the risk if the container is compromised.

### Recommended Configuration

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
```

### Benefits

- Limits damage from attacks
- Better process isolation
- Meets production security standards
- Follows the Principle of Least Privilege

---

# 4. Privileged Containers

A privileged container has almost the same permissions as the host machine.

### Example

```yaml
securityContext:
  privileged: true
```

### Risks

A privileged container can:

- Access host devices
- Load kernel modules
- Modify host networking
- Potentially escape container isolation

> ⚠️ Avoid privileged containers unless absolutely necessary.

---

# 5. Read-Only Root Filesystem

Prevent applications from modifying their root filesystem.

### Example

```yaml
securityContext:
  readOnlyRootFilesystem: true
```

Now the application cannot modify files such as:

```text
/app/config.yaml ❌
```

If writable storage is needed, mount a volume such as:

- `emptyDir`
- PersistentVolumeClaim (PVC)
- Configurable writable mount

---

# 6. Allow Privilege Escalation

Prevent processes inside the container from gaining additional privileges.

### Example

```yaml
securityContext:
  allowPrivilegeEscalation: false
```

### Production Recommendation

Always disable privilege escalation unless an application explicitly requires it.

---

# 7. Linux Capabilities

Linux divides root privileges into smaller capabilities.

Instead of granting full root access, provide only the permissions that are required.

### Example

```yaml
securityContext:
  capabilities:
    drop:
      - ALL
    add:
      - NET_BIND_SERVICE
```

### Meaning

- Drop every Linux capability
- Allow only binding to low-numbered ports

This follows the **Principle of Least Privilege**.

---

# 8. seccomp

**seccomp** filters Linux system calls available to a process.

### Example

```yaml
securityContext:
  seccompProfile:
    type: RuntimeDefault
```

### Benefits

- Blocks dangerous system calls
- Reduces attack surface
- Protects the Linux kernel

---

# 9. AppArmor

AppArmor limits what a process can access.

Examples of restrictions include:

- Prevent writing to `/etc`
- Restrict access to `/proc`
- Block execution of specific binaries

AppArmor profiles are typically configured through the container runtime and integrated with Kubernetes.

---

# 10. Pod Security Standards (PSS)

Kubernetes uses **Pod Security Standards (PSS)** to define security levels.

| Level | Purpose |
|--------|---------|
| **Privileged** | Minimal restrictions |
| **Baseline** | Blocks common risky settings |
| **Restricted** | Strong production security |

## Restricted Policy

The **Restricted** profile generally enforces:

- ✅ Run containers as non-root
- ✅ No privileged containers
- ✅ No host networking
- ✅ No host PID or IPC
- ✅ Limited Linux capabilities

---

# 11. Host Access (Usually Avoid)

Avoid enabling these options unless absolutely required:

```yaml
hostNetwork: true
hostPID: true
hostIPC: true
```

### Why?

These settings allow Pods to share host resources, reducing isolation and increasing security risks.

---

# 12. Image Security

Only deploy trusted container images.

### Good

```text
nginx:1.27.0
```

### Better

```text
nginx@sha256:<digest>
```

Using an image digest ensures the **exact image** is deployed every time.

### Avoid

```text
latest
```

because it changes over time and reduces deployment consistency.

---

# 13. Image Scanning

Scan images for vulnerabilities before deployment.

```text
Build Image
      ↓
Scan for Vulnerabilities
      ↓
Deploy
```

### Common Image Scanners

- Trivy
- Grype

---

# 14. Secret Security

Never hardcode sensitive values.

### ❌ Bad

```yaml
env:
  PASSWORD: admin123
```

### ✅ Good

Store secrets using Kubernetes Secrets:

```text
Secret
   ↓
Environment Variable

or

Secret
   ↓
Mounted Volume
```

> **Note:** Base64 encoding is **not encryption**.

---

# 15. Security Best Practices

Always:

- ✅ Run containers as a non-root user
- ✅ Drop unnecessary Linux capabilities
- ✅ Use a read-only root filesystem whenever possible
- ✅ Disable privilege escalation
- ✅ Apply NetworkPolicies
- ✅ Configure RBAC correctly
- ✅ Scan container images
- ✅ Keep Kubernetes and container images updated

---

# 16. Useful Commands

### Check Pod Details

```bash
kubectl describe pod <pod-name>
```

### View Pod YAML

```bash
kubectl get pod <pod-name> -o yaml
```

### View Cluster Events

```bash
kubectl get events
```

---

# 17. Common Mistakes

### Running Containers as Root

```text
UID = 0
```

Avoid unless absolutely necessary.

---

### Using `:latest`

```text
nginx:latest
```

The image may change unexpectedly.

Use a **fixed version** or **digest** instead.

---

### Using Privileged Containers Everywhere

```yaml
privileged: true
```

Creates unnecessary security risks.

---

### Hardcoding Credentials

Never commit passwords, API keys, or tokens into YAML files.

---

### Granting Excessive Permissions

Examples:

```yaml
privileged: true

hostNetwork: true

allowPrivilegeEscalation: true
```

Only enable these settings when absolutely required.

---

# 18. Interview Questions

### What is a SecurityContext?

A configuration that defines security settings for a Pod or container, such as user ID, filesystem permissions, Linux capabilities, and privilege settings.

---

### Why should containers run as non-root?

Running as a non-root user limits the impact of a compromise and follows the Principle of Least Privilege.

---

### What does `privileged: true` do?

It grants the container elevated privileges similar to the host system, increasing security risks.

---

### What is seccomp?

A Linux kernel feature that restricts the system calls a process can make, reducing the attack surface.

---

### What is `readOnlyRootFilesystem`?

It makes the container's root filesystem read-only, preventing applications from modifying system files.

---

### What are Pod Security Standards (PSS)?

Pod Security Standards define three security profiles:

- **Privileged**
- **Baseline**
- **Restricted**

These profiles help enforce secure Pod configurations across Kubernetes clusters.

---

# 📌 Key Takeaways

- Kubernetes security is **layered**, covering the cluster, nodes, pods, containers, and applications.
- Use **SecurityContext** to enforce secure container execution.
- Run containers as **non-root** whenever possible.
- Avoid **privileged containers**, **host networking**, and **privilege escalation** unless required.
- Enable **read-only root filesystems** and **drop unnecessary Linux capabilities**.
- Use **seccomp**, **AppArmor**, **RBAC**, and **NetworkPolicies** for stronger security.
- Scan images before deployment and avoid using the `latest` image tag.
- Store sensitive information in **Kubernetes Secrets**, not directly in manifests.
- Follow the **Restricted Pod Security Standard** for production workloads.