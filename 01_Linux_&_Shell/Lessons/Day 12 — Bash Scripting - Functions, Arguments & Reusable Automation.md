# Day 12 — Bash Scripting: Functions, Arguments & Reusable Automation

## Bash Scripting — Functions, Arguments & Reusable Automation

Day 11 introduced loops and arrays for automation.

Today we focus on making scripts **reusable, maintainable, and production-ready** using functions, argument handling, logging, error handling, and cleanup techniques.

Instead of repeating commands:

```text
Script
 ├── check server
 ├── check service
 ├── check disk
 └── check server again
```

We create reusable functions:

```text
Function
   ↓
Reusable Logic
   ↓
Call Whenever Needed
```

---

# 🎯 Learning Objectives

By the end of this lesson, you will be able to:

* Create reusable Bash functions
* Pass arguments to functions
* Use local variables safely
* Return success and failure statuses
* Capture function output
* Build logging utilities
* Validate commands and services
* Handle cleanup with `trap`
* Organize scripts using `main()`
* Create maintainable DevOps automation scripts

---

# 1. What Is a Function?

A function is a named block of commands that can be executed whenever needed.

## Syntax

```bash
function_name() {
    commands
}
```

Example:

```bash
hello() {
    echo "Hello DevOps"
}
```

Call the function:

```bash
hello
```

Output:

```text
Hello DevOps
```

Alternative syntax:

```bash
function hello {
    echo "Hello DevOps"
}
```

Preferred style:

```bash
hello() {
    echo "Hello DevOps"
}
```

---

# 2. Why Functions Matter

Without functions:

```bash
echo "Checking server"
ping -c 1 server1

echo "Checking server"
ping -c 1 server2

echo "Checking server"
ping -c 1 server3
```

With functions:

```bash
check_server() {
    ping -c 1 "$1"
}

check_server server1
check_server server2
check_server server3
```

Benefits:

* Less duplication
* Easier maintenance
* Cleaner code
* Reusable logic

---

# 3. Function Arguments

Functions accept arguments similarly to scripts.

Example:

```bash
greet() {
    echo "Hello $1"
}
```

Call:

```bash
greet Hatim
```

Output:

```text
Hello Hatim
```

---

# 4. Multiple Arguments

```bash
deploy() {
    echo "Environment: $1"
    echo "Version: $2"
}
```

Call:

```bash
deploy production v1.5.0
```

Output:

```text
Environment: production
Version: v1.5.0
```

### Argument Variables

| Variable | Meaning             |
| -------- | ------------------- |
| `$1`     | First argument      |
| `$2`     | Second argument     |
| `$3`     | Third argument      |
| `$#`     | Number of arguments |
| `$@`     | All arguments       |

---

# 5. Using `"$@"` Inside Functions

Example:

```bash
print_args() {
    for arg in "$@"
    do
        echo "$arg"
    done
}
```

Call:

```bash
print_args one two three
```

Output:

```text
one
two
three
```

### Best Practice

Use:

```bash
"$@"
```

Instead of:

```bash
$@
```

This preserves argument boundaries.

---

# 6. Local Variables

Avoid:

```bash
deploy() {
    environment="production"
}
```

Preferred:

```bash
deploy() {
    local environment="production"
}
```

Example:

```bash
deploy() {
    local environment="$1"

    echo "Deploying to $environment"
}
```

Call:

```bash
deploy staging
```

Output:

```text
Deploying to staging
```

### Rule

Use:

```bash
local variable="value"
```

for temporary function variables.

---

# 7. Function Return Values

Functions typically return success or failure through exit status.

Example:

```bash
check_service() {
    systemctl is-active --quiet "$1"
}
```

Usage:

```bash
if check_service docker; then
    echo "Docker is running"
else
    echo "Docker is not running"
fi
```

---

# 8. Using `return`

Example:

```bash
check_number() {
    if [[ "$1" -gt 10 ]]; then
        return 0
    else
        return 1
    fi
}
```

Usage:

```bash
if check_number 15; then
    echo "Number is greater than 10"
else
    echo "Number is 10 or less"
fi
```

### Exit Status

| Code     | Meaning |
| -------- | ------- |
| `0`      | Success |
| Non-zero | Failure |

---

# 9. Returning Text

Incorrect:

```bash
get_environment() {
    return "production"
}
```

Correct:

```bash
get_environment() {
    echo "production"
}
```

Capture output:

```bash
environment=$(get_environment)

echo "$environment"
```

Output:

```text
production
```

This technique is called **command substitution**.

---

# 10. Functions with Command Substitution

```bash
get_date() {
    date +"%Y-%m-%d"
}

today=$(get_date)

echo "Today: $today"
```

Output:

```text
Today: 2026-09-08
```

---

# 11. Logging Functions

Basic logger:

```bash
log() {
    echo "[INFO] $1"
}
```

Usage:

```bash
log "Starting deployment"
log "Checking Docker"
log "Deployment completed"
```

Output:

```text
[INFO] Starting deployment
[INFO] Checking Docker
[INFO] Deployment completed
```

---

# 12. Multiple Log Levels

```bash
info() {
    echo "[INFO] $1"
}

warning() {
    echo "[WARNING] $1"
}

error() {
    echo "[ERROR] $1"
}
```

Usage:

```bash
info "Starting deployment"
warning "Disk usage is high"
error "Deployment failed"
```

---

# 13. Logging with Timestamps

```bash
log() {
    local level="$1"
    local message="$2"

    printf '[%s] [%s] %s\n' \
        "$(date '+%Y-%m-%d %H:%M:%S')" \
        "$level" \
        "$message"
}
```

Usage:

```bash
log INFO "Starting deployment"
log WARNING "Disk usage is high"
log ERROR "Deployment failed"
```

Example Output:

```text
[2026-09-08 18:40:00] [INFO] Starting deployment
[2026-09-08 18:40:01] [WARNING] Disk usage is high
[2026-09-08 18:40:02] [ERROR] Deployment failed
```

---

# 14. Check Whether a Command Exists

```bash
command_exists() {
    command -v "$1" > /dev/null 2>&1
}
```

Usage:

```bash
if command_exists docker; then
    echo "Docker is installed"
else
    echo "Docker is not installed"
fi
```

Useful for:

```text
docker
kubectl
helm
aws
git
curl
```

---

# 15. Service Health Check Function

```bash
check_service() {
    local service="$1"

    if systemctl is-active --quiet "$service"; then
        echo "$service is running"
        return 0
    else
        echo "$service is NOT running"
        return 1
    fi
}
```

Usage:

```bash
check_service docker
check_service ssh
```

---

# 16. Functions + Loops

```bash
check_service() {
    local service="$1"

    if systemctl is-active --quiet "$service"; then
        echo "$service: OK"
    else
        echo "$service: FAILED"
    fi
}

services=("docker" "ssh")

for service in "${services[@]}"
do
    check_service "$service"
done
```

### Mental Model

```text
Array
  ↓
Loop
  ↓
Function
  ↓
Check Service
  ↓
Result
```

---

# 17. Function Argument Validation

```bash
deploy() {
    if [[ "$#" -ne 2 ]]; then
        echo "Usage: deploy <environment> <version>"
        return 1
    fi

    local environment="$1"
    local version="$2"

    echo "Deploying $version to $environment"
}
```

Correct:

```bash
deploy production v1.2.0
```

Output:

```text
Deploying v1.2.0 to production
```

---

# 18. Safer Scripts with `set -euo pipefail`

```bash
set -euo pipefail
```

Meaning:

| Option     | Description                         |
| ---------- | ----------------------------------- |
| `-e`       | Exit when a command fails           |
| `-u`       | Error on unset variables            |
| `pipefail` | Pipeline fails if any command fails |

Example:

```bash
#!/bin/bash

set -euo pipefail

deploy() {
    local environment="$1"
    echo "Deploying to $environment"
}

deploy production
```

---

# 19. Introduction to `trap`

Execute cleanup logic automatically when a script exits.

Example:

```bash
cleanup() {
    echo "Cleaning up..."
}

trap cleanup EXIT
```

---

# 20. Cleanup Temporary Files

```bash
#!/bin/bash

set -euo pipefail

temp_dir=$(mktemp -d)

cleanup() {
    rm -rf "$temp_dir"
}

trap cleanup EXIT

echo "Temporary directory: $temp_dir"
```

When the script exits, the temporary directory is removed.

---

# 21. Handling Signals

Common signals:

| Signal    | Meaning             |
| --------- | ------------------- |
| `SIGINT`  | Ctrl+C              |
| `SIGTERM` | Termination request |
| `EXIT`    | Script exits        |

Example:

```bash
cleanup() {
    echo "Cleaning up before exit..."
}

trap cleanup EXIT INT TERM
```

---

# 22. Real DevOps Utility Script

```bash
#!/bin/bash

set -euo pipefail

info() {
    printf '[INFO] %s\n' "$1"
}

error() {
    printf '[ERROR] %s\n' "$1" >&2
}

command_exists() {
    command -v "$1" > /dev/null 2>&1
}

check_service() {
    local service="$1"

    if systemctl is-active --quiet "$service"; then
        info "$service is running"
        return 0
    fi

    error "$service is not running"
    return 1
}

main() {
    local services=("ssh" "docker")

    info "Starting system health check"

    for service in "${services[@]}"
    do
        check_service "$service" || true
    done

    if command_exists docker; then
        info "Docker command found"
    else
        error "Docker command not found"
    fi

    info "Health check completed"
}

main "$@"
```

---

# 23. Why Use `main()`?

Pattern:

```bash
main() {
    ...
}

main "$@"
```

Benefits:

* Clear entry point
* Better organization
* Easier maintenance
* Cleaner structure

---

# 24. Recommended Script Layout

```bash
#!/bin/bash

set -euo pipefail

# Global Configuration

# Functions

log() {
    ...
}

validate_args() {
    ...
}

deploy() {
    ...
}

cleanup() {
    ...
}

main() {
    ...
}

trap cleanup EXIT

main "$@"
```

Think of a Bash script as a small program rather than a collection of commands.

---

# 🧪 Practice Lab

## Exercise 1 — Greeting Function

Create:

```bash
greet() {
    ...
}
```

Output:

```text
Hello Hatim
```

---

## Exercise 2 — Addition Function

Create:

```bash
add() {
    ...
}
```

Hint:

```bash
echo $(( $1 + $2 ))
```

Expected:

```text
30
```

---

## Exercise 3 — Command Checker

Create:

```bash
command_exists()
```

Check:

```text
docker
kubectl
helm
git
```

---

## Exercise 4 — Service Checker

Create:

```bash
check_service()
```

Check:

```text
ssh
docker
```

---

## Exercise 5 — Logging Function

Create:

```bash
log() {
    ...
}
```

Output:

```text
[INFO] Starting deployment
```

Then add timestamps.

---

## Exercise 6 — Cleanup Script

Use:

```bash
temp_dir=$(mktemp -d)
```

and:

```bash
trap cleanup EXIT
```

to automatically remove temporary files.

---

## Exercise 7 — Final Challenge

Build:

```bash
system-health.sh
```

Requirements:

1. Check required commands
2. Check Docker
3. Check SSH
4. Check disk usage
5. Print timestamps
6. Return failure on critical issues
7. Use functions
8. Use arrays
9. Use loops
10. Use `trap`

---

# 📚 Day 12 Master Concepts

| Concept             | Purpose                   |
| ------------------- | ------------------------- |
| `function()`        | Define reusable logic     |
| `$1`, `$2`          | Function arguments        |
| `$#`                | Number of arguments       |
| `"$@"`              | All arguments             |
| `local`             | Function-scoped variables |
| `return 0`          | Success                   |
| `return 1`          | Failure                   |
| `$(function)`       | Capture output            |
| `main()`            | Script entry point        |
| `trap`              | Cleanup & signal handling |
| `command -v`        | Command validation        |
| `set -euo pipefail` | Safer scripting           |

---

# 🧠 Day 12 Mental Model

```text
Day 10
Input
  ↓
Variables
  ↓
Conditions
```

```text
Day 11
Input
  ↓
Variables
  ↓
Conditions
  ↓
Loops
  ↓
Arrays
```

```text
Day 12
Input
  ↓
Variables
  ↓
Conditions
  ↓
Loops
  ↓
Functions
  ↓
Reusable Automation
  ↓
Error Handling & Cleanup
```

## Key Takeaway

Bash has evolved from simple command execution into a powerful automation language.

With functions, logging, validation, cleanup, and structured scripts, you now have the foundation for building real-world DevOps and system administration automation.
