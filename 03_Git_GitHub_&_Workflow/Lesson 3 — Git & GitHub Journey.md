# Lesson 3 — Git & GitHub Journey
Branching in Git

This is one of the MOST important Git concepts.

Branches allow developers to:
- work safely
- build features independently
- avoid breaking main code
- collaborate in teams

## What is a Branch?
Think:
```bash
main branch = production code
```
New feature?

## Create separate branch:
```bash
feature/login
```
Work there safely.

## Visual Understanding
```bash
main
 └── feature/login
```
Both branches can evolve independently.

## 1. Check Current Branch
Run:
```bash
git branch
```
You’ll see:
```bash
* main  || * master
```
> "*" star means current branch.

## 2. Create New Branch
```bash
git branch feature/login
```

Now check:
```bash
git branch
```
Output:
```bash
* main
  feature-login
```
Branch exists but not switched yet.

## 3. Switch Branch 
```bash
git switch feature-login
```
Now:
```bash
* feature-login
  main
```
You are inside new branch.

## Shortcut Command
Create + switch together:
```bash
git switch -c feature-payment
```
Very commonly used.

## 4. Make Changes in Branch
Inside feature-login:
```bash
echo "Login feature" >> notes.txt
```
Commit it:
```bash
git add .
git commit -m "add login feature"
```

## Important Understanding
That commit exists ONLY in:
```bash
feature-login
```
Not in:
```bash
main
```

## 5. Switch Back to Main
```bash
git switch main
```
Now open file.

You’ll notice:
```
login feature line disappeared
```

**Why?**

Because commit belongs to another branch.

> This is Git magic.

## 6. Merge Branch
Bring feature into main:
```bash
git merge feature-login
```
Now feature becomes part of main.

## Visual After Merge
```bash
main
 └── feature-login
        ↓
     merged
```

## 7. Delete Branch
After merge:
```bash
git branch -d feature-login
```
Keeps repository clean.

## Real Industry Workflow
```bash
main
 ├── feature/auth
 ├── feature/payment
 ├── bugfix/header
 └── hotfix/api
```
Every developer works separately.

## 8. Merge Conflicts (IMPORTANT)
Conflict happens when:
- two branches modify same line

Example:
```bash
main:
Hello World

feature:
Hello Git
```
Git cannot decide automatically.

## Conflict Example
Git shows:
```bash
<<<<<<< HEAD
Hello World
=======
Hello Git
>>>>>>> feature-login
```
You manually choose final version.

## Then:
```bash
git add .
git commit
```
Conflict resolved.

## Important Branch Commands
```bash
git branch
git switch
git switch -c
git merge
git branch -d
```
