# Lesson 1 — Linux Fundamentals
Goal today:
- Understand Linux structure
- Become comfortable in terminal
- Learn basic navigation

## 1. What is Linux?
Linux is an operating system kernel.

## Examples of Linux OS:
- Ubuntu
- Debian
- CentOS
- Arch Linux

## Linux is heavily used in:
- servers
- cloud
- Docker
- Kubernetes
- DevOps
- cybersecurity

> Most internet servers run Linux.

## 2. CLI vs GUI
### GUI (Graphical User Interface)
Graphical interface:
- button
- windows
- mouse

### Example:
Windows desktop
Ubuntu desktop

### CLI (Command Line Interface)
Graphical User Interface

### Example:
```bash
pwd

# Show current directory
```

## DevOps engineers mostly work in CLI.
### Why
- faster
- automatable
- remote-friendly
- lightweight

## 3. Open Terminal
If using:
- Ubuntu → Ctrl + Alt + T
- WSL → open terminal
- Mac → Terminal app

## 4. First Commands
Print current directory.
```bash
pwd
```
Example output:
```bash
/home/hatim
```

### ls
List files/folders.
```bash
ls

ls -a # Show hidden files
ls -l # Detailed listing.
ls -ltr # Show all details
```
You’ll see:
- permissions
- owner
- size
- date


## 5. Navigation
### cd
Change directory.
```bash
cd Downloads
```

### Go back
```bash
cd ..
```

### Go home:
```bash
cd
```

### cd ~
Basically work same like cd but here is a key difference
- cd uses the shell’s built-in default behavior (“go home”).
- cd ~ explicitly expands ~ to the home directory before running the command.
```bash
cd ~/<directory>
```

## 6. Linux File System
Linux uses /

Top directories:
```bash
/
├── home
├── etc
├── var
├── bin
├── usr
├── tmp
```

### Important Directories
| Directory | Purpose            |
|-----------|--------------------|
| /home     | user files         |
| /etc      | config files       |
| /var      | logs/data          |
| /tmp      | temporary files    |
| /bin      | commands           |
| /usr      | installed software |

## 7. Create Files & Folders
### mkdir
```bash
mkdir practice

# First check if directory not exits will create.
```

### touch: Create file.
```bash
touch test.txt
```

### 8. Remove Files
### rm: Delete file.
```bash
rm test.txt
```

### rm -r: Delete folder recursively.
```bash
rm -r practice
```
> Be careful with rm -r

## 9. Copy & Move 
### cp: Copy file.
```bash
cp file1.txt file2.txt
```

### mv: Move or rename.
Rename:
```bash
mv old.txt new.txt
```

### Move:
```bash
mv file1.txt Documents/
```

## 10. View File Content
cat
```bash
cat file1.txt
```

### les: Large file viewer.
```bash
less file1.txt
```

## 11. Clear Terminal
```bash
clear
```
> Shortcut: Ctrl + L

### 12. Command Help
### man: Manual pages.
```bash
man ls
```

### 13. Important Concepts
### Absolute Path: Starts from root /
Example: 
```bash 
/home/hatim/Documents
```

### Relative Path: Starts from current location.
Example: 
```bash
Documents/project
```