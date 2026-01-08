---
name: create-issues
description: Creates well-structured issues in GitHub, Linear, or Jira with proper formatting, labels, and acceptance criteria
---

# Create Issues

A comprehensive skill for creating well-structured issues in any issue tracking system.

## Trigger

Use this skill when the user asks to:
- Create an issue or issues
- Make a ticket or tickets
- Log a bug, feature request, or task
- Plan work items for a project

## Instructions

### Step 1: Determine Issue Tracker

First, identify which issue tracking system to use:

1. **Check the repository**: Run `gh repo view --json name,owner` to see if this is a GitHub repo
2. **Check for existing issues**: Look for patterns in how issues are already created
3. **Check CLAUDE.md**: Look for any issue tracking preferences documented there
4. **Ask if unclear**: If multiple options exist or none is obvious, ask the user:
   - GitHub Issues
   - Linear
   - Jira
   - Other (specify)

### Step 2: Gather Context

Before creating issues, understand:

1. **What needs to be built**: Get clear requirements from the user
2. **Existing labels/tags**:
   - For GitHub: `gh label list`
   - Check what categorization system is in place
3. **Existing projects/milestones**:
   - For GitHub: `gh project list` and `gh api repos/{owner}/{repo}/milestones`
4. **Issue templates**: Check `.github/ISSUE_TEMPLATE/` for required formats

If the request is ambiguous, ask clarifying questions:
- What is the acceptance criteria?
- What priority level?
- Any dependencies on other work?
- Who should be assigned (if applicable)?

### Step 3: Structure Each Issue

Every issue MUST include:

#### Title
- Clear, actionable, starts with verb (Add, Fix, Implement, Update, etc.)
- Specific enough to understand scope at a glance

#### Description
Structure the description with these sections:

```markdown
## Summary
[1-2 sentences explaining the what and why]

## Details
[Expanded context, background, or technical details]

## Acceptance Criteria
- [ ] Criterion 1 (specific, testable)
- [ ] Criterion 2
- [ ] Criterion 3

## Implementation Notes (optional)
[Technical hints, relevant files, suggested approach]

## Verification
- [ ] How to verify this is complete
- [ ] What to test
- [ ] Expected behavior
```

#### Metadata
Apply appropriate:
- **Labels**: Match existing label taxonomy (bug, enhancement, documentation, etc.)
- **Project**: Add to relevant project board if one exists
- **Milestone**: Associate with milestone if applicable
- **Assignee**: Only if explicitly requested

### Step 4: Create the Issue(s)

For **GitHub Issues**:
```bash
gh issue create --title "Title" --body "Body" --label "label1,label2"
```

Add to project if applicable:
```bash
gh project item-add [PROJECT-NUMBER] --owner [OWNER] --url [ISSUE-URL]
```

For **Linear** (if configured via MCP or CLI):
- Use the Linear API/CLI with appropriate team, project, and labels

For **Jira** (if configured):
- Use Jira API with appropriate project key, issue type, and components

### Step 5: Confirm and Report

After creating issue(s):
1. Display the issue URL(s) to the user
2. Summarize what was created
3. Show applied labels/project associations
4. Ask if any adjustments are needed

## Examples

### Single Bug Issue
User: "Create an issue for the login button not working on mobile"

Result:
- Title: "Fix: Login button unresponsive on mobile devices"
- Labels: bug, mobile, high-priority
- Clear repro steps and expected behavior in description

### Feature with Multiple Tasks
User: "Create issues for adding dark mode support"

Result: Multiple linked issues:
1. "Add: Dark mode color tokens to design system"
2. "Implement: Theme toggle component"
3. "Update: All components to use theme tokens"
4. "Add: Persist theme preference in storage"

Each with proper dependencies noted.

## Important Notes

- **Never guess labels**: Use existing labels only, or ask to create new ones
- **Never assume priority**: Ask if not specified
- **Link related issues**: Reference existing issues when relevant
- **Keep scope focused**: One issue = one deliverable unit of work
- **Use project conventions**: Match the style of existing issues in the repo
