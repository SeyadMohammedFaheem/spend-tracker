# Perception and visual grouping

Laws in this file: Aesthetic-Usability Effect, Law of Common Region, Law of Proximity, Law of Prägnanz, Law of Similarity, Law of Uniform Connectedness, Von Restorff Effect, Selective Attention.

Canonical write-ups: `https://lawsofux.com/<slug>/` (e.g. `law-of-proximity`, `von-restorff-effect`).

## Contents
- Aesthetic-Usability Effect
- Law of Common Region
- Law of Proximity
- Law of Prägnanz
- Law of Similarity
- Law of Uniform Connectedness
- Von Restorff Effect
- Selective Attention
- Grouping cheat sheet

---

## Aesthetic-Usability Effect
**Idea:** People judge attractive interfaces as easier to use, and forgive minor friction more readily.
**Use it when:** Auditing visual polish, justifying design-system investment, deciding what to refine before a demo.
**Do:**
- Invest in consistent spacing (4/8px scale), type hierarchy (max 2 typefaces, 3-4 sizes per screen), and aligned grids.
- Polish first-impression surfaces: landing, empty states, onboarding, success screens.
**Avoid:** Treating a good-looking prototype as validated. Polish can hide real task failures.
**Check:** Run task-based usability tests; compare task success with perceived ease ratings. If ratings are high but success is low, the effect is masking problems.

## Law of Common Region
**Idea:** Elements sharing a clearly bounded area are perceived as a group, even when other cues disagree.
**Use it when:** Dashboards, settings pages, cards, forms with multiple sections, tables with mixed content.
**Do:**
- Wrap related items in a container: card with 1px border or a subtle background tint (about 3-5% contrast shift from the page).
- Internal padding 16-24px; gap between cards 16-24px.
- Use at most 2 levels of nesting.
**Avoid:** Boxes inside boxes inside boxes; borders on everything (visual noise raises cognitive load). Prefer spacing alone when proximity is already enough.
**Check:** Blur or squint at the screen. Do the regions still read as the intended groups?

## Law of Proximity
**Idea:** Things placed close together are read as related; distance implies separation.
**Use it when:** Almost always. Labels and inputs, buttons and the content they affect, sections, list items, chart legends.
**Do:**
- Keep the gap *within* a group at least 2x smaller than the gap *between* groups. A solid starting point: 8px within, 24-32px between.
- Form: label to input 4-8px; field to field 16-24px; section to section 32-48px.
- Place an action next to the thing it acts on (a "Delete" for a row belongs on the row).
**Avoid:** Equal spacing everywhere (flat rhythm, no grouping); a label closer to the previous field than to its own input (a classic form bug).
**Check:** Cover everything but the whitespace in a screenshot. Can you still tell which items belong together?

## Law of Prägnanz
**Idea:** People interpret complex or ambiguous visuals as the simplest form possible because it costs the least effort.
**Use it when:** Icon design, logos, charts, layout grids, illustrations, data visualization.
**Do:**
- Prefer simple geometry and clear silhouettes; icons readable at 16-24px.
- Align to a grid (8pt) and limit corner radii to 1-2 values across the product.
- Chart: remove gridlines, borders, and 3D effects that don't carry information; label directly instead of using distant legends.
**Avoid:** Decorative complexity that forces users to decode what a shape is.
**Check:** Show an icon or chart for 3 seconds; ask what it is. Wrong or slow answers mean it's too complex or ambiguous.

## Law of Similarity
**Idea:** Elements that look alike (color, shape, size, style) are perceived as related or as having the same function.
**Use it when:** Design systems, link styling, tables, status indicators, navigation, button hierarchy.
**Do:**
- Same function means same style: all primary buttons identical; all links share one color and underline behavior.
- Different function means visibly different: destructive vs. neutral actions; links vs. plain text.
- Keep UI component contrast at least 3:1 against its background and body text at 4.5:1 (WCAG 2.2 AA).
**Avoid:** Styling non-interactive text like a link; using the same color for both "success" and "selected"; using color alone to distinguish state (add an icon or label).
**Check:** Squint-test. Do items that behave the same look the same, and vice versa?

## Law of Uniform Connectedness
**Idea:** Elements joined by a visual connector (line, shared background, frame) are perceived as more related than elements that are merely near or similar.
**Use it when:** Steppers, timelines, tree views, linked filters, connected radio/segmented controls, flow diagrams, tables with grouped rows.
**Do:**
- Stepper: connect step circles with a 2px line; fill the completed segment in the accent color.
- Segmented control: one shared outline with 1px dividers rather than separate buttons.
- Tree/outline: use indent plus a 1px guide line.
**Avoid:** Connecting things that are not actually related. A line is a strong claim.
**Check:** Can a user say what is linked to what without reading labels?

## Von Restorff Effect
**Idea:** When several similar items appear together, the one that differs is the most noticeable and best remembered.
**Use it when:** Primary CTA, recommended plan, new/changed items, critical alerts, key metric.
**Do:**
- One primary action per view: one filled, high-contrast button; others secondary (outline) or ghost (text).
- Reserve the accent color for roughly 10% of the surface or less.
- Highlight 1 (at most 2) items in a set, such as a "Recommended" pricing tier.
**Avoid:** Highlighting everything (nothing stands out); using the "alert" color for decoration; relying on color alone (add weight, size, icon, or position).
**Check:** Five-second test: ask users what they noticed first and remembered. Does it match the intended focus?

## Selective Attention
**Idea:** People filter the environment to what serves their current goal and miss the rest (banner blindness, change blindness).
**Use it when:** Notifications, alerts, ads or promos, onboarding hints, dashboards with live updates, error messages.
**Do:**
- Put goal-critical information in the main task path, not in sidebars or banners.
- For important changes, pair a visual change with a persistent message (inline text near the affected element), not just a transient toast.
- Toasts: show at least 5 seconds, pause on hover/focus; keep errors persistent until dismissed.
- Use motion sparingly; one animated element per view is plenty.
**Avoid:** Styling important content like an ad (wide banner, stock imagery, far from the task); silently updating data users are watching.
**Check:** Eye-tracking or think-aloud sessions: do users notice the critical message without prompting?

---

## Grouping cheat sheet

Strength of grouping cues, roughly weakest to strongest: similarity, proximity, common region, uniform connectedness. When cues conflict, the stronger cue wins, so don't box or connect things you only want loosely related.

| Goal | Cue | Typical value |
|---|---|---|
| Loosely related | Proximity | 8px within / 24px between |
| Clearly separate sections | Common region | Card, 16-24px padding |
| Sequence or hierarchy | Uniform connectedness | 2px connector or 1px guide line |
| Same function | Similarity | Identical component style |
| The one thing to notice | Von Restorff | One filled primary button |
