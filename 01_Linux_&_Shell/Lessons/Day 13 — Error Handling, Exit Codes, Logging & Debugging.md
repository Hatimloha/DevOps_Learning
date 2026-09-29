# Day 13 — Error Handling, Exit Codes, Logging & Debugging

## Bash Scripting — Error Handling, Exit Codes, Logging & Debugging

Day 12 focused on **functions and reusable automation**.

Today we focus on one of the most important DevOps skills:

> **What happens when your script fails?**

A production script shouldn't simply crash and leave you wondering what happened.

You want:

```text
Command Fails
     ↓
Detect Failure
     ↓
Log Useful Information
     ↓
Clean Up
     ↓
Exit With Correct Status
```

---

# 🎯 Learning Objectives

By the end of this lesson, you will be able to:

* Understand Linux exit codes
* Use `$?` to inspect command status
* Properly use `exit` and `return`
* Apply `set -euo pipefail`
* Implement explicit error handling
* Create production-style logging
* Send errors to stderr
* Debug Bash scripts with `set -x`
* Use `trap` for cleanup and error handling
* Build reliable DevOps automation scripts

---

# 1. Exit Codes

Every Linux command returns an **exit status**.

Typically:

```text
0      → Success
Non-zero → Failure
```

Example:

```bash
echo "Hello"
echo $?
```

Output:

```text
Hello
0
```

Failed command:

```bash
ls /does-not-exist
echo $?
```

Example output:

```text
2
```

The exact non-zero value depends on the command.

---

# 2. Understanding `$?`

`$?` contains the exit status of the **most recently executed command**.

Example:

```bash
mkdir test
echo $?
```

Output:

```text
0
```

### Important

```bash
mkdir test
echo $?

echo "Done"
echo $?
```

The second `$?` refers to:

```bash
echo "Done"
```

not `mkdir`.

Capture immediately when needed:

```bash
mkdir test

status=$?

echo "Status: $status"
```

---

# 3. Using Exit Codes in Conditions

Preferred approach:

```bash
if mkdir test
then
    echo "Directory created"
else
    echo "Failed to create directory"
fi
```

Instead of:

```bash
mkdir test

if [[ "$?" -eq 0 ]]
then
    echo "Success"
fi
```

Using the command directly is cleaner and easier to read.

---

# 4. Using `exit`

`exit` terminates the script and returns a status code.

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
#!/bin/bash

if [[ ! -f "config.txt" ]]; then
    echo "config.txt not found"
    exit 1
fi

echo "Configuration found"
```

---

# 5. Why Exit Codes Matter in DevOps

Example workflow:

```text
CI/CD Pipeline
      ↓
 deploy.sh
      ↓
Deployment Fails
```

Incorrect behavior:

```text
Deployment Fails
      ↓
exit 0
      ↓
Pipeline Thinks Success
```

Correct behavior:

```text
Deployment Fails
      ↓
exit 1
      ↓
Pipeline Detects Failure
      ↓
Pipeline Stops
```

### Common Uses

* CI/CD pipelines
* Docker automation
* Kubernetes automation
* AWS automation
* Cron jobs
* Monitoring scripts
* Deployment scripts

---

# 6. `return` vs `exit`

This distinction is critical.

## `return`

Used inside functions:

```bash
check_docker() {
    if command -v docker > /dev/null 2>&1; then
        return 0
    fi

    return 1
}
```

## `exit`

Terminates the entire script:

```bash
if [[ ! -f "$config" ]]; then
    echo "Missing configuration"
    exit 1
fi
```

### Mental Model

```text
return → Leave Function

exit   → Leave Script
```

---

# 7. Using `set -e`

```bash
set -e
```

Causes Bash to exit when a command fails in many ordinary command contexts.

Example:

```bash
#!/bin/bash

set -e

echo "Step 1"

mkdir /invalid/location

echo "Step 2"
```

If `mkdir` fails, the script exits before Step 2.

---

# 8. Important Warning About `set -e`

Do **not** assume:

> "`set -e` catches every possible error."

Important exceptions include:

* `if`
* `while`
* `until`
* `&&`
* `||`
* pipelines
* some function contexts

Example:

```bash
if false; then
    echo "Won't execute"
fi

echo "Script continues"
```

Production scripts still require deliberate error handling.

---

# 9. Using `set -u`

```bash
set -u
```

Treats unset variables as errors.

Example:

```bash
#!/bin/bash

set -u

echo "$NAME"
```

If `NAME` is undefined, Bash reports an error.

Useful for catching typos:

```bash
environment="production"

echo "$enviroment"
```

Without `set -u`, this could silently expand to an empty string.

---

# 10. Using `set -o pipefail`

Pipeline example:

```bash
command1 | command2
```

Normally:

```bash
false | true

echo $?
```

Result:

```text
0
```

Because the last command succeeded.

Enable:

```bash
set -o pipefail
```

Now:

```bash
false | true

echo $?
```

Returns a non-zero status because part of the pipeline failed.

---

# 11. `set -euo pipefail`

Common Bash baseline:

```bash
set -euo pipefail
```

Meaning:

```text
-e       → Stop on many command failures
-u       → Detect unset variables
pipefail → Detect failures inside pipelines
```

Example:

```bash
#!/bin/bash

set -euo pipefail

echo "Starting deployment"
```

---

# 12. Explicit Error Handling

Preferred for important operations:

```bash
if ! systemctl restart nginx; then
    echo "ERROR: Failed to restart nginx"
    exit 1
fi
```

Meaning:

```text
If Command Fails
       ↓
Run Error Block
```

---

# 13. Error Handling with `||`

```bash
systemctl restart nginx || {
    echo "Failed to restart nginx"
    exit 1
}
```

One-line example:

```bash
docker build -t myapp:latest . || exit 1
```

---

# 14. Using `&&` and `||`

Run second command only if first succeeds:

```bash
mkdir backup && echo "Backup directory created"
```

Run second command only if first fails:

```bash
systemctl is-active --quiet nginx || echo "Nginx is down"
```

---

# 15. Common Bash Mistake

Avoid:

```bash
command && success || failure
```

Example:

```bash
some_command && echo "Success" || echo "Failure"
```

If the success command fails, the failure branch may still execute.

Safer approach:

```bash
if some_command; then
    echo "Success"
else
    echo "Failure"
fi
```

---

# 16. Logging

Basic logging:

```bash
echo "[INFO] Starting deployment"
```

Reusable logger:

```bash
log() {
    printf '[INFO] %s\n' "$1"
}
```

Usage:

```bash
log "Starting deployment"
log "Building Docker image"
log "Deployment completed"
```

---

# 17. Logging Errors to stderr

```bash
error() {
    printf '[ERROR] %s\n' "$1" >&2
}
```

Usage:

```bash
error "Docker build failed"
```

### Why `>&2`?

```text
stdout → Normal Output
stderr → Errors
```

This allows callers to separate normal output from error messages.

---

# 18. Timestamped Logging

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
[2026-09-11 22:20:10] [INFO] Starting deployment
[2026-09-11 22:20:11] [WARNING] Disk usage is high
[2026-09-11 22:20:12] [ERROR] Deployment failed
```

---

# 19. Logging to a File

Redirect both stdout and stderr:

```bash
./deploy.sh >> deploy.log 2>&1
```

Meaning:

```text
>> deploy.log
      ↓
Append stdout

2>&1
      ↓
Redirect stderr to stdout
```

Everything goes into:

```text
deploy.log
```

---

# 20. Debugging with `set -x`

Enable execution tracing:

```bash
set -x
```

Example:

```bash
#!/bin/bash

set -x

name="Hatim"
echo "Hello $name"
mkdir test
```

Example output:

```text
+ name=Hatim
+ echo 'Hello Hatim'
Hello Hatim
+ mkdir test
```

---

# 21. Disable Debugging

```bash
set +x
```

Example:

```bash
set -x

echo "Debug this section"

set +x

echo "Normal output"
```

---

# 22. Run Scripts in Debug Mode

Without modifying the script:

```bash
bash -x deploy.sh
```

Other useful options:

```bash
bash -u deploy.sh
bash -e deploy.sh
```

---

# 23. Cleanup with `trap`

```bash
cleanup() {
    echo "Cleaning up..."
}

trap cleanup EXIT
```

Useful when scripts create:

* Temporary files
* Temporary directories
* Lock files
* Background processes
* Mounted resources

---

# 24. Error Handling with `trap`

Example:

```bash
error_handler() {
    echo "Script failed"
}

trap error_handler ERR
```

Improved version:

```bash
error_handler() {
    local exit_code=$?

    echo "[ERROR] Script failed with exit code: $exit_code" >&2
    exit "$exit_code"
}

trap error_handler ERR
```

---

# 25. Using `BASH_LINENO`

```bash
error_handler() {
    local exit_code=$?

    echo "[ERROR] Exit code: $exit_code" >&2
    echo "[ERROR] Line: ${BASH_LINENO[0]}" >&2

    exit "$exit_code"
}

trap error_handler ERR
```

Helpful for identifying where failures occur.

---

# 26. Production Error Handler

```bash
#!/bin/bash

set -Eeuo pipefail

error_handler() {
    local exit_code=$?

    printf '[ERROR] Command failed\n' >&2
    printf '[ERROR] Exit code: %s\n' "$exit_code" >&2
    printf '[ERROR] Line: %s\n' "${BASH_LINENO[0]}" >&2

    exit "$exit_code"
}

trap error_handler ERR

echo "Starting script"

false

echo "This won't normally execute"
```

### Why `-E`?

```bash
set -E
```

Enables `errtrace`, helping `ERR` traps propagate into functions and additional contexts.

---

# 27. Real DevOps Deployment Skeleton

```bash
#!/bin/bash

set -Eeuo pipefail

log() {
    local level="$1"
    local message="$2"

    printf '[%s] [%s] %s\n' \
        "$(date '+%Y-%m-%d %H:%M:%S')" \
        "$level" \
        "$message"
}

error_handler() {
    local exit_code=$?

    log ERROR "Command failed with exit code $exit_code"
    log ERROR "Failure near line ${BASH_LINENO[0]}"

    exit "$exit_code"
}

cleanup() {
    log INFO "Running cleanup"
}

trap error_handler ERR
trap cleanup EXIT

build() {
    log INFO "Building application"
}

test() {
    log INFO "Running tests"
}

deploy() {
    local environment="$1"

    log INFO "Deploying to $environment"
}

main() {
    if [[ "$#" -ne 1 ]]; then
        log ERROR "Usage: $0 <environment>"
        exit 1
    fi

    local environment="$1"

    build
    test
    deploy "$environment"

    log INFO "Deployment completed successfully"
}

main "$@"
```

---

# 🧪 Practice Lab

## Exercise 1 — Exit Codes

Create:

```bash
#!/bin/bash

mkdir test-directory

echo "Exit code: $?"
```

Then intentionally trigger an error and inspect the exit code.

---

## Exercise 2 — `set -e`

```bash
#!/bin/bash

set -e

echo "Step 1"
false
echo "Step 2"
```

Observe what happens.

---

## Exercise 3 — Pipeline Failure

Run:

```bash
false | true

echo $?
```

Then:

```bash
set -o pipefail

false | true

echo $?
```

Compare results.

---

## Exercise 4 — Debugging

Create:

```bash
#!/bin/bash

name="Hatim"
environment="production"

echo "Deploying $name to $environment"
```

Run:

```bash
bash -x script.sh
```

Study the output.

---

## Exercise 5 — Error Handler

Create:

```bash
error_handler() {
    ...
}

trap error_handler ERR
```

Print:

* Exit code
* Line number
* Error message

---

## Exercise 6 — Cleanup

Create:

```bash
temp_dir=$(mktemp -d)
```

Use:

```bash
trap cleanup EXIT
```

Verify cleanup occurs automatically.

---

# 📚 Day 13 Master Concepts

| Concept    | Purpose                         |
| ---------- | ------------------------------- |
| `$?`       | Previous command exit status    |
| `exit 0`   | Script success                  |
| `exit 1`   | Script failure                  |
| `return`   | Return from function            |
| `set -e`   | Exit on many unhandled failures |
| `set -u`   | Detect unset variables          |
| `pipefail` | Detect pipeline failures        |
| `set -x`   | Debug execution                 |
| `bash -n`  | Syntax validation               |
| `bash -x`  | Execution tracing               |
| `trap`     | Handle signals/events           |
| `ERR`      | Handle command failures         |
| `EXIT`     | Cleanup on exit                 |
| `>&2`      | Send output to stderr           |

---

# 🧠 DevOps Mental Model

```text
                 Bash Script
                     │
          ┌──────────┴──────────┐
          │                     │
       Input                  Config
          │                     │
          └──────────┬──────────┘
                     ↓
                 Functions
                     ↓
                 Conditions
                     ↓
                   Loops
                     ↓
                  Commands
                     ↓
               Exit Status
                     │
             ┌───────┴───────┐
             ↓               ↓
          Success         Failure
             │               │
             ↓               ↓
          Continue     Error Handler
                             │
                             ↓
                            Logs
                             │
                             ↓
                          Cleanup
                             │
                             ↓
                         Exit Code
```

## Key Takeaway

Your Bash journey has evolved through four major stages:

```text
Day 10 → Conditions & Arguments
Day 11 → Loops & Arrays
Day 12 → Functions & Reusable Automation
Day 13 → Error Handling, Logging & Debugging
```

At this stage, Bash scripts should be treated as **small production programs**, built with proper validation, logging, debugging, cleanup, and failure handling.
