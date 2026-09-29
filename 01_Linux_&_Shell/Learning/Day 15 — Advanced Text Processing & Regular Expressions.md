# Day 15 — Bash Advanced Text Processing & Regular Expressions

A practical DevOps study guide covering regular expressions, advanced `grep`, `awk`, `sed`, log parsing, and production-style Bash pipelines.

## Learning Goals

By the end of this lesson, you should be able to:

- Use regular expressions for practical text matching
- Work with `grep -E` and `grep -Eo`
- Extract IP addresses and HTTP status codes
- Use advanced `awk` conditions, variables, `BEGIN`/`END`, and associative arrays
- Use advanced `sed` with regular expressions and capture groups
- Parse and analyze application/Nginx-style logs
- Build multi-command pipelines for troubleshooting
- Create a practical Bash log-analysis script
- Prefer machine-readable output when automating DevOps tools

---

Day 14 covered the **basic text-processing toolkit**.

Day 15 takes those same tools and makes them useful for **real DevOps automation**.

Today we'll focus on:

1.  Regular Expressions 
2. `grep -E` 
3.  Advanced `awk` 
4.  Advanced `sed` 
5.  Parsing logs 
6.  Extracting IPs, ports, status codes 
7.  Combining tools into production-style pipelines 
8.  Building a practical log-analysis script 

---

## 1. Regular Expressions — The Foundation

A regular expression (regex) is a pattern used to match text.

Example:

```
```

```bash
grep -E "ERROR|FAILED" app.log
```

This matches either:

```
```

```bash
ERROR
```

or:

```
```

```
FAILED
```

### Common regex symbols

| Pattern  | Meaning               |
| -------- | --------------------- |
| `.`      | Any single character  |
| `^`      | Beginning of line     |
| `$`      | End of line           |
| `*`      | Zero or more          |
| `+`      | One or more           |
| `?`      | Zero or one           |
| `[abc]`  | a, b, or c            |
| `[0-9]`  | Any digit             |
| `[a-z]`  | Lowercase letter      |
| `[^0-9]` | Anything except digit |
| \`       | \`                    |
| `()`     | Grouping              |

---

# 2. `^` — Beginning of Line

Suppose:

```
```

```
ERROR Database failed
INFO Server started
ERROR Connection timeout
```

Find lines beginning with `ERROR`:

```
```

```bash
grep -E '^ERROR' app.log
```

This is different from:

```
```

```bash
grep "ERROR" app.log
```

The second can find `ERROR` anywhere in the line.

---

# 3. `$` — End of Line

Find lines ending with `ERROR`:

```
```

```bash
grep -E 'ERROR$' app.log
```

Example:

```
```

```
Database ERROR
Connection ERROR
Server started
```

Matches:

```
```

```
Database ERROR
Connection ERROR
```

---

# 4. `.` — Any Character

```
```

```bash
grep -E 'E.ROR' app.log
```

Could match:

```
```

```bash
ERROR
E1ROR
EXROR
```

because `.` represents one arbitrary character.

---

# 5. `[ ]` — Character Sets

Find digits:

```
```

```bash
grep -E '[0-9]' file.txt
```

Find lines containing lowercase letters:

```
```

```bash
grep -E '[a-z]' file.txt
```

Find lines containing hexadecimal characters:

```
```

```bash
grep -E '[0-9a-fA-F]' file.txt
```

---

# 6. `+` — One or More

Suppose:

```
```

```bash
user1
user22
user333
user
```

Find `user` followed by at least one digit:

```
```

```bash
grep -E 'user[0-9]+' users.txt
```

Matches:

```
```

```bash
user1
user22
user333
```

---

# 7. `*` — Zero or More

```
```

```bash
grep -E 'ab*c' file.txt
```

Can match:

```
```

```bash
ac
abc
abbc
abbbc
```

Because `b*` means:

> zero or more `b`

---

# 8. `?` — Optional

```
```

```bash
grep -E 'colou?r' file.txt
```

Matches:

```
```

```
color
colour
```

---

# 9. `|` — OR

Very useful for logs:

```
```

```bash
grep -E 'ERROR|FAILED|CRITICAL' app.log
```

This means:

```
```

```bash
ERROR
OR
FAILED
OR
CRITICAL
```

---

# 10. `grep -E` vs `grep`

`grep -E` enables **Extended Regular Expressions**.

Instead of:

```
```

```bash
grep "ERROR\|FAILED" app.log
```

you can write:

```
```

```bash
grep -E "ERROR|FAILED" app.log
```

For modern Bash/Linux scripting, `grep -E` is very useful.

---

# 11. Extract IP Addresses

Suppose:

```
```

```
Client connected from 192.168.1.20
Client connected from 10.0.0.15
Client connected from 172.16.1.50
```

A simple IPv4 pattern:

```
```

```bash
grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' app.log
```

Important option:

```
```

```
-o
```

means:

> Print only the matching portion.

Output:

```
```

```
192.168.1.20
10.0.0.15
172.16.1.50
```

This is extremely useful when processing logs.

**Note:** this pattern identifies IPv4-looking strings; it does not fully validate that every octet is between `0` and `255`.

---

# 12. Extract HTTP Status Codes

Example log:

```
```

```bash
10.0.0.1 GET /api 200
10.0.0.2 GET /login 404
10.0.0.3 GET /api 500
```

Extract 3-digit numbers:

```
```

```bash
grep -Eo '[0-9]{3}' access.log
```

Output:

```
```

```bash
200
404
500
```

Then count them:

```
```

```bash
grep -Eo '[0-9]{3}' access.log | sort | uniq -c
```

Example:

```
```

```
10 200
3  404
2  500
```

---

# 13. `awk` — Think in Fields

Day 14 introduced:

```
```

```bash
awk '{print $1}'
```

Now let's understand how powerful it can become.

Suppose:

```
```

```bash
10.0.0.1 GET /api 200
10.0.0.2 GET /login 404
10.0.0.3 GET /api 500
```

Fields:

```
```

```
$1 → IP
$2 → HTTP method
$3 → URL
$4 → status
```

So:

```
```

```bash
awk '{print $1}' access.log
```

prints IPs.

```
```

```bash
awk '{print $4}' access.log
```

prints status codes.

---

# 14. `awk` Conditions

Find HTTP 500 requests:

```
```

```bash
awk '$4 == 500 {print}' access.log
```

Print only the IP:

```
```

```bash
awk '$4 == 500 {print $1}' access.log
```

Count HTTP 500 responses:

```
```

```bash
awk '$4 == 500 {count++} END {print count}' access.log
```

This is more efficient than chaining several commands when the logic naturally belongs in `awk`.

---

# 15. `awk` Variables

Example:

```
```

```bash
awk '{count++} END {print count}' access.log
```

`count` is an `awk` variable.

Another example:

```
```

```bash
awk '$4 >= 400 {errors++} END {print errors}' access.log
```

Meaning:

> Count responses with status 400 or higher.

---

# 16. `awk` BEGIN and END

`BEGIN` runs before processing input.

`END` runs after processing input.

Example:

```
```

```bash
awk 'BEGIN {print "Starting analysis"} {count++} END {print "Total:", count}' access.log
```

Output:

```
```

```bash
Starting analysis
Total: 1500
```

This is useful for generating reports.

---

# 17. `awk` Field Separator

Suppose `/etc/passwd` contains:

```
```

```bash
root:x:0:0:root:/root:/bin/bash
```

Fields are separated by `:`.

Use:

```
```

```bash
awk -F ':' '{print $1}' /etc/passwd
```

Output:

```
```

```
root
daemon
bin
sys
...
```

Get usernames and shells:

```
```

```bash
awk -F ':' '{print $1, $7}' /etc/passwd
```

---

# 18. `awk` Built-in Variables

Important ones:

### `NF`

Number of fields.

```
```

```bash
awk '{print NF}' file.txt
```

### `NR`

Current record/line number.

```
```

```bash
awk '{print NR, $0}' file.txt
```

Example:

```
```

```
1 first line
2 second line
3 third line
```

### `$0`

Entire line.

```
```

```bash
awk '{print $0}' file.txt
```

---

# 19. Find Lines with a Certain Number of Fields

```
```

```bash
awk 'NF >= 4 {print}' file.txt
```

Meaning:

> Print lines containing at least four fields.

This can help detect malformed command output or log entries.

---

# 20. `sed` Advanced Usage

Basic replacement:

```
```

```bash
sed 's/old/new/g' file.txt
```

Now let's use regex.

Replace any sequence of digits with:

```
```

```
NUMBER
```

```
```

```bash
sed -E 's/[0-9]+/NUMBER/g' file.txt
```

Example:

```
```

```
Server 123 failed
Port 8080 unavailable
```

becomes:

```
```

```
Server NUMBER failed
Port NUMBER unavailable
```

---

# 21. `sed` Capture Groups

Suppose:

```
```

```bash
name=Hatim
name=Ali
```

You can transform it:

```
```

```bash
sed -E 's/name=(.*)/User: \1/' file.txt
```

Output:

```
```

```
User: Hatim
User: Ali
```

Here:

```
```

```
(.*)
```

captures text.

And:

```
```

```
\1
```

refers to the first captured group.

---

# 22. Delete Empty Lines

```
```

```bash
sed '/^$/d' file.txt
```

Regex:

```
```

```
^$
```

means:

> Beginning immediately followed by end → empty line.

---

# 23. Remove Comments

For a simple configuration file:

```
```

```bash
sed '/^[[:space:]]*#/d' config.conf
```

This removes lines whose first non-whitespace character is `#`.

---

# 24. Real DevOps Example — Analyze Nginx Logs

Suppose:

```
```

```bash
10.0.0.1 GET / 200
10.0.0.2 GET /login 200
10.0.0.1 GET /api 500
10.0.0.3 GET /api 404
10.0.0.1 GET /api 500
```

### Total requests

```
```

```bash
wc -l access.log
```

### Total errors

```
```

```bash
awk '$4 >= 400 {count++} END {print count}' access.log
```

### HTTP 500 count

```
```

```bash
awk '$4 == 500 {count++} END {print count}' access.log
```

### IPs causing 500 errors

```
```

```bash
awk '$4 == 500 {print $1}' access.log
```

### Top IPs causing 500 errors

```
```

```bash
awk '$4 == 500 {print $1}' access.log \
    | sort \
    | uniq -c \
    | sort -nr
```

---

# 25. Extract Unique URLs

```
```

```bash
awk '{print $3}' access.log | sort -u
```

Count requests per URL:

```
```

```bash
awk '{count[$3]++} END {for (url in count) print count[url], url}' access.log
```

Example:

```
```

```
150 /api
90 /login
50 /
```

This introduces an important `awk` concept:

## Associative Arrays

```
```

```
count[$3]++
```

`awk` creates a counter for each URL.

---

# 26. Associative Arrays — Very Important

Suppose:

```
```

```bash
200
200
404
500
200
404
```

Run:

```
```

```bash
awk '{count[$1]++} END {for (code in count) print code, count[code]}' status.txt
```

Possible output:

```
```

```
200 3
404 2
500 1
```

This is extremely useful for:

-  HTTP status analysis 
-  error counting 
-  IP counting 
-  Kubernetes pod states 
-  service states 
-  application metrics 

---

# 27. Build a Real Log Analyzer

Create:

```
```

```
log-analyzer.sh
```

```
```

```bash
#!/bin/bash

set -Eeuo pipefail

LOG_FILE="${1:-access.log}"

if [[ ! -f "$LOG_FILE" ]]; then
    echo "ERROR: Log file not found: $LOG_FILE" >&2
    exit 1
fi

echo "===== Log Analysis ====="
echo "File: $LOG_FILE"
echo

echo "Total requests:"
wc -l < "$LOG_FILE"

echo
echo "HTTP errors:"
awk '$4 >= 400 {count++} END {print count+0}' "$LOG_FILE"

echo
echo "HTTP 500 errors:"
awk '$4 == 500 {count++} END {print count+0}' "$LOG_FILE"

echo
echo "Top IPs:"
awk '{count[$1]++}
     END {
         for (ip in count)
             print count[ip], ip
     }' "$LOG_FILE" | sort -nr | head -n 5

echo
echo "Status codes:"
awk '{count[$4]++}
     END {
         for (code in count)
             print code, count[code]
     }' "$LOG_FILE" | sort -n
```

Run:

```
```

```bash
chmod +x log-analyzer.sh
./log-analyzer.sh access.log
```

---

# 28. Notice How Much You've Combined

This single script uses concepts from:

```
```

```
Day 10
  ↓
Variables + arguments + conditions

Day 12
  ↓
Reusable script structure

Day 13
  ↓
set -Eeuo pipefail + exit codes

Day 14
  ↓
awk + sort + head

Day 15
  ↓
Regex + advanced awk + associative arrays
```

This is exactly why we're learning Bash progressively.

---

# 29. Production Mindset

There is one important principle to remember:

### Don't parse human-readable output if a machine-readable option exists.

For example, with Kubernetes:

```
```

```bash
kubectl get pods
```

is designed for humans.

Prefer structured output when automation needs exact data:

```
```

```bash
kubectl get pods -o json
```

or:

```
```

```bash
kubectl get pods -o jsonpath='{.items[*].metadata.name}'
```

Similarly, many modern tools support:

```
```

```
--json
-o json
--format
```

Use those instead of fragile text parsing whenever practical.

---

# 30. Day 15 Command Cheat Sheet

### Regex

```
```

```bash
grep -E
```

### Extract matching text

```
```

```bash
grep -Eo
```

### Search beginning

```
```

```
^
```

### Search ending

```
```

```
$
```

### Character range

```
```

```
[0-9]
[a-z]
```

### One or more

```
```

```
+
```

### Zero or more

```
```

```
*
```

### OR

```
```

```
|
```

### Advanced field processing

```
```

```
awk
```

### Regex replacement

```
```

```bash
sed -E
```

### Count

```
```

```bash
wc -l
```

### Sort/count pipeline

```
```

```bash
sort | uniq -c | sort -nr
```

---

# 🎯 Day 15 Practice

Create:

```
```

```
day15/
├── access.log
├── users.txt
└── log-analyzer.sh
```

Use sample log data such as:

```
```

```bash
10.0.0.1 GET / 200
10.0.0.2 GET /login 200
10.0.0.1 GET /api 500
10.0.0.3 GET /api 404
10.0.0.1 GET /api 500
10.0.0.2 GET /login 200
10.0.0.4 GET /admin 403
10.0.0.1 GET /api 500
```

Then solve:

### Task 1

Find all HTTP 500 requests.

### Task 2

Count HTTP 500 requests.

### Task 3

Extract only the IPs generating HTTP 500.

### Task 4

Find the top IP addresses.

### Task 5

Count every HTTP status code.

### Task 6

Find unique URLs.

### Task 7

Count requests per URL.

### Task 8

Use regex to extract all IP addresses.

### Task 9

Modify the `log-analyzer.sh` script to accept the log filename as an argument.

Example:

```
```

```bash
./log-analyzer.sh access.log
```

---

## 🧠 Day 15 Mastery

You should now understand:

-  Regular expressions 
- `grep -E` 
- `grep -Eo` 
-  Regex anchors `^` and `$` 
-  Character classes 
- `+`, `*`, `?`, `|` 
- `awk` conditions 
- `awk` `BEGIN` / `END` 
- `NR` / `NF` 
- `awk` field separators 
- `awk` associative arrays 
-  Advanced `sed` 
-  Log parsing 
-  HTTP status analysis 
-  IP extraction 
-  Building multi-command pipelines 
-  Production-oriented text processing 

### Your Bash progression now

```
```

```
Day 10 → Variables + Conditions
Day 11 → Loops + Arrays
Day 12 → Functions + Reusable Automation
Day 13 → Error Handling + Debugging
Day 14 → Text Processing Basics
Day 15 → Regex + Advanced awk/sed + Log Analysis
```

**Next: Day 16 — Bash Automation & Real DevOps Scripts:** we'll start putting these skills together into practical scripts for **system health checks, service monitoring, disk/memory/CPU checks, backups, and deployment automation**.
