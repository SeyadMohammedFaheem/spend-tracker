---
name: laws-of-ux
description: Apply the Laws of UX (Jon Yablonski's collection of 30 psychology-based UX principles, e.g. Hick's Law, Fitts's Law, Jakob's Law, Miller's Law, Gestalt laws like Proximity and Common Region, Doherty Threshold, Peak-End Rule, Cognitive Load) to design work. Use this skill whenever the user asks to review, critique, audit, or improve a UI, screen, flow, form, dashboard, onboarding, navigation, pricing page, or design system; asks which UX law or principle applies; wants design rationale or case-study justification; wants a design brief or direction doc grounded in UX psychology; or names any law of UX. Also use it for vague asks like "why does this feel cluttered/confusing/slow" or "make this more usable", even if no law is named.
---

# Laws of UX

A working guide for applying psychology-based UX principles to real screens and flows.

Source collection: https://lawsofux.com by Jon Yablonski (site content is CC BY-NC-ND 4.0). This skill is an original, paraphrased application guide, not a copy of the site. Do not reproduce the site's wording at length. Name the law, explain it in your own words, and link to `https://lawsofux.com/<law-slug>/` when the user may want the canonical write-up (slug = lowercase, hyphenated, e.g. `hicks-law`, `fittss-law`, `law-of-proximity`).

## Mindset

- Laws are heuristics from psychology, not rules. They explain *why* something works or fails and help choose between options. They don't replace user testing.
- Three to five well-chosen laws beat a name-drop of thirty. Pick the ones that bear on what's actually on screen.
- Every law you cite must be tied to a specific element and a specific change. "This violates Hick's Law" is weak. "The toolbar shows 11 equal-weight actions; group into 3 and move 6 into an overflow menu" is useful.
- Prefer exact values (px, ms, counts, contrast ratios) so the advice can be implemented or handed to a coding agent without interpretation.

## Workflow

1. **Pick the mode.**
   - *Audit*: user shares a screen, flow, Figma link, code, or description and wants critique.
   - *Design*: user is making something new and wants principles to steer it.
   - *Rationale*: user wants to justify a decision (case study, stakeholder deck, PR description).
   - *Lookup*: user asks what a law means or which applies.
2. **Identify the situation** (form, dashboard, nav, onboarding, pricing, loading, etc.) and find candidate laws in the situation index below.
3. **Read only the matching reference file(s)** for those laws. Don't load all four.
4. **Look at the actual artifact** if one exists (view the image, read the code, fetch the link). Ground observations in what is really there. If nothing was shared and the request depends on it, ask for it in one short question, or proceed with clearly stated assumptions.
5. **Apply each chosen law** as: observation, principle in one line, concrete change, how to verify.
6. **Check tensions** (see below) so recommendations don't contradict each other.
7. **Format the output** with one of the templates below. Match the user's stated format; if they plan to feed it to an agentic coding tool, use the direction-doc template.

## Situation index

| Situation | Start with | Then consider |
|---|---|---|
| Forms, checkout, signup | Hick's, Postel's, Chunking, Proximity | Goal-Gradient, Zeigarnik, Parkinson's, Fitts's, Peak-End |
| Dashboards, data-dense UI | Cognitive Load, Chunking, Common Region, Proximity | Von Restorff, Selective Attention, Pareto, Working Memory, Doherty, Tesler's |
| Navigation, IA, menus | Hick's, Jakob's, Mental Model, Serial Position | Fitts's, Pareto, Miller's (with caution) |
| Onboarding, first-run | Paradox of the Active User, Goal-Gradient, Cognitive Load | Zeigarnik, Mental Model, Flow, Peak-End |
| Pricing, plans, choosing | Choice Overload, Hick's, Von Restorff | Serial Position, Cognitive Bias, Occam's |
| Visual hierarchy, layout | Proximity, Common Region, Similarity | Uniform Connectedness, Prägnanz, Von Restorff, Aesthetic-Usability |
| Loading, feedback, speed | Doherty Threshold, Flow | Peak-End, Goal-Gradient, Selective Attention |
| Mobile, touch | Fitts's, Serial Position, Jakob's | Cognitive Load, Doherty |
| Design systems, components | Jakob's, Similarity, Prägnanz | Occam's, Tesler's, Pareto |
| Copy, content, help | Chunking, Mental Model, Paradox of the Active User | Cognitive Load, Selective Attention |
| Errors, empty states, recovery | Postel's, Working Memory, Peak-End | Flow, Mental Model |
| Retention, engagement | Zeigarnik, Goal-Gradient, Peak-End | Cognitive Bias (ethically), Flow |
| Prioritizing scope or features | Pareto, Occam's, Tesler's | Parkinson's |

## Law index

| Law | Core idea (paraphrased) | Reference file |
|---|---|---|
| Aesthetic-Usability Effect | Attractive interfaces are perceived as easier to use | `references/perception.md` |
| Law of Common Region | Shared bounded areas read as groups | `references/perception.md` |
| Law of Proximity | Nearby items read as related | `references/perception.md` |
| Law of Prägnanz | People read ambiguous shapes as the simplest form | `references/perception.md` |
| Law of Similarity | Items that look alike read as related or same-function | `references/perception.md` |
| Law of Uniform Connectedness | Visually linked items read as more related | `references/perception.md` |
| Von Restorff Effect | The item that differs from its peers is remembered | `references/perception.md` |
| Selective Attention | People attend to goal-relevant stimuli and filter out the rest | `references/perception.md` |
| Cognitive Load | Mental effort needed to use an interface is finite | `references/cognition.md` |
| Chunking | Grouping information into meaningful units aids processing | `references/cognition.md` |
| Miller's Law | Short-term capacity is small (commonly cited as 7±2) | `references/cognition.md` |
| Working Memory | Information held in mind for the current task is fleeting | `references/cognition.md` |
| Mental Model | Users carry compressed expectations of how a system works | `references/cognition.md` |
| Serial Position Effect | First and last items in a series are remembered best | `references/cognition.md` |
| Cognitive Bias | Systematic judgment shortcuts shape perception and decisions | `references/cognition.md` |
| Hick's Law | Decision time grows with the number and complexity of choices | `references/behavior-and-decisions.md` |
| Choice Overload | Too many options causes paralysis or regret | `references/behavior-and-decisions.md` |
| Goal-Gradient Effect | Motivation increases as a goal gets closer | `references/behavior-and-decisions.md` |
| Zeigarnik Effect | Unfinished tasks stay in mind more than finished ones | `references/behavior-and-decisions.md` |
| Peak-End Rule | Experiences are judged by their peak and their ending | `references/behavior-and-decisions.md` |
| Flow | Deep, uninterrupted engagement when challenge matches skill | `references/behavior-and-decisions.md` |
| Parkinson's Law | Tasks expand to fill the time available | `references/behavior-and-decisions.md` |
| Paradox of the Active User | Users skip manuals and start using the product immediately | `references/behavior-and-decisions.md` |
| Fitts's Law | Target acquisition time depends on distance and size | `references/systems-and-interaction.md` |
| Doherty Threshold | Responses under about 400ms keep users and system in sync | `references/systems-and-interaction.md` |
| Jakob's Law | Users expect your product to work like the others they know | `references/systems-and-interaction.md` |
| Postel's Law | Be liberal in what you accept, conservative in what you send | `references/systems-and-interaction.md` |
| Tesler's Law | Some complexity can't be removed, only moved | `references/systems-and-interaction.md` |
| Occam's Razor | Prefer the solution with the fewest assumptions and parts | `references/systems-and-interaction.md` |
| Pareto Principle | A minority of causes drives most of the effects | `references/systems-and-interaction.md` |

## Tensions to resolve explicitly

When two laws pull in opposite directions, say so and choose, instead of citing both as if they agree.

- **Hick's / Choice Overload vs. Tesler's / Pareto**: cutting visible options helps novices but can hide power from experts. Resolve with progressive disclosure, defaults, and keyboard or command access.
- **Von Restorff vs. Similarity / Jakob's**: standing out vs. consistency. Reserve distinctiveness for one primary action per view; keep everything else consistent.
- **Aesthetic-Usability vs. evidence**: polish raises perceived usability and can mask real problems in testing. Don't treat "looks good" as "works well".
- **Miller's Law vs. reality**: "7±2" is widely misapplied as a cap on menu items or list length. Use it as a reminder to chunk and to not rely on recall, not as a numeric limit.
- **Postel's vs. data quality**: be tolerant in what you accept, but still validate and normalize on the server.
- **Engagement laws vs. ethics**: Zeigarnik, Goal-Gradient, Peak-End, and Cognitive Bias can be used to nudge or to manipulate. Recommend them only in ways that serve the user's own goal. Flag dark-pattern risk when you see it.

## Output templates

### Audit

Lead with a 2-3 sentence verdict (what's working, what's the biggest issue), then:

| # | Where | Law | Observation | Fix (specific) | Severity |
|---|---|---|---|---|---|
| 1 | Settings > Billing, plan cards | Choice Overload, Von Restorff | 6 plans with equal visual weight | Show 3; mark one "Recommended" with the only filled button | High |

Severity: High (blocks or confuses the main task), Medium (adds friction), Low (polish). Include a short "What's already working" list so the critique is balanced. Close with 1-3 things to validate in user testing.

### Design guidance

Short paragraph on the user's goal, then 3-5 principles. For each: the law, the rule in plain words, and the exact values to use. End with a "do not" list of the most likely mistakes.

### Rationale (case study, stakeholder, PR)

Write in first person plural, outcome-oriented: "We [decision] because [law in one clause], which should [user outcome]. We'll know it worked if [metric or test]." Keep it to what's true; never invent statistics or claim a law "proves" a result.

### Direction doc for agentic coding tools

Use when the user wants something to hand to Claude Code, Cursor, or similar. Produce a markdown file with checkable requirements:

```markdown
# UX direction: <screen or feature>

## Context
<who the user is, the primary task, constraints>

## Rules
1. **Grouping (Proximity, Common Region)**: gap within a group 8px; gap between groups 24px; each group in a card with 1px border and 16px padding.
2. **Primary action (Von Restorff, Hick's)**: exactly one filled primary button per view; others secondary or ghost.
3. **Targets (Fitts's)**: all interactive elements have a hit area of at least 44x44px on touch, 24x24px minimum on desktop.
4. **Feedback (Doherty)**: acknowledge any action within 100ms; show a skeleton or spinner if the response takes over 1s.

## Acceptance checks
- [ ] Only one primary button is visible per viewport
- [ ] Spacing between groups is at least 2x the spacing within groups
- [ ] ...

## Out of scope / don't
- ...
```

Keep rules numbered and testable. Put exact tokens and values in the rules so the agent doesn't have to guess.

## Guardrails

- Don't invent research, numbers, or citations. If a figure is a rule of thumb rather than a finding, say "rule of thumb".
- Distinguish well-established effects from popularized ones. Be candid that some laws (Miller's 7±2, Pareto's literal 80/20, Aesthetic-Usability in some contexts) are more heuristic than precise.
- Accessibility interacts with nearly every law (contrast, target size, motion, timing). When you give a value, prefer one that also satisfies WCAG 2.2 AA.
- Don't use a law to win an argument. Use it to frame a hypothesis and suggest a test.
- If the user's design deliberately breaks a law (e.g., a novel navigation pattern), engage with the trade-off and suggest how to soften the cost, rather than just flagging a violation.
