# Lesson 2 — Linux Fundamentals
File Permissions + Users + Ownership

This is one of the MOST important Linux topics.

## Without this:
- Docker permissions become confusing
- SSH issues happen
- deployment fails
- scripts break
- services cannot access files

## 1. Users in Linux
Linux is multi-user OS.

Every file belongs to:
- a user
- a group

check current user.
```bash
whoami

# Output: root
```

## 2. Understand ls -l
```bash
ls -l

# Output: -rw-r--r-- 1 hatim developers 120 May 22 test.txt


# Breakdown: This is permissions.
# -rw-r--r--
```

## 3. Permission Structure
```bash
-rwxr-xr--
```
Split:
```bash
- rwx r-x r--
```
| Section | Meaning |
|---------|---------|
| first   | type    | 
| rwx owner| permissions | 
| r-x group | permissions |
| r-- others | permissions |


## 4. Meaning of Permissions
| Symbol | Meaning |
|--------|---------|
| r	     | read    |
| w	     | write   |
| x	     | execute |

## 5. File Types
| Symbol | Type | 
|--------|------|
| -	     | file | 
| d	     | directory| 
| l	     | symbolic link| 

Example: 
```bash
drwxr-xr-x

# Means directory.
```

## 6. Permission Numbers
| Permission | Value |
|------------|-------|
| r          | 4     |
| w          | 2     |
| x          | 1     |

Example: 
| Value | Meaning |
|-------|---------|
| 7     | rwx     |
| 6     | rw-     |
| 5     | r-x     |
| 4     | r--     |

## 7. chmod
Change permissions.
```bash
chmod 755 file.sh
```
Meaning:
```bash
Owner  -> rwx (ALL)
Group  -> r-x (READ-WRITE)
Others -> r-x (READ-EXECUTE)
```

Example 2: 
```bash
chmod 644 notes.txt
```
Meaning:
```bash
Owner  -> rw- 
Group  -> r--
Others -> r--
```

## 8. Make Script Executable 
```bash
# Create a file.
touch app.sh

# Add 
vi touch

# Content
#!/bin/bash
echo "Hello World"


# Run
./app.sh
```
> Error: Permission denied

### Fix
```bash
chmod +x app.sh

# Now run: 
./app.sh
```

## 9. Symbolic chmod
Instead of numbers.

| Symbol | Meaning |
|--------|---------|
| u      | user    |
| g      | group   |
| o      | others  |
| a      | all     |

Example: Add Execute
```bash
chomod u+x file.sh
```
Example: Remove Write 
```bash
chmod g-w file.sh
```

Give all read:
```bash
chmod a+r file.sh
```

## 10. Ownership
Check ownership:
```bash
ls -l

# Output: hatim developers

# hatim → owner
# developers → group
```

## 11. chown
Change owner.
```bash
# Syntax: sudo chown <user> file.txt

sudo chown hatim notes.txt
```

## 12. Change Group
```bash
# Syntax: sudo chgrp <group> notes.txt
sudo chgrp developer notes.txt
```

## 13. sudo
Run command as administrator.
```bash
sudo apt update

# Important: Linux protects system files using permissions.
```

## 14. Important Directory Permission Rule
Directories behave differently.
| Permission | Directory Meaning   |
|------------|---------------------|
| r          | list contents       |
| w          | create/delete files |
| x          | enter directory     |

## 15. Root User
Linux superuser:
```bash
root

# Has full permissions.
```

## Switch:
```bash
sudo su - <user>
```

## exit
Use to logout
```bash
exit

# Be VERY careful as root.
```

## 16. Useful Commands
```bash
# Check current user
whoami 

# User ID
id

# Groups
groups
```

## 17. Real World Examples
Docker Permission Issue
```bash
permission denied while accessing docker.sock
```
Usually fixed with:
```bash
sudo usermod -aG docker $USER
```

## Script Not Running 
```bash
chmod +x file.txt
```

## SSH Key Permission
SSH requires:
```bash
chmod 600 ~/.ssh/id_rsa
```