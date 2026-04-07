Add `devsteps_docs_classify` to MCP tools handler:
- Input: `{ path, excerpt, session_id, token }`
- Validates token, marks file as in-progress in session
- Calls heuristicClassify (TASK-405) 
- Returns: scores, winner, mixed flag, signals[], suggested_splits?, next_steps[]
- MIXED next_steps: "Ask user to decide: accept/split/skip/rewrite. Then call devsteps_docs_classify_confirm"
- Clear next_steps: "Classification clear. Call devsteps_docs_classify_confirm with decision=accept"