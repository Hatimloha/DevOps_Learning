# Linux Fundamentals — Day 4
Processes + Monitoring + Background Jobs

This is real server administration.

You’ll learn how Linux manages:
- running applications
- CPU
- memory
- background tasks
- killing stuck programs

These are daily DevOps skills.

## 1. What is a Process?
A process = running program.

Examples:
- browser
- Docker daemon
- nginx
- VS Code
- bash terminal

Each process has:
- PID (process ID)
- memory usage
- CPU usage
- owner

## 2. View Running Processes
```bash
ps

# Shows processes in current shell.
```

## ps aux (VERY IMPORTANT)
```bash
# Common real-world command.
ps aux

# a: Shows processes for all users on the system, not just the current user.

# u: Displays the output in a user-oriented format, providing detailed columns like CPU and memory usage.

# x: Includes processes without a controlling terminal, such as background daemons and system services that start at boot.
```

Shows:
- user
- PID
- CPU
- memory
- command


## 3. Filter Processes
Find nginx process
```bash
ps aux | grep nginx
```

## 4. Process ID (PID)
Examples:
```bash
2315
# Every running process has unique PID.
```

## 5. Kill Process
Graceful stop
```bash
kill PID

# kill 2315
```

## Force kill - Use carefully.
```bash
kill -9 PID

# ⚠️ Forcefully terminates process.
```

## 6. top (System Monitor)
```bash
top
```
Shows live:
- CPU usage
- memory
- running processes

## 7. htop (Better top)
Install:
```bash
sudo apt install htop

# Run
htop
```

## 8. Background Jobs
Run in background
```bash
sleep 100 &

# & sends process to background.
```

## Check jobs
```bash
jobs
```

## 9. Foreground & Background
Bring to foreground
```bash
fg
```

## Send running process to background
Press:
```bash
Ctrl + Z

# Then
bg
```

## 10. nohup
Keeps process running after terminal closes.
```bash
nohup python app.py &
# Very common for servers.

# Output stored in:
# nohup.out
```

## 11. System Load
uptime
```bash
uptime
```
Shows:
- running time
- load average

## 12. Memory Usage
free
```bash
free -h
```
Shows:
- RAM
- swap
- available memory

## 13. Disk Usage
```bash
df -h
# Shows filesystem usage.
```

## du - Directory size.
```bash
du -sh folder/
```

## 14. CPU Information
```bash
lscpu
```

## 15. Open Ports
```bash
ss -tulnp
```
Shows:
- listening ports
- services

## 16. Real DevOps Examples
Find process using port 3000
```bash
ss -tulnp | grep 3000
```

## Kill stuck node app
```bash
ps aux | grep node
kill -9 PID
```

## Monitor logs live
```bash
tail -f app.log
```

## Check high memory usage
```bash
top
```

## 17. Signals in Linux
Processes receive signals.
| Signal | Meaning |
|--------|---------|
| SIGTERM	| graceful stop | 
| SIGKILL	| force kill | 
| SIGSTOP	| pause process | 

## 18. Useful Shortcuts
Stop current process
```bash
Ctrl + C
```

## Pause current process
```bash
Ctrl + Z
```