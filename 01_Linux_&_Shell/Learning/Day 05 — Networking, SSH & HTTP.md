# Linux Fundamentals — Day 5

## Linux Networking, SSH & HTTP

Networking is one of the most important Linux skills for DevOps.

A key troubleshooting question you should be able to answer is:

> **"My application is running, but why can't I access it?"**

This lesson covers Linux networking fundamentals, DNS, HTTP requests, ports, SSH, file transfers, and a practical troubleshooting workflow.

---

# 📚 Topics Covered

* Basic Networking Concepts
* IP Addresses & Network Interfaces
* Loopback & Localhost
* Connectivity Testing
* DNS
* `curl` & HTTP Debugging
* `wget`
* Listening Ports
* Common Network Ports
* Port Testing
* SSH
* SSH Key Authentication
* SCP File Transfers
* SSH Configuration
* Network Troubleshooting
* Real DevOps Scenario

---

# 1. 🌐 Basic Networking Concepts

A Linux server usually communicates through the following layers:

```text
Application
    ↓
Port
    ↓
IP Address
    ↓
Network Interface
    ↓
Network
```

Example:

```text
192.168.1.10:8080
```

Where:

* `192.168.1.10` → IP Address
* `8080` → Port

Your application listens on a port, and the network interface makes it accessible through the network.

---

# 2. 🖥️ Check IP Address

Use:

```bash
ip addr
```

Short version:

```bash
ip a
```

You may see interfaces such as:

```text
lo
eth0
ens33
```

Each interface can have its own network configuration and IP address.

---

# 3. 🔄 Loopback & Localhost

The address:

```text
127.0.0.1
```

means:

> **This machine itself**

You can also use:

```text
localhost
```

Example:

```bash
curl http://localhost:8080
```

This tests whether an application is accessible from the same machine.

---

# 4. 🔌 Check Network Interfaces

Use:

```bash
ip link
```

This shows your network interfaces and their status.

Common states:

```text
UP
DOWN
```

---

# 5. 📡 Test Connectivity with `ping`

Test connectivity to a domain:

```bash
ping google.com
```

Stop the command with:

```text
Ctrl + C
```

You can also ping an IP address:

```bash
ping 8.8.8.8
```

## DNS Troubleshooting Example

If this works:

```bash
ping 8.8.8.8
```

But this fails:

```bash
ping google.com
```

The problem may be related to:

> **DNS resolution**

---

# 6. 🔍 DNS Lookup

Use:

```bash
nslookup google.com
```

Or:

```bash
dig google.com
```

If `dig` is not installed:

```bash
sudo apt install dnsutils
```

DNS converts domain names into IP addresses.

Example:

```text
google.com
      ↓
DNS
      ↓
IP Address
```

---

# 7. 🔥 `curl`

`curl` is one of the most important commands for DevOps and production troubleshooting.

Make an HTTP request:

```bash
curl https://example.com
```

You can use `curl` to:

* Test APIs
* Test services
* Inspect HTTP responses
* Download data
* Debug applications

---

# 8. 📄 View HTTP Headers

Use:

```bash
curl -I https://example.com
```

Example response:

```text
HTTP/2 200
content-type: text/html
```

The `200` status code usually means the request was successful.

---

# 9. 🔎 Verbose `curl`

For detailed debugging:

```bash
curl -v https://example.com
```

This can show information about:

* DNS resolution
* TCP connection
* TLS handshake
* HTTP request
* HTTP response

This is extremely useful when debugging connectivity issues.

---

# 10. 🚀 Test an API

Example:

```bash
curl https://api.example.com/users
```

## POST Request

```bash
curl -X POST https://api.example.com/users
```

## POST Request with JSON

```bash
curl \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Hatim"}' \
  https://api.example.com/users
```

This becomes especially useful when debugging backend services and APIs.

---

# 11. 📥 `wget`

Use `wget` to download files:

```bash
wget https://example.com/file.zip
```

## `curl` vs `wget`

| Tool   | Best Use                   |
| ------ | -------------------------- |
| `curl` | APIs and network debugging |
| `wget` | Downloading files          |

Both tools can perform similar tasks, but they are commonly used for different purposes.

---

# 12. 🚪 Check Listening Ports

Use:

```bash
ss -tuln
```

For process information:

```bash
ss -tulnp
```

Example:

```text
LISTEN 0 128 0.0.0.0:8080
```

This means an application is listening on:

```text
Port: 8080
```

---

# 13. 🔢 Important Ports

These ports are important to memorize:

| Port   | Protocol / Service                  |
| ------ | ----------------------------------- |
| `22`   | SSH                                 |
| `53`   | DNS                                 |
| `80`   | HTTP                                |
| `443`  | HTTPS                               |
| `3000` | Common Node.js / Development Server |
| `5432` | PostgreSQL                          |
| `6379` | Redis                               |
| `8080` | Common Application Port             |

---

# 14. 🧪 Test a Port

Use `nc` (Netcat):

```bash
nc -zv localhost 8080
```

If successful:

```text
Connection succeeded
```

If unsuccessful:

```text
Connection refused
```

This helps determine whether a service is reachable on a specific port.

---

# 15. 🔐 SSH

SSH stands for:

> **Secure Shell**

It allows you to remotely access another Linux machine.

Basic syntax:

```bash
ssh user@server-ip
```

Example:

```bash
ssh ubuntu@192.168.1.50
```

---

# 16. 🔑 SSH Using a Private Key

A common AWS EC2 example:

```bash
ssh -i key.pem ubuntu@SERVER_IP
```

You may need to restrict the key permissions:

```bash
chmod 400 key.pem
```

---

# 17. 🔐 SSH Authentication

Typical SSH connection flow:

```text
Your Computer
      |
      | SSH
      ↓
Linux Server
      |
      ↓
Authentication
      |
      ↓
Shell
```

SSH authentication can use:

* Password authentication
* SSH keys

For production environments, **SSH key authentication is generally preferred**.

---

# 18. 📁 SCP — Secure Copy

SCP allows you to copy files over SSH.

## Local → Server

```bash
scp app.tar.gz ubuntu@server:/home/ubuntu/
```

## Server → Local

```bash
scp ubuntu@server:/home/ubuntu/app.log .
```

---

# 19. ⚙️ SSH Config

Instead of repeatedly typing:

```bash
ssh -i key.pem ubuntu@192.168.1.50
```

You can configure:

```text
~/.ssh/config
```

Example:

```text
Host myserver
    HostName 192.168.1.50
    User ubuntu
    IdentityFile ~/.ssh/key.pem
```

Then simply connect using:

```bash
ssh myserver
```

This makes managing multiple servers much easier.

---

# 20. 🔥 Network Troubleshooting Flow

Imagine your application is not accessible.

❌ Don't randomly restart everything.

Instead, troubleshoot systematically.

## Step 1: Is the process running?

```bash
ps aux | grep app
```

## Step 2: Is the port listening?

```bash
ss -tulnp
```

## Step 3: Can localhost access the application?

```bash
curl http://localhost:8080
```

## Step 4: Is the server reachable?

```bash
ping SERVER_IP
```

## Step 5: Is DNS working?

```bash
dig example.com
```

## Step 6: Is the remote port reachable?

```bash
nc -zv SERVER_IP 8080
```

## Step 7: Check firewall rules

On Linux:

```bash
sudo ufw status
```

For AWS, also check:

* Security Groups
* Network configuration
* Inbound rules
* Outbound rules

> **A systematic troubleshooting mindset is much more valuable than simply memorizing commands.**

---

# 21. 🚨 Real DevOps Scenario

Your Node.js application says:

```text
Server running on port 3000
```

But you cannot access it from your browser.

First, check the listening address:

```bash
ss -tulnp | grep 3000
```

Suppose you see:

```text
127.0.0.1:3000
```

This means the application is listening only on:

> **localhost**

External machines cannot directly access it.

The application may need to listen on:

```text
0.0.0.0:3000
```

This allows the application to accept connections through the server's network interface.

```text
Application
      ↓
0.0.0.0:3000
      ↓
Network Interface
      ↓
External Access
```

⚠️ Firewall and cloud security rules must also allow the connection.

This is a very common production issue.

---

# 22. 🧪 Practice Tasks

## Task 1 — Find Your IP Address

```bash
ip a
```

## Task 2 — Check DNS

```bash
nslookup google.com
```

## Task 3 — Test Connectivity

```bash
ping 8.8.8.8
```

## Task 4 — Inspect HTTP Headers

```bash
curl -I https://example.com
```

## Task 5 — Inspect the Complete Request

```bash
curl -v https://example.com
```

## Task 6 — Check Listening Ports

```bash
ss -tulnp
```

## Task 7 — Check SSH Configuration

```bash
ls -la ~/.ssh
```

> ⚠️ Do not modify or delete SSH files until you understand their purpose.

---

# 🛠️ Day 5 Commands to Master

```bash
ip a
ip link
ping
nslookup
dig
curl
wget
ss
nc
ssh
scp
```

---

# 🎯 DevOps Priority Commands

The commands you should especially focus on are:

```text
curl
ss
ssh
scp
ip
```

You will use these frequently when working with:

* AWS
* Linux Servers
* Docker
* Kubernetes
* CI/CD Pipelines
* APIs
* Production Environments

---

# 💡 Key Takeaway

When an application is not accessible, follow a logical troubleshooting process:

```text
Application Running?
        ↓
Port Listening?
        ↓
Localhost Working?
        ↓
Server Reachable?
        ↓
DNS Working?
        ↓
Port Reachable?
        ↓
Firewall / Security Rules?
```

> **DevOps is not about memorizing commands. It is about understanding how systems connect and knowing how to systematically find where something is failing.**

---

## 🚀 Next Step

After completing these practice tasks, move on to **Linux process management and service management with `systemd`**, which connects directly to troubleshooting applications running on production servers.
