# Lesson 6 — Git & GitHub Journey
Merge Conflicts & Rebase Basics

This lesson is very important because:
- it happens in real teams
- interviews ask it
- it confuses beginners

You’ll learn:
- what conflict is
- how to solve it
- what rebase is vs merge

## 1. What is a Merge Conflict?
A conflict happens when:
```bash
two branches edit the SAME line of the SAME file
```
Git cannot decide automatically.

## Example Situation
You have:
```bash
main branch:     Hello World
feature branch:  Hello Git
```
Both changed same line. 

## 2. How Git Shows Conflict
When merging:
```bash
git merge feature

# Git stops and shows:

<<<<<<< HEAD
Hello World
=======
Hello Git
>>>>>>> feature
```

## 3. Meaning of Conflict Markers
```bash
<<<<<<< HEAD      → current branch
=======
other branch change
>>>>>>> feature
```

## 4. How to Fix Conflict
You manually edit file:

Option 1: Keep main version:
```bash
Hello World
```

## Option 2:
Keep feature version:
```bash
Hello Git
```

## Option 3 (BEST):
Combine both:
```bash
Hello World + Hello Git
```

## 5. Finish Conflict Resolution
After fixing:
```bash
git add .
git commit
```
Now merge is completed.

## Real Idea
```bash
Conflict = Git asks you to decide final code
```

## 6. Why Conflicts Happen
Common reasons:
- multiple devs editing same file
- parallel feature branches
- outdated local branch

## 7. How to Avoid Conflicts
Best practices:
- pull frequently
- small commits
- short-lived branches
- communicate with team

## 8. What is Rebase?
Rebase = "rewrite history on top of another branch"

Instead of merging like:
```bash
main ----M----
       \     
        feature
```
Rebase makes:
```bash
main ----M----feature commits
```

## 9. Merge vs Rebase
Merge
```bash
git merge feature
```
- keeps history
- creates merge commit
- safer

## Rebase
```bash
git rebase main
```
- cleaner history
- linear commits
- rewrites commits

## 10. When to Use What
Use Merge when:
- team collaboration
- shared branches
- production code

Use Rebase when:
- local branch cleanup
- before PR
- personal workflow

## 11. Rebase Example
```bash
git switch feature
git rebase main
```
Now feature commits sit on top of latest main.

## 12. Conflict During Rebase
If conflict happens:
```bash
git add .
git rebase --continue
```
To cancel:
```bash
git rebase --abort
```

## 13. Golden Rule
```bash
Rebase = rewrite history
Merge  = preserve history
```

## 14. Important Commands Today
```bash
git merge
git rebase
git add
git commit
git rebase --continue
git rebase --abort
```
