Modify the Zod .regex() validator at packages/shared/src/schemas/analysis.ts (line ~94) to also accept PLAN-{session} format IDs (e.g., PLAN-TMP-FORMAL, PLAN-SPRINT-001, PLAN-20260409). Maintain backward compatibility with all existing EPIC|STORY|TASK|REQ|FEAT|BUG|SPIKE|TEST|DOC-NNN patterns. Add a unit test for the new PLAN-* pattern.

Affected: packages/shared/src/schemas/analysis.ts