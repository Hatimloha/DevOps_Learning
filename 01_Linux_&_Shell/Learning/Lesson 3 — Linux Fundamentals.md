# Lesson 3 — Linux Fundamentals
Text Processing + Pipes + Redirection (Very Important for DevOps)

This is where Linux starts becoming powerful for real-world work:
- logs analysis
- debugging servers
- CI/CD pipelines
- Docker troubleshooting

## 1. Pipes (|)
Pipe sends output of one command to another.
```bash
command1 | command2
```

Example:
```bash
ls -l | grep ".txt"
```

👉 Means:
- list files
- filter only .txt

## 2. Redirection (> and >>)
``> overwrite file``
```bash
echo "Hello" > file.txt

```

```>> append file```
```bash
echo "World" >> file.txt
```

## 3. Input Redirection (<)
```bash
wc -l < file.txt

# 👉 Reads file as input
```

## 4. grep (Search Tool 🔥)
Used to filter text.

Basic:
```bash
grep "error" log.txt
```

Case insensitive:
```bash
grep -i "error" log.txt
```

Show line numbers:
```bash
grep -n "error" log.txt

# Output: 
# **5:** 2026-05-23 08:11:16 ERROR   Failed to connect to database: Connection refused.

# **17:** 2026-05-23 08:15:45 ERROR   Package update failed: Unable to fetch repository metadata.

# **23:** 2026-05-23 08:18:06 ERROR   Mount failed: Unknown filesystem type 'ext5'.
```

## 5. find (File Search Tool)
Find file by name:
```bash
find . -name "file.txt"
```

Find directories:
```bash
find /home -type d -name "project"
```

## Find files larger than 10MB:
```bash
find . -size +10M
```

## 6. wc (Word Count Tool)
```bash
wc wc file.txt
```
Output:
- lines
- words
- bytes


## 7. sort (Sorting Data)
```bash
sort file.txt
```
Reverse:
```bash
sort -r file.txt
```

## 8. uniq (Remove duplicates)
⚠️ Works only on sorted data
```bash
sort file.txt | uniq
```

## 9. cut (Extract columns)
Example file:
```bash
hatim:devops:engineer
john:backend:developer
```

## Extract 1st column:
```bash
cut -d ":" -f 1 file.txt

# Output:
#       hatim
#       john
```

## 10. awk (Powerful Text Processor 🔥🔥)
Print column 1:
```bash
awk '{print $1}' file.txt

# Print column 2:
awk '{print $2}' file.txt
```

## 11. Pipes in Real Life (VERY IMPORTANT)
Example: find error logs
```bash
cat app.log | grep "ERROR" | sort | uniq
```
👉 Flow:
- read log
- filter errors
- sort
- remove duplicates

## 12. Log Analysis Example
```bash
cat access.log | grep "404" | wc -l

# 👉 Counts all 404 errors
```

## 13. Multiple Pipes Example
```bash
cat file.txt | grep "dev" | sort | uniq | wc -l

# 👉 Filters, sorts, removes duplicates, counts
```

## 14. tee (Save + Show Output)
```bash
ls -l | tee output.txt

# 👉 Shows output AND saves it
```

## 15. head / tail
First lines:
```bash
head file.txt
```

## Last lines:
```bash
tail file.txt
```

## Live logs:
```bash
tail -f app.log
```

## 16. Practical DevOps Use Cases
Check running processes
```bash
ps aux | grep nginx
```

## Find open ports
```bash
netstat -tulnp | grep 80
```

## Disk usage filter
```bash
df -h | grep "/dev"
```