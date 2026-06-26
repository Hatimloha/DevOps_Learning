# Lesson 1 — Git & GitHub Journey

## What is Git?
Git is a version control system.

It tracks:
- file changes
- code history
- who changed what
- rollback versions
- team collaboration

Think like:
```bash
Save Game System for Code
```
Every save point = commit.

## Why Git Exists
Without Git:
```bash
project-final
project-final-v2
project-final-final
project-final-final-real
```
> Chaos 😄 ------ Git solves this.

## Install Check
Run:
```bash
git --version
```
Expected:
```bash
git version 2.x.x
```

## Your First Git Project
### Step 1 — Create Folder
```bash
mkdir git-course
cd git-course
```

### Step 2 — Initialize Git
```bash
git init
```
Output:
```bash
Initialized empty Git repository
```

Now Git starts tracking this folder.

Git creates hidden folder:
```bash
.git

# Check 
ls -a
```
This is the Git database.

### Step 3 — Check Status
```bash
git status
```
This is the MOST used Git command.

It shows:
- modified files
- staged files
- untracked files

### Step 4 — Create File
```bash
echo "Hello Git" > app.txt
```

Check status again:
```bash
git status
```

You’ll see:
```bash
Untracked files:
  app.txt
```

Meaning:
Git sees file but not tracking yet.

### Step 5 — Stage File
```bash
git add app.txt
```
Now check:
```bash
git status
```
You’ll see:
```bash
Changes to be committed
```

## Important Concept
```bash
# Git has 3 stages:

Working Directory
      ↓
Staging Area
      ↓
Repository
```

### Step 6 — Commit
Commit = save snapshot.
```bash
git commit -m "first commit"
```

If error about username/email:
```bash
git config --global user.name "Your Name"

git config --global user.email "you@example.com"

## Then retry commit.
```

### Step 7 — View History
```bash
git log
```
You’ll see:
- commit id
- author
- date
- message

## Example:
```bash
commit a1b2c3...
Author: Hatim
Message: first commit
```
