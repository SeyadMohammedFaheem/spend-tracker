# Cognition and memory

Laws in this file: Cognitive Load, Chunking, Miller's Law, Working Memory, Mental Model, Serial Position Effect, Cognitive Bias.

Canonical write-ups: `https://lawsofux.com/<slug>/` (e.g. `cognitive-load`, `millers-law`, `serial-position-effect`).

## Contents
- Cognitive Load
- Chunking
- Miller's Law
- Working Memory
- Mental Model
- Serial Position Effect
- Cognitive Bias

---

## Cognitive Load
**Idea:** Every interface asks for mental effort, and people have a limited supply. Effort spent decoding the UI is effort not spent on the task.
**Use it when:** Dense screens, complex workflows, dashboards, onboarding, any "this feels overwhelming" feedback.
**Do:**
- Separate intrinsic load (the task is genuinely hard) from extraneous load (the UI makes it harder). Cut the extraneous: decorative elements, redundant labels, inconsistent patterns, unexplained jargon.
- Recognition over recall: show options instead of asking users to remember them.
- Progressive disclosure: show the common 20% by default, tuck the rest behind "Advanced" or an overflow menu.
- One main decision per step in multi-step flows.
- Sensible defaults for anything most people leave unchanged.
**Avoid:** Removing information users need just to look clean; hiding critical controls where experts can't find them.
**Check:** Count decisions and distinct elements per screen. Observe hesitation, backtracking, and repeated re-reading.

## Chunking
**Idea:** Breaking information into meaningful groups makes it easier to scan, understand, and remember.
**Use it when:** Long forms, dashboards, settings, long content, identifiers (phone, card, IBAN), tables.
**Do:**
- Group related items under a clear heading; aim for roughly 3-5 items per visible group when the items are unfamiliar.
- Format identifiers: card numbers 4-4-4-4; phone numbers by locale convention.
- Body text line length 50-75 characters; paragraphs of 2-4 sentences; descriptive subheads every few paragraphs.
- Dashboard: KPI cards in rows of 3-4, each card one metric with a label, value, and delta.
- Long forms: split into sections of 4-6 fields with a progress indicator.
**Avoid:** Chunks without labels (users can't tell what each is); chunking so aggressively that users have to click through many tiny steps.
**Check:** Can a new user describe the page in 3-4 "buckets" after 10 seconds?

## Miller's Law
**Idea:** Short-term memory holds only a small number of items. The classic figure is 7±2; more recent work suggests the practical limit is closer to 4 chunks.
**Use it when:** Deciding how to present lists, codes, or anything users must hold in mind briefly.
**Do:**
- Use it as a reminder to chunk and to avoid forcing recall, not as a numeric cap.
- Don't make users remember a value from one screen to use on the next; show it again where needed.
- Verification codes: separate digit boxes or grouped digits (e.g. 3-3) and allow paste.
**Avoid:** Citing "7±2" to justify a hard limit on navigation items, tabs, or table rows. Navigation is scanned (recognition), not recalled, so the limit doesn't apply the same way.
**Check:** Is anything required to be remembered rather than displayed?

## Working Memory
**Idea:** Working memory is the scratchpad for the current task. It's small, easily disrupted, and cleared by interruptions.
**Use it when:** Multi-step flows, comparisons, forms with dependencies, error recovery, search and filtering.
**Do:**
- Keep context visible: persistent order summary in checkout; active filters shown as removable chips above results.
- Support comparison side by side instead of across page loads.
- Preserve state through errors: never clear a form on a failed submit; keep scroll position and inputs.
- Autosave drafts and restore them.
- Show the previous answer or relevant constraint next to the field that depends on it.
**Avoid:** Modal interruptions in the middle of a task; forcing users to go back and re-read earlier steps.
**Check:** Observe whether users flip between screens to copy or recheck information.

## Mental Model
**Idea:** Users carry a compressed picture of how a system works, built from past experience. The closer your design matches it, the less they have to learn.
**Use it when:** Naming, information architecture, workflows, redesigns, new features, metaphors.
**Do:**
- Research the model first: interviews, card sorting, tree testing, and watching real tasks.
- Use users' words for labels, not internal jargon or database names.
- When changing something familiar, bridge the gap: a short "what's new" note, an opt-in toggle, or a temporary old-to-new mapping.
- Make system state and consequences visible ("This will notify 14 people").
**Avoid:** Designing to your own mental model or the engineering model (the "implementation model"); surprising users with irreversible actions.
**Check:** Ask users to predict what will happen before they click. Mismatch means the model is off.

## Serial Position Effect
**Idea:** In a series, the first (primacy) and last (recency) items are remembered and acted on best; the middle fades.
**Use it when:** Navigation, tab bars, lists, onboarding steps, forms, pricing options, search suggestions.
**Do:**
- Put the most important items first and last. Mobile bottom tab bar: 3-5 items, key destinations at the ends.
- Place the main action at the end of a flow or list and the key reassurance at the start.
- In a nav, put the "Home" or primary destination first, and the account or primary CTA last.
**Avoid:** Burying critical items in the middle of a long list; overloading the ends with low-value items.
**Check:** Recall test after a brief look: which items do users remember?

## Cognitive Bias
**Idea:** People use systematic mental shortcuts that skew perception and decisions, and designers and researchers have them too.
**Use it when:** Pricing, defaults, social proof, research planning, interpreting feedback.
**Common ones to know:**
- *Anchoring*: the first number sets the reference (show the full price before the discount).
- *Default effect*: most people keep the preset option.
- *Loss aversion*: losses loom larger than equal gains ("Don't lose your progress").
- *Social proof*: people follow what others do ("12,000 teams use this").
- *Framing*: the same fact lands differently when stated as a gain vs. a loss.
- *Confirmation bias*: researchers and teams favor evidence that supports their hypothesis.
**Do:**
- Set defaults that serve the user's interest (privacy-protective, least destructive).
- Use these effects to clarify choices, not to trick; if you'd be uncomfortable explaining the nudge to the user, don't ship it.
- In research, write the hypothesis and success criteria before looking at the data; recruit disconfirming participants.
**Avoid:** Dark patterns (confirmshaming, hidden costs, pre-checked upsells, forced continuity).
**Check:** Would an informed user, seeing how the nudge works, still agree with the outcome?
