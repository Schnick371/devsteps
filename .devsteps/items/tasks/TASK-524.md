Create packages/cli/src/commands/artifacts-status.ts. Scans tmp/ directory, categorizes files by naming pattern (analyst-*, aspect-*, exec-planner-*, plan-*, SPIKE-*-Research-Brief). Output: table with columns: filename, agent-type, item-id (parsed from filename), age (days), size (KB), linked (yes/no — checks if report_path appears in any .devsteps/analysis/ manifest).

Summary line: total files, orphan count (not linked to any item), oldest file date.

Affected: packages/cli/src/commands/artifacts.ts (new subcommand)