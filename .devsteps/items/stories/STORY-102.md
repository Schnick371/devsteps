# Compliance & Audit Trail - Requirements Traceability Matrix

## User Story

**As a** compliance officer or QA manager  
**I want** automated traceability from requirements to deployment  
**So that** I can demonstrate regulatory compliance (FDA, IEC 62304, SOX)

## Regulatory Requirements

### FDA 21 CFR Part 11 & IEC 62304
- ✅ **Tamper-proof logs**: Git provides immutable commit history
- ✅ **Requirements traceability**: Work Item → Code → Test → Deployment
- ✅ **Change control**: Pull requests with approval workflow
- ✅ **Audit trail**: Who, what, when, why for every change
- ✅ **Electronic signatures**: Git commit signatures (GPG)

### SOX Compliance (Section 404)
- ✅ **Segregation of duties**: Code author ≠ Reviewer ≠ Deployer
- ✅ **Change monitoring**: Automatic tracking of all modifications
- ✅ **Access control**: Git permissions + work item validation
- ✅ **Retention**: Git history never deleted

## Acceptance Criteria

1. ✅ Generate Requirements Traceability Matrix (RTM) on demand
2. ✅ Export audit evidence (CSV/PDF) for regulatory submissions
3. ✅ Track complete chain: REQ → FEAT → TASK → Commit → Build → Deploy
4. ✅ Validate segregation of duties (different users for code/review/merge)
5. ✅ Sign commits with GPG for non-repudiation
6. ✅ Generate change history report with justification

## Traceability Matrix Schema

**Requirements → Implementation → Verification:**

```typescript
interface TraceabilityMatrix {
  requirement: {
    id: string;          // REQ-001 or EPIC-026
    title: string;
    acceptance_criteria: string[];
    risk_classification?: "high" | "medium" | "low";
  };
  
  implementation: {
    stories: string[];   // STORY-099, STORY-100, STORY-101
    tasks: string[];     // TASK-XXX
    commits: CommitEvidence[];
    pull_requests: PREvidence[];
  };
  
  verification: {
    tests: string[];     // TEST-XXX work items
    test_runs: TestEvidence[];
    code_reviews: ReviewEvidence[];
  };
  
  deployment: {
    releases: ReleaseEvidence[];
    environments: ("dev" | "staging" | "production")[];
    approvals: ApprovalEvidence[];
  };
  
  audit_trail: {
    created_at: string;
    created_by: string;
    reviewed_by: string[];
    approved_by: string[];
    segregation_validated: boolean;
  };
}

interface CommitEvidence {
  sha: string;
  message: string;
  author: string;
  author_email: string;
  committer: string;
  committer_email: string;
  timestamp: string;
  gpg_signature?: {
    status: "valid" | "invalid" | "unsigned";
    signer: string;
    fingerprint: string;
  };
  files_changed: string[];
  insertions: number;
  deletions: number;
  work_item_refs: string[];
}

interface ReviewEvidence {
  reviewer: string;
  timestamp: string;
  status: "approved" | "changes_requested" | "commented";
  comments: string;
  segregation_valid: boolean; // reviewer ≠ author
}

interface ApprovalEvidence {
  approver: string;
  role: "developer" | "qa" | "manager" | "compliance";
  timestamp: string;
  comments: string;
}
```

## CLI Commands

**Generate Traceability Matrix:**
```bash
# Full matrix for Epic
devsteps audit trace EPIC-026 --output matrix.csv

# Specific requirement chain
devsteps audit trace REQ-001 --format pdf --include-evidence

# Compliance report
devsteps audit compliance-report --start-date 2026-01-01 --end-date 2026-12-31
```

**Segregation of Duties Validation:**
```bash
# Verify no self-approvals
devsteps audit validate-segregation STORY-099

# Check all work items in release
devsteps audit validate-release v1.0.0
```

**Export Audit Evidence:**
```bash
# FDA submission package
devsteps audit export-evidence EPIC-026 --format fda --output evidence/

# SOX compliance bundle
devsteps audit export-evidence --all --format sox --fiscal-year 2026
```

## Implementation Details

**RTM Generation:**
```typescript
// packages/shared/src/compliance/traceability-matrix.ts

export async function generateTraceabilityMatrix(
  devstepsDir: string,
  rootItemId: string,
  options: RTMOptions = {}
): Promise<TraceabilityMatrix> {
  // 1. Load root item (Epic/Requirement)
  const root = await getItem(devstepsDir, rootItemId);
  
  // 2. Traverse hierarchy (Epic → Stories → Tasks)
  const implementation = await traceImplementation(devstepsDir, rootItemId);
  
  // 3. Collect commit evidence from all tasks
  const commits = implementation.tasks.flatMap(task => 
    task.commits.map(commit => ({
      ...commit,
      gpg_signature: validateGPGSignature(commit.sha),
      work_item_refs: extractWorkItemRefs(commit.message)
    }))
  );
  
  // 4. Find related test items
  const verification = await findTestCoverage(devstepsDir, rootItemId);
  
  // 5. Extract deployment/release info
  const deployment = await extractDeploymentData(commits);
  
  // 6. Validate segregation of duties
  const segregation = validateSegregation(commits, verification);
  
  return {
    requirement: { ...root },
    implementation: { ...implementation, commits, pull_requests: [] },
    verification,
    deployment,
    audit_trail: {
      created_at: new Date().toISOString(),
      created_by: getCurrentUser(),
      segregation_validated: segregation.valid,
      reviewed_by: segregation.reviewers,
      approved_by: segregation.approvers
    }
  };
}
```

**Segregation Validation:**
```typescript
function validateSegregation(commits: CommitEvidence[], reviews: ReviewEvidence[]): {
  valid: boolean;
  violations: string[];
  reviewers: string[];
  approvers: string[];
} {
  const violations: string[] = [];
  const reviewers = new Set<string>();
  const approvers = new Set<string>();
  
  for (const commit of commits) {
    const author = commit.author_email;
    
    // Find reviews for this commit
    const commitReviews = reviews.filter(r => 
      r.commit_sha === commit.sha
    );
    
    for (const review of commitReviews) {
      reviewers.add(review.reviewer);
      
      // SOX violation: Self-approval
      if (review.reviewer === author) {
        violations.push(
          `Self-approval detected: ${author} reviewed own commit ${commit.sha.substring(0, 7)}`
        );
      }
    }
  }
  
  return {
    valid: violations.length === 0,
    violations,
    reviewers: Array.from(reviewers),
    approvers: Array.from(approvers)
  };
}
```

## Dashboard Integration

**Compliance Dashboard Section:**
```typescript
// Extension WebView: Compliance tab
<div class="compliance-section">
  <h2>Regulatory Compliance</h2>
  
  <div class="metrics">
    <div class="metric">
      <label>Traceability Coverage</label>
      <progress value="95" max="100">95%</progress>
      <span>95% (38/40 requirements traced)</span>
    </div>
    
    <div class="metric">
      <label>Segregation Compliance</label>
      <span class="status-ok">✓ 100% Valid</span>
      <small>No self-approvals detected</small>
    </div>
    
    <div class="metric">
      <label>Signed Commits</label>
      <progress value="87" max="100">87%</progress>
      <span>87% (245/282 commits signed)</span>
    </div>
  </div>
  
  <div class="actions">
    <button onclick="generateRTM()">Generate RTM</button>
    <button onclick="exportEvidence()">Export Evidence</button>
    <button onclick="validateCompliance()">Validate Compliance</button>
  </div>
  
  <div class="recent-violations">
    <h3>Recent Issues</h3>
    <ul>
      <li class="warning">
        ⚠️ 3 unsigned commits in STORY-099
        <button>Sign Now</button>
      </li>
      <li class="info">
        ℹ️ 2 requirements pending test coverage
        <a href="#TEST-XXX">Add Tests</a>
      </li>
    </ul>
  </div>
</div>
```

## Export Formats

**CSV (Excel-compatible):**
```csv
Requirement ID,Title,Story,Task,Commit SHA,Author,Reviewer,Test ID,Status
REQ-001,User Auth,STORY-099,TASK-042,abc1234,dev@ex.com,qa@ex.com,TEST-001,✓
```

**PDF Report (Regulatory Submission):**
- Cover page with project metadata
- Table of contents
- Requirements list with acceptance criteria
- Implementation evidence (commits, code reviews)
- Test results and coverage
- Deployment history
- Signatures page

**JSON (Machine-readable):**
```json
{
  "compliance_report": {
    "generated_at": "2026-01-29T12:00:00Z",
    "scope": "EPIC-026",
    "standards": ["FDA 21 CFR Part 11", "IEC 62304", "SOX 404"],
    "traceability_matrix": { ... },
    "segregation_analysis": { ... },
    "risk_assessment": { ... }
  }
}
```

## Testing Strategy

**Unit Tests:**
```typescript
describe('Traceability Matrix', () => {
  it('should generate complete RTM for Epic', async () => {
    const matrix = await generateTraceabilityMatrix('.devsteps', 'EPIC-026');
    expect(matrix.requirement.id).toBe('EPIC-026');
    expect(matrix.implementation.stories).toHaveLength(3);
    expect(matrix.audit_trail.segregation_validated).toBe(true);
  });
  
  it('should detect self-approval violations', async () => {
    const validation = validateSegregation(commits, reviews);
    expect(validation.violations).toContain('Self-approval detected');
  });
});
```

**Integration Tests:**
```bash
# Generate RTM for test project
bats tests/integration/compliance/traceability-matrix.bats
```

## Dependencies

- STORY-099: Commit tracking (provides CommitMetadata)
- Git log parsing for evidence collection
- GPG signature validation
- Export libraries (csv-writer, pdfkit)

## Related Standards

**References:**
- FDA 21 CFR Part 11: Electronic Records and Signatures
- IEC 62304: Medical Device Software Lifecycle
- SOX Section 404: Internal Controls
- ISO 13485: Quality Management for Medical Devices
- GAMP 5: Good Automated Manufacturing Practice

**Industry Tools Comparison:**
- IntuitionLabs: Git compliance for FDA/IEC 62304
- Inflectra SpiraTeam: Requirements traceability matrix
- Microsoft Azure DevOps: End-to-end traceability
- Jama Connect: Requirements management for regulated industries