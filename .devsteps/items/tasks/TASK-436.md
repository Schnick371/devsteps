Create `packages/shared/src/utils/heading-shift.ts` with `adjustHeadingLevels(content: string, offset: number): string`. Uses a line-by-line state machine to track fenced code blocks (`\`\`\`` and `~~~` markers) — heading adjustment is SKIPPED for lines inside a fence. For non-fenced lines starting with `#`, shift the heading level by `offset` using formula `depth === 0 ? 0 : depth + 1` where `depth` is the hierarchical level (0 = L1, 1 = L2, etc.); `offset` is the pre-computed value passed by the caller. Hard cap: `Math.min(existingLevel + offset, 6)` — never emit H7 or higher. `offset === 0` must be identity (no mutation).

Re-export from `packages/shared/src/utils/index.ts`.

## Acceptance Criteria
- Identity when `offset === 0`
- H6 promotion never produces H7+ (capped)
- Lines inside ` ``` ` fences are not modified
- Nested fence markers (` ``` ` inside `~~~ `) handled correctly (only first-level fence counted)
- File ≤ 70 lines; zero new dependencies