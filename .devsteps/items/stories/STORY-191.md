## Problem
Aktuell: 0% Test-Coverage für den kritischsten Ausführungspfad des Systems.

## Benötigte Tests

### Vitest Unit-Tests
Tests die prüfen:
- (a) **Silent-Failure**: wenn Analyst keinen MandateResult schreibt, wird Quorum-Violation erkannt
- (b) **Format-Mismatch**: zwischen Koordinator-Erwartung und Analyst-Output
- (c) **Quorum-Violation**: weniger MandateResults als dispatched agents → write_escalation
- (d) **Illegales Nested-Dispatch**: TIER2-PROTOCOL-artiges verschachteltes Dispatch

### BATS Integration Tests
- End-to-end Dispatch-Zyklus mit Mock-MandateResult-Files als Fixtures

## Fixtures
- Mock-MandateResult-Files in `tests/fixtures/cbp/`

## Acceptance Criteria
- Vitest Unit-Tests decken alle 4 Szenarien (a)-(d) ab
- BATS Integration-Tests laufen durch
- Coverage Report zeigt >80% für `packages/shared/src/schemas/cbp-mandate.ts`
- `npm test` grün