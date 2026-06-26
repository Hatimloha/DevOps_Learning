# Lesson 2 — Git & GitHub Journey
Understanding File Changes in Git

## Today you’ll learn:
- git diff
- staging vs unstaging
- restoring files
- .gitignore

These are daily-use Git skills. 

## 1. Modify Existing File
Change your file: 
```bash
touch notes.txt
echo "New line added" >> notes.txt
```
Now check:
```bash
git status
```
You’ll see:
```bash
modified: notes.txt
```
Git detected changes.

## 2. View Exact Changes
Use:
```bash
git diff
```
This shows:
- old content
- new content

Example:
## 
```bash
+ New line added
```
Meaning:
```bash
+ added line
- removed line
```

## Important
git diff shows:
```bash
Working Directory vs Staging Area
```

## 3. Stage Changes
```bash
git add notes.txt
```
Now:
```bash
git status
```
## 4. Difference After Staging
You may see nothing.

Why?

Because changes are already staged.

Now use:
```bash
git diff --staged
```
This shows:
```bash
Staging Area vs Last Commit
```

## VERY important: Core Git Understanding
```bash
git diff
    ↓
unstaged changes

git diff --staged
    ↓
staged changes
```

## 5. Unstage File
Suppose you accidentally staged something.
Use:
```bash
git restore --staged notes.txt
```
Now file becomes unstaged again.

Check: 
```bash
git status
```

## 6. Restore File (Discard Changes)
Suppose you made bad edits.

Use: git restore notes.txt

This removes uncommitted changes.
```bash
git restore <file>
# This removes uncommitted changes.
```
> ⚠ Dangerous: Changes are lost permanently.

```bash
Real Meaning: git restore file

Means: "Bring file back from last commit"
```

## 7. Create Unwanted Files
Example:
```bash
touch debug.log
touch secret.env
```
These should NOT go to Git.

## 8. Use .gitignore
Create:
```bash
touch .gitignore
```
Add:
```bash
*.log
*.env
node_modules/
dist/
```
> Now Git ignores them.

Check: git status

Ignored files disappear.

## Why .gitignore Matters
Never upload:
- secrets
- passwords
- API keys
- cache files
- build folders

Very important in real projects.

## Common .gitignore Examples
Node.js
```bash
node_modules/
.env
dist/
```

## Python
```bash
__pycache__/
venv/
.env
```