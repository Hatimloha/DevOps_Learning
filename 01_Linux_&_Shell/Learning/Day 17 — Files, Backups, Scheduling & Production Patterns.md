# Day 17 — Bash Automation: Files, Backups, Scheduling & Production Patterns

Today we'll take the automation from Day 16 one step further.

You already know how to build health checks and basic automation. Now we'll learn how to make scripts **reliable enough to run repeatedly**.

### Today's focus

1.  File and directory automation 
2. `find` deeply 
3.  Safe cleanup 
4.  Backup rotation 
5.  Temporary files with `mktemp` 
6. `trap` for cleanup 
7.  Lock files 
8.  Scheduling with `cron` 
9.  Log rotation concepts 
10.  Building a production-style backup script 

---

# 1. File Automation

Linux automation frequently involves:


```
create
copy
move
rename
delete
compress
find
archive
```

Basic commands:


```
mkdir -p /opt/myapp
cp app.conf /opt/myapp/
mv old.log archive.log
rm old.log
```

Always quote paths:


```
cp "$source" "$destination"
```

---

# 2. `find` — One of the Most Important DevOps Commands

Basic:


```
find /var/log -type f
```

Find files ending in `.log`:


```
find /var/log -type f -name "*.log"
```

Find directories:


```
find /opt -type d
```

Find files larger than 100 MB:


```
find /var/log -type f -size +100M
```

Find files modified in the last day:


```
find /var/log -type f -mtime -1
```

Find files older than 7 days:


```
find /backup -type f -mtime +7
```

---

# 3. `find` with `-exec`

You can execute a command for every result.

Example:


```
find /tmp -type f -name "*.tmp" -exec ls -lh {} \;
```

Here:


```
{}
```

represents the current file.

Example:


```
find /tmp -type f -name "*.tmp" -exec rm {} \;
```

This deletes matching files.

⚠️ **Be careful with `rm`.**

Always test first:


```
find /tmp -type f -name "*.tmp"
```

Then add the destructive operation.

---

# 4. Safer Cleanup Pattern

Instead of immediately deleting:


```
find "$BACKUP_DIR" -type f -mtime +7 -delete
```

first show what would be deleted:


```
find "$BACKUP_DIR" -type f -mtime +7 -print
```

Then verify.

This simple habit prevents many production mistakes.

---

# 5. `find` by Name + Age

Suppose:


```
/backup/
├── app-2026-09-01.tar.gz
├── app-2026-09-10.tar.gz
├── app-2026-09-15.tar.gz
└── app-2026-09-19.tar.gz
```

Find backups older than 7 days:


```
find /backup \
    -type f \
    -name "*.tar.gz" \
    -mtime +7
```

This becomes the foundation for backup retention.

---

# 6. Backup Rotation

A common production strategy:


```
Create backup
     ↓
Store backup
     ↓
Keep recent backups
     ↓
Delete old backups
```

For example:


```
Keep:
7 daily backups
4 weekly backups
12 monthly backups
```

This is called a **retention policy**.

You don't always need such a complicated policy, but you should understand the concept.

---

# 7. Creating a Compressed Backup

`tar` is commonly used for archives.

Create:


```
tar -czf backup.tar.gz /opt/myapp
```

Options:


```
-c → create
-z → gzip
-f → output filename
```

Extract:


```
tar -xzf backup.tar.gz
```

List contents without extracting:


```
tar -tzf backup.tar.gz
```

This is very useful for verifying backups.

---

# 8. Verify a Backup

After creating:


```
tar -czf "$backup_file" "$source"
```

check:


```
if [[ -f "$backup_file" ]]; then
    echo "Backup exists"
else
    echo "Backup failed"
    exit 1
fi
```

You can also test archive integrity:


```
tar -tzf "$backup_file" >/dev/null
```

Then:


```
if tar -tzf "$backup_file" >/dev/null 2>&1; then
    echo "Backup archive is valid"
else
    echo "Backup archive is corrupted"
    exit 1
fi
```

That's much better than assuming the backup succeeded simply because `tar` returned output.

---

# 9. Temporary Files with `mktemp`

Avoid manually creating temporary filenames like:


```
/tmp/output.txt
```

because multiple processes could collide.

Use:


```
tmp_file=$(mktemp)
```

Example:


```
tmp_file=$(mktemp)

echo "temporary data" > "$tmp_file"

cat "$tmp_file"
```

You can create a temporary directory:


```
tmp_dir=$(mktemp -d)
```

Then:


```
mkdir "$tmp_dir/data"
```

---

# 10. `trap` — Cleanup Automatically

Suppose your script creates:


```
tmp_dir=$(mktemp -d)
```

You don't want to leave it behind.

Use:


```
cleanup() {
    rm -rf "$tmp_dir"
}

trap cleanup EXIT
```

Now when the script exits:


```
script finishes
     ↓
EXIT trap
     ↓
cleanup()
     ↓
temporary directory removed
```

This works even when the script exits through many normal/error paths.

---

# 11. Better Temporary Directory Pattern


```
#!/bin/bash

set -Eeuo pipefail

tmp_dir=$(mktemp -d)

cleanup() {
    rm -rf "$tmp_dir"
}

trap cleanup EXIT

echo "Working in: $tmp_dir"

# automation
```

This pattern is extremely useful.

---

# 12. Why `trap` Matters

Imagine:


```
Script
 ↓
Create temporary files
 ↓
Run command
 ↓
Command fails
 ↓
Script exits
```

Without cleanup:


```
/tmp
 ├── old-temp
 ├── old-temp2
 ├── old-temp3
 └── ...
```

With:


```
trap cleanup EXIT
```

the temporary resources are cleaned automatically.

---

# 13. Handling Interrupts

You can also trap signals:


```
trap cleanup EXIT INT TERM
```

Common signals:


```
INT  → Ctrl+C
TERM → termination request
EXIT → shell exits
```

Be careful with trap design: putting both `EXIT` and signal traps around the same cleanup function can cause cleanup to run more than once unless the cleanup is safe/idempotent.

For example, this is usually safe:


```
cleanup() {
    rm -rf "$tmp_dir"
}
```

because removing an already-removed temporary directory doesn't normally create a problem when `-f` is used.

---

# 14. Lock Files — Prevent Duplicate Runs

Imagine you schedule:


```
backup.sh
```

every hour.

But one backup takes two hours.

Now you could have:


```
backup #1 → running
backup #2 → running
backup #3 → starts
```

That's bad.

You can use a lock.

Simple approach:


```
LOCK_FILE="/tmp/my-backup.lock"

if [[ -e "$LOCK_FILE" ]]; then
    echo "Backup already running"
    exit 1
fi

touch "$LOCK_FILE"

cleanup() {
    rm -f "$LOCK_FILE"
}

trap cleanup EXIT
```

Now only one instance should proceed.

---

# 15. Better Locking with `flock`

On Linux, `flock` is generally preferable to manually checking whether a lock file exists because the check-and-create operation can otherwise have a race condition.

Example:


```
exec 200>/tmp/my-backup.lock

if ! flock -n 200; then
    echo "Backup already running"
    exit 1
fi
```

Now:


```
Process A
   ↓
gets lock
   ↓
runs backup

Process B
   ↓
tries lock
   ↓
fails
   ↓
exits
```

This is a very useful Linux automation technique.

---

# 16. Scheduling with Cron

So far we've manually run:


```
./backup.sh
```

But automation often means:

> Run this automatically at a particular time.

That's where **cron** comes in.

View your user's cron jobs:


```
crontab -l
```

Edit them:


```
crontab -e
```

---

# 17. Cron Syntax

The standard structure is:


```
minute hour day-of-month month day-of-week command
```

Example:


```
0 2 * * * /opt/scripts/backup.sh
```

Meaning:

> Run every day at 02:00.

---

# 18. Cron Examples

Every 5 minutes:


```
*/5 * * * * /opt/scripts/check.sh
```

Every hour:


```
0 * * * * /opt/scripts/check.sh
```

Every day at 02:30:


```
30 2 * * * /opt/scripts/backup.sh
```

Every Sunday at 03:00:


```
0 3 * * 0 /opt/scripts/backup.sh
```

---

# 19. Cron Environment Is Different

This is a **very important DevOps issue**.

Your interactive shell might have:


```
PATH=/usr/local/bin:/usr/bin:/bin
```

But cron may have a much smaller environment.

So this might work manually:


```
docker
```

but fail in cron.

Use:


```
command -v docker
```

and use absolute paths where appropriate:


```
/usr/bin/docker
```

Also don't assume:


```
HOME
PATH
AWS credentials
custom shell variables
```

are identical to your interactive session.

---

# 20. Redirect Cron Output

Instead of allowing output to become difficult to find:


```
0 2 * * * /opt/scripts/backup.sh
```

use:


```
0 2 * * * /opt/scripts/backup.sh >> /var/log/backup.log 2>&1
```

Meaning:


```
stdout → backup.log
stderr → backup.log
```

Then inspect:


```
tail -f /var/log/backup.log
```

---

# 21. Cron vs systemd Timers

You should know both.

### Cron

Good for:


```
simple scheduled jobs
```

### systemd timers

Better when you want:


```
service integration
journal logging
dependency handling
systemd lifecycle
more detailed scheduling
```

Since you've already learned `systemd`, you'll eventually want to understand **systemd timers** as well.

For now, learn cron fundamentals first.

---

# 22. Production Backup Script

Let's combine today's concepts.


```
#!/bin/bash

set -Eeuo pipefail

SOURCE="/opt/myapp"
BACKUP_DIR="/var/backups/myapp"
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"

timestamp=$(date '+%Y-%m-%d_%H-%M-%S')
backup_file="$BACKUP_DIR/myapp-$timestamp.tar.gz"

log() {
    local level="$1"
    local message="$2"

    printf '[%s] [%s] %s\n' \
        "$(date '+%Y-%m-%d %H:%M:%S')" \
        "$level" \
        "$message"
}

cleanup_old_backups() {
    log INFO "Removing backups older than $RETENTION_DAYS days"

    find "$BACKUP_DIR" \
        -type f \
        -name 'myapp-*.tar.gz' \
        -mtime +"$RETENTION_DAYS" \
        -print \
        -delete
}

create_backup() {
    log INFO "Creating backup"

    tar -czf "$backup_file" "$SOURCE"

    log INFO "Backup created: $backup_file"
}

verify_backup() {
    log INFO "Verifying backup"

    if tar -tzf "$backup_file" >/dev/null 2>&1; then
        log INFO "Backup verification successful"
    else
        log ERROR "Backup verification failed"
        return 1
    fi
}

main() {
    log INFO "Starting backup"

    create_backup
    verify_backup
    cleanup_old_backups

    log INFO "Backup completed successfully"
}

main "$@"
```

---

# 23. Improve It With a Lock

Add:


```
exec 200>/tmp/myapp-backup.lock

if ! flock -n 200; then
    echo "Another backup is already running"
    exit 1
fi
```

Now the script protects against overlapping executions.

---

# 24. Add a Temporary Workspace

Suppose you want to stage data before creating the final archive:


```
tmp_dir=$(mktemp -d)

cleanup() {
    rm -rf "$tmp_dir"
}

trap cleanup EXIT
```

Then:


```
mkdir -p "$tmp_dir/app"
cp -a "$SOURCE/." "$tmp_dir/app/"
```

You can work safely in the temporary directory.

---

# 25. Important Bash Pattern — `main "$@"`

You've seen this several times:


```
main "$@"
```

Why?

Suppose:


```
./script.sh production v1.5.0
```

Then:


```
$1 → production
$2 → v1.5.0
```

If you call:


```
main "$@"
```

the function receives the original arguments.

This is the cleanest structure:


```
main() {
    ...
}

main "$@"
```

---

# 26. Configuration vs Code

Don't hardcode everything.

Bad:


```
BACKUP_DIR="/var/backups/myapp"
RETENTION_DAYS=7
```

everywhere throughout the script.

Better:


```
BACKUP_DIR="${BACKUP_DIR:-/var/backups/myapp}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
```

Now you can override:


```
RETENTION_DAYS=30 ./backup.sh
```

This makes your automation reusable.

---

# 27. Configuration Validation

Suppose:


```
RETENTION_DAYS="${RETENTION_DAYS:-7}"
```

You should validate it.


```
if ! [[ "$RETENTION_DAYS" =~ ^[0-9]+$ ]]; then
    echo "ERROR: RETENTION_DAYS must be a number" >&2
    exit 1
fi
```

Now:


```
RETENTION_DAYS=abc ./backup.sh
```

fails early instead of behaving unpredictably.

---

# 28. Safe Deletion Principle

This is one of the most important lessons today.

Never start with:


```
rm -rf "$directory"/*
```

Instead:

### Step 1

Inspect:


```
find "$directory" -type f
```

### Step 2

Filter:


```
find "$directory" \
    -type f \
    -name '*.log' \
    -mtime +7
```

### Step 3

Review.

### Step 4

Then delete:


```
find "$directory" \
    -type f \
    -name '*.log' \
    -mtime +7 \
    -delete
```

Automation should be **predictable before it becomes destructive**.

---

# 29. Real DevOps Architecture

At this point, your Bash scripts should start looking like:


```
                 Script
                   │
           ┌───────┴───────┐
           ↓               ↓
       Configuration     Arguments
           │               │
           └───────┬───────┘
                   ↓
               Validation
                   ↓
             Acquire Lock
                   ↓
              Main Action
                   ↓
             Verification
                   ↓
           Cleanup / Rotation
                   ↓
             Logging
                   ↓
              Exit Code
```

That's a real automation workflow.

---

# 30. Day 17 Practice

## Task 1 — File Cleanup Script

Create:


```
cleanup.sh
```

Requirements:

-  Accept a directory as `$1`. 
-  Find `.log` files older than 7 days. 
-  Print them first. 
-  Delete them. 
-  Return `1` if the directory doesn't exist. 

---

## Task 2 — Backup Script

Create:


```
backup.sh
```

Requirements:


```
source → tar.gz → timestamp
```

Add:

- `set -Eeuo pipefail` 
-  logging 
-  backup verification 
-  retention cleanup 
-  configurable backup directory 
- `flock` 

---

## Task 3 — Temporary Workspace

Write a script that:

1.  Creates a temporary directory. 
2.  Creates three files inside it. 
3.  Displays them. 
4.  Exits. 
5.  Automatically deletes the temporary directory. 

Use:


```
mktemp -d
```

and:


```
trap
```

---

## Task 4 — Cron

Schedule your backup script:


```
Every day at 2 AM
```

Use:


```
0 2 * * * ...
```

Then verify:


```
crontab -l
```

---

## Task 5 — Prevent Duplicate Execution

Make sure two copies of the backup script cannot run simultaneously.

Use:


```
flock
```

---

# 🎯 Day 17 Mastery Checklist

You should understand:

- `find` 
- `find -exec` 
-  File cleanup 
- `tar` 
-  Backup verification 
-  Backup retention 
- `mktemp` 
- `trap` 
-  Temporary directories 
-  Locking 
- `flock` 
-  Cron 
-  Cron environment 
-  Cron logging 
-  Safe deletion 
-  Idempotent automation 
-  Configuration through environment variables 

### Your progression


```
Day 13 → Error Handling
Day 14 → Text Processing
Day 15 → Regex + awk/sed
Day 16 → DevOps Automation
Day 17 → Reliable Scheduled Automation
```

The next step is **Day 18 — Bash + Linux Monitoring**, where we'll build scripts around **CPU, memory, disk, processes, network, services, logs, thresholds, and alerting**.
