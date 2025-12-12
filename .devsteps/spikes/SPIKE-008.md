# Research: Multi-User Scaling Beyond 5 Concurrent Users

## Research Question

**At what scale does ULID + LWW conflict resolution break down, and when is a centralized server necessary?**

## Background

ULID-based offline-first approach works well for:
- 2-3 developers/agents working in parallel
- Occasional concurrent edits
- Git as coordination layer

But we need to validate the upper limits:
- **5+ simultaneous users** editing same items
- **High-frequency updates** (multiple changes per minute)
- **Complex dependencies** requiring transactional consistency
- **Real-time collaboration** expectations

## Research Areas

### 1. Conflict Probability Analysis

**Calculate collision scenarios:**
- ULID collision probability with N concurrent generators
- ID counter collision rate at different scales
- LWW merge complexity with M branches

**Testing:**
```bash
# Simulate 5, 10, 20 concurrent agents
for i in {1..20}; do
  (devsteps add task "Agent $i task" &)
done
# Measure: conflicts, merge time, data loss
```

### 2. Git Merge Performance

**Benchmark:**
- Merge time for N concurrent branches (N=5, 10, 20)
- Index.json conflict resolution overhead
- File system limitations (100s of .json files)

**Hypothesis:** Git merges degrade beyond 10-15 concurrent branches

### 3. Real-Time vs Eventual Consistency

**Compare patterns:**

| Pattern | Use Case | Pros | Cons |
|---------|----------|------|------|
| **Offline-First (ULID)** | <5 users, async work | No server, simple | Eventual consistency only |
| **Operational Transform** | Real-time editors | True real-time | Complex, server required |
| **CRDT (Automerge)** | 5-15 users, P2P | No central server | Network overhead, complexity |
| **Server + Websockets** | 15+ users, real-time | Strong consistency | Infrastructure dependency |

### 4. Case Studies Research

**Review production systems:**
- **Linear**: How they handle multi-user issue tracking
- **Notion**: CRDT + server hybrid approach
- **Figma**: Operational Transform at scale
- **GitHub Issues**: Server-based with optimistic UI

**Tools to research:**
- Automerge (CRDT library)
- Yjs (CRDT for collaborative editing)
- Electric SQL (local-first with sync)
- PowerSync (Postgres ↔ SQLite sync)

### 5. Cost-Benefit Analysis

**Scenarios:**

**Scenario A: 5-10 Users (ULID + Git)**
- Cost: Development time (ULID implementation)
- Benefit: Zero infrastructure, offline-first
- Risk: Occasional merge conflicts

**Scenario B: 10-20 Users (CRDT Layer)**
- Cost: Add Automerge/Yjs, network complexity
- Benefit: Better conflict resolution, P2P sync
- Risk: Learning curve, debugging difficulty

**Scenario C: 20+ Users (Centralized Server)**
- Cost: Infrastructure (database, websockets, hosting)
- Benefit: True real-time, strong consistency
- Risk: Single point of failure, offline breaks

## Deliverables

### 1. Scaling Report (Markdown)
```
packages/shared/docs/scaling-analysis.md
- Conflict probability calculations
- Git merge benchmarks
- Pattern comparison matrix
- Recommendation by team size
```

### 2. Prototype (Optional)
- Simple CRDT integration POC (if promising)
- Benchmark suite for concurrent operations
- Demo of 10-agent scenario

### 3. Decision Framework
```markdown
## When to Use What

### ULID + Git (Current Approach)
✅ Use when:
- Team size: 1-5 developers
- Work style: Async, branch-based
- Offline: Critical requirement
- Infrastructure: None available

### Add CRDT Layer
✅ Use when:
- Team size: 5-15 users
- Work style: Semi-real-time
- Offline: Still important
- Acceptable: Network complexity

### Centralized Server
✅ Use when:
- Team size: 15+ users
- Work style: Real-time collaboration
- Offline: Nice to have
- Acceptable: Infrastructure costs
```

## Success Criteria

- [ ] Quantitative limits identified (N users, M items)
- [ ] Comparison matrix complete
- [ ] Recommendations documented
- [ ] POC code (if CRDT chosen)
- [ ] Decision made: Stay ULID-only or add layer

## Timeline

- Research: 2-3 days
- Prototyping: 2-4 days (if needed)
- Documentation: 1 day

**Total: ~1 week**

## Follow-Up Stories

Based on findings, create:
- **If ULID sufficient:** Close spike, proceed with STORY-076
- **If CRDT needed:** New story for Automerge/Yjs integration
- **If server needed:** New epic for server architecture

## References

- [Automerge: Local-First Software](https://automerge.org/)
- [Electric SQL: Local-First Sync](https://electric-sql.com/)
- [CRDT.tech: Comprehensive CRDT resources](https://crdt.tech/)
- [Figma: Multiplayer Architecture](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)