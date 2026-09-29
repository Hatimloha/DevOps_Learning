# Day 16 — Bash Automation & Real DevOps Scripts

A practical DevOps study guide for turning Bash knowledge into safe, production-oriented automation: preflight checks, system health monitoring, backups, deployment workflows, idempotency, and dry-run design.

## Learning Goals

By the end of this lesson, you should be able to:

- Design production-oriented Bash scripts
- Perform preflight/dependency checks
- Monitor disk, memory, CPU/load, services, ports, and HTTP endpoints
- Build reusable health-check functions
- Automate backups and cleanup
- Structure deployment scripts with validation, build, test, deploy, and health-check stages
- Use environment variables and script arguments safely
- Understand idempotency and dry-run concepts
- Collect failures instead of stopping at the first health-check failure
- Apply practical Bash safety habits

---

Day 15 focused on **text processing and log analysis**. Today we start combining everything you've learned into **real DevOps automation**.

The goal is not just to know Bash syntax. The goal is to write scripts that can answer:

-  Is the server healthy? 
-  Is a service running? 
-  Is disk usage too high? 
-  Is memory usage too high? 
-  Is CPU overloaded? 
-  Is a required command installed? 
-  Should an alert be generated? 
-  Can we safely create a backup? 
-  Did a deployment succeed? 

---

# 1. What Makes a DevOps Script?

A production-oriented script usually follows this flow:

```
```

```
Input
  ↓
Validate
  ↓
Collect information
  ↓
Check conditions
  ↓
Take action
  ↓
Log result
  ↓
Exit with correct status
```

For example:

```
```

```
system-health.sh
       ↓
Check disk
       ↓
Check memory
       ↓
Check CPU
       ↓
Check services
       ↓
Generate report
       ↓
exit 0 / exit 1
```

This is the mindset we want to develop.

---

# 2. Standard Script Structure

A good Bash automation script can start like this:

```
```

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

main() {
    log INFO "Starting script"

    # automation logic

    log INFO "Script completed"
}

main "$@"
```

You already know almost every part of this from Days 10–13.

Today we're going to **use it practically**.

---

# 3. Script 1 — Check Required Commands

Suppose your automation requires:

```
```

```
docker
curl
git
systemctl
```

Before doing anything, verify they exist.

```
```

```
command_exists() {
    command -v "$1" >/dev/null 2>&1
}
```

Then:

```
```

```bash
for command in docker curl git systemctl
do
    if command_exists "$command"; then
        echo "[OK] $command is installed"
    else
        echo "[ERROR] $command is missing"
    fi
done
```

### Why this matters

Imagine a deployment script starts with:

```
```

```bash
docker build ...
```

but Docker isn't installed.

Instead of producing a confusing failure later, your script can immediately say:

```
```

```
[ERROR] docker is missing
```

This is called **preflight validation**.

---

# 4. Preflight Checks

Before deployment, you might check:

```
```

```
✓ Required commands
✓ Required files
✓ Environment variables
✓ Disk space
✓ Network connectivity
✓ Credentials/configuration
✓ Target environment
```

Example:

```
```

```bash
if ! command -v docker >/dev/null 2>&1; then
    echo "ERROR: Docker is required"
    exit 1
fi
```

---

# 5. Script 2 — Disk Usage Check

Linux provides filesystem information through:

```
```

```bash
df -h
```

Example:

```
```

```
Filesystem      Size  Used Avail Use%
/dev/sda1        50G   38G   12G  77%
```

You can extract the usage percentage:

```
```

```bash
df -h / | awk 'NR==2 {print $5}'
```

Result:

```
```

```
77%
```

Remove `%`:

```
```

```bash
df -h / | awk 'NR==2 {gsub("%","",$5); print $5}'
```

Result:

```
```

```
77
```

---

# 6. Disk Alert Script

```
```

```bash
#!/bin/bash

set -euo pipefail

THRESHOLD=80

usage=$(df -P / | awk 'NR==2 {gsub("%","",$5); print $5}')

echo "Disk usage: ${usage}%"

if (( usage >= THRESHOLD )); then
    echo "WARNING: Disk usage is high"
    exit 1
else
    echo "OK: Disk usage is normal"
fi
```

Run:

```
```

```bash
./disk-check.sh
```

Possible output:

```
```

```
Disk usage: 72%
OK: Disk usage is normal
```

---

# 7. Why `df -P`?

You may have noticed:

```
```

```bash
df -P /
```

The `-P` option requests a more predictable POSIX-style format.

That's useful when parsing command output with `awk`.

This reinforces an important principle:

> When scripting, prefer predictable/machine-friendly output.

---

# 8. Script 3 — Memory Check

Linux memory information can be found using:

```
```

```bash
free -m
```

Example:

```
```

```
               total   used   free
Mem:            16000  12000  2000
```

A simple way to calculate memory usage:

```
```

```bash
free -m | awk '/^Mem:/ {printf "%.0f", ($3/$2)*100}'
```

This gives a percentage.

Example:

```
```

```
75
```

Then:

```
```

```
memory_usage=$(free -m | awk '/^Mem:/ {printf "%.0f", ($3/$2)*100}')

echo "Memory usage: ${memory_usage}%"

if (( memory_usage >= 80 )); then
    echo "WARNING: High memory usage"
fi
```

---

# 9. Script 4 — CPU Load

You can inspect CPU/load information with:

```
```

```bash
uptime
```

Example:

```
```

```
14:30:00 up 10 days,  4 users,  load average: 1.20, 0.80, 0.60
```

These values represent load averages over:

```
```

```
1 minute
5 minutes
15 minutes
```

You can inspect them using:

```
```

```bash
awk '{print $(NF-2), $(NF-1), $NF}' <<< "$(uptime)"
```

However, for automation, `/proc/loadavg` is often easier:

```
```

```bash
cat /proc/loadavg
```

Example:

```
```

```
1.20 0.80 0.60 2/500 12345
```

Get the 1-minute load:

```
```

```bash
awk '{print $1}' /proc/loadavg
```

---

# 10. CPU Load vs CPU Percentage

This distinction is important.

### CPU utilization

Answers:

> How busy is the CPU?

### Load average

Answers more broadly:

> How much work is waiting/running relative to the system's CPU capacity?

Load average isn't simply a CPU percentage.

For production monitoring, tools such as:

```
```

```
top
htop
vmstat
mpstat
```

give more complete information.

---

# 11. Script 5 — Service Health Check

You already learned:

```
```

```bash
systemctl is-active --quiet nginx
```

Use it in a script:

```
```

```bash
check_service() {
    local service="$1"

    if systemctl is-active --quiet "$service"; then
        echo "[OK] $service is running"
        return 0
    else
        echo "[ERROR] $service is not running"
        return 1
    fi
}
```

Then:

```
```

```bash
check_service nginx
```

Or multiple services:

```
```

```
services=("ssh" "nginx" "docker")

for service in "${services[@]}"
do
    check_service "$service"
done
```

This combines:

```
```

```
Day 11 → arrays + loops
Day 12 → functions
Day 13 → exit codes
Day 16 → automation
```

---

# 12. Important: Don't Stop at `systemctl`

A service can be "running" but the application can still be broken.

For example:

```
```

```bash
systemctl → running
```

but:

```
```

```
HTTP → 500
```

So production health checks often happen at multiple levels:

```
```

```
Process
   ↓
Service
   ↓
Port
   ↓
Application
   ↓
Dependency
```

Example:

```
```

```bash
systemctl is-active --quiet nginx
```

then:

```
```

```bash
curl -f http://localhost/
```

---

# 13. Script 6 — HTTP Health Check

```
```

```bash
check_http() {
    local url="$1"

    if curl -fsS "$url" >/dev/null; then
        echo "[OK] $url"
        return 0
    else
        echo "[ERROR] $url"
        return 1
    fi
}
```

Run:

```
```

```bash
check_http "http://localhost"
```

### What do these options mean?

```
```

```
-f → fail on HTTP errors
-s → silent
-S → still show errors
```

This is much better for scripts than simply:

```
```

```bash
curl http://localhost
```

---

# 14. Script 7 — Port Check

You previously learned:

```
```

```bash
ss -tuln
```

You can check whether something is listening:

```
```

```bash
if ss -ltn | grep -q ':80 '; then
    echo "[OK] Port 80 is listening"
else
    echo "[ERROR] Port 80 is not listening"
fi
```

Notice:

```
```

```
grep -q
```

`-q` means **quiet**.

We don't need the matching text.

We only care about the exit status:

```
```

```
0 → found
non-zero → not found
```

This is a very important Bash automation pattern.

---

# 15. Script 8 — System Health Check

Now let's combine everything.

Create:

```
```

```
system-health.sh
```

```
```

```bash
#!/bin/bash

set -Eeuo pipefail

DISK_THRESHOLD=80
MEMORY_THRESHOLD=80

log() {
    local level="$1"
    local message="$2"

    printf '[%s] [%s] %s\n' \
        "$(date '+%Y-%m-%d %H:%M:%S')" \
        "$level" \
        "$message"
}

check_disk() {
    local usage

    usage=$(df -P / | awk 'NR==2 {gsub("%","",$5); print $5}')

    log INFO "Disk usage: ${usage}%"

    if (( usage >= DISK_THRESHOLD )); then
        log ERROR "Disk usage is too high"
        return 1
    fi

    log INFO "Disk usage is healthy"
}

check_memory() {
    local usage

    usage=$(free -m | awk '/^Mem:/ {printf "%.0f", ($3/$2)*100}')

    log INFO "Memory usage: ${usage}%"

    if (( usage >= MEMORY_THRESHOLD )); then
        log ERROR "Memory usage is too high"
        return 1
    fi

    log INFO "Memory usage is healthy"
}

check_service() {
    local service="$1"

    if systemctl is-active --quiet "$service"; then
        log INFO "$service is running"
    else
        log ERROR "$service is not running"
        return 1
    fi
}

main() {
    log INFO "Starting system health check"

    check_disk
    check_memory

    check_service ssh

    log INFO "System health check completed"
}

main "$@"
```

Run:

```
```

```
chmod +x system-health.sh
./system-health.sh
```

---

# 16. One Problem With This Script

Because we use:

```
```

```bash
set -e
```

if:

```
```

```bash
check_disk
```

fails, the script may exit immediately.

That can be desirable for some scripts.

But for a **health-check script**, you may want:

```
```

```
Check everything
    ↓
Disk → FAIL
    ↓
Memory → OK
    ↓
SSH → OK
    ↓
Final result → FAIL
```

rather than stopping at the first failure.

So we can deliberately collect failures.

---

# 17. Better Health Check Design

```
```

```
failures=0

if ! check_disk; then
    ((failures+=1))
fi

if ! check_memory; then
    ((failures+=1))
fi

if ! check_service ssh; then
    ((failures+=1))
fi

if (( failures > 0 )); then
    log ERROR "$failures health checks failed"
    exit 1
fi

log INFO "All health checks passed"
exit 0
```

This is a better pattern for monitoring scripts.

---

# 18. Script 9 — Backup Automation

Now let's create a practical backup script.

Goal:

```
```

```
Source directory
      ↓
Create compressed archive
      ↓
Store backup
      ↓
Verify backup
      ↓
Report result
```

Example:

```
```

```bash
#!/bin/bash

set -Eeuo pipefail

SOURCE="/etc"
BACKUP_DIR="/tmp/backups"

mkdir -p "$BACKUP_DIR"

timestamp=$(date '+%Y-%m-%d_%H-%M-%S')
backup_file="$BACKUP_DIR/etc-$timestamp.tar.gz"

tar -czf "$backup_file" "$SOURCE"

if [[ -f "$backup_file" ]]; then
    echo "Backup created: $backup_file"
else
    echo "ERROR: Backup failed" >&2
    exit 1
fi
```

---

# 19. Why Quote Variables?

Always prefer:

```
```

```bash
tar -czf "$backup_file" "$SOURCE"
```

instead of:

```
```

```bash
tar -czf $backup_file $SOURCE
```

Suppose:

```
```

```
SOURCE="/home/my application"
```

Without quotes, Bash can interpret it as two arguments.

With quotes:

```
```

```
"$SOURCE"
```

it remains one argument.

This is one of the most important Bash safety habits.

---

# 20. Backup Cleanup

Suppose backups should be kept for seven days.

You can use:

```
```

```bash
find "$BACKUP_DIR" \
    -type f \
    -name '*.tar.gz' \
    -mtime +7 \
    -delete
```

Meaning:

```
```

```bash
find backup directory
    ↓
files only
    ↓
.tar.gz
    ↓
older than 7 days
    ↓
delete
```

### Be careful

`-delete` is destructive.

Always test first:

```
```

```bash
find "$BACKUP_DIR" \
    -type f \
    -name '*.tar.gz' \
    -mtime +7
```

Verify the output before adding:

```
```

```
-delete
```

---

# 21. Script 10 — Deployment Automation

Now we move closer to DevOps.

Imagine a simple deployment:

```
```

```
Validate
   ↓
Pull code
   ↓
Build
   ↓
Test
   ↓
Deploy
   ↓
Health check
```

A simplified script:

```
```

```bash
#!/bin/bash

set -Eeuo pipefail

log() {
    printf '[%s] %s\n' \
        "$(date '+%Y-%m-%d %H:%M:%S')" \
        "$1"
}

validate() {
    command -v git >/dev/null 2>&1
    command -v docker >/dev/null 2>&1
}

build() {
    log "Building application"
    docker build -t myapp:latest .
}

test() {
    log "Running tests"
    ./run-tests.sh
}

deploy() {
    log "Deploying application"

    docker stop myapp 2>/dev/null || true
    docker rm myapp 2>/dev/null || true

    docker run -d \
        --name myapp \
        -p 8080:8080 \
        myapp:latest
}

health_check() {
    log "Checking application"

    curl -fsS http://localhost:8080/health >/dev/null
}

main() {
    log "Starting deployment"

    validate
    build
    test
    deploy
    health_check

    log "Deployment successful"
}

main "$@"
```

This is obviously simplified, but the **architecture** is important.

---

# 22. Why `|| true`?

Consider:

```
```

```bash
docker stop myapp
```

If the container doesn't exist:

```
```

```bash
docker stop → failure
```

With:

```
```

```bash
set -e
```

the script could stop.

We intentionally write:

```
```

```bash
docker stop myapp 2>/dev/null || true
```

Meaning:

> Try to stop it; if it isn't running, that's acceptable.

This is an example of **intentional error handling**.

Don't blindly add `|| true` everywhere.

Use it only when failure is genuinely acceptable.

---

# 23. Script Arguments

Deployment scripts should usually accept configuration.

Instead of hardcoding:

```
```

```bash
environment="production"
```

use:

```
```

```bash
environment="${1:-development}"
```

Then:

```
```

```bash
./deploy.sh production
```

gives:

```
```

```bash
environment=production
```

Without an argument:

```
```

```bash
./deploy.sh
```

uses:

```
```

```
development
```

---

# 24. Validate Environment

Never blindly deploy based on arbitrary input.

```
```

```bash
case "$environment" in
    development|staging|production)
        ;;
    *)
        echo "Invalid environment: $environment" >&2
        exit 1
        ;;
esac
```

This protects your automation from unexpected values.

---

# 25. Environment Variables

A more DevOps-friendly approach:

```
```

```bash
IMAGE_NAME="${IMAGE_NAME:-myapp}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
ENVIRONMENT="${ENVIRONMENT:-development}"
```

Then:

```
```

```bash
IMAGE_NAME=myapp IMAGE_TAG=v1.5.0 ENVIRONMENT=staging ./deploy.sh
```

This pattern is extremely common in:

-  CI/CD 
-  Docker 
-  Kubernetes 
-  GitHub Actions 
-  GitLab CI 
-  Jenkins 
-  AWS automation 

---

# 26. Script Design — Separate Responsibilities

Avoid writing a 500-line script where everything is mixed together.

Instead:

```
```

```
main
 │
 ├── validate
 │
 ├── collect
 │
 ├── check
 │
 ├── action
 │
 └── report
```

For example:

```
```

```bash
main() {
    validate_environment
    validate_dependencies
    backup
    deploy
    health_check
    report
}
```

This makes the script:

-  easier to read 
-  easier to test 
-  easier to debug 
-  easier to modify 

---

# 27. Idempotency

This is a very important DevOps concept.

An operation is **idempotent** when running it multiple times produces the same desired final state.

For example:

```
```

```bash
mkdir -p /opt/myapp
```

is effectively idempotent.

Running it once:

```
```

```
directory exists
```

Running it again:

```
```

```
directory still exists
```

Compare that with:

```
```

```bash
mkdir /opt/myapp
```

The second run fails if the directory already exists.

### DevOps principle

Prefer:

```
```

```
"Make the system reach the desired state"
```

rather than:

```
```

```
"Perform this sequence exactly once"
```

This concept will become especially important when you move deeper into:

-  Ansible 
-  Kubernetes 
-  Terraform 
-  CI/CD 
-  GitOps 

---

# 28. Dry Run

Destructive automation should sometimes support a dry-run mode.

Example:

```
```

```bash
DRY_RUN="${DRY_RUN:-false}"
```

Then:

```
```

```bash
if [[ "$DRY_RUN" == "true" ]]; then
    echo "DRY RUN: would delete $file"
else
    rm "$file"
fi
```

Run:

```
```

```bash
DRY_RUN=true ./cleanup.sh
```

This allows you to inspect what the script would do.

---

# 29. DevOps Script Safety Checklist

Before running an automation script in production, ask:

```
```

```
□ Are variables quoted?
□ Are arguments validated?
□ Are required commands checked?
□ Are failures handled?
□ Is the exit code correct?
□ Are destructive commands reviewed?
□ Is there a dry-run option?
□ Is logging available?
□ Can the script be safely run twice?
□ Are secrets avoided in logs?
```

That last point is critical.

Never do:

```
```

```
echo "Password=$PASSWORD"
```

in production logs.

---

# 30. The Big Picture

You've now moved from:

```
```

```
Learning Bash syntax
```

to:

```
```

```
Building automation
```

Your progression:

```
```

```
Day 10
Variables + conditions
       ↓
Day 11
Loops + arrays
       ↓
Day 12
Functions
       ↓
Day 13
Error handling
       ↓
Day 14
Text processing
       ↓
Day 15
Regex + advanced awk/sed
       ↓
Day 16
Real DevOps automation
```

And the overall architecture is:

```
```

```
                 Bash Automation
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
     Validate       Collect         Execute
        │              │              │
        ↓              ↓              ↓
 dependencies     system data      actions
        │              │              │
        └──────────────┼──────────────┘
                       ↓
                    Verify
                       ↓
                    Report
                       ↓
                  Exit status
```

---

# 🎯 Day 16 Practice

Don't just read this lesson. Build these.

### Task 1 — Dependency checker

Create:

```
```

```
dependency-check.sh
```

Check whether these commands exist:

```
```

```
bash
curl
git
docker
kubectl
```

Print:

```
```

```
[OK] docker
[OK] git
[ERROR] kubectl
```

The script should exit `1` if anything is missing.

---

### Task 2 — Disk monitor

Create:

```
```

```
disk-check.sh
```

Requirements:

-  Accept threshold as argument. 
-  Default threshold: `80`. 
-  Check `/`. 
-  Print usage. 
-  Exit `1` if usage exceeds threshold. 

Example:

```
```

```bash
./disk-check.sh 90
```

---

### Task 3 — Service checker

Create:

```
```

```
service-check.sh
```

Usage:

```
```

```bash
./service-check.sh nginx
```

It should:

```
```

```
[OK] nginx is running
```

or:

```
```

```
[ERROR] nginx is not running
```

---

### Task 4 — System health script

Create:

```
```

```
system-health.sh
```

Check:

```
```

```
✓ Disk
✓ Memory
✓ SSH service
✓ Docker service
✓ HTTP localhost
```

Don't stop after the first failure. Collect all failures and return:

```
```

```
0 → everything healthy
1 → one or more checks failed
```

---

### Task 5 — Backup script

Create:

```
```

```
backup.sh
```

Requirements:

```
```

```
source directory → .tar.gz → timestamp → backup directory
```

Also add cleanup for backups older than 7 days.

---

### Task 6 — Deployment script

Create:

```
```

```
deploy.sh
```

Structure:

```
```

```
validate
   ↓
build
   ↓
test
   ↓
deploy
   ↓
health check
```

Use functions for every stage.

---

## 🔥 Day 16 Mastery Checklist

You should understand:

-  Preflight checks 
- `command -v` 
-  Disk monitoring 
-  Memory monitoring 
-  CPU/load concepts 
-  Service health checks 
-  HTTP health checks 
-  Port checks 
-  Backup automation 
- `find` for cleanup 
-  Deployment automation structure 
-  Environment variables 
-  Idempotency 
-  Dry-run concepts 
-  Failure collection 
-  Production-oriented Bash structure 

### Most important takeaway

Don't think:

```
```

```
"I am learning Bash commands."
```

Think:

```
```

```
"I am learning how to automate Linux operations safely."
```

That's the transition from **Bash learner → DevOps automation mindset**.
