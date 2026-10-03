# Behavior and decisions

Laws in this file: Hick's Law, Choice Overload, Goal-Gradient Effect, Zeigarnik Effect, Peak-End Rule, Flow, Parkinson's Law, Paradox of the Active User.

Canonical write-ups: `https://lawsofux.com/<slug>/` (e.g. `hicks-law`, `choice-overload`, `peak-end-rule`).

## Contents
- Hick's Law
- Choice Overload
- Goal-Gradient Effect
- Zeigarnik Effect
- Peak-End Rule
- Flow
- Parkinson's Law
- Paradox of the Active User

---

## Hick's Law
**Idea:** Decision time rises with the number and complexity of options. The relationship is roughly logarithmic: T = b · log2(n + 1).
**Use it when:** Menus, toolbars, action lists, settings, command palettes, landing-page CTAs, wizard choices.
**Do:**
- Reduce simultaneous choices: group, categorize, or split into steps.
- Progressive disclosure: show the common actions, put the rest in "More" or an overflow menu.
- Highlight a recommended or default option.
- Order and label options so scanning is fast (verbs first, consistent structure).
- Keep frequently used actions visible even if that raises the count; the law concerns *unfamiliar* decisions.
**Avoid:** Hiding every action behind one menu (adds a click and breaks recognition); assuming fewer is always better for experts who know the options.
**Check:** Time-to-first-click and error rate on a task as option count changes.

## Choice Overload
**Idea:** Too many options can cause paralysis, lower satisfaction, or no decision at all (often called the paradox of choice).
**Use it when:** Pricing tables, product catalogs, template galleries, plan selectors, onboarding questions.
**Do:**
- Pricing: 3 tiers is the common sweet spot (2-4 is reasonable); mark one as recommended.
- Offer a "Compare" view or filters instead of a long flat list.
- Curate: "Popular" and "Recommended for you" sections; sensible defaults.
- For genuinely large catalogs, let users narrow through facets or search rather than scroll.
**Avoid:** Treating this as "never show many options". Browsing a large catalog is fine when the user has a clear way to narrow it.
**Check:** Drop-off at the selection step; time spent; self-reported confidence in the choice.

## Goal-Gradient Effect
**Idea:** The closer people get to a goal, the harder they push to finish it.
**Use it when:** Onboarding checklists, multi-step forms, profile completion, loyalty or reward programs, uploads and imports.
**Do:**
- Show progress: "Step 3 of 5" or a progress bar with labeled steps.
- Give a head start (endowed progress): count "Account created" as step 1 so the bar starts above 0 (e.g. 20-30%).
- Keep checklists short: 4-6 items; show completed items checked.
- Make the remaining effort visible and small ("2 minutes left").
**Avoid:** Fake progress or bars that stall near the end; inflating the step count to make progress look better.
**Check:** Completion rate of the flow, and drop-off by step.

## Zeigarnik Effect
**Idea:** Unfinished or interrupted tasks stay active in memory and pull attention back; finished tasks fade.
**Use it when:** Drafts, onboarding, carts, long-running tasks, learning products, resume-where-you-left-off.
**Do:**
- Show open loops clearly: "Draft saved", "Profile 60% complete", "Continue where you left off".
- Autosave and restore state so returning is effortless.
- Offer one clear next step on resuming.
**Avoid:** Nagging (repeated notifications on every unfinished item); using open loops purely to drive engagement without benefit to the user.
**Check:** Resume rate and completion rate of started tasks, plus user sentiment about reminders.

## Peak-End Rule
**Idea:** People remember an experience mostly by its most intense moment (good or bad) and its ending, not by the average of every moment.
**Use it when:** Journey mapping, checkout, onboarding, support, error recovery, upload or export, anything with a clear finish.
**Do:**
- Map the journey and identify the emotional peak and the ending of each flow.
- Design the end deliberately: a clear success state, what happens next, and a short, genuine moment of delight (a concise confirmation, not a long animation; keep it under about 1 second).
- Treat a failure as a potential negative peak: plain-language errors, preserved input, and a clear recovery path.
- Fix the worst moment first; it weighs disproportionately in memory.
**Avoid:** Ending a flow on an upsell, survey, or dead-end screen; spending polish on the middle while the ending is generic.
**Check:** Post-task satisfaction ratings and recall interviews: what do users say they remember?

## Flow
**Idea:** People do their best work in a state of full, energized focus, which occurs when challenge matches skill and feedback is immediate.
**Use it when:** Editors, creative tools, games, learning tools, code or design tooling, long-form focused tasks.
**Do:**
- Give immediate feedback to every action (acknowledge within 100ms).
- Reduce interruptions: avoid blocking modals, defer notifications, autosave instead of prompting.
- Provide keyboard shortcuts and a command palette for repeated actions.
- Scale difficulty: let users start with a simple mode and unlock depth.
**Avoid:** Confirmation dialogs for reversible actions (offer undo instead); loading states that break focus.
**Check:** Observe whether users lose track of time in tasks, and count interruptions per session.

## Parkinson's Law
**Idea:** Work expands to fill the time available; shorter, bounded tasks get done faster.
**Use it when:** Forms, signup, checkout, setup wizards, approvals, task lists.
**Do:**
- Shorten flows: remove optional fields, defer non-essential questions until after signup.
- Autofill, remember inputs, offer smart defaults, support paste and import.
- State the expected effort: "Takes about 2 minutes".
- Set sensible deadlines or auto-save so tasks don't drift.
**Avoid:** Fake urgency (countdown timers that reset); cutting steps users actually need.
**Check:** Median time to complete and completion rate before and after trimming.

## Paradox of the Active User
**Idea:** People skip manuals and tutorials and start using the product straight away, even when reading first would make them faster.
**Use it when:** Onboarding, empty states, complex tools, help systems, feature launches.
**Do:**
- Design for learning by doing: empty states with a single clear first action and an example.
- Contextual help at the point of need: inline hints, tooltips on demand, "?" icons next to complex fields.
- Keep onboarding tours short: 3 steps at most; make them skippable and re-openable.
- Provide safe defaults and easy undo so exploring is cheap.
**Avoid:** Long tutorials before first use; docs as a substitute for clear UI.
**Check:** Do new users reach their first success without opening help? Where do they get stuck?
