# Day 19 — Networking & Troubleshooting

Today we move from **monitoring** into **automated troubleshooting**.

You've already learned Linux networking basics, SSH, HTTP, ports, DNS, `curl`, `ss`, `nc`, and Bash functions. Now we'll combine them into a **network diagnostic script**.

---

## 1. The DevOps Troubleshooting Flow

When an application cannot connect, don't randomly run commands.

Use this flow:


```
Application
    ↓
DNS
    ↓
IP address
    ↓
Network connectivity
    ↓
Port
    ↓
TCP connection
    ↓
HTTP/application
```

For example:


```
myapp.example.com
       ↓
   DNS resolves?
       ↓
   IP reachable?
       ↓
   Port 443 open?
       ↓
   TCP connection?
       ↓
   HTTP response?
```

This gives you a systematic troubleshooting method.

---

# 2. Check DNS

Basic:


```
nslookup google.com
```

Better for scripting:


```
dig google.com
```

Get only the IP:


```
dig +short google.com
```

Example:


```
142.250.x.x
```

In Bash:


```
ip=$(dig +short "$host" | head -n1)

echo "IP: $ip"
```

---

# 3. Check Whether DNS Works

Create:


```
check_dns() {
    local host="$1"

    if dig +short "$host" | grep -q .; then
        echo "[OK] DNS resolution: $host"
    else
        echo "[CRITICAL] DNS resolution failed: $host"
        return 1
    fi
}
```

Usage:


```
check_dns google.com
```

Important:


```
DNS failure ≠ network failure
```

The server might have working networking but broken DNS configuration.

---

# 4. Check Network Reachability

The classic command:


```
ping -c 4 8.8.8.8
```

But don't rely entirely on ping.

Why?

Because:


```
ICMP may be blocked
```

A server can be reachable over TCP while refusing ICMP.

So:


```
ping failed
```

doesn't automatically mean:


```
server is down
```

---

# 5. Check a TCP Port

You learned `ss` for local listening ports.

For remote connectivity, `nc` is useful.


```
nc -zv google.com 443
```

Meaning:


```
-z → scan/check without sending data
-v → verbose
```

Example:


```
Connection to google.com 443 port [tcp/https] succeeded!
```

Function:


```
check_port() {
    local host="$1"
    local port="$2"

    if nc -z -w 5 "$host" "$port" 2>/dev/null; then
        echo "[OK] $host:$port reachable"
    else
        echo "[CRITICAL] $host:$port unreachable"
        return 1
    fi
}
```

Usage:


```
check_port google.com 443
```

---

# 6. Check HTTP

TCP connectivity isn't enough.

You need to know whether the application responds.


```
curl -I https://google.com
```

For scripting:


```
curl -fsS --max-time 5 https://google.com
```

Check only the HTTP status:


```
curl -s -o /dev/null -w '%{http_code}\n' https://google.com
```

Example:


```
200
```

This is extremely useful in monitoring scripts.

---

# 7. HTTP Status Codes

You should know these:


```
200 → OK
201 → Created
204 → No Content

301 → Permanent redirect
302 → Temporary redirect

400 → Bad Request
401 → Unauthorized
403 → Forbidden
404 → Not Found

500 → Internal Server Error
502 → Bad Gateway
503 → Service Unavailable
504 → Gateway Timeout
```

From a DevOps perspective:


```
4xx → usually client/request side
5xx → usually server/upstream side
```

But don't treat that as an absolute rule. For example, authentication and authorization systems can make 401/403 part of normal application behavior.

---

# 8. Build an HTTP Status Checker


```
check_http() {
    local url="$1"
    local status

    status=$(curl -s -o /dev/null \
        -w '%{http_code}' \
        --max-time 5 \
        "$url")

    if [[ "$status" =~ ^2[0-9][0-9]$ ]]; then
        echo "[OK] $url → HTTP $status"
    elif [[ "$status" =~ ^3[0-9][0-9]$ ]]; then
        echo "[WARNING] $url → HTTP $status"
    elif [[ "$status" =~ ^[45][0-9][0-9]$ ]]; then
        echo "[CRITICAL] $url → HTTP $status"
        return 1
    else
        echo "[CRITICAL] $url → HTTP $status"
        return 1
    fi
}
```

---

# 9. Check Your Network Interface


```
ip addr
```

Or:


```
ip -br addr
```

The second is much easier to read:


```
lo       UNKNOWN    127.0.0.1/8
eth0     UP         192.168.1.20/24
```

Check interface state:


```
ip link
```

You want something like:


```
state UP
```

---

# 10. Check the Routing Table


```
ip route
```

Typical output:


```
default via 192.168.1.1 dev eth0
192.168.1.0/24 dev eth0 proto kernel scope link
```

The important part:


```
default via 192.168.1.1
```

That's your default gateway.

If the machine has no appropriate route, external connectivity may fail.

---

# 11. Check the Default Route

A simple script check:


```
check_route() {
    if ip route | grep -q '^default'; then
        echo "[OK] Default route exists"
    else
        echo "[CRITICAL] No default route"
        return 1
    fi
}
```

Run:


```
check_route
```

---

# 12. Check DNS Configuration

Look at:


```
cat /etc/resolv.conf
```

Modern systems may use a resolver such as:


```
nameserver 127.0.0.53
```

or another DNS server.

You can test the configured resolver with:


```
resolvectl status
```

on systems using `systemd-resolved`.

---

# 13. Check Listening Services

For local ports:


```
ss -lnt
```

More useful:


```
ss -lntp
```

Example:


```
LISTEN 0 128 0.0.0.0:80
LISTEN 0 128 0.0.0.0:22
```

Find port 8080:


```
ss -lntp | grep ':8080'
```

---

# 14. The Important `127.0.0.1` Problem

Suppose:


```
Application:
127.0.0.1:8080
```

Then:


```
curl localhost:8080
```

works.

But:


```
curl 192.168.1.20:8080
```

may fail.

Why?

Because the application is only listening on the loopback interface.

Compare:


```
127.0.0.1:8080
```

with:


```
0.0.0.0:8080
```

Conceptually:


```
127.0.0.1
   ↓
Only this machine

0.0.0.0
   ↓
Listen on available interfaces
```

This is one of the most common application networking problems.

---

# 15. Trace the Network Path

Use:


```
traceroute google.com
```

If unavailable:


```
tracepath google.com
```

This helps answer:

> Where along the route is connectivity failing?

Example:


```
Your server
    ↓
Gateway
    ↓
Router
    ↓
ISP
    ↓
Internet
    ↓
Destination
```

Don't assume every `* * *` means failure; routers may intentionally not answer traceroute probes.

---

# 16. Check Open Connections

You already know:


```
ss
```

Useful:


```
ss -tan
```

Listening:


```
ss -lnt
```

Established:


```
ss -tn state established
```

Find connections to port 443:


```
ss -tn | grep ':443'
```

This becomes very useful when debugging:


```
Too many connections
TIME_WAIT
ESTABLISHED
connection exhaustion
```

---

# 17. TCP States

Know these:


```
LISTEN
ESTABLISHED
TIME-WAIT
SYN-SENT
SYN-RECV
FIN-WAIT
CLOSE-WAIT
```

A simplified connection:


```
Client                    Server

SYN -------------------->

     <------------------ SYN-ACK

ACK -------------------->

       ESTABLISHED
```

If you see lots of:


```
SYN-SENT
```

you may have connection/reachability problems.

If you see lots of:


```
CLOSE-WAIT
```

it can indicate applications aren't properly closing sockets.

---

# 18. Build a Network Diagnostic Script

Now let's combine the concepts.

### `network-check.sh`


```
#!/bin/bash

set -Eeuo pipefail

failures=0

log() {
    local level="$1"
    local message="$2"

    printf '[%s] %s\n' "$level" "$message"
}

check_interface() {
    if ip link show | grep -q 'state UP'; then
        log "OK" "Network interface is UP"
    else
        log "CRITICAL" "No UP network interface found"
        ((failures++))
    fi
}

check_route() {
    if ip route | grep -q '^default'; then
        log "OK" "Default route exists"
    else
        log "CRITICAL" "Default route missing"
        ((failures++))
    fi
}

check_dns() {
    local host="$1"

    if dig +short "$host" | grep -q .; then
        log "OK" "DNS resolution: $host"
    else
        log "CRITICAL" "DNS resolution failed: $host"
        ((failures++))
    fi
}

check_port() {
    local host="$1"
    local port="$2"

    if nc -z -w 5 "$host" "$port" 2>/dev/null; then
        log "OK" "$host:$port reachable"
    else
        log "CRITICAL" "$host:$port unreachable"
        ((failures++))
    fi
}

check_http() {
    local url="$1"
    local status

    status=$(curl -s -o /dev/null \
        -w '%{http_code}' \
        --max-time 5 \
        "$url")

    if [[ "$status" =~ ^2[0-9][0-9]$ ]]; then
        log "OK" "$url → HTTP $status"
    else
        log "CRITICAL" "$url → HTTP $status"
        ((failures++))
    fi
}

main() {
    local host="${1:-google.com}"

    echo "===== Network Diagnostic ====="
    echo "Target: $host"
    echo

    check_interface
    check_route
    check_dns "$host"
    check_port "$host" 443
    check_http "https://$host"

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
chmod +x network-check.sh
./network-check.sh google.com
```

---

# 19. Troubleshooting Like a DevOps Engineer

Suppose your application is unreachable.

Don't immediately restart everything.

Use:


```
1. Is the process running?
        ↓
2. Is the service running?
        ↓
3. Is the port listening?
        ↓
4. What interface is it bound to?
        ↓
5. Is DNS resolving?
        ↓
6. Is there a route?
        ↓
7. Can TCP connect?
        ↓
8. Does HTTP respond?
        ↓
9. What do the logs say?
```

Example:


```
ps
systemctl status myapp
ss -lntp
ip addr
ip route
dig myapp.example.com
nc -zv myapp.example.com 8080
curl -v http://myapp.example.com:8080
journalctl -u myapp
```

That's a **repeatable troubleshooting workflow**.

---

# 20. `curl -v` Is Extremely Useful

When HTTP isn't behaving:


```
curl -v https://example.com
```

You'll see things such as:


```
* Connected to example.com
* TLS handshake
> GET /
< HTTP/1.1 200 OK
```

This lets you distinguish:


```
DNS problem
        ↓
TCP problem
        ↓
TLS problem
        ↓
HTTP problem
        ↓
Application problem
```

That distinction is extremely valuable.

---

# 21. DevOps Example

Imagine:


```
User
 ↓
Load Balancer
 ↓
Nginx
 ↓
Application
 ↓
Database
```

User reports:

> Website is down.

Your investigation:


```
curl domain.com
      ↓
     502
      ↓
Nginx is alive
      ↓
Check nginx logs
      ↓
Upstream connection failed
      ↓
Check application port
      ↓
Port not listening
      ↓
systemctl status myapp
      ↓
Application crashed
      ↓
journalctl -u myapp
```

Notice the difference:

You didn't just say:

> "Website is down."

You identified the **failure layer**.

---

# 22. Day 19 Practice

### Task 1 — DNS Checker

Create:


```
dns-check.sh
```

Usage:


```
./dns-check.sh google.com
```

Check:

-  DNS resolution 
-  resolved IP 
-  exit code 

---

### Task 2 — Port Checker

Create:


```
port-check.sh
```

Usage:


```
./port-check.sh google.com 443
```

Use:


```
nc
```

---

### Task 3 — HTTP Checker

Usage:


```
./http-check.sh https://google.com
```

Print:


```
HTTP Status: 200
```

and classify it:


```
2xx → OK
3xx → WARNING
4xx/5xx → CRITICAL
```

---

### Task 4 — Network Diagnostic ⭐

Create:


```
network-check.sh
```

It should check:


```
✓ Interface
✓ Default route
✓ DNS
✓ TCP port
✓ HTTP
✓ Failure count
✓ Exit code
```

---

### Task 5 — Real Troubleshooting

On your Linux machine, run:


```
ip -br addr
ip route
ss -lntp
cat /etc/resolv.conf
```

Then investigate:


```
curl -v https://google.com
```

Try to understand **each stage of the connection**, rather than just looking at whether `curl` succeeded.

---

## Day 19 Mental Model


```
          Network Troubleshooting
                    │
       ┌────────────┼────────────┐
       ↓            ↓            ↓
     DNS          Routing       Interface
       │            │            │
       └────────────┼────────────┘
                    ↓
                  TCP
                    ↓
                  Port
                    ↓
                  TLS
                    ↓
                 HTTP
                    ↓
              Application
                    ↓
                  Logs
```

**Day 18:** Monitor the system.

**Day 19:** Diagnose the system.

