# Lesson 5 — Git & GitHub Journey
Pull Requests (PR) & Team Workflow

Now you move from:
```bash
single developer workflow 👉
to
real team collaboration workflow

```
> This is what companies use daily.

## What is a Pull Request?
A Pull Request (PR) is:
```bash
“Hey, I made changes — please review and merge them into main”
```
- It is NOT a Git command.
- It is a GitHub feature.

## Real Workflow Overview
```bash
1. Create branch
2. Work on feature
3. Push branch
4. Open PR
5. Review code
6. Merge to main
```

## 1. Create Feature Branch
```bash
git switch -c feature-login
```

## 2. Make Changes
Example:
```bash
echo "Login API created" >> auth.txt
```
Commit:
```bash
git add .
git commit -m "feat: add login API"
```

## 3. Push Branch to GitHub
```bash
git push origin feature-login
```
Now branch exists on GitHub.

## 4. Open Pull Request
Go to repository: [Repo](https://github.com/pulls) 
You will see:
```bash
“Compare & Pull Request”
```
Click it.

### PR Contains
A Pull Request shows:
- changes made
- file diffs
- commit history
- discussion area

## 5. Code Review Process
Team members can:
- comment
- suggest changes
- approve
- request fixes

Example feedback:
```bash
Please rename function for clarity
```

Why Code Review is Important

It helps:
- avoid bugs
- improve code quality
- share knowledge
- maintain standards

## 6. Merge Pull Request
Once approved:

Options:
- Merge commit 
- Squash merge
- Rebase merge

Most common:
```bash
Squash and merge

# It keeps history clean.
```

## After Merge
Your branch gets merged into:
```bash
main
```

## 7. Delete Branch
After merge:
```bash
git branch -d feature-login
```
And on GitHub:
```bash
“Delete branch” button
```
Keeps repo clean.

## 8. Sync Local Main
After merge:
```bash
git switch main
git pull
```
Now local main is updated.

## Real Industry Flow
```bash
Developer A → feature branch → PR → Review → Merge

Developer B → feature branch → PR → Review → Merge
```
Everything goes through PR.

## 9. Fork Workflow (Open Source)
If you don’t have write access:
```bash
Fork repo → clone → change → PR back
```

## 10. Fork Steps
- Fork repo on GitHub
- Clone your fork
- Create branch
- Push changes
- Open PR to original repo

## Important Commands Today
```bash
git switch -c
git push origin branch
git pull
git branch -d
```
