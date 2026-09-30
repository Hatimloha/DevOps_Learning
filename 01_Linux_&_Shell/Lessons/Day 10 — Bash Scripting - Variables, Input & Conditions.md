# Day 10 — Bash Scripting: Variables, Input & Conditions

## Scripts, Variables, Input & Conditions

Today we move beyond interactive commands and begin writing **real Bash scripts**.

The objective is to create scripts that can:

* Accept input
* Store data in variables
* Make decisions
* Validate user input
* Check files and directories
* Automate common tasks

---

## Learning Objectives

By the end of this lesson, you should be able to:

* Create executable Bash scripts
* Use variables correctly
* Read user input
* Work with command-line arguments
* Use conditional statements
* Compare numbers and strings
* Validate files and directories
* Handle exit statuses properly
* Build simple automation scripts

---

# 1. Bash Script Structure

Create a script:

```bash
nano hello.sh
```

Basic structure:

```bash
#!/bin/bash

echo "Hello DevOps"
```

Run:

```bash
bash hello.sh
```

Or make it executable:

```bash
chmod +x hello.sh
./hello.sh
```

### Shebang

```bash
#!/bin/bash
```

The shebang tells Linux which interpreter should execute the script.

---

# 2. Comments

Comments begin with `#`.

```bash
#!/bin/bash

# This is a comment
echo "Hello"
```

### Best Practice

Use comments to explain:

* Why something is being done
* Business logic
* Important assumptions

Avoid commenting obvious code.

---

# 3. Variables

Create variables:

```bash
name="Hatim"
age=25
role="DevOps Engineer"
```

Display values:

```bash
echo "$name"
echo "$age"
echo "$role"
```

### Correct Syntax

```bash
name="Hatim"
```

### Incorrect Syntax

```bash
name = "Hatim"
```

Bash does not allow spaces around `=`.

---

# 4. Always Quote Variables

Recommended:

```bash
echo "$name"
```

Avoid:

```bash
echo $name
```

Example:

```bash
file="my backup.txt"

cat "$file"
```

Quoting prevents issues with:

* Spaces
* Wildcards
* Empty values

---

# 5. User Input with `read`

```bash
#!/bin/bash

echo "Enter your name:"
read name

echo "Hello $name"
```

Run:

```bash
./hello.sh
```

---

# 6. Prompt Directly with `read -p`

```bash
read -p "Enter your name: " name

echo "Hello $name"
```

---

# 7. Silent Input

Useful for passwords:

```bash
read -s -p "Password: " password
echo
```

### Option

| Option | Description           |
| ------ | --------------------- |
| `-s`   | Hide typed characters |

---

# 8. Command-Line Arguments

Execute:

```bash
./script.sh Hatim DevOps
```

Inside the script:

```bash
echo "$1"
echo "$2"
```

Output:

```text
Hatim
DevOps
```

---

## Special Variables

| Variable | Meaning                 |
| -------- | ----------------------- |
| `$0`     | Script name             |
| `$1`     | First argument          |
| `$2`     | Second argument         |
| `$#`     | Number of arguments     |
| `$@`     | All arguments           |
| `$?`     | Previous command status |
| `$$`     | Current shell PID       |

---

# 9. Deployment Script Example

Run:

```bash
./deploy.sh production v1.2.0
```

Script:

```bash
#!/bin/bash

environment="$1"
version="$2"

echo "Environment: $environment"
echo "Version: $version"
```

Common pattern in:

* CI/CD
* Deployments
* Automation pipelines

---

# 10. Validate Argument Count

```bash
#!/bin/bash

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <environment> <version>"
    exit 1
fi

echo "Environment: $1"
echo "Version: $2"
```

Example:

```bash
./deploy.sh production v1.0.0
```

---

# 11. Formatted Output with `printf`

Single value:

```bash
printf "Hello %s\n" "$name"
```

Multiple values:

```bash
printf "Environment: %s | Version: %s\n" \
"$environment" "$version"
```

### Why `printf`?

* More predictable than `echo`
* Supports formatting
* Preferred in production scripts

---

# 12. Basic `if`

```bash
if [ condition ]; then
    command
fi
```

Example:

```bash
if [ "$age" -ge 18 ]; then
    echo "Adult"
fi
```

---

# 13. `if / else`

```bash
if [ "$age" -ge 18 ]; then
    echo "Adult"
else
    echo "Minor"
fi
```

---

# 14. `elif`

```bash
if [ "$age" -lt 13 ]; then
    echo "Child"
elif [ "$age" -lt 18 ]; then
    echo "Teenager"
else
    echo "Adult"
fi
```

---

# 15. Numeric Comparisons

| Operator | Meaning               |
| -------- | --------------------- |
| `-eq`    | Equal                 |
| `-ne`    | Not equal             |
| `-gt`    | Greater than          |
| `-ge`    | Greater than or equal |
| `-lt`    | Less than             |
| `-le`    | Less than or equal    |

Example:

```bash
if [ "$cpu" -gt 80 ]; then
    echo "High CPU usage"
fi
```

---

# 16. String Comparisons

Equal:

```bash
if [ "$environment" = "production" ]; then
    echo "Production deployment"
fi
```

Not equal:

```bash
if [ "$environment" != "development" ]; then
    echo "Not development"
fi
```

---

# 17. Empty String Checks

Check empty:

```bash
if [ -z "$name" ]; then
    echo "Name is empty"
fi
```

Check non-empty:

```bash
if [ -n "$name" ]; then
    echo "Name exists"
fi
```

---

# 18. File Tests

| Test | Meaning      |
| ---- | ------------ |
| `-f` | Regular file |
| `-d` | Directory    |
| `-e` | Exists       |
| `-r` | Readable     |
| `-w` | Writable     |
| `-x` | Executable   |

Example:

```bash
if [ -f "app.log" ]; then
    echo "Log file exists"
fi
```

---

# 19. Directory Check

```bash
if [ -d "/var/log" ]; then
    echo "/var/log exists"
fi
```

---

# 20. Backup Directory Validation

```bash
#!/bin/bash

backup="/backup"

if [ -d "$backup" ]; then
    echo "Backup directory exists"
else
    echo "Backup directory missing"
    exit 1
fi
```

---

# 21. Combining Conditions

## AND

```bash
if [ "$age" -ge 18 ] && [ "$age" -lt 60 ]; then
    echo "Working age"
fi
```

## OR

```bash
if [ "$environment" = "production" ] || \
   [ "$environment" = "staging" ]; then
    echo "Deployment environment"
fi
```

---

# 22. Bash Conditional Syntax `[[ ]]`

Preferred Bash syntax:

```bash
if [[ "$environment" == "production" ]]; then
    echo "Production"
fi
```

### Benefits

* Bash-specific
* More expressive
* Safer for many use cases

---

# 23. `case` Statement

```bash
case "$environment" in
    production)
        echo "Production"
        ;;
    staging)
        echo "Staging"
        ;;
    development)
        echo "Development"
        ;;
    *)
        echo "Unknown environment"
        ;;
esac
```

Useful for multiple choices.

---

# 24. Environment Selection Example

```bash
#!/bin/bash

environment="$1"

case "$environment" in
    production)
        echo "Deploying to production"
        ;;
    staging)
        echo "Deploying to staging"
        ;;
    development)
        echo "Deploying to development"
        ;;
    *)
        echo "Invalid environment"
        exit 1
        ;;
esac
```

---

# 25. Exit Status

Success:

```bash
exit 0
```

Failure:

```bash
exit 1
```

Example:

```bash
if [[ ! -f "$file" ]]; then
    echo "File not found"
    exit 1
fi
```

---

# 26. Production-Style Script

```bash
#!/bin/bash

set -euo pipefail

if [[ "$#" -ne 1 ]]; then
    printf "Usage: %s <environment>\n" "$0"
    exit 1
fi

environment="$1"

case "$environment" in
    production|staging|development)
        printf "Environment: %s\n" "$environment"
        ;;
    *)
        printf "Invalid environment: %s\n" "$environment"
        exit 1
        ;;
esac

printf "Deployment validation successful.\n"
```

---

# Practice Lab

## Task 1 — User Input

Create:

```bash
user.sh
```

Input:

```text
Enter your name:
Enter your age:
```

Output:

```text
Hello Hatim
You are 25 years old
```

---

## Task 2 — Even or Odd

Run:

```bash
./check.sh 10
```

Output:

```text
Even
```

Hint:

```bash
(( number % 2 == 0 ))
```

---

## Task 3 — File Checker

Run:

```bash
./check.sh app.log
```

Output:

```text
File exists
```

or

```text
File does not exist
```

---

## Task 4 — Directory Checker

Run:

```bash
./checkdir.sh /var/log
```

Check whether the directory exists.

---

## Task 5 — Environment Validator

Create:

```bash
validate.sh
```

Valid values:

```text
production
staging
development
```

Invalid values should:

* Print `Invalid environment`
* Exit with non-zero status

---

# Day 10 Commands & Concepts to Master

```text
#!/bin/bash

variables
read
$1
$2
$#
$@
$?
printf

if
elif
else
case

-e
-f
-d
-r
-w
-x

-eq
-ne
-gt
-ge
-lt
-le

==
!=
-z
-n

exit
```

---

# Mental Model

```text
Input
  │
  ├── Arguments
  └── User Input
        │
        ▼
     Variables
        │
        ▼
     Conditions
        │
   ┌────┴────┐
   ▼         ▼
 Success    Failure
   │         │
   ▼         ▼
 Command    exit 1
```

## Key Takeaway

You are no longer just executing Linux commands.

You are building automation logic around them, which is the foundation of DevOps, system administration, CI/CD pipelines, and infrastructure automation.
