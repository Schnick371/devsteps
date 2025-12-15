# Problem

AI agents (including me) tend to jump to implementation before completing full context analysis.

## What I did wrong
1. Saw search results showing JSON.parse duplications
2. Immediately started creating getConfig() function  
3. Created config.ts without checking if similar patterns exist
4. Started refactoring before understanding full scope

## What I should have done
1. Search for ALL config-related patterns first
2. Analyze existing shared functions (getItem, listItems, etc.)
3. Check if getConfig pattern already exists elsewhere
4. Map complete landscape before any code changes
5. Create comprehensive refactoring plan
6. Then implement systematically

## Root Cause

Cognitive bias: Action bias - preference for doing over analyzing
Missing step: Complete discovery phase before implementation
Impact: Wasted tokens, potential duplicate code, incomplete refactoring

## Solution

Workflow change needed:
1. STOP after understanding user request
2. SEARCH comprehensively (multiple patterns, semantic + grep)
3. READ existing implementations in shared package  
4. MAP all locations needing changes
5. PLAN refactoring strategy
6. ONLY THEN implement

## Acceptance Criteria

- Document this pattern in devsteps-coordinator chatmode
- Add pre-implementation checklist
- Prevent premature code generation