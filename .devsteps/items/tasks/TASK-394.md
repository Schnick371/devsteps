TASK-378 (DocIndex.ts) was originally planned to depend on `docs-map-positions.json`. SPIKE-041 research shows this dependency is unnecessary.

**Changes needed:**
1. Update TASK-378 description: "DocIndex.getDocSectionsForFile(relPath) = loadItemsByType('doc').filter(i => i.affected_paths.includes(relPath))" 
2. Remove `depends-on: TASK-377` link from TASK-378
3. Update STORY-229 and STORY-230: remove dependency on TASK-377
4. Update TASK-377 description: clarify it is NOT a prerequisite for CodeLens/HoverProvider (STORY-229/230) but still needed for ARCH tree and TreeView

This unblocks STORY-229 and STORY-230 from waiting for TASK-377.Done: TASK-378 description updated with simplified loadItemsByType approach. TASK-377 dependency context added. Commit 69d8e35.