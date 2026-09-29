# Lesson 8 — Git & GitHub Journey
Advanced Git Commands

Now you’ll learn the commands that:
- save developers from disasters
- fix mistakes
- recover lost commits
- manage complex workflows

These are real-world power tools.

## 1. Git Stash
Sometimes:
- you’re working
- changes are incomplete
- need to switch branches quickly

Use:
```bash
git stash
```
Git temporarily stores uncommitted changes.

## Before Stash
```bash
modified: app.js
modified: auth.js
```

## After Stash
Working directory becomes clean.
Check:
```bash
git status
```

## Restore Stash
```bash
git stash pop
```
Changes return.

## View Stashes
```bash
git stash list
```

## 2. Cherry-Pick
Copy a commit from another branch.

Example:
```bash
git cherry-pick <commit-id>
```
Useful when:
- only ONE commit is needed
- avoid merging entire branch

## Real Example
```bash
feature branch has 10 commits
You only want 1 bug fix
```
Cherry-pick solves this.

## 3. Git Reflog (VERY IMPORTANT)
This command saves lives.
```bash
git reflog
```
Shows:
- every HEAD movement
- deleted commits
- branch switches
- rebases
> Even lost commits can often be recovered.

## Example Reflog
```bash
a1b2c3 HEAD@{0}: commit
d4e5f6 HEAD@{1}: reset
```

## Recover Lost Commit
```bash
git checkout <commit-id>
```
or
```bash
git reset --hard <commit-id>
```

## 4. Reset vs Revert
This confuses many developers.

### Git Reset
Moves branch backward.

#### Soft Reset
```bash
git reset --soft HEAD~1
```
Removes commit but keeps staged changes.

#### Mixed Reset (default)
```bash
git reset HEAD~1
```
Keeps files but unstages changes.

#### Hard Reset ⚠
```bash
git reset --hard HEAD~1
```
Deletes commit + changes permanently.
>> Dangerous.

### 5. Git Revert
Safer for teams. 
```bash
git revert <commit-id>
```
Creates NEW commit that undoes changes.

History remains safe.

## Golden Rule
```bash
reset  = rewrite history
revert = preserve history
```

## 6. Git Tags
Used for releases.

Example:
```bash
git tag v1.0
```
#### Push tags:
```bash
git push origin v1.0
```

## Real Use
```bash
v1.0
v1.1
v2.0
```
Used In:
- production releases
- CI/CD
- deployments

## 7. Interactive Rebase
Clean commit history.
```bash
git rebase -i HEAD~3
```
Can:
- rename commits
- squash commits
- reorder commits

## Example
Before:
```bash
fix typo
fix typo again
final typo fix
```

After Squash:
```bash
fix documentation typo
```
Cleaner history.

## 8. Amend Last Commit
Modify last commit.
```bash
git commit --amend
```
Useful for:
- wrong commit message
- forgot files

## 9. Important Commands Today
```bash
git stash
git stash pop
git cherry-pick
git reflog
git reset
git revert
git tag
git rebase -i
git commit --amend
```
