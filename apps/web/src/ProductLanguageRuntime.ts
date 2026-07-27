let installed = false;

const replacements = new Map<string, string>([
  ['Your steady patterns, current pressure, and what only you can confirm', 'Your Baseline, what may be more active now, and what you confirm'],
  ['Use your Baseline to work through one real question', 'Explore your design, choices, relationships, and growth'],
  ['Understand a relationship with both people’s permission', 'See two Baseline Designs together—with permission and clear boundaries'],
  ['See how roles, authority, and responsibility shape a group', 'Map how people, roles, pressure, and responsibility shape the whole system'],
  ['Return to insights you chose to save', 'Return to the understandings you chose to keep'],
  ['Build your Baseline and manage your account', 'Explore your Baseline and manage your settings'],
  ['What decision, reaction, or pressure is in front of you?', 'Ask about yourself, a choice, a relationship, or what feels active now.'],
  ['What part of your life would you like to understand more clearly?', 'Ask about your design, shadow and light, alignment, relationships, or growth.'],
  ['What are you trying to understand about this interaction?', 'Ask what each person may be bringing to the relationship.'],
  ['What feels unclear about this family, household, or team?', 'Ask how this family, household, group, or team functions as a whole.'],
  ['What would you like to understand next?', 'Continue from something you chose to keep.'],
  ['What would you like Sovereign to help you understand?', 'Ask about your Baseline, settings, privacy, or Covenant.'],
  ['Understand your life in context.', 'Know yourself. Understand the system. Choose what fits.'],
  ['Create your account, then build a starting map for decisions, relationships, and the groups around you.', 'Create your account to explore your Baseline, choices, relationships, and the systems around you.'],
  ['Return to Today, your conversations, and the insights you chose to save.', 'Return to your Baseline, relationships, systems, and saved understandings.'],
  ['Work through a decision with your own patterns in view', 'Explore your full Baseline in plain language'],
  ['Prepare for a difficult conversation without guessing motives', 'Check the alignment of a decision, behavior, or relationship'],
  ['See how roles and responsibility shape a family or team', 'Map how people function together in a relationship, family, or team'],
  ['Choose where you want to begin, or ask Sovereign below.', 'Choose an area to explore, or ask Sovereign about yourself, a relationship, or a system.'],
  ['Start with one real question.', 'Begin with yourself—or the system around you.'],
  ['Your Baseline is ready. Ask Sovereign about a real situation to use it.', 'Your Baseline is ready. Explore any part of yourself, a choice, a relationship, or your role in a system.'],
  ['Build your Baseline to give Sovereign a consistent starting point.', 'Build your Baseline once to create the stable personal framework for your workspace.'],
  ['Temporary current context is available.', 'Current timing is available as a separate layer around your Baseline.'],
  ['No current-condition context is active.', 'No current timing context is active.'],
  ['Nothing about today is treated as fact until you confirm it.', 'Your lived experience remains yours to confirm and correct.'],
  ['Your context for today.', 'What may be more active now.'],
  ['Start with what tends to be steady. Add what may be louder now. You confirm what is true.', 'Start with your design. Add today’s timing. Keep only what fits your actual life.'],
  ['Does this fit today?', 'Does this feel true for you now?'],
  ['Your answer helps this conversation stay grounded in your experience.', 'Your answer keeps the experience grounded in your own life.'],
  ['Work through one real question.', 'Explore any part of who you are.'],
  ['Choose an area and name what feels difficult or unclear. Sovereign will use your Baseline as a starting point, not a verdict.', 'Choose an area or ask naturally about identity, shadow and light, alignment, decisions, relationships, purpose, or growth.'],
  ['Example: Why does this decision feel harder than it should?', 'Example: What is the shadow and light expression of this quality?'],
  ['Your Baseline, the current moment, facts you provide, and anything still unknown remain distinct.', 'Your Baseline, current timing, facts you provide, and anything still unknown remain separate.'],
  ['Understand the relationship—not just the latest moment.', 'See the relationship from both sides.'],
  ['Start with what you know about the interaction. If the other person joins, Sovereign can compare both perspectives using only what each of you agrees to share.', 'Bring two permitted Baselines together to explore needs, communication, roles, tension, connection, boundaries, and mutual influence.'],
  ['Compare our permitted context', 'Explore our relationship'],
  ['See the structure around the group.', 'Understand the whole system.'],
  ['A family, household, friendship, or team is more than a set of personalities. Add roles, authority, responsibility, dependence, and shared goals to see what the situation may actually require.', 'Map a family, household, friendship, team, or workplace to see how people, roles, pressure, authority, and responsibility work together.'],
  ['Interaction patterns, role conflicts, responsibility boundaries, missing information, and one grounded next step—without pretending to know anyone’s private motives.', 'See fixed roles, pressure, authority, responsibility, missing perspectives, and how one person’s change affects the whole—without guessing private motives.'],
  ['Review this group', 'Explore this system'],
  ['Return to what was worth keeping.', 'Keep what changed your understanding.'],
  ['Save an answer when it changes how you see a decision, relationship, or recurring pattern. It will return here with the context that made it useful.', 'Save any understanding you want to revisit. It returns here with the people, system, and context that made it useful.'],
  ['Your Library is a collection of chosen insights, not a feed of every conversation.', 'Only the understandings you deliberately save appear here.'],
  ['No saved understandings yet.', 'Your Library is ready.'],
  ['When an answer is worth returning to, choose “Save this understanding.” It will appear here with its original context.', 'Explore a question, relationship, or system. Save anything worth keeping, and it will appear here.'],
  ['Build your starting map.', 'Meet your Baseline Design.'],
  ['Your Baseline translates selected symbolic frameworks into practical themes for decisions, communication, connection, learning, expression, and pressure. Treat it as material for reflection—not a fixed label.', 'Explore the qualities, roles, strengths, tensions, shadow and light expressions, communication, choices, relationships, and pressure responses that shape how you move through life.'],
  ['Choose the depth you need.', 'Choose how far you want to explore.'],
  ['Free includes the complete personal Baseline experience. Sovereign+ adds more conversations, permission-based relationship comparisons, group views, and saved continuity.', 'Free includes the complete personal Baseline experience. Sovereign+ adds deeper relationship comparisons, family and team systems, Library continuity, Covenant, and more conversations.'],
  ['Optional Scripture lens. Off unless you enable it for this thread.', 'Optional Christian and biblical lens. Off unless you enable it for this thread.'],
  ['Save Covenant choice for this thread', 'Save Covenant for this thread'],
  ['Build my Baseline', 'Explore my Baseline'],
  ['Explore your archetypal qualities, shadow and light, decisions, behaviors, and relationships—then bring multiple Baseline Designs together to understand families, teams, and the human systems around you.', 'Explore who you are, check what fits, and see how people shape the systems around you.'],
  ['One person is complex. A relationship is more complex. A family is an entire system. Sovereign.OS helps make all three understandable without reducing anyone to a label.', 'Understand yourself. See the other side. Map the whole system—without reducing anyone to a label.'],
  ['Baseline Design translates the platform’s natal-data framework into a personal understanding of your archetypal qualities, natural roles, strengths, tensions, communication, decisions, relationships, and responses under pressure.', 'Baseline Design turns your natal framework into a clear view of your qualities, roles, strengths, tensions, choices, and relationships.'],
  ['Explore each part in plain language, examine its shadow and light expressions, and consider how it appears across the choices and relationships that make up your actual life.', 'Explore each part through shadow and light, alignment, and the life you are actually living.'],
  ['Bring a decision, relationship, behavior, family role, or part of yourself you want to understand. Sovereign connects the question to the deeper framework already present in your Baseline Design.', 'Apply your Baseline to a decision, relationship, behavior, family role, or part of yourself.'],
  ['Bring two Baseline Designs together to understand different needs and perspectives. Add more people to map the roles, pressures, loyalties, authority, and responsibility shaping an entire family, household, team, or community.', 'Compare two permitted Baselines or map the roles and pressure shaping a family, team, or community.'],
  ['Explore your Baseline Design, examine what fits, and see how people function together inside the relationships and systems that shape your life.', 'Explore your design. Check what fits. Understand the people and systems shaping your life.']
]);

function replaceTextNode(node: Text): void {
  const raw = node.nodeValue ?? '';
  const trimmed = raw.trim();
  const replacement = replacements.get(trimmed);
  if (!replacement) return;
  const start = raw.indexOf(trimmed);
  node.nodeValue = `${raw.slice(0, start)}${replacement}${raw.slice(start + trimmed.length)}`;
}

function replaceText(root: Node): void {
  if (root.nodeType === Node.TEXT_NODE) replaceTextNode(root as Text);

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    replaceTextNode(current as Text);
    current = walker.nextNode();
  }
}

function applyProductLanguage(): void {
  if (!document.body) return;
  replaceText(document.body);
}

export function installProductLanguageRuntime(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  const start = () => {
    applyProductLanguage();
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          replaceText(mutation.target);
          continue;
        }
        for (const node of mutation.addedNodes) replaceText(node);
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}
