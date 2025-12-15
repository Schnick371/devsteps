# Spike: Predictive Refactoring Advisor - Hotspot Detection

## Objective
Research behavioral code analysis on DevSteps history to predict technical debt and refactoring needs.

## Research Questions
1. Can we detect "hotspots" (high change frequency + complexity)?
2. Can we predict future bugs from change patterns?
3. What's the ML effort vs. rule-based heuristics?

## Hypothesis
DevSteps `affected_paths` + temporal data = **behavioral analysis dataset**. Like CodeScene, we can detect deviating patterns and generate proactive refactoring alerts.

## Research Approach
- Implement hotspot detection (change frequency × file size/complexity proxy)
- Analyze work item clustering (multiple bugs affecting same file)
- Prototype "Refactoring Advisor" alerts

## Dependencies
Requires SPIKE-009 knowledge graph foundation.

## Success Criteria
- Detect 3+ real hotspots in DevSteps project
- Predict at least one real technical debt area
- Developer feedback: "This flagged a real problem"

## Research Foundation

**Behavioral Code Analysis:**
- Software Design X-Rays (Book): https://pragprog.com/titles/atevol/software-design-x-rays/
- CodeScene Behavioral Analysis: https://codescene.com/hubfs/web_docs/Behavioral-code-analysis-in-practice.pdf
- CodeScene Hotspot Detection: https://codescene.io/docs/guides/technical/hotspots.html

**AI-Powered Technical Debt:**
- AI Code Review Tools: https://pieces.app/blog/code-review-tools
- ML for Technical Debt Prediction (Paper): https://www.jetir.org/papers/JETIR2502816.pdf
- Qodo AI Technical Debt Guide: https://www.qodo.ai/blog/managing-technical-debt-ai-powered-productivity-tools-guide/
- Generative AI for Technical Debt: https://medium.com/@adnanmasood/rewriting-the-technical-debt-curve-how-generative-ai-vibe-coding-and-ai-driven-sdlc-transform-03129e81a25e

**Key Findings:**
- "40% faster code reviews, 60% fewer regression bugs" - Behavioral analysis impact
- "Change coupling + temporal data = predictive power" - Software Design X-Rays
- "Detect absence of change as much as frequency" - CodeScene

## Deliverable
- Hotspot detection prototype on DevSteps data
- Risk assessment report for current codebase
- Decision: Build ML model vs. rule-based heuristics vs. integrate CodeScene
- Research findings on predictive accuracy
