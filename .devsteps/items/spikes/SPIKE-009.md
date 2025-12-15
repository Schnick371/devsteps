# Spike: Knowledge Graph Foundation - Query Developer History

## Objective
Explore building a knowledge graph from DevSteps data to enable historical queries.

## Research Questions
1. Can we build a CLI tool `devsteps context <file>` to show work item history?
2. What patterns emerge from querying `affected_paths` relationships?
3. Can we surface common pitfalls or related work automatically?

## Hypothesis
DevSteps `affected_paths` field + work item relationships = **latent knowledge graph**. By making it queryable, we provide immediate value without complex AI integration.

## Research Approach
- Analyze `.devsteps/index/` structure for graph capabilities
- Prototype CLI: `devsteps context packages/shared/src/core/validation.ts`
- Expected output: Work item history, change frequency, related files

## Success Criteria
- CLI returns useful insights for 3+ test files
- Developer feedback: "This would save me time"
- Performance: Query results < 500ms

## Research Foundation

**Knowledge Graph Architectures:**
- CodeGraphContext: https://skywork.ai/skypage/en/codegraph-smart-code-companion/1978349276941164544
- DevEx Ambient Agent: https://www.chrisshayan.com/blog-posts/devex-ambient-agent-with-advanced-knowledge-graph
- Graphiti (Temporal): https://medium.com/@saeedhajebi/building-ai-agents-with-knowledge-graph-memory-a-comprehensive-guide-to-graphiti-3b77e6084dec
- AI Agents + Knowledge Graphs: https://skywork.ai/skypage/en/ai-agent-knowledge-graph/1980088995707211776

**Key Insight:** "Most AI treat code as text, missing the intricate web of relationships" - CodeGraphContext

## Deliverable
- PoC CLI tool demonstrating file history queries
- Decision document: Build full feature or integrate existing tool
- Research findings on DevSteps graph capabilities
