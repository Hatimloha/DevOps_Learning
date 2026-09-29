# Day 18 — Linux Monitoring & Alerting

Today we move from **automation → monitoring**.

You already know how to work with processes, services, logs, networking, `awk`, functions, error handling, and production-style scripts. Now we'll combine those skills into a **Linux monitoring script similar to what you would build before using Prometheus/Grafana**.

---

## 1. Monitoring Mindset

A monitoring system basically answers:

> **Is the system healthy?**

We normally monitor:


```
CPU
Memory
Disk
Inodes
Processes
Services
Ports
Network
Logs
```

And for each metric we can define:


```
OK
WARNING
CRITICAL
```

Example:


```
Disk usage: 45%  → OK
Disk usage: 82%  → WARNING
Disk usage: 95%  → CRITICAL
```

The important concept is:


```
Metric → Threshold → Status → Action
```

---

# 2. CPU Monitoring

You already saw `uptime` and `/proc/loadavg`.

### Check load average


```
uptime
```

Example:


```
load average: 0.42, 0.35, 0.28
```

These represent approximately:


```
1 minute
5 minutes
15 minutes
```

You can also inspect:


```
cat /proc/loadavg
```

Example:


```
0.42 0.35 0.28 2/145 18234
```

### Important: Load ≠ CPU %

Load average represents the amount of work/tasks waiting for or using CPU resources, and can also reflect tasks stuck in uninterruptible I/O.

So:


```
CPU utilization ≠ Load average
```

A machine can have high load because of disk I/O even when CPU utilization isn't near 100%.

---

# 3. CPU Information


```
nproc
```

Shows the number of available CPUs.


```
lscpu
```

Provides detailed CPU information.

You can combine CPU count with load:


```
cpu_count=$(nproc)
load=$(awk '{print $1}' /proc/loadavg)

echo "CPU cores: $cpu_count"
echo "Load: $load"
```

For a simple monitoring script, you might flag a high load when:


```
load > CPU cores
```

But remember that this is only a **heuristic**, not a universal definition of CPU overload.

---

# 4. Memory Monitoring

Use:


```
free -m
```

Example:


```
               total   used   free
Mem:            15900   6200   3000
```

For scripting:


```
memory_usage=$(free | awk '/^Mem:/ {printf "%.0f", ($3/$2)*100}')
```

Then:


```
echo "Memory usage: ${memory_usage}%"
```

You can create thresholds:


```
MEM_WARN=80
MEM_CRITICAL=90
```

Then:


```
if (( memory_usage >= MEM_CRITICAL )); then
    echo "CRITICAL: Memory usage ${memory_usage}%"
elif (( memory_usage >= MEM_WARN )); then
    echo "WARNING: Memory usage ${memory_usage}%"
else
    echo "OK: Memory usage ${memory_usage}%"
fi
```

---

# 5. Disk Monitoring

This is one of the most important Linux monitoring checks.


```
df -h /
```

For scripts:


```
disk_usage=$(df -P / | awk 'NR==2 {gsub("%","",$5); print $5}')
```

Then:


```
echo "Disk usage: ${disk_usage}%"
```

Thresholds:


```
DISK_WARN=80
DISK_CRITICAL=90
```

Check:


```
if (( disk_usage >= DISK_CRITICAL )); then
    echo "CRITICAL: Disk usage ${disk_usage}%"
elif (( disk_usage >= DISK_WARN )); then
    echo "WARNING: Disk usage ${disk_usage}%"
else
    echo "OK: Disk usage ${disk_usage}%"
fi
```

---

# 6. Inode Monitoring

Disk space isn't the only thing that can run out.

You can have:


```
Disk space available
BUT
Inodes exhausted
```

Check:


```
df -i /
```

Example:


```
Filesystem     Inodes  IUsed  IFree IUse%
/dev/sda1      1000000 950000 50000 95%
```

Extract usage:


```
inode_usage=$(df -Pi / | awk 'NR==2 {gsub("%","",$5); print $5}')
```

Then:


```
echo "Inode usage: ${inode_usage}%"
```

This is particularly important on systems creating huge numbers of small files.

---

# 7. Process Monitoring

List processes:


```
ps aux
```

Find a process:


```
pgrep nginx
```

Check whether a process exists:


```
if pgrep nginx > /dev/null; then
    echo "OK: nginx is running"
else
    echo "CRITICAL: nginx is not running"
fi
```

Reusable function:


```
check_process() {
    local process="$1"

    if pgrep "$process" > /dev/null; then
        echo "OK: $process is running"
    else
        echo "CRITICAL: $process is not running"
    fi
}
```

Usage:


```
check_process nginx
check_process sshd
```

---

# 8. Service Monitoring

For systemd services:


```
systemctl is-active --quiet nginx
```

Use it inside a function:


```
check_service() {
    local service="$1"

    if systemctl is-active --quiet "$service"; then
        echo "OK: $service"
    else
        echo "CRITICAL: $service is not running"
    fi
}
```

Usage:


```
check_service nginx
check_service docker
```

This is more reliable than simply checking whether a process with a particular name exists.

---

# 9. Port Monitoring

Suppose your application should listen on port `8080`.

Check:


```
ss -ltn
```

Or:


```
ss -ltn | grep ':8080 '
```

Script:


```
check_port() {
    local port="$1"

    if ss -ltn | grep -q ":$port "; then
        echo "OK: Port $port is listening"
    else
        echo "CRITICAL: Port $port is not listening"
    fi
}
```

Usage:


```
check_port 80
check_port 443
check_port 8080
```

---

# 10. HTTP Health Check

A service listening on a port doesn't necessarily mean the application is healthy.

For example:


```
Port 8080 → listening
Application → broken
```

So test the application itself.


```
curl -fsS http://localhost:8080/health
```

`-f`:


```
fail on HTTP errors
```

`-s`:


```
silent
```

`-S`:


```
show errors
```

Function:


```
check_http() {
    local url="$1"

    if curl -fsS --max-time 5 "$url" > /dev/null; then
        echo "OK: $url"
    else
        echo "CRITICAL: $url"
    fi
}
```

Usage:


```
check_http "http://localhost:8080/health"
```

This is closer to what production monitoring systems actually care about.

---

# 11. Monitoring Logs

You already learned `grep`, `tail`, `awk`, etc.

Check recent errors:


```
journalctl -p err -n 20
```

For a service:


```
journalctl -u nginx -p err -n 20
```

Follow logs:


```
journalctl -u nginx -f
```

You can also search application logs:


```
grep -i "error" /var/log/myapp.log
```

Count errors:


```
grep -ic "error" /var/log/myapp.log
```

---

# 12. Alert Levels

Let's standardize our monitoring output.


```
OK
WARNING
CRITICAL
```

For example:


```
OK: Disk usage 42%
WARNING: Memory usage 84%
CRITICAL: Disk usage 95%
```

We can create a helper:


```
log_status() {
    local level="$1"
    local message="$2"

    echo "[$level] $message"
}
```

Then:


```
log_status "OK" "Disk usage is 40%"
log_status "WARNING" "Memory usage is 85%"
log_status "CRITICAL" "Disk usage is 95%"
```

---

# 13. Configuration Through Environment Variables

Don't hard-code every threshold.

Instead:


```
DISK_WARN="${DISK_WARN:-80}"
DISK_CRITICAL="${DISK_CRITICAL:-90}"

MEM_WARN="${MEM_WARN:-80}"
MEM_CRITICAL="${MEM_CRITICAL:-90}"
```

Now you can run:


```
DISK_WARN=70 ./system-monitor.sh
```

or:


```
DISK_WARN=70 DISK_CRITICAL=85 ./system-monitor.sh
```

This pattern is extremely useful in DevOps.

---

# 14. Aggregating Failures

A monitoring script shouldn't necessarily stop after the first problem.

For example:


```
CPU       → OK
Memory    → WARNING
Disk      → CRITICAL
Nginx     → OK
Port 8080 → CRITICAL
```

We want to report **everything**.

Use:


```
failures=0
```

Then:


```
if (( disk_usage >= DISK_CRITICAL )); then
    echo "CRITICAL: Disk usage ${disk_usage}%"
    ((failures++))
fi
```

At the end:


```
if (( failures > 0 )); then
    exit 1
fi

exit 0
```

So another system can determine:


```
0 → healthy
1 → problem detected
```

---

# 15. Production-Style Monitoring Script

Now let's combine what you've learned.

### `system-monitor.sh`


```
#!/bin/bash

set -Eeuo pipefail

DISK_WARN="${DISK_WARN:-80}"
DISK_CRITICAL="${DISK_CRITICAL:-90}"

MEM_WARN="${MEM_WARN:-80}"
MEM_CRITICAL="${MEM_CRITICAL:-90}"

failures=0

log() {
    local level="$1"
    local message="$2"

    printf '[%s] %s\n' "$level" "$message"
}

check_disk() {
    local usage

    usage=$(df -P / | awk 'NR==2 {
        gsub("%","",$5)
        print $5
    }')

    if (( usage >= DISK_CRITICAL )); then
        log "CRITICAL" "Disk usage: ${usage}%"
        ((failures++))
    elif (( usage >= DISK_WARN )); then
        log "WARNING" "Disk usage: ${usage}%"
    else
        log "OK" "Disk usage: ${usage}%"
    fi
}

check_memory() {
    local usage

    usage=$(free | awk '/^Mem:/ {
        printf "%.0f", ($3/$2)*100
    }')

    if (( usage >= MEM_CRITICAL )); then
        log "CRITICAL" "Memory usage: ${usage}%"
        ((failures++))
    elif (( usage >= MEM_WARN )); then
        log "WARNING" "Memory usage: ${usage}%"
    else
        log "OK" "Memory usage: ${usage}%"
    fi
}

check_service() {
    local service="$1"

    if systemctl is-active --quiet "$service"; then
        log "OK" "Service $service is running"
    else
        log "CRITICAL" "Service $service is not running"
        ((failures++))
    fi
}

check_port() {
    local port="$1"

    if ss -ltn | grep -q ":$port "; then
        log "OK" "Port $port is listening"
    else
        log "CRITICAL" "Port $port is not listening"
        ((failures++))
    fi
}

check_http() {
    local url="$1"

    if curl -fsS --max-time 5 "$url" > /dev/null; then
        log "OK" "HTTP health check: $url"
    else
        log "CRITICAL" "HTTP health check failed: $url"
        ((failures++))
    fi
}

main() {
    echo "===== Linux System Monitor ====="

    check_disk
    check_memory
    check_service "ssh"
    check_port 22

    # Uncomment if your application exposes this endpoint.
    # check_http "http://localhost:8080/health"

    echo
    echo "Failures: $failures"

    if (( failures > 0 )); then
        exit 1
    fi

    exit 0
}

main "$@"
```

Run:


```
chmod +x system-monitor.sh
./system-monitor.sh
```

Possible output:


```
===== Linux System Monitor =====
[OK] Disk usage: 41%
[OK] Memory usage: 52%
[OK] Service ssh is running
[OK] Port 22 is listening

Failures: 0
```

---

# 16. Why This Script Is DevOps-Relevant

This isn't just a Bash exercise.

The same architecture appears in larger monitoring systems:


```
                Linux Server
                     │
       ┌─────────────┼─────────────┐
       ↓             ↓             ↓
      CPU          Memory         Disk
       │             │             │
       └─────────────┼─────────────┘
                     ↓
                  Metrics
                     ↓
                 Thresholds
                     ↓
              ┌──────┴──────┐
              ↓             ↓
             OK          Problem
                            ↓
                         Alert
```

Later you'll see the same concepts with:


```
Prometheus
    ↓
Metrics
    ↓
PromQL
    ↓
Alert Rules
    ↓
Alertmanager
    ↓
Notification
```

And:


```
Grafana
   ↓
Visualization
   ↓
Dashboards
```

So today's Bash monitoring is the **foundation**, not the final monitoring solution.

---

# 17. Important Monitoring Principle — Avoid False Positives

A bad monitoring script might say:


```
CPU > 80%
CRITICAL!!!
```

for every short CPU spike.

That creates alert fatigue.

Good monitoring considers:


```
Metric
+
Threshold
+
Duration
+
Context
```

For example:


```
Memory > 90%
for 5 minutes
```

is more meaningful than:


```
Memory > 90%
for 2 seconds
```

This becomes very important when you move to Prometheus alerting.

---

# 18. Monitoring vs Logging

Don't confuse them.

### Monitoring

Answers:

> **What is the current state?**

Examples:


```
CPU = 62%
Memory = 71%
Disk = 84%
nginx = running
Port 443 = listening
```

### Logging

Answers:

> **What happened?**

Example:


```
2026-09-20 22:10:32 ERROR Database connection failed
2026-09-20 22:10:34 ERROR Retry failed
```

### Together


```
Metrics → What is happening?
Logs    → Why is it happening?
```

This distinction will become very important when you learn observability.

---

# 19. DevOps Monitoring Stack You'll Eventually Reach

Your learning path can now evolve toward:


```
Linux
  ↓
Bash Monitoring
  ↓
Prometheus
  ↓
Grafana
  ↓
Alertmanager
  ↓
Node Exporter
  ↓
Kubernetes Monitoring
  ↓
Application Monitoring
  ↓
Logs
  ↓
Full Observability
```

And eventually:


```
Metrics + Logs + Traces
            ↓
       Observability
```

---

# 20. Day 18 Practice

### Task 1 — CPU Monitor

Create:


```
cpu-monitor.sh
```

It should:

-  detect CPU count 
-  read 1-minute load 
-  calculate load per CPU 
-  print `OK`, `WARNING`, or `CRITICAL` 

---

### Task 2 — Disk Monitor

Create:


```
disk-monitor.sh
```

Requirements:


```
Argument 1 → filesystem/path
Argument 2 → warning threshold
Argument 3 → critical threshold
```

Example:


```
./disk-monitor.sh / 80 90
```

---

### Task 3 — Service Monitor

Create:


```
service-monitor.sh
```

Usage:


```
./service-monitor.sh nginx
```

Expected:


```
[OK] nginx is running
```

or:


```
[CRITICAL] nginx is not running
```

---

### Task 4 — HTTP Monitor

Create:


```
http-monitor.sh
```

Usage:


```
./http-monitor.sh http://localhost:8080/health
```

Use:


```
curl -fsS --max-time 5
```

---

### Task 5 — Full System Monitor ⭐

Build your own:


```
system-monitor.sh
```

It should check:


```
✓ CPU/load
✓ Memory
✓ Disk
✓ Inodes
✓ SSH service
✓ Docker service
✓ Port 22
✓ Port 80
✓ HTTP endpoint
✓ Failure count
✓ Exit code
```

Target architecture:


```
system-monitor.sh
        │
        ├── check_cpu()
        ├── check_memory()
        ├── check_disk()
        ├── check_inodes()
        ├── check_service()
        ├── check_port()
        ├── check_http()
        │
        └── summary()
```

---

## Day 18 Mental Model

Remember this:


```
Linux System
     ↓
Collect metrics
     ↓
CPU / Memory / Disk / Inodes
     ↓
Check processes / services / ports
     ↓
Health checks
     ↓
Compare against thresholds
     ↓
OK / WARNING / CRITICAL
     ↓
Exit code + logs + alert
```

**Day 17:** automate Linux tasks

**Day 18:** monitor Linux systems

**Next:** we can move deeper into **Bash + Linux Networking & Troubleshooting**, where you'll build scripts that diagnose connectivity, DNS, ports, HTTP failures, and service-to-service problems.

let go
