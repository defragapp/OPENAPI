# Baseline Question Universe and Demonstration Strategy

Status: product reference and implementation planning document.

This document preserves the expanded question universe for Baseline Design and maps it to the current Sovereign.OS product, public landing experience, How It Works page, FAQ, and the authenticated single-room space.

It does **not** replace the canonical contracts in:

- `AGENTS.md`
- `docs/launch-product-contract.md`
- `docs/inner-recognition-intelligence.md`
- `docs/landing-experience-audit.md`

Where this document describes a useful question that the current deterministic or interpretive data cannot answer by itself, the product must ask for user context, label the result as a possibility, or keep the answer unknown. It must never fill missing framework data or turn interpretation into measured psychological fact.

## Sources reviewed

This strategy was checked against the current repository implementation and product sources:

- `apps/web/src/PublicLanding.tsx`
- `apps/web/src/SovereignIntelligenceSpace.tsx`
- `apps/web/public/how-it-works.html`
- `apps/web/public/faq.html`
- `apps/sovereign-worker/src/agent/prompt-v1.ts`
- `apps/sovereign-worker/src/agent/sovereign.ts`
- `docs/launch-product-contract.md`
- `docs/inner-recognition-intelligence.md`
- `docs/landing-experience-audit.md`

---

# 1. Product purpose

Sovereign.OS should make a wide range of human questions answerable without making the user learn framework terminology or special prompting.

The user arrives in ordinary language:

- “Why do I react this way?”
- “Why did they respond like that?”
- “Why do we keep having the same fight?”
- “What just happened?”
- “Should I say something now or wait?”

Sovereign should recognize the human intent, connect only the relevant authorized context, and return a direct answer that distinguishes:

1. what appears stable in the user’s Baseline;
2. what may be temporarily emphasized now;
3. what the user has actually observed or confirmed;
4. what may be happening in a relationship or system;
5. what remains interpretive;
6. what remains unknown.

The product value is not a long report. It is a useful distinction that changes how the user understands the moment.

Examples:

- Supporting someone is different from becoming responsible for their emotional state.
- Needing time is different from avoiding the decision.
- Directness is different from urgency.
- Silence can be regulation from one side and disconnection from the other.
- A relationship problem can be a timing mismatch rather than a values mismatch.
- A family conflict can be reinforced by a role structure rather than caused by one “bad” person.

---

# 2. Evidence and certainty tiers

The complete question universe must be separated by what the product can responsibly support.

## Tier A — Baseline-supported interpretation

These questions can be answered from validated Baseline facets when the relevant facet exists and has authorized Basis references:

- core orientation;
- identity and purpose;
- communication tendencies;
- decision-making orientation;
- learning style;
- creativity and expression;
- love and connection;
- leadership;
- boundaries;
- responsibility;
- conflict and repair;
- response to pressure;
- response to change;
- underused capacity;
- Shadow expression;
- Gift expression;
- observable Alignment markers.

These are interpretive possibilities, not measured psychological facts.

## Tier B — Requires current context, user observation, or confirmation

These questions cannot be responsibly answered from Baseline alone:

- what the user is actually feeling now;
- the emotional load they are currently carrying;
- whether a specific person is activating them;
- whether a repeated loop is currently occurring;
- why a specific conversation changed;
- whether someone intended criticism, abandonment, control, or rejection;
- whether now is a good time for a specific conversation;
- what role the user is actually performing in a family or team;
- whether a relationship is safe, trustworthy, or mutually repairable;
- whether a decision is aligned without knowing the actual choice, tradeoffs, and constraints.

Sovereign should still provide value first, then ask one focused question only when missing information materially blocks a responsible answer.

## Tier C — Must remain unknown or prohibited

Sovereign must not claim:

- an absent person’s exact emotion, motive, private experience, or future behavior;
- a diagnosis or hidden pathology;
- deterministic personality proof from source data;
- certainty that a relationship will succeed or fail;
- that a current astronomical condition caused behavior;
- divine certainty;
- unsupported Human Design type, authority, centers, profile, channels, design-side values, or a complete Gene Keys profile;
- a compatibility score, Alignment score, or psychological score.

---

# 3. Human intent: what brings the user into Sovereign

The user does not arrive asking for “dilemma analysis” or “relational geometry.” The intake should begin with recognizable human intent.

## I need to understand myself

Examples:

- Why do I react this way?
- Why do I keep repeating this?
- Why am I overwhelmed?
- Why can’t I let this go?
- Why do I take responsibility so quickly?
- What part of me is showing up here?
- What do I need in order to think clearly?
- What does this quality look like under pressure?
- What does it look like at its best?

## I need to understand someone else

Examples:

- Why did they respond like that?
- Why did they withdraw?
- What might they be trying to communicate?
- What am I missing?
- Why does my directness land as pressure for them?
- Why does their silence affect me so strongly?

The answer must remain framed as a permitted Baseline possibility plus observed interaction—not mind-reading.

## I need to understand a relationship

Examples:

- Why do we keep having this fight?
- Why do we trigger each other?
- Why does this relationship feel stuck?
- What role do we each play?
- What is mine, what is theirs, and what happens between us?
- Where is the timing mismatch?
- What would repair require from each person?

## I need to understand a situation

Examples:

- What just happened?
- Did I misread this?
- What changed?
- What is shaping this moment?
- Is someone else influencing the situation?
- Is this a family or group role showing up again?

## I need to understand a decision

Examples:

- What should I consider before I act?
- Should I say something?
- Should I wait?
- Is now the right time?
- Am I choosing from clarity or pressure?
- Does this fit me, or does it cost too much of me?
- What would a closer version of this choice look like?

---

# 4. Full single-user question universe

## 4.1 Identity and orientation

Questions:

- Who is this person at their core?
- What is their fundamental orientation?
- What do they naturally stabilize, activate, harmonize, challenge, anchor, or catalyze?
- What is their natural center of gravity in relationships?
- What roles do they naturally take on?
- Do they tend to lead, follow, mediate, observe, organize, protect, challenge, or create movement?
- What is their baseline orientation toward conflict?
- Do they move toward tension, away from it, or try to neutralize it?
- What appears to motivate them most: stability, connection, autonomy, understanding, harmony, impact, expression, or responsibility?
- What capacity may be underused because it is less familiar or less socially rewarded?

Primary repository facet mapping:

- `core_orientation`
- `identity_purpose`
- `leadership`
- `underused_capacity`

## 4.2 Safety and regulation

Questions:

- What conditions may help this person feel more settled?
- Do they tend to need predictability, reassurance, space, directness, softness, time, or clear expectations?
- What conditions may destabilize them?
- How might ambiguity, coldness, overwhelm, pressure, silence, inconsistency, or emotional intensity affect them?
- What tends to restore clarity?
- Do they regulate through solitude, conversation, structure, movement, reassurance, logic, warmth, or a sequence of more than one?
- What tends to overwhelm them first?
- How quickly may pressure become visible in their expression?
- Does their activation appear fast, slow, cyclical, layered, or highly context-dependent?

Boundary:

The Baseline may support regulation tendencies and pressure responses. It does not establish the user’s current nervous-system state, trauma history, diagnosis, or exact emotional threshold.

Primary facet mapping:

- `response_pressure`
- `response_change`
- `boundaries`
- `conflict_repair`

## 4.3 Relational behavior

Questions:

- How may they behave under pressure?
- Do they tend to withdraw, pursue, overfunction, freeze, placate, escalate, or collapse?
- What relationship loops may they be vulnerable to?
- Where may overfunctioning become resentment and shutdown?
- Where may appeasing become an eventual sharp reaction?
- Where may withdrawal invite pursuit and greater pressure?
- What misunderstandings may their style create?
- Can silence be misread as disinterest?
- Can intensity be misread as anger?
- Can logic be misread as coldness?
- Can emotion be misread as instability?
- What misunderstandings may they commonly experience?
- Are they more likely to interpret space as abandonment, connection as intrusion, directness as criticism, or uncertainty as danger?
- What roles may their expression invite in other people?
- Might others feel responsible, needed, criticized, overwhelmed, protected, challenged, or organized around them?

Boundary:

A Baseline can describe likely interaction pressures. A repeated real-world loop must be connected to user-supplied or confirmed observations.

Primary facet mapping:

- `love_connection`
- `responsibility`
- `conflict_repair`
- `response_pressure`
- `shadow_expression`
- `gift_expression`

## 4.4 Communication

Questions:

- How does this person tend to communicate when clear?
- How does communication change under pressure?
- Are they direct, indirect, emotional, analytical, symbolic, minimal, expansive, sequential, or nonlinear?
- What do they register first: tone, content, timing, emotional charge, inconsistency, or body language?
- What communication style may work best with them?
- Do they respond better to soft tone plus structure, direct tone plus low emotional charge, slower pacing plus reassurance, or fast clarity with a defined decision?
- What communication conditions may activate defensiveness?
- Interruptions?
- Silence?
- Sharp tone?
- Ambiguity?
- Overexplaining?
- Emotional flooding?
- How do they tend to repair after conflict?
- Fast repair, slow repair, direct repair, indirect repair, acts of service, clarification, or emotional openness?

Primary facet mapping:

- `communication`
- `conflict_repair`
- `love_connection`
- `response_pressure`

## 4.5 Processing and meaning-making

Questions:

- How do they process information?
- Fast, slow, sequential, nonlinear, layered, or cyclical?
- How do they naturally reach decisions?
- Through immediate recognition, deliberation, intuitive integration, data, conversation, time, or a sequence?
- What do they notice first?
- Tone, logic, emotion, inconsistency, energy, or practical consequence?
- What meaning-making tendencies may appear under pressure?
- Internal narrative loops?
- Projection?
- Catastrophizing?
- Minimizing?
- Pattern recognition?
- Emotional inference?
- What assumptions may become more likely under stress?
- “It is my fault.”
- “They are upset with me.”
- “I am being judged.”
- “I am being abandoned.”
- “I am being controlled.”

Boundary:

The product may name a possible interpretation bias only when connected to relevant facets and the user’s reported experience. It must not present a cognitive distortion as a diagnosis or fact.

Primary facet mapping:

- `decision_making`
- `learning`
- `communication`
- `response_pressure`
- `shadow_expression`

## 4.6 Alignment and misalignment

Questions:

- What does the person’s aligned expression look like?
- What does their defended or pressured expression look like?
- What is the cleanest distinction available in conflict?
- Pause or proceed?
- Clarify or reassure?
- Ask directly or allow more time?
- Set a boundary or reduce the demand?
- Name the pressure or change the timing?
- What distorts their expression?
- Bad timing?
- High pressure?
- Emotional overwhelm?
- Group dynamics?
- Misread authority or responsibility?
- What supports the fit of a choice?
- What pulls against it?
- What is the real tradeoff?
- What information is still needed?
- What closer version preserves the underlying intention without repeating the cost?

Primary facet mapping:

- `alignment_markers`
- `shadow_expression`
- `gift_expression`
- any relevant domain facet

Canonical renderer mapping:

- Supports the fit
- Pulls against it
- The real tradeoff
- Still needed
- A closer version

## 4.7 Internal load and pressure mapping

Questions:

- What might this person be carrying?
- Responsibility?
- Fear?
- Shame?
- Exhaustion?
- Unspoken needs?
- Old relational expectations?
- What need may be shaping the behavior?
- Reassurance?
- Autonomy?
- Clarity?
- Closeness?
- Predictability?
- What internal conflict may be present?
- Wanting closeness while fearing dependence.
- Wanting honesty while fearing conflict.
- Wanting independence while fearing abandonment.
- Wanting to help while resenting responsibility.

Boundary:

Baseline can identify a vulnerability or pressure pattern. Current emotional load requires the user’s description or confirmation.

## 4.8 Individual behavior in families, teams, and groups

Questions:

- How might this person behave in a group?
- Do they become the stabilizer, lightning rod, observer, mediator, challenger, organizer, caregiver, or change agent?
- How do they respond to hierarchy?
- Deferential, challenging, adaptive, avoidant, collaborative, or independent?
- How do they respond to collective pressure?
- Absorb it, amplify it, deflect it, organize it, withdraw from it, or collapse under it?
- What role may others expect them to keep performing?
- What changes when they stop performing it?

Boundary:

Formal roles, authority, responsibility, caregiving, dependence, and constraints are factual only when supplied or confirmed. Baseline-derived roles remain possibilities.

Primary mapping:

- `leadership`
- `responsibility`
- `boundaries`
- `response_pressure`
- system context

## 4.9 Timing sensitivity

Questions:

- How does timing affect clarity?
- Are misreads more likely when tired, rushed, interrupted, emotionally activated, or under public pressure?
- When may this person be most receptive?
- After processing?
- After reassurance?
- After space?
- After a clear question?
- When may they be least receptive?
- During activation?
- During overwhelm?
- During ambiguity?
- During emotional flooding?
- Is a current theme making responsibility, communication, boundaries, change, or relationship tension more relevant for a limited time?

Boundary:

Current astronomical context may make a Baseline facet more relevant. It does not prove current behavior, emotion, or outcome. Conversation timing also depends on the actual situation and user-supplied context.

## 4.10 Self-awareness and blind spots

Questions:

- What might they not notice about how they land?
- How intense they feel?
- How withdrawn they appear?
- How their tone changes?
- How their silence affects others?
- What may they read accurately?
- Tone?
- Inconsistency?
- Practical responsibility?
- Emotional movement?
- What may they be more likely to misread?
- Intent?
- Timing?
- Pressure?
- Meaning?

Boundary:

Blind spots are hypotheses to test, not verdicts. The user should be able to confirm, partly confirm, or reject the interpretation.

---

# 5. Emotional architecture vocabulary

The following vocabulary can help the AI reason and can support plain-language explanations. It should not become a visible diagnostic taxonomy or fixed identity label.

## Regulation tendencies

- pressure absorber;
- pressure expeller;
- internalizer;
- externalizer;
- oscillator;
- hybrid processor.

## Pressure responses

- contract;
- escalate;
- overfunction;
- freeze;
- appease;
- withdraw;
- pursue;
- hyper-analyze;
- overexplain.

## Sensitivity dimensions

- tone sensitivity;
- timing sensitivity;
- volume or intensity sensitivity;
- ambiguity sensitivity;
- inconsistency sensitivity;
- responsibility sensitivity.

## Emotional pacing

- fast processor;
- slow processor;
- cyclical processor;
- layered processor;
- delayed processor.

## Stress signatures

- sharpness;
- flatness;
- overexplaining;
- hyper-logic;
- hyper-emotion;
- silence;
- urgency;
- overcontrol.

## Recovery tendencies

- fast reset;
- slow thaw;
- conditional reset;
- delayed reset;
- repair through direct conversation;
- repair through practical action;
- repair through space followed by return.

All labels should be translated into behavior:

> Under pressure, you may move toward more detail and control because uncertainty feels harder to hold.

Not:

> You are an overfunctioning pressure absorber.

---

# 6. Relational tendency vocabulary

Use as internal reasoning vocabulary or user-facing plain language only when supported and carefully framed.

## Possible relational roles

- caretaker;
- challenger;
- harmonizer;
- strategist;
- anchor;
- catalyst;
- mediator;
- observer;
- organizer;
- protector;
- change agent.

## Attachment-like movement without diagnosis

- moves toward conflict;
- moves away from conflict;
- blends to preserve connection;
- alternates between pursuit and distance.

Do not present these as clinical attachment diagnoses.

## Boundary tendencies

- rigid;
- porous;
- inconsistent under pressure;
- adaptive and clear;
- over-responsible;
- self-erasing;
- overcontrolling.

## Conflict tendencies

- direct;
- indirect;
- avoidant;
- intense and fast;
- appeasing;
- analytical;
- delayed.

## Repair tendencies

- quick explicit repair;
- slow repair after processing;
- indirect repair through action;
- clarification before emotional repair;
- reassurance before problem-solving.

---

# 7. Pair overlay: additional questions answerable with permission

A second permitted Baseline creates relationship-level questions. The product must keep each person distinct and show the relationship itself as a third field.

## 7.1 Relational compatibility and tension

Questions:

- Where do processing styles differ?
- Where do emotional or communication tendencies complement each other?
- Where do misunderstandings naturally become more likely?
- Where does timing mismatch occur?
- Where do both people want the same outcome but use different routes?
- Where does one person’s strength become pressure for the other?

Do not produce a compatibility percentage.

## 7.2 Role interaction

Questions:

- What roles may they invite in each other?
- Does one become more parental while the other becomes more dependent?
- Does one pursue clarity while the other creates distance?
- Does one become the emotional anchor?
- Does one amplify urgency?
- Does one carry practical responsibility while the other carries relational tone?

These are possible interaction roles, not fixed identities.

## 7.3 Pressure dynamics

Questions:

- Who may activate first?
- What expression from one person may trigger pressure in the other?
- What is the likely sequence of the loop?
- Where can the loop be interrupted?
- Where are authority and responsibility mismatched?
- Who is carrying an outcome they do not control?

## 7.4 Timing sensitivity

Questions:

- Does one person need immediate expression while the other needs processing time?
- Is the current moment highly pressured for either person?
- Is the conversation more likely to land after reassurance, space, a defined return time, or a smaller question?
- Should the product recommend speaking, waiting, or agreeing when to return?

Any timing recommendation must be grounded in the actual situation and framed as a practical possibility, not a prediction.

## 7.5 Clean moves between two people

Questions:

- What reduces pressure rather than adding more?
- What is the clearest responsibility boundary?
- What can each person own?
- What must still be asked directly?
- What would preserve both honesty and connection?
- What is a safer next step for this pair?

## 7.6 Repair pathways

Questions:

- What repair sequence may work best?
- Who may be able to move first without taking all responsibility?
- What tone, timing, pacing, and structure may restore contact?
- Does one person need acknowledgment before problem-solving?
- Does the other need a clear return time before giving space?
- What remains impossible to determine without both people’s participation?

---

# 8. System-level questions

With permitted members and supplied system context, Sovereign can answer questions beyond a two-person interaction.

Questions:

- Who appears to stabilize the system?
- Who challenges established expectations?
- Where does responsibility concentrate?
- Who carries emotional or practical pressure?
- Where are formal authority and actual responsibility separated?
- Who mediates, withdraws, adapts, resists, protects, or overfunctions?
- Which roles are confirmed and which are only Baseline-derived possibilities?
- What changes when one person stops performing a familiar role?
- Which missing perspective could materially change the interpretation?
- Is the conflict between two people, or is the wider system reinforcing it?
- What does the system require that no individual can solve alone?

System output should distinguish:

- confirmed membership and roles;
- user-reported observations;
- Baseline-derived role possibilities;
- pressure concentration;
- supported relationship edges;
- missing perspectives;
- responsibility boundaries.

---

# 9. Internal product demonstration strategy

The current authenticated architecture already has the correct top-level surfaces:

- Today
- Explore
- People
- Systems
- Library
- You

Do not add a new navigation destination for every question category. Use this question universe to make the existing space feel more capable and immediately useful.

## 9.1 Today

Today should answer before the user types:

- What remains steady in me?
- What may be more relevant now?
- What might this affect?
- What would pressure look like?
- What would a more conscious expression look like?
- What remains unknown until I confirm it?

Demonstration pattern:

> **What remains yours**  
> You may create structure quickly when responsibility is unclear.
>
> **What may be louder now**  
> Questions of responsibility may deserve more attention for a limited time.
>
> **The distinction**  
> Creating direction is different from carrying an outcome you do not control.
>
> **Try this in context**  
> Apply it to a decision, relationship, or family role.

## 9.2 Explore

The current Explore modes already cover Baseline, Shadow and Gift, Alignment, decisions, communication, love, learning, leadership, boundaries, pressure, and family role.

Use the question universe to deepen the entry experience:

### First layer: human intent

- Understand myself
- Understand a reaction
- Understand a decision
- Understand a relationship
- Understand a family or group role
- Understand what may be more relevant now

### Second layer: example questions

After the user chooses an intent, show three to five relevant prompts rather than the same generic suggestions everywhere.

Example for “Understand a reaction”:

- Why did I become responsible so quickly?
- Why did their tone affect me more than their words?
- Why do I need an answer before I can settle?
- What might this reaction be protecting?

The user can still type naturally at every stage.

## 9.3 AI answer experience

Keep `sovereign-answer.v2`. Do not add a second presentation contract.

The question universe should improve routing, section selection, and continuation actions inside the existing contract.

Preferred answer flow:

1. **Direct answer** — answer the actual question in plain language.
2. **The useful distinction** — separate two experiences the user may be conflating.
3. **Baseline connection** — name the relevant facet without leading with framework jargon.
4. **Pressure and Gift** — show how the same valid capacity changes under pressure and awareness.
5. **Relationship or system effect** — only when relevant.
6. **Unknowns** — keep actual state and absent perspectives visible.
7. **Continuation** — offer the next useful exploration, not a compulsory action plan.
8. **Basis** — exact approved evidence beneath the interpretation.

Examples of strong distinctions:

- Care versus responsibility.
- Space versus abandonment.
- Urgency versus clarity.
- Directness versus pressure.
- Processing versus avoidance.
- Reassurance versus agreement.
- Supporting versus rescuing.
- A boundary versus withdrawal.
- Understanding versus excusing.
- Forgiveness versus reconciliation.

## 9.4 Contextual actions

Use the existing action types rather than adding generic buttons.

Examples:

- `explore_facet`: “See how this changes under pressure”
- `examine_alignment`: “Apply this distinction to the decision”
- `open_person`: “Look at what happens between you”
- `invite_person`: “Invite them to add their permitted Baseline”
- `open_system`: “See the wider family or team structure”
- `save_to_library`: “Keep this distinction”
- `offer_covenant`: “Add a Christian perspective”

Actions should appear only when they directly continue the current question.

## 9.5 People

The internal product should demonstrate three simultaneous fields:

### You may be bringing

Your relevant Baseline facet, timing, and user-confirmed observation.

### They may be bringing

Only permitted facets and clearly labeled possibilities.

### What happens between you

The timing gap, role interaction, pressure loop, responsibility boundary, or shared need created by the interaction.

The product should never make “their possible perspective” look like access to private thoughts.

## 9.6 Systems

The system view should demonstrate:

- confirmed people and roles;
- role possibilities;
- authority;
- responsibility;
- care and dependence;
- pressure concentration;
- missing perspectives;
- the change produced when one person changes a role.

The visual map should support the explanation, not become a decorative graph.

## 9.7 Library

Do not save “chat.” Save the understanding that remains useful.

Examples:

- My responsibility pattern
- What I need before a hard conversation
- The timing gap between us
- The role I carry in my family
- What supports this decision
- What changes when I stop overfunctioning

Each saved object should preserve:

- the direct insight;
- the useful distinction;
- relevant Baseline facets;
- permitted people or system;
- exact Basis references;
- date and temporary current context;
- correction history.

---

# 10. Landing-page demonstration strategy

The current landing screenshots have a strong product-first composition:

- recognizable conversation on the left;
- visible step-by-step interpretation on the right;
- restrained exact evidence;
- one clear action below the stage;
- personal and relationship examples using the same visual language.

The weakness is not the layout. It is that the current demonstration universe is too narrow. A visitor can see one responsibility example and one timing-gap relationship example, but not the breadth of what Sovereign can help them understand.

## 10.1 Preserve one shared product stage

Do not stack ten unrelated feature cards.

Use one shared demonstration stage with a question rail or segmented selector:

- Myself
- A reaction
- A decision
- A relationship
- A family or team
- What may be active now

Selecting a question updates the same conversation and reasoning stage.

This teaches breadth without making the landing feel like a dashboard.

## 10.2 Recommended demonstration set

### Personal identity

Question:

> Why do I keep becoming the responsible one?

Direct answer:

> You may create direction quickly when ownership is unclear. The cost begins when your capacity becomes an obligation to carry the outcome.

Useful distinction:

> Leadership is not the same as responsibility for everyone involved.

### Emotional reaction

Question:

> Why can’t I let this go after the conversation is over?

Direct answer:

> The unfinished part may be less about the words and more about not knowing where the relationship stands.

Useful distinction:

> Wanting clarity is different from needing immediate resolution.

### Decision

Question:

> Should I say something now or wait?

Direct answer:

> The choice may not be between honesty and silence. It may be between speaking while pressure is high and agreeing on a time when the message can actually land.

Useful distinction:

> Waiting with a return time is different from avoidance.

### Relationship

Question:

> Why does the same conversation feel calm to them and urgent to me?

Direct answer:

> You may need a defined next step in order to settle. They may need less pressure before they can respond clearly. The conflict can become a timing gap before it becomes a values gap.

Useful distinction:

> Different processing speeds do not automatically mean different levels of care.

### Family or team

Question:

> Why does everything fall to me when something goes wrong?

Direct answer:

> The group may rely on you to restore structure because you have done it before. That does not establish that the responsibility belongs to you now.

Useful distinction:

> Being the most capable person in the room does not make every unfinished responsibility yours.

### Current context

Question:

> Why does an old role feel harder to keep performing now?

Direct answer:

> A familiar responsibility theme may be more visible for a limited time, making the cost of the role harder to ignore.

Useful distinction:

> A temporary emphasis can reveal a tension without deciding what you must do.

## 10.3 Evidence treatment

Each landing example should display:

- two to five exact, fixture-backed Basis values;
- accessible expanded labels;
- a clear “illustrative demonstration” boundary;
- a direct visual connection between each relevant facet and the explanation;
- no unsupported framework values.

Exact Basis should support the interpretation without dominating the product story.

## 10.4 Immediate fixture concern

The current `PublicLanding.tsx` demonstration uses labels such as:

- `AUTH · EMO`
- `AUTH · SPLENIC`
- “permitted emotional authority”
- “permitted splenic authority”

The canonical contract explicitly says the product does not claim uncomputed Human Design authority. These fixtures should not become a long-term reference source. Replace them with supported facet language and exact fixture values that the current source contract can actually calculate and authorize.

The same review should verify every claim such as “stability is a core value” against an explicit fixture facet and authorized Basis references rather than treating the technical chips as decorative proof.

---

# 11. How It Works page strategy

The current page correctly explains the five connected steps and the separation between Baseline, current context, people and systems, Basis, and user confirmation.

It should add a visible answer to:

> What can Sovereign actually help me understand?

## Recommended section: Start with the question you already have

Use five expandable or selectable intents:

### Myself

- Why do I react this way?
- What part of my Baseline is showing up?
- What do I need to think clearly?
- What does this quality become under pressure?

### A decision

- Am I choosing from clarity or pressure?
- What supports the fit?
- What pulls against it?
- What would a closer version look like?

### A relationship

- Why does this land differently for each of us?
- What is mine, theirs, and between us?
- Where is the timing mismatch?
- What does repair require from each person?

### A family or team

- Who is carrying pressure?
- Where are authority and responsibility separated?
- What role am I expected to keep performing?
- What changes when I stop performing it?

### What may be active now

- What remains steady?
- What may be more relevant for a limited time?
- What part of my Baseline may deserve attention?
- What remains unknown until I confirm it?

Then show one shared answer stage so the page demonstrates the experience rather than becoming a long feature list.

---

# 12. FAQ strategy

The current FAQ answers category, framework, permission, Covenant, plans, privacy, and broad “What can I ask?” questions.

Add the following questions to clarify capability and limits.

## What can Baseline Design answer without me describing a problem?

It can help explain enduring personal tendencies across identity, communication, decisions, learning, connection, leadership, boundaries, responsibility, conflict, pressure, change, Shadow, Gift, and Alignment. These are interpretive possibilities connected to exact source data, not measured personality facts.

## What does Sovereign need me to describe?

A specific event, actual emotion, current relationship loop, practical constraint, decision tradeoff, or family role usually requires your observation or confirmation. Sovereign should separate what comes from your Baseline from what only your real-life context can establish.

## Can Sovereign tell me what another person feels?

No. With permission, it can show how two Baselines may interact and why the same moment may land differently. It cannot know another person’s exact feelings, motives, private experience, or future behavior.

## Can it tell me when to speak or wait?

It can help examine timing, processing differences, current pressure, and what information is missing. It can suggest a lower-pressure sequence, such as speaking briefly now and agreeing when to return, but it does not predict the result.

## What does the Basis prove?

Basis shows the exact approved source values that materially supported an interpretation. It verifies what data was used. It does not prove personality, motive, emotion, or outcome.

## Can Sovereign diagnose a pattern or condition?

No. It can describe observable dynamics and possible pressure responses in plain language. It does not diagnose mental-health conditions or assign clinical labels.

## What happens when the interpretation does not fit?

The user can mark it as fitting, partly fitting, or not fitting, add a correction, remove current context, revoke shared permission, and keep only the understanding they choose.

---

# 13. Production-safe marketing language

The raw language bank contains strong emotional value, but some lines overclaim certainty or use absolutes. The following hierarchy preserves the best value while staying inside the product contract.

## Strongest production-ready value lines

- See what is yours, what is theirs, and what is happening between you.
- Understand the moment before you add more pressure to it.
- Turn emotionally complex moments into clear distinctions.
- See how the same conversation can land differently for each person.
- Understand what supports a choice, what pulls against it, and what still needs to be known.
- See the role you carry—and what changes when you stop carrying it.
- Know yourself. Understand the system. Choose what fits.
- A direct answer built around the person asking.
- Your Baseline gives the question a place to begin.
- Keep what changes how you understand.

## Strong lines that require careful context

- Stop losing relationships to misreads.
- Break the loop you keep getting pulled into.
- Know when to speak, when to wait, and when to return.
- See the dynamic between you, not just your side of it.
- Understand their reaction without pretending to know their thoughts.
- See what may have shifted—and what you can responsibly do next.
- Real-time understanding for real relationships.

These should be paired with an accurate demonstration and not used as unsupported guarantees.

## Lines to revise before production

Raw:

> Know exactly why the moment shifted—in seconds.

Safer:

> See a grounded explanation for what may have shifted—and what remains unknown.

Raw:

> There is always one move that reduces pressure.

Safer:

> Look for the move that reduces pressure instead of adding more.

Raw:

> Most conflict is two people protecting something they can’t name.

Safer:

> Some conflict becomes clearer when each person can name what they are trying to protect.

Raw:

> Understanding someone isn’t guessing. It’s reading the field.

Safer:

> With permission, Sovereign can show how two Baselines may shape the interaction—without claiming access to private thoughts.

Raw:

> Patterns repeat until they’re understood.

Safer:

> Repeated dynamics become easier to change when the role, pressure, and timing are visible.

## Avoid as absolute public claims

- “This is the killer feature.”
- “Know exactly.”
- “There is always one move.”
- “Most conflict is…”
- “You are not random. You are patterned.”
- “The clean move is the one that doesn’t cost you.”
- Any line implying motive detection, guaranteed repair, exact emotional knowledge, prediction, or deterministic psychological truth.

---

# 14. Entry-point copy bank

Use these as prompt starters, demonstration titles, continuation actions, or editorial copy. They should remain subordinate to clear product explanation.

## When something confusing happens

- See the moment beneath the first reaction.
- When the tone shifts, you do not have to decide what it means alone.
- Clarity can separate what happened from what fear added to it.
- Ask what changed, what you know, and what remains unconfirmed.

## When a dynamic keeps repeating

- See what keeps the interaction in motion—and where it can change.
- Every repeated dynamic has a sequence.
- Name the role, pressure, and timing before choosing the next response.
- The goal is not to label the pattern. It is to see how it functions.

## When the user does not know how to say something

- Timing is part of the message.
- The right opening can change how the whole conversation lands.
- Say what is true without making the other person carry the urgency.
- A return time can make space feel safer for both people.

## When the user does not know what they are feeling

- Your reaction may make more sense when the pressure is visible.
- Name what is being asked of you before deciding what you feel about it.
- Overwhelm can make one problem feel like every problem.
- Separate the load from the identity.

## When the user does not know what the other person is feeling

- You can examine how the interaction may land without pretending to know their private experience.
- See what their permitted Baseline may make more important to them.
- Understanding a possible perspective is not the same as excusing behavior.
- What still needs to be asked directly should remain visible.

## When the user is afraid they are misreading the moment

- Check the read, the evidence, and the fear separately.
- A clearer read does not require false certainty.
- Ask what is confirmed, what is possible, and what is still unknown.
- The moment may be pressured without being dangerous.

## When the user does not know the next move

- Look for the move that reduces pressure instead of adding more.
- You do not need a perfect response to choose a more grounded one.
- Clarify responsibility before taking action.
- The next useful step may be a question, boundary, pause, or return time.

## When the user is stuck between two bad options

- The tradeoff may reveal a third version of the choice.
- Ask what each option protects and what each option costs.
- A closer version can preserve the real need without repeating the same pressure.
- The decision may be conditional rather than binary.

## When someone else is influencing the moment

- Not every tension belongs to one relationship.
- The conflict may be reinforced by the wider system.
- See the role of the third person, expectation, or authority structure.
- You do not have to carry a triangle alone.

## When it feels like a family role

- Old roles can remain active even when nobody chose them today.
- See what the family expects from you when pressure rises.
- Changing a role changes the whole system.
- Break the role without reducing the people to the role.

## When the user fears losing the relationship

- Fear can tighten the timing and make every response feel final.
- Honesty and connection do not have to be opposites.
- Repair begins with understanding what each person can own.
- Understanding is not the same as reconciliation or restored trust.

## When the user fears losing themselves

- Staying connected should not require disappearing.
- A need is not automatically a threat to the relationship.
- A boundary can make responsibility clearer without becoming a wall.
- Ask what part of the relationship requires self-abandonment and what part requires growth.

## When preparing for a hard conversation

- Practice the opening before entering the whole conversation.
- Rehearsal can reduce pressure.
- Decide what the conversation must accomplish—and what it cannot solve in one moment.
- Choose the tone, timing, and return point intentionally.

## When the user wants to understand themselves

- Know how you work so you can work with yourself.
- Your Baseline is a reference, not a box.
- See what remains steady and what changes under pressure.
- Understanding is not self-fixing. It is a clearer relationship with your own capacities.

## When the user wants to understand a relationship

- Two Baselines create one interaction.
- See what happens between you, not only inside each person.
- The same moment can carry two valid experiences.
- Separate shared responsibility from individual responsibility.

## When the user needs to know whether now is the right moment

- Timing is part of the message.
- Some moments can hold more truth than others.
- Say less when the field is pressured; agree when to return.
- Better timing does not remove the hard part. It gives it a better chance to land.

---

# 15. Repository findings and implementation implications

## Finding 1: the current visual direction is strong

The personal and relationship screenshots use the right core composition. Preserve the two-panel product demonstration, quiet evidence chips, restrained typography, and single action.

The next improvement should expand the questions demonstrated without replacing the design.

## Finding 2: the internal product already has the right breadth in code

`SovereignIntelligenceSpace.tsx` already includes Explore modes for Baseline, Shadow and Gift, Alignment, decisions, communication, love, learning, leadership, boundaries, pressure, and family role.

The question universe should become:

- better prompt examples;
- smarter contextual actions;
- richer empty states;
- more specific answer demonstrations;
- a source for FAQ and How It Works content.

It should not create separate mini-products.

## Finding 3: the current public explanation is accurate but under-demonstrates breadth

The How It Works and FAQ pages explain the framework and limits accurately. They need more visible examples of the questions people already have.

## Finding 4: no new answer schema is required

`sovereign-answer.v2` already supports Baseline, Now, Shadow and Gift, Alignment, Relationship, System, and Covenant modes, with structured sections, exact Basis references, correction, confidence, safety mode, and contextual actions.

Use this document to improve selection and rendering within that contract rather than introducing a parallel response format.

## Finding 5: fixture truth requires immediate attention

The public demonstration currently includes unsupported Human Design authority labels. Public fixtures must follow the same source boundaries as the real product.

A fixture audit should verify:

- every exact value exists in the supported deterministic source contract;
- every Baseline claim is tied to a fixture facet with valid `basisRefs`;
- no technical chip is used as decorative proof;
- no other-person value appears without the equivalent permitted scope;
- no current factor is turned into a behavior claim;
- no user statement is represented as Baseline evidence.

---

# 16. Recommended implementation sequence

## Phase 1 — fixture and claim audit

- Replace unsupported authority fixtures.
- Trace every public claim to a supported fixture facet and exact Basis value.
- Preserve the current visual composition.

## Phase 2 — internal question entry

- Add human-intent groupings to Explore without changing top-level navigation.
- Expand surface-specific prompt suggestions from this question universe.
- Keep free natural text input available.

## Phase 3 — answer quality

- Update runtime guidance and tests so answers prioritize a useful distinction.
- Strengthen question-family routing using the existing modes and section IDs.
- Add continuation actions that directly follow the user’s intent.

## Phase 4 — landing breadth

- Add a question rail to the shared product stage.
- Demonstrate personal, reaction, decision, relationship, system, and current-context questions.
- Keep one focal point rather than stacking feature cards.

## Phase 5 — How It Works and FAQ

- Add the grouped question universe.
- Add clear boundaries for Baseline-only, user-confirmed, relationship-permitted, and unknown information.
- Explain Basis as evidence of source use, not proof of personality.

## Phase 6 — verification

Add tests that prove:

- public examples use only supported framework values;
- each demonstration has an illustrative-data boundary;
- no motive or exact-emotion claim appears;
- no compatibility or Alignment score appears;
- personal, decision, relationship, and system questions are visibly represented;
- Basis values remain secondary and accessible;
- mobile renders the question, answer beginning, evidence, and action without horizontal overflow;
- internal prompts preserve one Sovereign agent and the existing navigation;
- Library saves understanding rather than indiscriminate conversation;
- corrections can confirm, partially confirm, or reject an interpretation.

---

# 17. Acceptance criteria

This strategy is successfully reflected in the product when:

1. A new visitor can name at least five real questions Sovereign can help with.
2. The landing demonstrates self, decision, relationship, and system intelligence without becoming a dashboard.
3. The authenticated space offers useful entry points before the user writes a perfect prompt.
4. Answers create a specific, practical distinction rather than generic coaching.
5. Stable Baseline, temporary current context, user observation, relationship interaction, system structure, and unknown state remain visibly separate.
6. Another person is represented only through permitted information and possibility language.
7. Every technical value shown publicly is supported by the current source contract.
8. Basis demonstrates what shaped the answer without being presented as personality proof.
9. Alignment remains a structured comparison rather than a score.
10. The user can correct what does not fit and keep only the understanding that remains useful.
11. The product feels like one private intelligence environment rather than a collection of psychological tools.
12. Sovereign.OS communicates its full value: self, current context, decisions, relationships, families, teams, timing, responsibility, repair, and optional Covenant exploration.
