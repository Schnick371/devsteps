# Cleanup DevSteps Work Items

## Archive Completed Items
Move done items from active to archive:

```bash
# Archive all done items
devsteps archive --filter status:done

# Or selective:
devsteps archive TASK-001 TASK-002 BUG-001 ...
```

## Update EPIC-004 Status
- Review all child tasks completion
- Mark EPIC-004 as done if all required tasks complete

## Clean Up Draft Items
Review draft items:
- Obsolete items → status:obsolete
- Won't-do items → status:cancelled  
- Still relevant → keep as draft

## Verify Traceability
- All implemented items link to parent
- No orphaned items
- Relationship graph clean

## Final Status Report
```bash
devsteps status --detailed
```

Expected after cleanup:
- Draft: ~20-30 items (future work)
- In-Progress: 0
- Done: Archived
- Blocked: Resolved or cancelled

## Acceptance Criteria
- ✅ All done items archived
- ✅ EPIC-004 status accurate
- ✅ No orphaned items
- ✅ Clean status report
- ✅ Ready for production