## Goal

`mcp_devsteps_doctor` als vollständiges MCP-Tool registrieren das `runDoctorChecks()` aus shared aufruft.

## Tool Definition (in `system.ts`)

```typescript
export const doctorTool: Tool = {
  name: 'doctor',
  description: 'Run data integrity checks on the DevSteps project. ' +
    'Verifies JSON validity, index⟷item consistency, bidirectional link symmetry, ' +
    'orphaned items, broken references, CBP directory structure, and context staleness. ' +
    'Returns structured report with status (healthy/warning/critical), individual check results, ' +
    'and list of auto-fixable issues. Use after branch merges, crashes, or unexpected MCP errors. ' +
    'DISTINCT from health (server uptime) — doctor checks DATA integrity.',
  inputSchema: {
    type: 'object',
    properties: {
      auto_fix: {
        type: 'boolean',
        description: 'Automatically repair asymmetric links and rebuild index if needed. Default: false.'
      },
      checks: {
        type: 'array',
        items: { type: 'string', enum: ['json', 'index', 'links', 'orphans', 'refs', 'cbp', 'context'] },
        description: 'Specific checks to run. Default: all.'
      }
    },
    required: []
  }
};
```

## Handler

**Neue Datei: `packages/mcp-server/src/handlers/doctor.ts`**

```typescript
import { runDoctorChecks } from '@schnick371/devsteps-shared';

export async function handleDoctor(args, devstepsDir) {
  const report = await runDoctorChecks(devstepsDir, {
    auto_fix: args.auto_fix ?? false
  });
  return { content: [{ type: 'text', text: JSON.stringify(report, null, 2) }] };
}
```

## Registration

- `system.ts`: `export const doctorTool` 
- `index.ts` (tools barrel): `export { doctorTool }` 
- `server-utils.ts` oder equivalent: `case 'doctor': return handleDoctor(...)`

## Acceptance Criteria
- [ ] Tool erscheint bei `mcp_devsteps_context` unter verfügbaren Tools
- [ ] `mcp_devsteps_doctor({})` liefert DoctorReport JSON
- [ ] `mcp_devsteps_doctor({ auto_fix: true })` repariert asymmetrische Links
- [ ] `auto_fix` default immer `false` — AI-Agent muss explizit `true` übergeben
- [ ] Fehler bei fehlendem `.devsteps/` → strukturierter Fehler, kein Stack Trace