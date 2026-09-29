# Day 09 — Shell Environment & Bash Internals

## Shell Environment & Bash Internals

This lesson explains how Bash and the Linux shell environment work behind the scenes. It covers command lookup, variables, environment management, shell configuration files, quoting, error handling, and Bash scripting fundamentals.

---

## Learning Objectives

By the end of this lesson, you should understand:

* What a shell is and how it processes commands
* The difference between shell variables and environment variables
* How Bash finds executable commands using `PATH`
* How aliases, functions, and builtins work
* The purpose of `.bashrc` and `.profile`
* Command substitution and quoting rules
* Exit codes and conditional execution
* Basic Bash error handling techniques
* Function creation and argument passing
* Environment variable inheritance in child processes

---

## 1. Shell Basics

Common shells:

```bash
bash
zsh
sh
fish
```

Check your current shell:

```bash
echo $SHELL
```

Check the current shell process:

```bash
ps -p $$ -o pid,comm,args
```

---

## 2. Variables

Create a shell variable:

```bash
name="Hatim"
```

Read the variable:

```bash
echo "$name"
```

Correct syntax:

```bash
name="Hatim"
```

Incorrect syntax:

```bash
name = "Hatim"
```

---

## 3. Shell Variables vs Environment Variables

Shell variable:

```bash
name="Hatim"
```

Environment variable:

```bash
export name="Hatim"
```

Display value:

```bash
echo "$name"
```

---

## 4. Environment Variables

Show all environment variables:

```bash
env
```

or

```bash
printenv
```

Show a specific variable:

```bash
printenv HOME
```

Common environment variables:

| Variable | Description            |
| -------- | ---------------------- |
| HOME     | User home directory    |
| USER     | Current username       |
| SHELL    | Current shell          |
| PATH     | Executable search path |
| PWD      | Current directory      |
| OLDPWD   | Previous directory     |
| LANG     | Language settings      |
| TERM     | Terminal type          |

---

## 5. PATH Variable

Display PATH:

```bash
echo "$PATH"
```

Example:

```text
/usr/local/bin:/usr/bin:/bin
```

Find where commands are located:

```bash
which curl
```

Better Bash-oriented lookup:

```bash
type curl
```

---

## 6. Command Types

Commands may be:

* Builtins
* Aliases
* Functions
* External executables

Examples:

```bash
type cd
type echo
type ls
```

---

## 7. Aliases

Create alias:

```bash
alias ll='ls -lah'
```

Use:

```bash
ll
```

List aliases:

```bash
alias
```

Remove alias:

```bash
unalias ll
```

---

## 8. Bash Configuration Files

### `.bashrc`

Location:

```bash
~/.bashrc
```

View:

```bash
cat ~/.bashrc
```

Typically contains:

* Aliases
* Environment variables
* Functions
* PATH modifications
* Shell configuration

Reload configuration:

```bash
source ~/.bashrc
```

or

```bash
. ~/.bashrc
```

### `.profile`

Location:

```bash
~/.profile
```

View:

```bash
cat ~/.profile
```

Used primarily for login-shell configuration.

---

## 9. Command Substitution

Modern syntax:

```bash
today=$(date)
```

Example:

```bash
echo "$today"
```

Another example:

```bash
files=$(ls)
```

Practical usage:

```bash
backup_dir="/backup/$(date +%Y-%m-%d)"
```

---

## 10. Quoting

### Double Quotes

```bash
name="Hatim"
echo "Hello $name"
```

Output:

```text
Hello Hatim
```

### Single Quotes

```bash
echo 'Hello $name'
```

Output:

```text
Hello $name
```

### Escape Characters

```bash
echo "Hello \"Hatim\""
```

Output:

```text
Hello "Hatim"
```

---

## 11. Safe File Handling

Avoid:

```bash
rm $file
```

Use:

```bash
rm "$file"
```

Example:

```bash
file="my backup.txt"
rm "$file"
```

---

## 12. Exit Codes

Check exit status:

```bash
echo $?
```

Meaning:

* `0` = Success
* Non-zero = Failure

Example:

```bash
ls /does-not-exist
echo $?
```

---

## 13. Conditional Execution

### Using `&&`

Run next command only if first succeeds:

```bash
mkdir test && echo "Directory created"
```

### Using `||`

Run next command if first fails:

```bash
mkdir test || echo "Failed"
```

### Combined

```bash
mkdir test && echo "Success" || echo "Failed"
```

---

## 14. Bash Error Handling

Recommended options:

```bash
set -e
set -u
set -o pipefail
```

Common combination:

```bash
set -euo pipefail
```

### set -e

Exit when commands fail.

### set -u

Treat unset variables as errors.

### pipefail

Fail pipeline when any command in the pipeline fails.

---

## 15. Production Script Template

```bash
#!/bin/bash

set -euo pipefail

echo "Starting script..."
```

---

## 16. Functions

Create function:

```bash
hello() {
    echo "Hello DevOps"
}
```

Call function:

```bash
hello
```

### Function Arguments

```bash
greet() {
    echo "Hello $1"
}

greet "Hatim"
```

---

## 17. Child Processes & Environment Variables

Not inherited:

```bash
name="Hatim"
bash -c 'echo "$name"'
```

Inherited:

```bash
export name="Hatim"
bash -c 'echo "$name"'
```

This concept is important for:

* Docker
* Kubernetes
* GitHub Actions
* CI/CD Pipelines
* AWS Automation

---

## Practice Lab

### Task 1

```bash
echo "$SHELL"
echo "$HOME"
echo "$USER"
echo "$PATH"
```

### Task 2

```bash
type cd
type echo
type ls
type curl
```

### Task 3

```bash
name="Hatim"
echo "$name"
```

### Task 4

```bash
export name="Hatim"
bash -c 'echo "$name"'
```

### Task 5

```bash
current_date=$(date)
echo "$current_date"
```

### Task 6

```bash
file="my backup.txt"
touch "$file"
ls -l "$file"
rm "$file"
```

### Task 7

```bash
true
echo $?

false
echo $?
```

### Task 8

```bash
true && echo "Success"
false && echo "Success"
```

### Task 9

```bash
true || echo "Failed"
false || echo "Failed"
```

---

## Key Concepts to Master

```text
PATH
HOME
USER
SHELL
env
printenv
export
type
which
alias
source
.bashrc
.profile
$()
$?
&&
||
set -e
set -u
set -o pipefail
```

---

## Mental Model

```text
Terminal
   │
   ▼
Bash
   │
   ├── Variables
   ├── Environment
   ├── Functions
   ├── Aliases
   └── PATH
        │
        ▼
    Command Lookup
        │
        ├── Builtin
        ├── Function
        ├── Alias
        └── Executable
                │
                ▼
             Process
                │
                ▼
            Exit Status
```

### Most Important Takeaways

```text
Shell Variable
      ≠
Environment Variable
```

```text
PATH
 ↓
Where Bash searches for commands
```
