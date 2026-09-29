# Day 14 — Bash Text Processing & Data Manipulation

A practical DevOps study guide for processing command output, configuration files, logs, and data using standard Linux/Bash utilities.

## Learning Goals

By the end of this lesson, you should be able to:

- Build Linux command pipelines using `|`
- Search and filter data with `grep`
- Extract fields with `cut` and `awk`
- Sort and count data with `sort` and `uniq`
- Transform text with `tr` and `sed`
- Monitor logs with `tail -f`
- Analyze Docker and Kubernetes command output
- Combine Bash utilities for practical DevOps troubleshooting

---

Today we move into one of the **most important Linux + DevOps skills**: processing command output, configuration files, and logs.

In real DevOps work, you constantly need to answer questions like:

-  Which requests returned `500`? 
-  Which process is using the most CPU? 
-  How many times did an error occur? 
-  Extract IP addresses from logs. 
-  Find a specific configuration value. 
-  Filter Kubernetes/Docker output. 
-  Transform raw command output into useful data. 

The core tools today are:

`grep` → `cut` → `sort` → `uniq` → `head` → `tail` → `wc` → `tr` → `sed` → `awk`

---

## 1. The Pipeline Concept

The most important concept is the **Linux pipe**:
```bash
command1 | command2 | command3
```
The output of one command becomes the input of the next.

Example:
```bash
ps aux | grep nginx
```
Flow:
```bash
ps aux
   ↓
grep nginx
   ↓
only nginx-related lines
```
Another example:
```bash
cat access.log | grep "500" | wc -l
```
Meaning:
```
access.log
   ↓
find lines containing 500
   ↓
count those lines
```
### DevOps mindset

Instead of manually reading thousands of lines:
```
Raw data → Filter → Transform → Sort → Count
```
---

# 2. `grep` — Search & Filter

`grep` searches text for a pattern.

Basic:
```bash
grep "error" app.log
```
Case-insensitive:
```bash
grep -i "error" app.log
```
Show line numbers:
```bash
grep -n "error" app.log
```
Invert the match:
```bash
grep -v "INFO" app.log
```
Multiple patterns:
```bash
grep -E "error|failed|critical" app.log
```
Recursive search:
```bash
grep -r "database" /etc
```
Useful combination:
```bash
grep -i -n "error" app.log
```
### Real DevOps example

Suppose:
```
app.log
```
contains:
```
INFO Server started
INFO Connected to database
ERROR Database connection failed
INFO Request received
ERROR Timeout
```
Run:
```bash
grep "ERROR" app.log
```
Output:
```
ERROR Database connection failed
ERROR Timeout
```
---

# 3. `head` — First Lines

Show first 10 lines:
```bash
head app.log
```
Specify number:
```bash
head -n 5 app.log
```
Useful for inspecting files quickly:
```bash
head -n 20 /etc/passwd
```
---

# 4. `tail` — Last Lines

Show last 10 lines:
```bash
tail app.log
```
Last 20:
```bash
tail -n 20 app.log
```
### Extremely important for DevOps

Follow a log in real time:
```bash
tail -f app.log
```
For example:
```bash
tail -f /var/log/nginx/access.log
```
Now new log entries appear as they are written.

Stop:
```
Ctrl + C
```
---

# 5. `wc` — Count

`wc` means **word count**, but it can count several things.

Count lines:
```bash
wc -l app.log
```
Count words:
```bash
wc -w app.log
```
Count characters:
```bash
wc -m app.log
```
Example:
```bash
grep "ERROR" app.log | wc -l
```
Meaning:

> How many lines contain `ERROR`?

This is extremely common in troubleshooting.

---

# 6. `sort` — Sort Data

Suppose:
```
server3
server1
server2
server1
```
Run:
```bash
sort servers.txt
```
Result:
```
server1
server1
server2
server3
```
Reverse:
```bash
sort -r servers.txt
```
Numeric sorting:
```bash
sort -n numbers.txt
```
---

# 7. `uniq` — Remove Duplicates

Important:

`uniq` removes **adjacent duplicate lines**.

Example:
```
server1
server1
server2
server3
server3
```
Run:
```bash
uniq servers.txt
```
Result:
```
server1
server2
server3
```
But usually you combine:
```bash
sort servers.txt | uniq
```
Or simply:
```bash
sort -u servers.txt
```
### Count occurrences

This is extremely useful:
```bash
sort servers.txt | uniq -c
```
Example:
```
3 server1
1 server2
2 server3
```
This means:
```
server1 → 3 times
server2 → 1 time
server3 → 2 times
```
---

# 8. `cut` — Extract Columns

Suppose:
```
Hatim:DevOps:UAE
Ali:Developer:India
Ahmed:SRE:UK
```
Extract the first field:
```bash
cut -d ':' -f 1 users.txt
```
Output:
```
Hatim
Ali
Ahmed
```
Extract second field:
```bash
cut -d ':' -f 2 users.txt
```
Output:
```
DevOps
Developer
SRE
```
### Understanding the options
```
-d ':'
```
means delimiter is `:`.
```
-f 1
```
means field 1.

---

# 9. `tr` — Translate / Replace Characters

Convert lowercase to uppercase:
```bash
echo "devops" | tr 'a-z' 'A-Z'
```
Output:
```
DEVOPS
```
Replace characters:
```bash
echo "hello-world" | tr '-' '_'
```
Output:
```
hello_world
```
Remove characters:
```bash
echo "123abc456" | tr -d '0-9'
```
Output:
```
abc
```
---

# 10. `sed` — Stream Editor

`sed` is used for **searching, replacing, deleting, and transforming text**.

Replace first occurrence:
```bash
sed 's/old/new/' file.txt
```
Replace all occurrences:
```bash
sed 's/old/new/g' file.txt
```
Example:
```bash
echo "hello hello" | sed 's/hello/DevOps/g'
```
Result:
```
DevOps DevOps
```
### Delete lines

Delete line 2:
```bash
sed '2d' file.txt
```
Delete lines containing `ERROR`:
```bash
sed '/ERROR/d' app.log
```
### Important

By default:
```bash
sed 's/old/new/g' file.txt
```
**does not modify the original file.**

It prints the modified output.

To modify the file:
```bash
sed -i 's/old/new/g' file.txt
```
Be careful with `-i` in production.

---

# 11. `awk` — Powerful Data Processing

`awk` is one of the most important tools for Linux/DevOps scripting.

Suppose:
```
Hatim DevOps 5000
Ali Developer 4000
Ahmed SRE 6000
```
Print first column:
```bash
awk '{print $1}' users.txt
```
Output:
```
Hatim
Ali
Ahmed
```
Second column:
```bash
awk '{print $2}' users.txt
```
Output:
```
DevOps
Developer
SRE
```
Third column:
```bash
awk '{print $3}' users.txt
```
Output:
```
5000
4000
6000
```
---

# 12. `awk` with Conditions

Print users whose salary is greater than 4500:
```bash
awk '$3 > 4500 {print $1, $3}' users.txt
```
Output:
```
Hatim 5000
Ahmed 6000
```
This is where `awk` becomes extremely powerful.

---

# 13. `awk` with Delimiters

For:
```
Hatim:DevOps:UAE
Ali:Developer:India
Ahmed:SRE:UK
```
Use:
```bash
awk -F ':' '{print $1, $2}' users.txt
```
Output:
```
Hatim DevOps
Ali Developer
Ahmed SRE
```
`-F ':'` defines the field separator.

---

# 14. `awk` + Calculations

Suppose:
```
server1 20
server2 40
server3 60
```
Calculate total:
```bash
awk '{sum += $2} END {print sum}' servers.txt
```
Result:
```
120
```
Average:
```bash
awk '{sum += $2} END {print sum/NR}' servers.txt
```
---

# 15. Real DevOps Log Analysis

Imagine an Nginx access log:
```
10.0.0.1 GET / 200
10.0.0.2 GET /login 200
10.0.0.1 GET /api 500
10.0.0.3 GET /api 404
10.0.0.1 GET /api 500
```
### Find HTTP 500 errors
```bash
grep "500" access.log
```
### Count HTTP 500 errors
```bash
grep "500" access.log | wc -l
```
Result:
```
2
```
### Find IP addresses generating 500 errors
```bash
grep "500" access.log | awk '{print $1}'
```
Result:
```
10.0.0.1
10.0.0.1
```
### Count errors by IP
```bash
grep "500" access.log | awk '{print $1}' | sort | uniq -c
```
Result:
```
2 10.0.0.1
```
This is a very realistic troubleshooting command.

---

# 16. Finding Top IPs

Suppose you want to know which IPs send the most requests:
```bash
awk '{print $1}' access.log | sort | uniq -c | sort -nr
```
Flow:
```
awk
 ↓
extract IP
 ↓
sort
 ↓
count duplicates
 ↓
numeric reverse sort
```
Example:
```
150 10.0.0.1
120 10.0.0.5
80  10.0.0.2
```
Now you can immediately see the busiest clients.

---

# 17. `ps` + Text Processing

Very common DevOps command:
```bash
ps aux | grep nginx
```
Find processes using high CPU:
```bash
ps aux | sort -k3 -nr | head
```
Here:
```
-k3
```bash
sort by column 3.
```
-n
```
numeric.
```
-r
```
reverse.

Then:
```
head
```
shows the top results.

---

# 18. Docker Example

List running containers:
```bash
docker ps
```
Filter:
```bash
docker ps | grep nginx
```
Count running containers:
```bash
docker ps -q | wc -l
```
Get container IDs:
```bash
docker ps -q
```
This demonstrates an important principle:

> Prefer commands that produce machine-friendly output when available.

For example:
```bash
docker ps -q
```
is better than trying to parse the human-readable `docker ps` table.

---

# 19. Kubernetes Example

The same concepts become useful with Kubernetes.

For example:
```bash
kubectl get pods
```
Filter pods:
```bash
kubectl get pods | grep nginx
```
Count pods:
```bash
kubectl get pods --no-headers | wc -l
```
Extract a particular column:
```bash
kubectl get pods --no-headers | awk '{print $1}'
```
Again:
```
command output
      ↓
    filter
      ↓
   extract
      ↓
    count
```
---

# 20. A Very Important DevOps Rule

Don't automatically do:
```
cat file.txt | grep something
```
Instead:
```bash
grep something file.txt
```
This:
```
cat file.txt | grep error
```
works, but is unnecessary.

Prefer:
```bash
grep error file.txt
```
This is often called a **Useless Use of `cat`**.

---

# 21. Combining Everything

Imagine:
```
access.log
```
contains thousands of requests.

You want:

> Top 5 IP addresses generating HTTP 500 errors.

One possible pipeline:
```bash
grep "500" access.log \
    | awk '{print $1}' \
    | sort \
    | uniq -c \
    | sort -nr \
    | head -n 5
```
Think about the pipeline:
```
access.log
    ↓
grep
500 errors only
    ↓
awk
extract IP
    ↓
sort
group identical IPs
    ↓
uniq -c
count IPs
    ↓
sort -nr
highest count first
    ↓
head
top 5
```
This is the kind of command-chain thinking you want to develop as a DevOps engineer.

---

# 22. Bash Script Using Text Processing

Example:
```bash
#!/bin/bash

set -euo pipefail

LOG_FILE="app.log"

if [[ ! -f "$LOG_FILE" ]]; then
    echo "ERROR: Log file not found"
    exit 1
fi

echo "Total lines:"
wc -l "$LOG_FILE"

echo
echo "Error count:"
grep -i "error" "$LOG_FILE" | wc -l

echo
echo "Recent errors:"
grep -i "error" "$LOG_FILE" | tail -n 5
```
Run:
```bash
chmod +x analyze-log.sh
./analyze-log.sh
```
This combines your previous lessons:
```
Day 10 → conditions
Day 11 → loops
Day 12 → functions
Day 13 → error handling
Day 14 → text processing
```
You're now starting to combine the skills instead of learning them independently.

---

# 23. The Most Important Commands Today

| Command | Main purpose                |
| ------- | --------------------------- |
| `grep`  | Search/filter               |
| `head`  | First lines                 |
| `tail`  | Last lines / follow logs    |
| `wc`    | Count                       |
| `sort`  | Sort                        |
| `uniq`  | Remove/count duplicates     |
| `cut`   | Extract fields              |
| `tr`    | Transform characters        |
| `sed`   | Search/replace/edit streams |
| `awk`   | Field-based processing      |
| `|`    | Connect commands            |

---

# 24. Your DevOps Mental Model

Remember this pattern:
```
              RAW DATA
                 │
                 ▼
              grep
           filter/search
                 │
                 ▼
              awk/cut
           extract fields
                 │
                 ▼
              sort
                 │
                 ▼
             uniq -c
            count/group
                 │
                 ▼
             sort -nr
                 │
                 ▼
              head
             top results
```
Once this becomes natural, Linux troubleshooting becomes **much faster**.

---

# 25. Day 14 Practice

Create:
```
day14/
├── app.log
├── users.txt
└── analyze.sh
```
### Practice 1 — grep

Find all errors:
```bash
grep "ERROR" app.log
```
Find errors case-insensitively:
```bash
grep -i "error" app.log
```
---

### Practice 2 — Count

Count errors:
```bash
grep -i "error" app.log | wc -l
```
---

### Practice 3 — Top IPs

If your log has IP addresses:
```bash
awk '{print $1}' app.log | sort | uniq -c | sort -nr
```
---

### Practice 4 — cut

Create:
```
Hatim:DevOps:UAE
Ali:Developer:India
Ahmed:SRE:UK
```
Then extract:
```bash
cut -d ':' -f 1 users.txt
```
and:
```bash
cut -d ':' -f 2 users.txt
```
---

### Practice 5 — awk

Print the first and third fields:
```bash
awk '{print $1, $3}' users.txt
```
---

### Practice 6 — sed

Replace:
```
development
```
with:
```
production
```
using:
```bash
sed 's/development/production/g' file.txt
```
---

### Practice 7 — Log monitoring

Run:
```bash
tail -f app.log
```
Then append a new line from another terminal:
```bash
echo "ERROR Database connection failed" >> app.log
```
Watch it appear immediately.

---

## 🎯 Day 14 Mastery Checklist

You should now understand:

-  Linux pipes `|` 
- `grep` 
- `head` 
- `tail` 
- `wc` 
- `sort` 
- `uniq` 
- `cut` 
- `tr` 
- `sed` 
- `awk` 
-  Log analysis 
-  Command-output processing 
-  Building pipelines 
-  Combining Bash with Linux utilities 
-  Docker/Kubernetes output filtering 

### 🔥 Most important commands to memorize
```
grep
tail -f
wc -l
sort
uniq -c
cut
sed
awk
```
And most importantly, learn to **think in pipelines**:
```
command | filter | extract | sort | count
```
