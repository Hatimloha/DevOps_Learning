Linux Fundamentals — Day 5
Linux Networking + SSH + HTTP

Networking is one of the most important Linux skills for DevOps.

You should be able to answer:

"My application is running, but why can't I access it?"

1. Basic Networking Concepts

A Linux server usually has:

Application
    ↓
Port
    ↓
IP Address
    ↓
Network Interface
    ↓
Network

Example:

192.168.1.10:8080
192.168.1.10 → IP address
8080 → port
2. Check IP Address

Use:

ip addr

Short version:

ip a

You'll see interfaces such as:

lo
eth0
ens33
3. Loopback
127.0.0.1

means:

This machine itself.

You can also use:

localhost

Example:

curl http://localhost:8080
4. Check Network Interfaces
ip link

You'll see whether interfaces are:

UP
DOWN
5. Test Connectivity — ping
ping google.com

Stop with:

Ctrl + C

You can also ping an IP:

ping 8.8.8.8
Important

If IP works but domain doesn't:

ping 8.8.8.8     → works
ping google.com  → fails

The problem may be DNS.

6. DNS Lookup

Use:

nslookup google.com

or:

dig google.com

If dig isn't installed:

sudo apt install dnsutils
7. curl 🔥

curl is one of the most important DevOps commands.

Make HTTP request:

curl https://example.com

You can use it to:

test APIs
test services
inspect HTTP responses
download data
debug applications
8. See HTTP Headers
curl -I https://example.com

Example:

HTTP/2 200
content-type: text/html
9. Verbose curl

Very useful for debugging:

curl -v https://example.com

You'll see:

DNS connection
TCP connection
TLS
HTTP request
HTTP response
10. Test an API
curl https://api.example.com/users

POST example:

curl -X POST https://api.example.com/users

With JSON:

curl \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Hatim"}' \
  https://api.example.com/users

This becomes extremely useful when debugging backend services.

11. wget

Download a file:

wget https://example.com/file.zip

curl and wget overlap, but:

curl → excellent for APIs/network debugging
wget → commonly used for downloading files
12. Check Listening Ports

Use:

ss -tuln

More details:

ss -tulnp

Example:

LISTEN 0 128 0.0.0.0:8080

Your application is listening on port 8080.

13. Important Ports

Memorize these:

Port	Protocol/Service
22	SSH
53	DNS
80	HTTP
443	HTTPS
3000	Common Node/dev server
5432	PostgreSQL
6379	Redis
8080	Common application port
14. Test a Port

You can use:

nc -zv localhost 8080

If successful:

Connection succeeded

If not:

Connection refused
15. SSH 🔥🔥

SSH = Secure Shell.

It allows you to remotely access another Linux machine.

Basic:

ssh user@server-ip

Example:

ssh ubuntu@192.168.1.50
16. SSH Using Private Key

Common AWS EC2 example:

ssh -i key.pem ubuntu@SERVER_IP

You may need:

chmod 400 key.pem
17. SSH Authentication

Typical flow:

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

Authentication can use:

password
SSH keys

For production, SSH keys are preferred.

18. SCP

Copy files over SSH.

Local → Server:

scp app.tar.gz ubuntu@server:/home/ubuntu/

Server → Local:

scp ubuntu@server:/home/ubuntu/app.log .
19. SSH Config

Instead of repeatedly typing:

ssh -i key.pem ubuntu@192.168.1.50

You can configure:

~/.ssh/config

Example:

Host myserver
    HostName 192.168.1.50
    User ubuntu
    IdentityFile ~/.ssh/key.pem

Then:

ssh myserver

Much easier.

20. Network Troubleshooting Flow 🔥

Imagine your application isn't accessible.

Don't randomly restart everything.

Check in order:

1. Is the process running?
ps aux | grep app
2. Is the port listening?
ss -tulnp
3. Can localhost access it?
curl http://localhost:8080
4. Is the server reachable?
ping SERVER_IP
5. Is DNS working?
dig example.com
6. Is the remote port reachable?
nc -zv SERVER_IP 8080
7. Check firewall/security rules

On Linux:

sudo ufw status

In AWS, also check:

Security Group

This troubleshooting mindset is much more valuable than memorizing commands.

21. Real DevOps Scenario

Your Node.js application says:

Server running on port 3000

But browser cannot access it.

Check:

ss -tulnp | grep 3000

Suppose you see:

127.0.0.1:3000

This means the application is listening only on localhost.

It may need to listen on:

0.0.0.0:3000

Now the application can accept connections through the server's network interface, assuming firewall/security rules also permit it.

This is a very common production issue.

22. Practice 🔥
Task 1

Find your IP:

ip a
Task 2

Check DNS:

nslookup google.com
Task 3

Check connectivity:

ping 8.8.8.8
Task 4

Inspect HTTP:

curl -I https://example.com
Task 5

Inspect the complete request:

curl -v https://example.com
Task 6

Check listening ports:

ss -tulnp
Task 7

Find your SSH configuration:

ls -la ~/.ssh

Don't modify or delete anything yet.

Day 5 Commands to Master
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
DevOps priority

I'd especially memorize:

curl
ss
ssh
scp
ip

You'll use these constantly with AWS, Docker, Kubernetes, CI/CD, and production servers.
