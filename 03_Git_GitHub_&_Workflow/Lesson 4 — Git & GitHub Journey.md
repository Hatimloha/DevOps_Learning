# Lesson 4 — Git & GitHub Journey
Connecting Git with GitHub

Now you’ll learn:
- remote repositories
- GitHub basics
- git push
- git pull
- git clone
- SSH authentication

This is where local Git becomes collaborative.

## What is GitHub?
```bash
# Git:
local version control

# GitHub:
cloud platform for Git repositories

GitHub stores repositories online.
```
Official site: [GitHub](https://github.com/hatimloha)

## Real Workflow
```bash
Your Laptop
     ↕
  GitHub
     ↕
Team Members
```

## 1. Create GitHub Repository
Go to:

Create New GitHub Repository

Repository name example: devops-playground

Do NOT initialize:
- README
- .gitignore
- license

Because local repo already exists.

## 2. Connect Local Repo to GitHub
GitHub gives URL like:
```bash
git@github.com:username/devops-playground.git
```

Add Remote:
```bash
git remote add origin git@github.com:username/devops-playground.git
```

## What is "origin"?
Conventionally:
```bash
origin = remote GitHub repository
```
You can verify:
```bash
git remote -v
```

## 3. Push Code to GitHub
First push:
```bash
git push -u origin main
```
Meaning:
```bash
push local main branch
→ remote origin
```
-u sets upstream tracking.

## Next time simply:
```bash
git push
```

## 4. SSH Authentication (IMPORTANT)
Avoid HTTPS passwords.

Use SSH.

Generate key:
```bash
ssh-keygen -t ed25519 -C "you@example.com"
```
Press Enter for defaults.

## 5. Copy Public Key
```bash
# View key:
cat ~/.ssh/id_ed25519.pub
```
Copy output.

Add here: [GitHub SSH Settings](https://github.com/settings/keys)


## 6. Test SSH Connection
```bash
ssh -T git@github.com
```
Expected:
```bash
Hi username! You've successfully authenticated
```

## 7. Clone Repository
Download existing repository:
```bash
git clone git@github.com:user/repo.git

# This creates full project locally.
```

## 8. Pull Changes
Fetch latest updates:
```bash
git pull
```
Meaning: download + merge remote changes

## 9. Fetch vs Pull
**Fetch**
```bash
git fetch
```
Downloads changes only.

**Pull**
```BASH
git pull
```
Downloads + merges changes.


## GitHub Workflow Example
```bash
1. Clone repo
2. Create branch
3. Commit changes
4. Push branch
5. Open Pull Request
6. Merge
```
> This is standard industry workflow.

## Important Commands Today
```bash
git remote add
git remote -v
git push
git pull
git fetch
git clone
```