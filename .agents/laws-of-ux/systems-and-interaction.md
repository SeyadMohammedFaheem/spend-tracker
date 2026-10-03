# Systems and interaction

Laws in this file: Fitts's Law, Doherty Threshold, Jakob's Law, Postel's Law, Tesler's Law, Occam's Razor, Pareto Principle.

Canonical write-ups: `https://lawsofux.com/<slug>/` (e.g. `fittss-law`, `doherty-threshold`, `teslers-law`).

## Contents
- Fitts's Law
- Doherty Threshold
- Jakob's Law
- Postel's Law
- Tesler's Law
- Occam's Razor
- Pareto Principle

---

## Fitts's Law
**Idea:** The time to hit a target depends on how far away it is and how big it is. Bigger and closer is faster and less error-prone.
**Use it when:** Buttons, touch targets, menus, toolbars, tables with row actions, mobile layouts, destructive actions.
**Do:**
- Minimum target sizes: 44x44pt (Apple HIG), 48x48dp (Material), 44x44 CSS px (WCAG 2.2 AAA, 2.5.5). WCAG 2.2 AA (2.5.8) sets a floor of 24x24 CSS px.
- Space adjacent targets at least 8px apart.
- Extend the hit area beyond the visible icon with padding rather than enlarging the icon.
- Make labels clickable for checkboxes and radios.
- Place primary actions where the cursor or thumb already is; on mobile, favor the lower half of the screen (thumb zone).
- Screen edges and corners are effectively infinite-size targets on desktop (useful for menus and toolbars).
- Separate destructive actions from frequent ones; make them smaller or farther away, not adjacent.
**Avoid:** Tiny icon-only buttons packed tightly; primary action far from the content it affects.
**Check:** Mis-tap and mis-click rates; time-to-target in testing on a real phone.

## Doherty Threshold
**Idea:** Productivity rises when the system responds fast enough (about 400ms or less) that neither the person nor the system waits on the other.
**Use it when:** Loading states, search, saves, navigation, animations, dashboards, forms with validation.
**Do:**
- Acknowledge every action within 100ms (pressed state, optimistic update, inline change).
- Aim for meaningful responses under 400ms.
- Over about 1s: show a loading indicator. Skeleton screens for page or section loads; delay showing them by about 200-300ms so quick loads don't flash.
- 1-10s: spinner or indeterminate progress. Over 10s: determinate progress with a time estimate, and let users continue other work.
- Optimistic UI for low-risk actions (like, reorder, rename), with rollback and an error message on failure.
- Micro-interaction animations 150-250ms; page transitions up to about 300ms.
**Avoid:** Animation that makes the experience feel slower; spinners that appear and vanish within a few hundred ms.
**Check:** Measure interaction-to-response times (INP in web vitals; target 200ms or less at the 75th percentile) and watch users during slow responses.

## Jakob's Law
**Idea:** Users spend most of their time in other products, so they expect yours to work the same way.
**Use it when:** Navigation, forms, icons, checkout, auth, settings, new features, redesigns, design systems.
**Do:**
- Use established patterns: logo top-left links home; magnifier icon for search; cart icon top-right for commerce; labels above inputs; standard keyboard behavior.
- Reuse the platform's components (native date pickers, system share sheets) unless you have a strong reason not to.
- Check competitors and adjacent categories for the convention before inventing.
- If you must break a convention, add a transition path: opt-in toggle, a short "what changed" note, or running the old and new patterns side by side for a period.
**Avoid:** Novelty for its own sake; renaming standard things ("Sign in" vs. "Enter the portal").
**Check:** First-click tests: do users click where convention says?

## Postel's Law
**Idea:** Be liberal in what you accept and conservative in what you send. Tolerate variation in input; produce clean, consistent output.
**Use it when:** Forms, search, import tools, APIs, data entry, error handling, responsive and cross-device behavior.
**Do:**
- Accept flexible input: phone numbers with spaces, dashes, or country codes; dates in several formats; trim whitespace; case-insensitive emails.
- Normalize quietly and show the normalized result.
- Forgive errors: inline, specific, early validation; suggestions ("Did you mean gmail.com?"); preserve what the user typed.
- Output strictly: consistent formats, units, and dates in your UI and APIs.
**Avoid:** Rejecting valid input because of formatting; "liberal" turning into "lax" (still validate and sanitize on the server for security and data quality).
**Check:** Validation error rate and form-abandonment by field.

## Tesler's Law
**Idea:** Every system has an irreducible amount of complexity. The only question is who handles it: the user or the product (and the team behind it).
**Use it when:** Setup flows, settings, imports, integrations, pricing structures, admin tools, anywhere "make it simpler" is requested.
**Do:**
- Move complexity to the system where possible: auto-detect, infer, pre-fill, validate, and suggest (address autocomplete, detected time zone, import mapping).
- Keep real complexity accessible for power users: "Advanced" sections, API access, keyboard shortcuts.
- Be honest about the trade-off: every simplification is paid for in engineering or design effort or in lost flexibility.
**Avoid:** Simplifying by deleting controls that people truly need; pushing configuration onto users because it's cheaper to build.
**Check:** List the decisions the user must make; for each, ask "could the system decide this reliably?"

## Occam's Razor
**Idea:** When several solutions work equally well, prefer the one with the fewest elements and assumptions.
**Use it when:** Scoping, component design, flows, copy, diagnosing why users are confused, design-system audits.
**Do:**
- Try removing elements one at a time and test whether the task still works; keep only what earns its place.
- Prefer one pattern over three that do the same job.
- When diagnosing a usability issue, check the simplest explanation first (unclear label, low contrast) before inventing a complex one.
**Avoid:** Oversimplifying until the product can't do the job; the razor says "no more than necessary", not "as little as possible".
**Check:** Does removing the element change task success or time? If not, it goes.

## Pareto Principle
**Idea:** For many outcomes, a small share of causes (often framed as 20%) produces most of the effects (about 80%).
**Use it when:** Prioritizing features, designing defaults, shaping navigation, deciding what to show on a dashboard, planning research and QA.
**Do:**
- Use analytics and interviews to find the top tasks, then make them 1-2 clicks from the main screen.
- Design defaults and the default view around the common case.
- Spend polish budget where traffic and value concentrate.
- Still handle the long tail properly: accessibility, error and edge states, and advanced users via progressive disclosure.
**Avoid:** Taking 80/20 literally as a precise ratio; ignoring low-frequency but high-stakes tasks (account recovery, billing disputes, data export).
**Check:** Rank features by usage and by value; compare against how much screen space and effort each gets.
