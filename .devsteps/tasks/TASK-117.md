# Task: Translate AI-GUIDE.md to English - Publication Ready

## Objective

Translate `.devsteps/AI-GUIDE.md` from German to English for international NPM package distribution and GitHub publication.

## Translation Approach

### Content Structure (294 Lines)
1. **Header & Introduction** (Lines 1-20)
   - "AI Assistant Guide für DevSteps" → "AI Assistant Guide for DevSteps"
   - Core principles explanation

2. **Hierarchy Rules** (Lines 21-120) 
   - Scrum/Agile vs Waterfall hierarchies
   - Epic → Story → Task relationships
   - Common mistakes prevention

3. **Validation Patterns** (Lines 121-200)
   - Relationship validation rules
   - JSON examples with correct/incorrect patterns
   - Error prevention guidance

4. **AI Assistant Instructions** (Lines 201-294)
   - Specific guidance for AI assistants
   - Command patterns and best practices

### Technical Terminology (Consistency)

**Keep English (already established):**
- Epic, Story, Task, Spike, Bug, Test
- implements, relates-to, depends-on, blocks
- draft, in-progress, done, blocked

**Translate German terms:**
- "Kern-Prinzip" → "Core Principle" 
- "Häufigste Fehler" → "Common Mistakes"
- "NIEMALS SO!" → "NEVER DO THIS!"
- "RICHTIG" → "CORRECT"
- "Grund" → "Reason"

### Translation Quality Standards

**Technical Accuracy:**
- DevSteps-specific terminology consistent with codebase
- JSON examples must remain syntactically valid
- Command patterns match actual CLI implementation

**Clarity & Style:**
- Professional technical documentation tone
- Clear, actionable guidance for AI assistants
- Maintain emoji structure (🎯, 🚨, ✅, ❌)
- Preserve formatting (code blocks, lists, emphasis)

**Cultural Adaptation:**
- Remove German-specific phrasing patterns
- Use international English (not US/UK specific)
- Maintain logical flow and structure

## Implementation Steps

### 1. Create Translation Working Copy
```bash
# Backup original
cp .devsteps/AI-GUIDE.md .devsteps/AI-GUIDE.de.md

# Work on English version
vim .devsteps/AI-GUIDE.md
```

### 2. Section-by-Section Translation
**Systematic approach:**
- Translate headers/titles first
- Update all German text to English
- Verify JSON examples still valid
- Check command references match CLI

### 3. Terminology Consistency Check
```bash
# Check against other docs
grep -r "Epic\|Story\|Task" README.md docs/
grep -r "implements\|relates-to" packages/shared/src/

# Ensure consistency
```

### 4. Rebuild Packages (Auto-Copy)
```bash
# CLI package copies docs
cd packages/cli && npm run build

# MCP server copies docs  
cd packages/mcp-server && npm run build

# Verify copied
ls packages/cli/.devsteps/AI-GUIDE.md
ls packages/mcp-server/.devsteps/AI-GUIDE.md
```

### 5. Quality Validation
- **AI Assistant Test**: Feed translated guide to AI, verify understanding
- **Technical Accuracy**: All JSON examples valid
- **Command Patterns**: Match actual CLI/MCP implementations
- **Consistency**: Terminology aligned with codebase

## Deliverables

✅ **English AI-GUIDE.md**: Professional technical documentation  
✅ **German Backup**: Preserved as `AI-GUIDE.de.md`  
✅ **Package Updates**: CLI + MCP Server rebuilt with English version  
✅ **Future Init**: New projects get English documentation  
✅ **NPM Ready**: International packages with English docs  

## Testing Strategy

### Manual Verification
```bash
# Test Init deploys English
mkdir test-translation && cd test-translation
devsteps init test-proj
head .devsteps/AI-GUIDE.md
# Should show: "# AI Assistant Guide for DevSteps"

# Test package contents
tar -tzf packages/cli/*.tgz | grep AI-GUIDE
tar -tzf packages/mcp-server/*.tgz | grep AI-GUIDE
```

### Content Quality Check
- All German text replaced with English
- Technical terminology consistent
- JSON examples still valid syntax
- Command patterns match CLI help

## Success Criteria

✅ **0 German words** in AI-GUIDE.md (except maybe examples)  
✅ **NPM packages** contain English documentation  
✅ **Init command** deploys English to new projects  
✅ **Technical accuracy** maintained (all examples work)  
✅ **Professional quality** for GitHub publication  

## Post-Translation

**Next Steps:**
- Update EPIC-004 checklist ✅ English documentation
- Consider translating other German content if found
- Update contribution guidelines about English-only docs

## Effort Estimate

- **Translation**: 2-3 hours (294 lines, technical content)
- **Quality Review**: 1 hour (terminology consistency) 
- **Testing**: 30 min (rebuild + verify deployment)
- **Total**: ~4 hours

## References

- **Translation Best Practices**: [Technical Manual Translation 2025](https://www.ecinnovations.com/blog/technical-manual-translation/)
- **DevSteps Terminology**: `packages/shared/src/schemas/`
- **Current German Version**: `.devsteps/AI-GUIDE.md` (294 lines)