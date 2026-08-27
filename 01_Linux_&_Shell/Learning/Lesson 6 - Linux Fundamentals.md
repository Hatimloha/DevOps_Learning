# Linux Fundamentals — Day 6

## Users, Groups & Sudo

Today we go deeper into **Linux Identity and Access Management (IAM)**.

Understanding users, groups, and privileges is important when working with:

* SSH servers
* AWS EC2
* Docker
* Kubernetes
* CI/CD runners
* Production environments and permissions

---

## 1. Linux Users

Every process in Linux runs under a user identity.

### Check your current user

```bash
whoami
```

### Get detailed user information

```bash
id
```

Example:

```text
uid=1000(hatim) gid=1000(hatim) groups=1000(hatim),27(sudo)
```

### Important fields

* `uid` → User ID
* `gid` → Primary Group ID
* `groups` → Groups the user belongs to

---

## 2. `/etc/passwd`

Linux stores basic user account information in:

```bash
cat /etc/passwd
```

Example:

```text
hatim:x:1000:1000:Hatim:/home/hatim:/bin/bash
```

### Structure

```text
username
password placeholder
UID
GID
description
home directory
login shell
```

### Important

Actual password hashes are **not stored in `/etc/passwd`**.

They are stored in:

```text
/etc/shadow
```

---

## 3. `/etc/shadow`

View the file using:

```bash
sudo cat /etc/shadow
```

This file contains password-related information.

Example structure:

```text
username:$hash:...
```

It is highly restricted, so you normally need:

```bash
sudo
```

to access it.

---

## 4. `/etc/group`

Linux groups are stored in:

```bash
cat /etc/group
```

Example:

```text
developers:x:1001:hatim,john
```

Meaning:

```text
Group: developers
Members: hatim, john
```

---

## 5. Create a User

Basic user creation:

```bash
sudo useradd john
```

However, this does not necessarily create a complete home environment.

A better option is:

```bash
sudo useradd -m john
```

The `-m` option creates the user's home directory:

```text
/home/john
```

---

## 6. Set a User Password

```bash
sudo passwd john
```

You will be prompted to enter and confirm the password.

---

## 7. Check User Information

Use:

```bash
id john
```

Or:

```bash
getent passwd john
```

---

## 8. Delete a User

Delete the user:

```bash
sudo userdel john
```

Delete the user and their home directory:

```bash
sudo userdel -r john
```

> ⚠️ **Be careful with `-r`**, as it removes the user's home directory and associated files.

---

## 9. Linux Groups

### List your groups

```bash
groups
```

Or:

```bash
id
```

### Create a group

```bash
sudo groupadd developers
```

---

## 10. Add a User to a Group 🔥

Use:

```bash
sudo usermod -aG developers john
```

### Meaning

```text
-a = append
-G = supplementary group
```

### ⚠️ Common Mistake

Avoid running:

```bash
sudo usermod -G developers john
```

without `-a`.

This can replace the user's existing supplementary groups instead of adding a new one.

---

## 11. Verify Group Membership

```bash
groups john
```

Or:

```bash
id john
```

---

## 12. Primary vs Supplementary Groups

A Linux user can belong to:

```text
Primary Group
+
Supplementary Groups
```

Example:

```text
john
 ├── Primary Group: john
 ├── docker
 ├── developers
 └── sudo
```

This concept becomes very important when managing Linux permissions.

---

## 13. `su` — Switch User

Switch to another user:

```bash
su - john
```

The `-` loads the target user's login environment.

Return to your previous user:

```bash
exit
```

---

## 14. `sudo`

`sudo` allows an authorized user to execute commands with elevated privileges.

Example:

```bash
sudo systemctl restart nginx
```

Without sufficient permissions:

```text
Permission denied
```

With `sudo`:

```text
Command executes with elevated privileges
```

---

## 15. Why `sudo` Matters

You should **not normally work directly as the root user**.

Instead:

```text
Normal User
     ↓
   sudo
     ↓
Privileged Command
```

This follows the security principle of **least privilege**.

Only use elevated permissions when they are actually required.

---

## 16. Root User

The root user has:

```text
UID = 0
```

Check root user information:

```bash
id root
```

Example output:

```text
uid=0(root)
```

Root can access and modify almost everything on the system.

---

## 17. `sudo su`

You can open a root shell using:

```bash
sudo su
```

Then check:

```bash
whoami
```

Output:

```text
root
```

Exit the root shell:

```bash
exit
```

### Better Practice

Prefer running individual commands with:

```bash
sudo command
```

instead of staying logged in as root.

---

## 18. Sudo Configuration

The main sudo configuration file is:

```text
/etc/sudoers
```

Never casually edit it directly using:

```bash
nano /etc/sudoers
```

Instead, use:

```bash
sudo visudo
```

`visudo` checks the syntax before saving, helping prevent configuration errors that could break sudo access.

---

## 19. Sudoers Example

A rule may look like:

```text
john ALL=(ALL) ALL
```

This allows `john` to execute commands through `sudo` according to that rule.

> In production environments, avoid granting unnecessary privileges.

---

## 20. Service Accounts

Not every Linux user represents a human.

Many services run using dedicated system users.

Examples:

```text
nginx
postgres
redis
www-data
```

### Why?

**Security isolation.**

Example:

```text
nginx process
      ↓
runs as nginx user
      ↓
limited permissions
```

If the service is compromised, its access is limited by the permissions assigned to that user.

---

## 21. Check Which User Runs a Process

Use:

```bash
ps aux
```

Example:

```text
root      1000 ...
www-data  1200 ...
postgres  1300 ...
```

Filter for a specific process:

```bash
ps aux | grep nginx
```

---

## 22. Real DevOps Scenario 🔥

Imagine your deployment script creates:

```text
app.log
```

But your application runs as:

```text
www-data
```

and the file belongs to:

```text
root
```

The application may receive:

```text
Permission denied
```

### Investigation

Check the file ownership:

```bash
ls -l app.log
```

Then check which user runs the application:

```bash
ps aux | grep app
```

Now you can determine **which user actually needs access to the file**.

> This is an important DevOps troubleshooting mindset: always check **who owns the resource** and **which user the process runs as**.

---

## 23. Docker Connection 🔥

Linux users and groups become very important in Docker.

A container might run as:

```dockerfile
USER 1000
```

This means the application is **not running as root**.

If a mounted volume has incorrect ownership:

```text
Container
   ↓
Permission denied
   ↓
Volume ownership problem
```

Understanding Linux users and groups makes Docker permission issues much easier to troubleshoot.

---

## 24. Practice Lab 🧪

Perform these tasks on your Ubuntu VM or WSL environment.

### Task 1 — Create a User

```bash
sudo useradd -m devuser
```

### Task 2 — Set Password

```bash
sudo passwd devuser
```

### Task 3 — Check User Information

```bash
id devuser
```

### Task 4 — Create a Group

```bash
sudo groupadd developers
```

### Task 5 — Add User to the Group

```bash
sudo usermod -aG developers devuser
```

### Task 6 — Verify Group Membership

```bash
groups devuser
```

### Task 7 — Switch User

```bash
su - devuser
```

Check:

```bash
whoami
```

Then exit:

```bash
exit
```

### Task 8 — Find Service Users

```bash
cat /etc/passwd | grep -E "www-data|nginx|redis|postgres"
```

> Some service users may not exist on your system, and that is completely normal.

---

## 25. Important Commands

Master these commands:

```bash
whoami
id
groups
useradd
usermod
userdel
passwd
groupadd
su
sudo
visudo
getent
```

Also understand these important files:

```text
/etc/passwd
/etc/shadow
/etc/group
/etc/sudoers
```

---

# Day 6 Mental Model 🧠

Think about Linux access like this:

```text
USER
  │
  ├── UID
  │
  ├── Primary Group
  │
  ├── Supplementary Groups
  │
  └── Permissions
          │
          ├── Read
          ├── Write
          └── Execute
```

Once you understand this model, concepts such as **Linux permissions, Docker volumes, SSH access, Kubernetes SecurityContexts, and CI/CD runners** become much easier to understand and troubleshoot.
