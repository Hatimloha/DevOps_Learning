# Linux Shell Guide

A beginner-friendly guide to Linux shells, shell scripting, and shebangs.

---

# Table of Contents

1. [What is a Shell?](#what-is-a-shell)
2. [Uses of a Shell](#uses-of-a-shell)
3. [What is a Shebang (`#!`)?](#what-is-a-shebang-)
4. [Common Shebang Examples](#common-shebang-examples)
5. [How to Find Installed Shells](#how-to-find-installed-shells)
6. [Best Shell for Different Use Cases](#best-shell-for-different-use-cases)

---

# What is a Shell?

A **shell** is a command-line interpreter that allows users to interact with the Linux operating system.

It acts as a bridge between:

- The **user**
- The **kernel (Linux core)**

The shell accepts commands from the user and executes them.

# Uses of a Shell
Shells are used for:

##### 1. Running Commands
Execute Linux commands like:
```bash
pwd
mkdir test
rm file.txt
```
##### 2. Automation
Execute Linux commands like:
```bash
#!/bin/bash

echo "Backup started"
cp -r /home/user/data /backup/
echo "Backup completed"
```

##### 3. System Administration 
- User management
- Service management
- Monitoring systems
- cheduling tasks

##### 4. File Management
Create, move, delete, and search files.
```bash
mv old.txt new.txt
find . -name "*.log"
```

##### 5. Software Development
Developers use shells for:
- Running builds
- Deployments
- Git operations
- CI/CD pipelines

##### 6. Remote Server Access
Execute Linux commands like:
```bash
ssh user@server-ip
```

## Popular Linux Shells
| Shell | Full Name | Features |
|-------|------------|-----------|
| sh | Bourne Shell | Original Unix shell |
| bash | Bourne Again Shell | Most popular Linux shell |
| zsh | Z Shell | Advanced features and themes |
| fish | Friendly Interactive Shell | User-friendly shell |
| ksh | Korn Shell | Powerful scripting |
| csh | C Shell | C-like syntax |
| tcsh | TENEX C Shell | Improved C shell |
| dash | Debian Almquist Shell | Lightweight and fast |


# What is a Shebang (#!)?
A shebang tells Linux which interpreter should execute the script.


Syntax:
```sh
#!<path-to-shell>
```

Example: Bash
```sh
#!/bin/bash
```

# How to Find Installed Shells
View available shells:
```sh
cat /etc/shells
```

Example output:
```sh
/bin/sh
/bin/bash
/bin/zsh
/usr/bin/fish
```

# Changing Your Default Shell
```sh
chsh -s /bin/zsh
```

# Best Shell for Different Use Cases
Use Case | Recommended Shell | 
|--------|-------------------|
| Beginners | Bash | 
| Power Users | Zsh | 
| Fast Startup | Dash | 
| Friendly Experience | Fish | 
| Enterprise Scripts | Bash / Sh | 