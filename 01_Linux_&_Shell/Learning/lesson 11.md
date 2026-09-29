# 🐚 Linux & Bash — Day 11

## Bash Scripting: Loops & Arrays

Today we move from **conditions** to **automation**.

In Day 10, scripts followed this flow:

```text
Input → Variable → Condition → Action
```

Now we introduce repetition:

```text
Input → Loop → Action → Repeat
```

---

## Learning Objectives

By the end of this lesson, you will be able to:

* Use `for`, `while`, and `until` loops
* Control loops using `break` and `continue`
* Create and manage Bash arrays
* Process files and directories automatically
* Read files line-by-line safely
* Loop through script arguments
* Build automation workflows commonly used in DevOps

---

# 1. Why Loops Matter

Instead of running the same command repeatedly:

```text
10 Servers
20 Docker Containers
50 Log Files
100 Kubernetes Namespaces
```

Use automation:

```bash
for server in server1 server2 server3
do
    echo "Checking $server"
done
```

Output:

```text
Checking server1
Checking server2
Checking server3
```

---

# 2. for Loop

Basic syntax:

```bash
for item in list
do
    command
done
```

Example:

```bash
#!/bin/bash

for name in Hatim Ali Ahmed
do
    echo "Hello $name"
done
```

Output:

```text
Hello Hatim
Hello Ali
Hello Ahmed
```

### One-line Version

```bash
for name in Hatim Ali Ahmed; do echo "Hello $name"; done
```

---

# 3. Loop Through Numbers

Explicit values:

```bash
for number in 1 2 3 4 5
do
    echo "Number: $number"
done
```

Brace expansion:

```bash
for number in {1..5}
do
    echo "$number"
done
```

Output:

```text
1
2
3
4
5
```

---

# 4. C-Style for Loop

```bash
for ((i=1; i<=5; i++))
do
    echo "$i"
done
```

Output:

```text
1
2
3
4
5
```

Useful when a counter is required.

Example:

```bash
for ((i=1; i<=10; i++))
do
    echo "Deployment attempt: $i"
done
```

---

# 5. while Loop

A `while` loop runs while a condition remains true.

```bash
count=1

while [[ "$count" -le 5 ]]
do
    echo "Count: $count"
    ((count++))
done
```

Output:

```text
Count: 1
Count: 2
Count: 3
Count: 4
Count: 5
```

### Important

Always update the loop variable.

Bad example:

```bash
count=1

while [[ "$count" -le 5 ]]
do
    echo "$count"
done
```

This creates an infinite loop.

---

# 6. until Loop

Opposite of `while`.

```bash
count=1

until [[ "$count" -gt 5 ]]
do
    echo "$count"
    ((count++))
done
```

Output:

```text
1
2
3
4
5
```

### Comparison

```text
while → continue while condition is TRUE

until → continue until condition becomes TRUE
```

---

# 7. break

Exit a loop immediately.

```bash
for number in {1..10}
do
    if [[ "$number" -eq 5 ]]; then
        break
    fi

    echo "$number"
done
```

Output:

```text
1
2
3
4
```

---

# 8. continue

Skip the current iteration.

```bash
for number in {1..5}
do
    if [[ "$number" -eq 3 ]]; then
        continue
    fi

    echo "$number"
done
```

Output:

```text
1
2
4
5
```

### Difference

```text
break    → stop entire loop

continue → skip current iteration
```

---

# 9. Arrays

Create an array:

```bash
servers=("server1" "server2" "server3")
```

Access one element:

```bash
echo "${servers[0]}"
```

Output:

```text
server1
```

### Array Indexes

```text
Index:    0        1        2
           ↓        ↓        ↓
         server1  server2  server3
```

---

# 10. Access All Array Elements

```bash
"${servers[@]}"
```

Example:

```bash
servers=("server1" "server2" "server3")

for server in "${servers[@]}"
do
    echo "Checking $server"
done
```

Output:

```text
Checking server1
Checking server2
Checking server3
```

### Best Practice

Use:

```bash
"${array[@]}"
```

Not:

```bash
${array[@]}
```

The quotes preserve elements containing spaces.

---

# 11. Array Length

```bash
echo "${#servers[@]}"
```

Example:

```bash
servers=("server1" "server2" "server3")

echo "Total servers: ${#servers[@]}"
```

Output:

```text
Total servers: 3
```

---

# 12. Add Elements to Arrays

```bash
servers=("server1" "server2")

servers+=("server3")
servers+=("server4")
```

Display:

```bash
echo "${servers[@]}"
```

Output:

```text
server1 server2 server3 server4
```

---

# 13. Loop Through Files

Example directory:

```text
logs/
├── app.log
├── error.log
└── access.log
```

Process files:

```bash
for file in logs/*.log
do
    echo "Processing: $file"
done
```

Output:

```text
Processing: logs/app.log
Processing: logs/error.log
Processing: logs/access.log
```

Example with operations:

```bash
for file in logs/*.log
do
    echo "Checking $file"
    wc -l "$file"
done
```

---

# 14. Check Files Before Processing

Safer pattern:

```bash
for file in logs/*.log
do
    if [[ -f "$file" ]]; then
        echo "Processing: $file"
    fi
done
```

---

# 15. Read Files Line-by-Line

Suppose `servers.txt` contains:

```text
server1
server2
server3
```

Recommended pattern:

```bash
while IFS= read -r server
do
    echo "Checking $server"
done < servers.txt
```

### Why?

```bash
IFS=
```

Prevents unwanted whitespace splitting.

```bash
read -r
```

Prevents backslash interpretation.

---

# 16. Server Health Check Script

```bash
#!/bin/bash

servers=("server1" "server2" "server3")

for server in "${servers[@]}"
do
    echo "Checking $server..."

    if ping -c 1 "$server" > /dev/null 2>&1; then
        echo "$server is UP"
    else
        echo "$server is DOWN"
    fi
done
```

Workflow:

```text
Servers Array
      ↓
    Loop
      ↓
     Ping
      ↓
  Condition
      ↓
  UP / DOWN
```

---

# 17. Docker Cleanup Example

```bash
#!/bin/bash

containers=$(docker ps -aq)

for container in $containers
do
    echo "Container: $container"
done
```

### Better Option

Use Docker's built-in cleanup:

```bash
docker container prune
```

Use loops only when necessary.

---

# 18. Nested Loops

```bash
for environment in development staging production
do
    for region in us-east-1 eu-west-1
    do
        echo "$environment → $region"
    done
done
```

Output:

```text
development → us-east-1
development → eu-west-1
staging → us-east-1
staging → eu-west-1
production → us-east-1
production → eu-west-1
```

Useful for:

```text
Environment × Region
```

---

# 19. Loop Through Command Output

```bash
for service in $(systemctl list-units --type=service \
--state=running --no-legend | awk '{print $1}')
do
    echo "Running service: $service"
done
```

### Warning

Command substitution performs word splitting.

For arbitrary lines, prefer:

```bash
while IFS= read -r line
```

---

# 20. Service Monitoring Script

```bash
#!/bin/bash

services=("ssh" "docker")

for service in "${services[@]}"
do
    if systemctl is-active --quiet "$service"; then
        echo "$service is running"
    else
        echo "$service is NOT running"
    fi
done
```

---

# 21. Loop Through Script Arguments

```bash
#!/bin/bash

for environment in "$@"
do
    echo "Deploying to: $environment"
done
```

Run:

```bash
./deploy.sh development staging production
```

Output:

```text
Deploying to: development
Deploying to: staging
Deploying to: production
```

---

# 22. "$@" vs $@

Preferred:

```bash
for arg in "$@"
do
    echo "$arg"
done
```

Avoid:

```bash
for arg in $@
do
    echo "$arg"
done
```

Quoted version safely handles spaces.

---

# 23. Production-Style Example

```bash
#!/bin/bash

set -euo pipefail

environments=("development" "staging" "production")

for environment in "${environments[@]}"
do
    echo "--------------------------------"
    echo "Checking environment: $environment"

    case "$environment" in
        development)
            echo "Development deployment"
            ;;
        staging)
            echo "Staging deployment"
            ;;
        production)
            echo "Production deployment"
            ;;
        *)
            echo "Unknown environment"
            exit 1
            ;;
    esac
done

echo "All environments checked successfully."
```

---

# Practice Lab

## Exercise 1 — Numbers

Print:

```text
1
2
3
4
5
6
7
8
9
10
```

Using a `for` loop.

---

## Exercise 2 — Even Numbers

Print:

```text
2
4
6
8
10
```

Hint:

```bash
(( number % 2 == 0 ))
```

---

## Exercise 3 — Array

Create:

```bash
services=("nginx" "docker" "ssh" "postgresql")
```

Output:

```text
Checking nginx
Checking docker
Checking ssh
Checking postgresql
```

---

## Exercise 4 — Service Health

Create array:

```bash
services=("ssh" "docker")
```

Use:

```bash
systemctl is-active
```

To check service status.

---

## Exercise 5 — File Processing

Create log files and print:

```text
Processing: app.log
Processing: error.log
Processing: access.log
```

---

## Exercise 6 — Read Servers

Create:

```text
servers.txt
```

Contents:

```text
server1
server2
server3
```

Read using:

```bash
while IFS= read -r server
```

---

## Exercise 7 — Deployment Automation

Run:

```bash
./deploy.sh development staging production
```

Output:

```text
Deploying to development
Deploying to staging
Deploying to production
```

Use:

```bash
"$@"
```

---

# Day 11 Master Concepts

| Concept              | Purpose                |
| -------------------- | ---------------------- |
| `for`                | Repeat over values     |
| `while`              | Repeat while true      |
| `until`              | Repeat until true      |
| `break`              | Exit loop              |
| `continue`           | Skip iteration         |
| `(( ))`              | Arithmetic expressions |
| `array=(...)`        | Create array           |
| `${array[@]}`        | Access elements        |
| `${#array[@]}`       | Array length           |
| `array+=()`          | Add elements           |
| `"$@"`               | Safe script arguments  |
| `while IFS= read -r` | Safe file reading      |

---

# DevOps Mental Model

```text
                Bash Script
                    │
           ┌────────┴────────┐
           │                 │
        Input            Variables
           │                 │
           └────────┬────────┘
                    │
               Conditions
                    │
                  Loops
                    │
        ┌───────────┼───────────┐
        │           │           │
      Files      Services    Servers
        │           │           │
        └───────────┼───────────┘
                    │
               Automation
```

## Key Takeaway

Bash is no longer just a way to run commands.

You are now using Bash to automate Linux systems, process files, manage services, and build the foundation for DevOps automation.
