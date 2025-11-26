# Concept 1: Copilot's View of Sprint

**Visual Metaphor:** Scrum/Kanban board columns viewed THROUGH Copilot glasses - AI's perspective on workflow

## Design Philosophy

- **Human-AI Partnership:** AI viewing and understanding YOUR workflow
- **Copilot Perspective:** Glasses = AI vision/analysis  
- **Unique Positioning:** Only DevSteps shows "workflow through AI lens"
- **Circular Design:** Round visible area (square canvas) with extending elements

## Variants

### Variant A: Bold Glasses, 3 Clear Lanes
**File:** `Variant-A-Bold-Glasses-3-Clear-Lanes.svg`

**Characteristics:**
- ⭐⭐⭐⭐⭐ Recognizability at 28×28
- Bold 2px strokes, clear shapes
- 3 distinct lanes (Todo/In Progress/Done)
- Prominent Copilot glasses reference
- Temples extend beyond circle boundary

**Best for:** Maximum visibility, clear Copilot branding

---

### Variant B: Subtle Glasses, 4 Lanes with Dots
**File:** `Variant-B-Subtle-Glasses-4-Lanes-Dots.svg`

**Characteristics:**
- ⭐⭐⭐ Recognizability (more detail)
- Thinner strokes (1.5px), minimalist aesthetic
- 4 lanes (more realistic Scrum board)
- Items represented as dots
- Subtle glasses hint (not dominant)

**Best for:** Clean, professional look with detail

---

### Variant C: Angled Glasses, Cards with Movement
**File:** `Variant-C-Angled-Glasses-Cards-Movement.svg`

**Characteristics:**
- ⭐⭐⭐⭐ Recognizability (dynamic feel)
- Angled glasses suggest perspective
- Cards shown as rectangles (actual work items)
- Curved paths, rounded rectangles
- Modern aesthetic with movement

**Best for:** Unique, eye-catching design

---

### Variant D: Monochrome Theme Compatible
**File:** `Variant-D-Monochrome-Theme-Compatible.svg`

**Characteristics:**
- ⭐⭐⭐⭐⭐ Recognizability (simplified)
- Pure currentColor (works in ANY theme)
- Simplified geometry (perfect pixel alignment)
- High contrast light/dark
- Maximum VS Code theme compatibility

**Best for:** Production use, theme consistency

## Technical Specifications

- **Size:** 28×28 pixels (Activity Bar)
- **ViewBox:** 24×24 (scaled to 28×28)
- **Stroke Width:** 2px (bold) or 1.5px (subtle)
- **Color:** currentColor (theme-aware)
- **Format:** SVG (vector, scalable)

## Design Decisions

### Why Circular?
- User requirement: "rund haben also das image background ist natürlich quadratisch, aber der sichtbare Teil soll rund sein"
- Material Design influence (70% of 2025 icons use circles)
- Harmonious shape, perfect for small sizes

### Why Glasses Extend Beyond Circle?
- User requirement: "wenn der Platz nicht reicht kann auch einzelne Elemente darüber hinaus gehen"
- Creates depth and interest
- Clear Copilot reference (temples visible)

### Why 3 Lanes (most variants)?
- Recognizable as board/workflow at small size
- Classic Todo/Doing/Done pattern
- Avoids over-complexity at 28×28

### Why Copilot Glasses?
- User requirement: "beziehung mensch - KI herstellen"
- Universal AI symbol (GitHub Copilot, Microsoft Copilot)
- Partnership metaphor (AI viewing workflow, not replacing human)

## Next Steps

1. **User Testing:** Display all 4 variants side-by-side in VS Code mockup
2. **Theme Testing:** Test in light/dark/high-contrast themes
3. **Selection:** Choose winning variant based on feedback
4. **Refinement:** Pixel-perfect optimization for 28×28 rendering
5. **Export:** Generate PNG versions for marketplace (128×128)

## Related Work Items

- **TASK-072:** This concept implementation
- **STORY-021:** Logo Design Workshop (parent)
- **EPIC-009:** Brand Identity & Visual Design System
- **TASK-073:** Concept 2 (Footsteps + Glasses)
- **TASK-074:** Concept 3 (Step Dots Through Lens)
