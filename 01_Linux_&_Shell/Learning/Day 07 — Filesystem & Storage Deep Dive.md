# Linux Fundamentals — Day 7

## Filesystem & Storage Deep Dive

Today we'll understand **how Linux organizes and manages storage**.

This knowledge is essential for working with:

* AWS EC2 and EBS
* Docker volumes
* Kubernetes PV/PVC
* Databases
* Application logs
* Production servers

---

# 1. Linux Filesystem Starts at `/`

Unlike Windows, Linux does not use drive letters such as:

```text
C:\
D:\
```

Instead, everything starts from:

```text
/
```

Think of `/` as the **root of the entire Linux filesystem**.

```text
/
├── bin
├── boot
├── dev
├── etc
├── home
├── lib
├── media
├── mnt
├── opt
├── proc
├── root
├── run
├── sbin
├── srv
├── sys
├── tmp
├── usr
└── var
```

---

# 2. Important Linux Directories

## `/home`

Contains home directories for normal users.

```text
/home/hatim
/home/devuser
```

Your personal files and user-specific configuration usually live here.

---

## `/root`

This is the **home directory of the root user**.

```text
/root
```

> ⚠️ Don't confuse `/` with `/root`.

```text
/      → Filesystem root
/root  → Root user's home directory
```

---

# 3. `/etc` — Configuration

`/etc` contains system-wide and application configuration files.

Examples:

```text
/etc/hosts
/etc/passwd
/etc/group
/etc/ssh/
/etc/systemd/
```

Explore it:

```bash
ls /etc
```

As a Linux or DevOps engineer, you will work with `/etc` constantly.

---

# 4. `/var` — Variable Data

`/var` contains data that changes frequently.

Important directories include:

```text
/var/log
/var/lib
/var/cache
```

Check available logs:

```bash
ls /var/log
```

Common examples:

```text
/var/log/syslog
/var/log/auth.log
```

> Log locations and filenames can differ depending on your Linux distribution.

---

# 5. `/tmp`

`/tmp` is used for temporary files.

```bash
ls /tmp
```

Applications commonly use it for temporary data.

> ⚠️ Don't store important permanent data in `/tmp`.

Temporary files may be automatically removed depending on the system configuration.

---

# 6. `/usr`

`/usr` contains many installed programs, libraries, and shared resources.

Examples:

```text
/usr/bin
/usr/sbin
/usr/lib
/usr/share
```

Explore:

```bash
ls /usr/bin | head
```

---

# 7. `/opt`

`/opt` is often used for optional or third-party software.

Example:

```text
/opt/myapp
```

---

# 8. `/dev` 🔥

`/dev` contains **device files**.

Explore:

```bash
ls /dev
```

You might see:

```text
/dev/sda
/dev/sdb
/dev/null
/dev/zero
```

Linux represents many devices through files.

---

# 9. `/dev/null` 🔥

One of the most useful Linux concepts.

Anything written to `/dev/null` effectively disappears.

Example:

```bash
echo "hello" > /dev/null
```

You won't see any output.

### Ignore command output

```bash
command > /dev/null
```

### Ignore output and errors

```bash
command > /dev/null 2>&1
```

This is commonly used in scripts and automation.

---

# 10. `/proc` 🔥

`/proc` is a **virtual filesystem** containing information about the running kernel and processes.

Explore:

```bash
ls /proc
```

You'll see directories such as:

```text
1
2
100
1250
...
```

These numbers represent **Process IDs (PIDs)**.

---

## Check Process Information

For example:

```bash
ls /proc/1
```

This displays information related to process ID `1`.

---

# 11. `/proc/cpuinfo`

Check CPU information:

```bash
cat /proc/cpuinfo
```

---

# 12. `/proc/meminfo`

Check memory information:

```bash
cat /proc/meminfo
```

This is one reason Linux commands can expose detailed system information.

---

# 13. `/sys`

Explore:

```bash
ls /sys
```

`/sys` exposes information related to:

* Hardware
* Devices
* Kernel subsystems

You normally should not modify it manually.

---

# 14. `/run`

`/run` contains runtime information created since system boot.

Explore:

```bash
ls /run
```

Examples may include:

* PID files
* Sockets
* Service runtime data

---

# 15. Disk vs Partition vs Filesystem

This distinction is very important.

Think about storage like this:

```text
Physical / Virtual Disk
        ↓
    Partition
        ↓
   Filesystem
        ↓
      Mount
        ↓
    Directory
```

Example:

```text
/dev/sda
   ↓
/dev/sda1
   ↓
ext4
   ↓
/
```

---

# 16. List Disks — `lsblk`

Use:

```bash
lsblk
```

Example output:

```text
NAME   SIZE TYPE MOUNTPOINT
sda     50G disk
└─sda1  50G part /
```

This command is extremely useful when working with AWS EC2 instances and additional EBS volumes.

---

# 17. Check Filesystem Type

Run:

```bash
lsblk -f
```

You may see:

```text
FSTYPE
ext4
```

Common Linux filesystems include:

* `ext4`
* `XFS`
* `Btrfs`

---

# 18. Disk Space — `df`

Check filesystem usage:

```bash
df -h
```

Example:

```text
Filesystem  Size  Used Avail Use%
/dev/sda1    50G   20G   30G  40%
```

Important columns:

```text
Size
Used
Available
Use%
```

---

# 19. Directory Size — `du`

`df` tells you filesystem usage.

`du` tells you how much space files and directories consume.

Example:

```bash
du -sh /var/log
```

Check large directories inside `/var`:

```bash
du -h --max-depth=1 /var
```

---

# 20. `df` vs `du` 🔥

Remember:

```text
df → Filesystem usage
du → File and directory usage
```

### Real-World Troubleshooting Example

You receive an alert:

```text
Disk usage: 95%
```

First check the filesystem:

```bash
df -h
```

Then investigate the directories:

```bash
du -h --max-depth=1 /
```

Then investigate further:

```bash
du -h --max-depth=1 /var
```

You might discover:

```text
/var/log → 40G
```

Now you have identified where the disk space is being consumed.

---

# 21. Mounting

Linux attaches filesystems to directories using **mount points**.

Check mounted filesystems:

```bash
mount
```

A cleaner option:

```bash
findmnt
```

Example:

```text
/dev/sda1 → /
/dev/sdb1 → /data
```

The directory:

```text
/data
```

then provides access to the contents of that filesystem.

---

# 22. Create a Mount Point

Example:

```bash
sudo mkdir /data
```

A filesystem can then be mounted to this directory.

---

# 23. `mount`

Basic syntax:

```bash
sudo mount DEVICE DIRECTORY
```

Example:

```bash
sudo mount /dev/sdb1 /data
```

Conceptually:

```text
/dev/sdb1
     ↓
   /data
```

---

# 24. Unmount a Filesystem

Use:

```bash
sudo umount /data
```

> ⚠️ Never blindly unmount filesystems on a production system.

Always verify what is mounted and which processes may be using it.

---

# 25. `/etc/fstab` 🔥

`/etc/fstab` defines filesystems that should be mounted automatically.

Check it:

```bash
cat /etc/fstab
```

Example:

```text
UUID=xxxx  /data  ext4  defaults  0  2
```

Conceptually:

```text
Filesystem
    ↓
/data
    ↓
ext4
    ↓
Mount automatically
```

This is particularly important when configuring persistent storage on servers.

> 💡 Using a UUID is generally safer than relying on device names such as `/dev/sdb1`, because device names can sometimes change.

---

# 26. Inodes

Linux does not identify a file only by its filename.

Each file has an **inode** that stores metadata about the file.

Check inode usage:

```bash
df -i
```

An inode contains information such as:

* Permissions
* Owner
* Timestamps
* File size
* Pointers to data blocks

---

# 27. Why Inodes Matter 🔥

You can have:

```text
Disk space: 30% used
```

but:

```text
Inodes: 100% used
```

In this situation, you may still be unable to create new files.

This commonly happens when a system contains an enormous number of small files.

---

# 28. Hard Links vs Symbolic Links

Links are an important Linux filesystem concept.

---

## Symbolic Link

Create a symbolic link:

```bash
ln -s original.txt link.txt
```

Conceptually:

```text
link.txt
   ↓
original.txt
```

Check it:

```bash
ls -l
```

You will see:

```text
link.txt -> original.txt
```

---

# 29. Hard Link

Create a hard link:

```bash
ln original.txt hardlink.txt
```

A hard link points to the **same underlying inode**.

Conceptually:

```text
original.txt ──┐
               ├── inode
hardlink.txt ──┘
```

---

# 30. Symlink vs Hard Link

| Feature                     | Symbolic Link | Hard Link            |
| --------------------------- | ------------- | -------------------- |
| Points to                   | File path     | Inode                |
| Can cross filesystems       | Yes           | No                   |
| Can point to directories    | Yes           | Generally restricted |
| Breaks if target is removed | Yes           | No                   |
| Common usage                | Very common   | Less common          |

---

# 31. Real DevOps Connection 🔥

## Docker

Docker volumes depend heavily on Linux filesystem concepts.

```text
Container
    ↓
Volume
    ↓
Host Filesystem
```

---

## Kubernetes

Persistent storage:

```text
Pod
 ↓
PVC
 ↓
PV
 ↓
Storage
```

---

## AWS

For example:

```text
EC2
 ↓
EBS Volume
 ↓
Filesystem
 ↓
Mount Point
```

Once you understand Linux storage fundamentals, these DevOps concepts become much easier to understand.

---

# 32. Practice Lab 🧪

## Task 1 — Explore Important Directories

```bash
ls /
```

Then explore:

```bash
ls /etc
ls /var
ls /dev
ls /proc
ls /sys
```

---

## Task 2 — Check Disks

```bash
lsblk
```

---

## Task 3 — Check Filesystems

```bash
lsblk -f
```

---

## Task 4 — Check Disk Usage

```bash
df -h
```

---

## Task 5 — Check Inode Usage

```bash
df -i
```

---

## Task 6 — Find `/var` Usage

```bash
du -h --max-depth=1 /var
```

---

## Task 7 — Explore Processes

```bash
ls /proc | head
```

Then:

```bash
cat /proc/meminfo | head
```

---

## Task 8 — Create a Symbolic Link

```bash
echo "Linux" > original.txt
ln -s original.txt link.txt
cat link.txt
```

Then run:

```bash
ls -li original.txt link.txt
```

Observe the inode information and link behavior.

---

# 33. Commands to Master Today

```bash
lsblk
lsblk -f
df -h
df -i
du
mount
umount
findmnt
ln
```

Also understand these important directories:

```text
/
/etc
/var
/home
/root
/tmp
/usr
/dev
/proc
/sys
/run
/opt
```

---

# Day 7 Mental Model 🧠

Keep this architecture in your head:

```text
                Linux Filesystem
                       │
                       ▼
                       /
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
      /etc           /var          /home
   Config Files       Logs          Users
        │
        ▼
      /dev
   Devices / Disks
        │
        ▼
     Filesystem
        │
        ▼
     Mount Point
        │
        ▼
      /data
```

## The Key Distinction 🔥

```text
lsblk  → What disks and block devices exist?
df     → How full is the filesystem?
du     → What files or directories consume space?
mount  → Where is a filesystem attached?
df -i  → Are we running out of inodes?
```

> These are **production troubleshooting tools**, not just Linux theory. Understanding them will help you troubleshoot EC2 storage, Docker volumes, Kubernetes persistent storage, logs, and production servers.
