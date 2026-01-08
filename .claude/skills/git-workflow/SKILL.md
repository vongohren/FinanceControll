---
name: git-workflow
description: Manages the full Git development lifecycle including creating branches, making commits, pushing code, and creating pull requests
---

# Git Workflow

A comprehensive skill for managing the full Git development lifecycle: branch → commit → push → PR.

## Trigger

Use this skill when the user asks to:
- Start working on a task/feature/fix
- Commit changes
- Push code
- Create a PR / pull request
- "Save my work"
- Any git-related workflow request

## The Workflow Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│  1. START      2. WORK         3. SAVE        4. SHARE         │
│  ─────────     ──────────      ──────────     ──────────       │
│  New branch → Make changes → Commit often → Push → Create PR   │
└─────────────────────────────────────────────────────────────────┘
```

## Instructions

### Step 0: Assess Current State

ALWAYS start by understanding where we are in the workflow:

```bash
# Get comprehensive state
git status
git branch --show-current
git log --oneline -5
git remote -v
```

Determine:
1. **Current branch**: Are we on main/master or a feature branch?
2. **Uncommitted changes**: Any staged or unstaged work?
3. **Unpushed commits**: Are we ahead of remote?
4. **Remote tracking**: Does this branch track a remote?

Then proceed to the appropriate stage.

---

### Stage 1: START - Create Feature Branch

**When**: Starting new work, and currently on main/master

**Actions**:
1. Ensure main is up to date:
   ```bash
   git pull origin main
   ```

2. Create descriptive branch name:
   - Format: `type/short-description`
   - Types: `feature/`, `fix/`, `refactor/`, `docs/`, `chore/`
   - Examples: `feature/add-dark-mode`, `fix/login-mobile-bug`

3. Create and switch:
   ```bash
   git checkout -b feature/descriptive-name
   ```

4. Confirm to user:
   > "Created branch `feature/xyz`. Ready to work. I'll commit regularly as we make progress."

**Ask if unclear**:
- What should the branch be named?
- Is this a feature, fix, refactor, or something else?

---

### Stage 2: WORK - Regular Commits

**When**: Changes have been made on a feature branch

**Commit Guidelines**:

1. **Commit frequently** - Small, logical units of work
2. **Commit messages** - Clear, conventional format:
   ```
   type: short description

   - Detail 1
   - Detail 2

   🤖 Generated with Claude Code

   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

3. **Types**: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`

4. **Process**:
   ```bash
   git status                    # See what changed
   git diff                      # Review changes
   git add <specific-files>      # Stage relevant files (prefer specific over -A)
   git commit -m "message"       # Commit with clear message
   ```

5. **When to commit**:
   - After completing a logical piece of work
   - Before switching context
   - After tests pass
   - When user says "commit", "save", or similar

**Never commit**:
- `.env` files or secrets
- Build artifacts (unless intentional)
- Half-broken code (stash instead)

---

### Stage 3: SAVE - Push to Remote

**When**: Have local commits ready to share/backup

**Actions**:

1. **First push** (new branch):
   ```bash
   git push -u origin $(git branch --show-current)
   ```

2. **Subsequent pushes**:
   ```bash
   git push
   ```

3. **Before pushing**, verify:
   ```bash
   git log origin/main..HEAD --oneline  # What we're pushing
   ```

4. **Confirm to user**:
   > "Pushed X commits to `branch-name`. Ready for PR when you want."

---

### Stage 4: SHARE - Create Pull Request

**When**: Feature is complete and pushed, ready for review/merge

**Pre-PR Checklist**:
```bash
# 1. Ensure we're up to date with main
git fetch origin main
git log HEAD..origin/main --oneline  # Check if main has new commits

# 2. Run project verification (from CLAUDE.md)
bun run build
bun run lint

# 3. Review all changes going into PR
git diff origin/main...HEAD
git log origin/main..HEAD --oneline
```

**Create PR**:
```bash
gh pr create --title "type: description" --body "$(cat <<'EOF'
## Summary
- What this PR does

## Changes
- Change 1
- Change 2

## Test Plan
- [ ] How to verify

🤖 Generated with Claude Code
EOF
)"
```

**PR Best Practices**:
- Title matches commit convention
- Link related issues: "Closes #123"
- Add reviewers if known: `--reviewer user1,user2`
- Add labels if applicable: `--label enhancement`

**After PR creation**:
- Share the PR URL with user
- Offer to merge if approved: `gh pr merge --squash`

---

## Smart Responses by Trigger

| User Says | Action |
|-----------|--------|
| "Start working on X" | Stage 1: Create branch |
| "Commit" / "Save my work" | Stage 2: Commit changes |
| "Push" | Stage 3: Push to remote |
| "Create PR" / "I'm done" | Stage 4: Create PR |
| "What's my git status?" | Stage 0: Assess and report |
| Ambiguous | Assess state, suggest next step |

---

## Handling Edge Cases

### On main with uncommitted changes
```
⚠️ You have uncommitted changes on main. Let's:
1. Create a feature branch first
2. Then commit your changes there
```

### Merge conflicts
```bash
git fetch origin main
git merge origin/main
# If conflicts, help resolve them, then:
git add .
git commit -m "chore: resolve merge conflicts with main"
```

### Need to switch branches with uncommitted work
```bash
git stash push -m "WIP: description"
git checkout other-branch
# Later:
git checkout original-branch
git stash pop
```

### PR has conflicts
```bash
git fetch origin main
git merge origin/main
# Resolve conflicts
git push
```

---

## State Detection Summary

Run this assessment and proceed accordingly:

```
┌─────────────────────────────────────────────────────────────┐
│ Q: On main/master?                                      │
│ ├─ YES + No changes → Ready to START (create branch)   │
│ ├─ YES + Has changes → Warn, create branch first       │
│ └─ NO (feature branch)                                  │
│     ├─ Has uncommitted changes → COMMIT                 │
│     ├─ Has unpushed commits → PUSH                      │
│     └─ All pushed → Ready for PR                        │
└─────────────────────────────────────────────────────────────┘
```

## Important Notes

- **Never force push** unless explicitly asked and confirmed
- **Never push to main** directly (unless repo allows and user confirms)
- **Always verify** before destructive operations
- **Match project conventions** from CLAUDE.md for build/lint commands
- **Commit message footer** always includes Claude Code attribution
