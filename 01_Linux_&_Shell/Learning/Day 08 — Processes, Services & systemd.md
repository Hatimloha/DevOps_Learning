# Linux Fundamentals — Day 8

## Processes, Services & systemd

Today we move from understanding **"what is running?"** to learning **"how does Linux manage applications and services?"**

This is especially important for:

* AWS EC2
* Nginx
* Docker
* CI/CD runners
* Databases
* Production troubleshooting

---

# 1. Process Lifecycle

A process starts, runs, and eventually exits.

Basic lifecycle:

```text
Parent Process
      │
      ▼
   fork()
      │
      ▼
 Child Process
      │
      ▼
   exec()
      │
      ▼
 Running
      │
      ▼
 Exit
```

Every process has information such as:

* PID
* PPID
* User
* State
* CPU usage
* Memory usage

---

# 2. PID — Process ID

**PID** stands for **Process ID**.

Run:

```bash
ps
```

Example:

```text
PID TTY          TIME CMD
2315 pts/0    00:00:00 bash
```

Here:

```text
2315 → PID
```

Each running process has a unique PID while it exists.

---

# 3. PPID — Parent Process ID

**PPID** stands for **Parent Process ID**.

Use:

```bash
ps -ef
```

Example:

```text
UID      PID   PPID  CMD
hatim   2315   2200  bash
```

Meaning:

```text
PPID 2200
   │
   ▼
PID 2315
```

The `bash` process was created by its parent process.

---

# 4. View the Process Tree

Use:

```bash
pstree
```

Show PIDs:

```bash
pstree -p
```

Example:

```text
systemd(1)
 ├─sshd(900)
 │   └─bash(1200)
 │       └─pstree(1500)
 └─nginx(700)
```

This makes parent-child process relationships easier to understand.

---

# 5. PID 1 — Very Important 🔥

On most modern Linux systems using `systemd`:

```text
PID 1 → systemd
```

Check:

```bash
ps -p 1 -o pid,comm,args
```

Typical output:

```text
1 systemd /sbin/init
```

PID 1 is important because it:

* Starts system services
* Manages services
* Handles system initialization
* Adopts orphaned processes

---

# 6. Process States

Processes can exist in different states.

Run:

```bash
ps aux
```

The `STAT` column shows process state information.

Common states:

| State | Meaning               |
| ----- | --------------------- |
| `R`   | Running or runnable   |
| `S`   | Interruptible sleep   |
| `D`   | Uninterruptible sleep |
| `T`   | Stopped               |
| `Z`   | Zombie                |

---

# 7. Zombie Processes

A **zombie process** is a process that has finished execution, but its parent has not yet collected its exit status.

Conceptually:

```text
Child
  │
  ▼
Exits
  │
  ▼
Zombie
  │
  ▼
Parent collects status
  │
  ▼
Removed
```

A zombie is **not simply a process consuming high CPU**.

It is an already terminated process entry waiting for its parent process.

Find zombies:

```bash
ps aux | grep ' Z '
```

---

# 8. Linux Signals

Linux communicates with processes using **signals**.

Important signals:

| Signal    | Number | Purpose                   |
| --------- | -----: | ------------------------- |
| `SIGTERM` |     15 | Graceful termination      |
| `SIGKILL` |      9 | Force termination         |
| `SIGSTOP` |    19* | Stop process              |
| `SIGCONT` |    18* | Continue process          |
| `SIGHUP`  |      1 | Hangup or reload behavior |

> *Signal numbers can vary between architectures, so signal names are generally safer to remember.*

---

# 9. `kill`

Despite its name, `kill` does not always mean **force kill**.

```bash
kill PID
```

By default, this sends:

```text
SIGTERM
```

The application gets a chance to shut down gracefully.

---

# 10. `kill -9`

```bash
kill -9 PID
```

This sends:

```text
SIGKILL
```

The kernel immediately terminates the process.

> ⚠️ Do not use `kill -9` as your first option.

Prefer:

```bash
kill PID
```

First, and investigate if the process does not stop.

---

# 11. Send a Specific Signal

Send `SIGTERM`:

```bash
kill -TERM PID
```

Equivalent to:

```bash
kill PID
```

Force termination:

```bash
kill -KILL PID
```

---

# 12. `pkill`

Terminate processes by name:

```bash
pkill nginx
```

> ⚠️ Be careful. This may affect multiple processes with the same name.

---

# 13. `pgrep`

Find process IDs by name:

```bash
pgrep nginx
```

Show the PID and command:

```bash
pgrep -a nginx
```

This is useful when troubleshooting or scripting.

---

# 14. Process Priority

Linux processes have a scheduling priority influenced by a **nice value**.

Check:

```bash
ps -eo pid,ni,comm
```

Nice values generally range from:

```text
-20 → Higher priority
 19 → Lower priority
```

---

# 15. `nice`

Start a process with a specific nice value:

```bash
nice -n 10 command
```

Example:

```bash
nice -n 10 ./backup.sh
```

A higher nice value generally gives the process lower CPU scheduling priority.

---

# 16. `renice`

Change the nice value of an existing process:

```bash
renice 10 -p PID
```

This is useful when you don't want a CPU-heavy task to dominate the system.

---

# 17. What Is a Service?

A **service** is usually a long-running background process that provides functionality.

Examples:

```text
nginx
ssh
postgresql
docker
redis
```

Instead of manually running:

```bash
./application
```

you can let Linux manage it as a service.

That's where **systemd** comes in.

---

# 18. What Is systemd?

`systemd` is a system and service manager used by many modern Linux distributions.

It manages:

* Services
* System startup
* Dependencies
* Logs
* Service states

The primary command for managing systemd services is:

```bash
systemctl
```

---

# 19. Check Service Status

Example:

```bash
systemctl status ssh
```

Depending on your Linux distribution, the service may be named:

```text
ssh
```

or:

```text
sshd
```

List available services:

```bash
systemctl list-units --type=service
```

---

# 20. Start a Service

```bash
sudo systemctl start nginx
```

This starts the service immediately.

---

# 21. Stop a Service

```bash
sudo systemctl stop nginx
```

---

# 22. Restart a Service

```bash
sudo systemctl restart nginx
```

This is useful after configuration changes.

---

# 23. Reload a Service

Some services support reloading their configuration without a complete restart.

```bash
sudo systemctl reload nginx
```

Difference:

```text
restart → Stop and start the service
reload  → Reload configuration without a full restart
```

When supported, `reload` can reduce service interruption.

---

# 24. Enable a Service at Boot 🔥

To start a service automatically after reboot:

```bash
sudo systemctl enable nginx
```

Check:

```bash
systemctl is-enabled nginx
```

---

# 25. Disable a Service at Boot

```bash
sudo systemctl disable nginx
```

This prevents the service from automatically starting at boot.

---

# 26. Start and Enable Together

Very useful:

```bash
sudo systemctl enable --now nginx
```

Meaning:

```text
Enable at boot
+
Start now
```

---

# 27. Check Service State

```bash
systemctl is-active nginx
```

Possible results:

```text
active
```

or:

```text
inactive
```

---

# 28. List Failed Services 🔥

Excellent troubleshooting command:

```bash
systemctl --failed
```

If something failed during boot or while running, this can quickly identify failed units.

---

# 29. Service Logs — `journalctl`

`systemd` collects logs through the **systemd journal**.

View logs:

```bash
journalctl
```

---

# 30. Logs for a Specific Service

View logs for Nginx:

```bash
journalctl -u nginx
```

Follow logs live:

```bash
journalctl -u nginx -f
```

This is similar to:

```bash
tail -f
```

but specifically works with the systemd journal.

---

# 31. Logs Since Current Boot

Current boot:

```bash
journalctl -b
```

Previous boot:

```bash
journalctl -b -1
```

This is extremely useful when troubleshooting problems that happened before a reboot.

---

# 32. Logs by Time

For example:

```bash
journalctl --since "1 hour ago"
```

Or:

```bash
journalctl --since today
```

---

# 33. Show Recent Logs

```bash
journalctl -u nginx -n 50
```

Meaning:

```text
Show the last 50 Nginx log entries.
```

---

# 34. Real Production Troubleshooting 🔥

Imagine your Nginx service is not working.

Don't immediately reinstall it.

### Step 1 — Check Status

```bash
systemctl status nginx
```

### Step 2 — Check Logs

```bash
journalctl -u nginx -n 100
```

### Step 3 — Test Configuration

```bash
sudo nginx -t
```

### Step 4 — Check Port

```bash
ss -tulnp | grep ':80'
```

### Step 5 — Test Locally

```bash
curl http://localhost
```

This gives you a systematic troubleshooting workflow.

---

# 35. Create Your Own systemd Service 🔥

This is an important hands-on skill.

Create a service file:

```bash
sudo nano /etc/systemd/system/myapp.service
```

Example:

```ini
[Unit]
Description=My Application
After=network.target

[Service]
ExecStart=/usr/bin/python3 /opt/myapp/app.py
Restart=on-failure
User=appuser

[Install]
WantedBy=multi-user.target
```

---

# 36. Understanding the Unit File

## `[Unit]`

Contains general service information and dependencies.

```ini
[Unit]
Description=My Application
After=network.target
```

---

## `[Service]`

Defines how the application runs.

```ini
[Service]
ExecStart=/usr/bin/python3 /opt/myapp/app.py
```

---

## `Restart`

```ini
Restart=on-failure
```

If the application crashes, systemd can automatically restart it.

---

## `User`

```ini
User=appuser
```

This runs the application as a non-root user.

🔥 This is an important security practice.

---

## `[Install]`

Controls how the service can be enabled.

```ini
[Install]
WantedBy=multi-user.target
```

---

# 37. Reload systemd

After creating or modifying a unit file:

```bash
sudo systemctl daemon-reload
```

Then start the service:

```bash
sudo systemctl start myapp
```

Check its status:

```bash
systemctl status myapp
```

Enable it at boot:

```bash
sudo systemctl enable myapp
```

---

# 38. Why `daemon-reload`?

systemd needs to re-read its unit files after changes.

Think:

```text
Modify service file
       ↓
daemon-reload
       ↓
systemd reads new configuration
       ↓
start or restart service
```

---

# 39. Important Connection to Docker

When you run:

```bash
sudo systemctl status docker
```

You are asking `systemd` about the Docker service.

The relationship looks like:

```text
Linux
  │
  ▼
systemd
  │
  ├── Docker
  ├── SSH
  ├── Nginx
  ├── PostgreSQL
  └── Other services
```

---

# 40. Practice Lab 🧪

Run these commands in your Linux environment.

## Task 1 — Check PID 1

```bash
ps -p 1 -o pid,comm,args
```

---

## Task 2 — View Process Tree

```bash
pstree -p
```

---

## Task 3 — Find Your Shell

```bash
pgrep -a bash
```

If you're using another shell:

```bash
ps -p $$ -o pid,comm,args
```

---

## Task 4 — Start a Background Process

```bash
sleep 300 &
```

Find it:

```bash
pgrep sleep
```

Terminate it gracefully:

```bash
kill $(pgrep sleep)
```

---

## Task 5 — Check Running Services

```bash
systemctl list-units --type=service --state=running
```

---

## Task 6 — Find Failed Services

```bash
systemctl --failed
```

---

## Task 7 — Check SSH Service

```bash
systemctl status ssh
```

If that doesn't exist:

```bash
systemctl status sshd
```

---

## Task 8 — View SSH Logs

```bash
journalctl -u ssh -n 30
```

---

# 41. Commands to Master

## Process Management

```bash
ps
ps aux
ps -ef
pstree
pgrep
pkill
kill
kill -TERM
kill -KILL
nice
renice
```

## Service Management

```bash
systemctl
systemctl status
systemctl start
systemctl stop
systemctl restart
systemctl reload
systemctl enable
systemctl disable
systemctl --failed
```

## Log Management

```bash
journalctl
journalctl -u
journalctl -f
journalctl -b
```

---

# Day 8 Mental Model 🧠

Remember this architecture:

```text
Linux Boot
    │
    ▼
systemd (PID 1)
    │
    ├── SSH
    ├── Nginx
    ├── Docker
    ├── PostgreSQL
    └── Your Application
             │
             ▼
          Process
             │
       ┌─────┴─────┐
       ▼           ▼
      PID         User
       │
       ▼
    Signals
       │
       ▼
   Exit / Restart
```

## Most Important Distinction 🔥

```text
ps         → What processes are running?
systemctl  → What services are managed?
journalctl → What did the services report?
```

These concepts form the foundation of **Linux production troubleshooting**.
