---
applyTo: "**/*.ps1,**/*.psm1,**/Install/*.ps1,**/Modules/**/*.ps1"
description: "Remarc.Common logging infrastructure standards for Teamcenter deployment automation"
---

# PowerShell Remarc.Common Logging Standards

## Logging Infrastructure

**Module:** `Remarc.Common`  
**Core Functions:** `Initialize-Logging`, `Write-LogFile`, `Test-Logging`  
**Convenience Wrappers:** `Write-LogInfo`, `Write-LogWarning`, `Write-LogError` (auto-prefix + console output)

## Script-Level Initialization

**Pattern:** Call `Initialize-Logging` in begin block (auto-detects script name)  
**Location:** User-started scripts ONLY (not internal modules/helpers)  
**Optional:** Add `-DataFilePath` parameter for environment JSON context

## Message Output Standards

**Dual-Output Pattern (File + Console):**
- Use convenience wrappers for combined file and console output
- Prefix messages appropriately (Info, Warning, Error)
- Maintain backward compatibility with manual piping pattern

**Prohibited Patterns:**

**Never use for operational messages:**
- `Write-Host` - Missing file logging, not pipeline-friendly
- Bare `Write-Output` - Missing file logging, pollutes return values
- `Write-Verbose` - Use ONLY for diagnostics (developer-facing)

## Module Function Logging

**Module functions** use `Write-Verbose` for diagnostics, `Write-LogFile | Write-{Level}` for user messages (assumes caller initialized logging)

### Core Module Functions (Remarc.Tc.Install.Core)

**Pattern:** Core infrastructure functions use `Write-Verbose` ONLY  
**Rationale:** Core functions are building blocks (path discovery, config parsing) called by higher-level scripts that manage logging context

**Exception:** If Core function performs user-visible operation (git commands, file modifications), use dual-output pattern

## Enforcement

**Apply dual-output pattern:** `Write-LogFile | Write-{Level}` for all user-facing operations  
**Core modules:** Use `Write-Verbose` only (unless performing user-visible actions)  
**Never use:** `Write-Host`, bare `Write-Output` for operational messages
