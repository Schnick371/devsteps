# DevSteps MCP Tools Guide

## MCP Tools Available

**devsteps-init** - Initialize project with methodology (scrum/waterfall/hybrid)  
**devsteps-add** - Create work items (epic/story/feature/task/bug/spike)  
**devsteps-link** - Create relationships (implements/relates-to/blocks/depends-on/tested-by/supersedes)  
**devsteps-update** - Modify work item properties (status/priority/assignee/description)  
**devsteps-list** - Query work items with filters (type/status/priority/assignee/tags)  
**devsteps-get** - Retrieve complete work item details  
**devsteps-trace** - Show relationship tree with depth traversal  
**devsteps-search** - Full-text search across titles and descriptions  
**devsteps-status** - Project overview with statistics breakdown

---

## Core Workflow Principles

**1. Initialization Phase**
- Select methodology matching team process
- Methodology determines hierarchy rules
- Configuration persists in `.devsteps/config.json`

**2. Hierarchy Creation**
- Always create parent before children
- Link children to parents using `implements` relation only
- Verify hierarchy rules via `devsteps://docs/hierarchy` resource

**3. Branch Strategy**
- Create branch at Level 1 item start (Epic/Requirement)
- Branch naming: `epic/<ID>-<slug>` or `requirement/<ID>-<slug>`
- Maintain stable main branch
- Merge via pull request when complete

**4. Status Management**
- Progress: draft → in-progress → review → done
- Optional states: blocked, cancelled
- Update status as work advances
- Status reflects current work state

**5. Bug Handling**
- Bug is child of Epic/Story/Requirement/Feature
- Use `implements` for hierarchy OR `blocks` for blocking impact
- Create fix Task implementing Bug
- Choose level based on impact scope

**6. Spike Management**
- Spike is child of Epic/Requirement
- Use `relates-to` to inform Stories/Features
- Time-box research activities
- Optional: Add Tasks for spike breakdown

**7. Testing Integration**
- Run automated tests before status change
- User provides manual testing feedback
- Update to `review` status after testing
- Move to `done` when validated

**8. Commit Convention**
- Use conventional commit format
- Reference work item in commit body
- Include relationship context
- Enable traceability via git history

**9. Link Validation**
- Strict hierarchy for `implements` relation
- Flexible relations bypass hierarchy
- Read hierarchy resource before linking
- Validation prevents invalid relationships

**10. Work Item Query**
- Filter by type, status, priority, assignee
- Search across titles and descriptions
- Trace relationships with depth control
- View project statistics and trends

---

## Relation Types

**implements (strict hierarchy):**
- Parent-child relationships only
- Scrum: Epic→Story|Spike|Bug, Story→Task|Bug, Bug→Task, Spike→Task
- Waterfall: Requirement→Feature|Spike|Bug, Feature→Task|Bug, Bug→Task, Spike→Task

**relates-to (flexible):**
- Cross-references without hierarchy or blocking
- Use for general context, informational links
- Spike informs Story/Feature via relates-to

**blocks/blocked-by (dual purpose - Jira 2025):**
- **Hierarchy mode**: Bug blocks Epic/Story/Requirement/Feature (parent-child + blocking)
- **Flexible mode**: Story→Story, Task→Task, etc. (sequencing/dependencies, no validation)
- Jira semantics: One issue prevents another from progressing
- Use for Bug when it both belongs to AND prevents completion of Epic/Story

**depends-on/required-by (flexible):**
- Technical dependencies
- Build order requirements
- Prerequisite relationships

**tested-by/tests (flexible):**
- Test coverage tracking
- Quality assurance links
- Validation relationships

**supersedes/superseded-by (flexible):**
- Replacement tracking
- Obsolescence management
- Evolution documentation

---

## Resources Available

`devsteps://docs/hierarchy` - Complete hierarchy rules with industry standards  
`devsteps://docs/ai-guide` - This guide (extended version with detailed patterns)

Read resources BEFORE creating work items or links to ensure compliance.
