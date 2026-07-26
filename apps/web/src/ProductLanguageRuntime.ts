let installed = false;

const replacements = new Map<string, string>([
  ['Your steady patterns, current pressure, and what only you can confirm', 'Your Baseline Design, the role or state active now, and what it may be asking of you'],
  ['Use your Baseline to work through one real question', 'Explore identity, shadow and light, alignment, decisions, relationships, and growth'],
  ['Understand a relationship with both people’s permission', 'See two Baseline Designs together and understand the relationship from both sides'],
  ['See how roles, authority, and responsibility shape a group', 'Map how people, roles, pressures, and relationships shape the whole system'],
  ['Return to insights you chose to save', 'Return to the understandings you chose to keep'],
  ['Build your Baseline and manage your account', 'Explore your Baseline Design and manage your settings'],
  ['What decision, reaction, or pressure is in front of you?', 'Explore what feels most active now, or apply it to a choice, relationship, behavior, or direction.'],
  ['What part of your life would you like to understand more clearly?', 'Ask about any part of your design, shadow or light, alignment, relationship, or development.'],
  ['What are you trying to understand about this interaction?', 'Ask what each person may be bringing to the relationship.'],
  ['What feels unclear about this family, household, or team?', 'Ask how this family, household, group, or team functions as a whole.'],
  ['What would you like to understand next?', 'Continue from an understanding you chose to keep.'],
  ['What would you like Sovereign to help you understand?', 'Ask about your Baseline Design, settings, privacy, or Covenant.'],
  ['Understand your life in context.', 'Know yourself. Understand the system. Choose what fits.'],
  ['Create your account, then build a starting map for decisions, relationships, and the groups around you.', 'Create your account to explore your Baseline Design, shadow and light, alignment, relationships, and the systems around you.'],
  ['Return to Today, your conversations, and the insights you chose to save.', 'Return to your Baseline Design, relationships, systems, and the understandings you chose to keep.'],
  ['Work through a decision with your own patterns in view', 'Explore your full Baseline Design in plain language'],
  ['Prepare for a difficult conversation without guessing motives', 'Examine the alignment of a decision, behavior, or relationship'],
  ['See how roles and responsibility shape a family or team', 'Map how people function together in a relationship, family, or team'],
  ['Choose where you want to begin, or ask Sovereign below.', 'Choose an area to explore, or ask Sovereign about yourself, a relationship, or a system.'],
  ['Start with one real question.', 'Begin with yourself—or the system around you.'],
  ['Your Baseline is ready. Ask Sovereign about a real situation to use it.', 'Your Baseline Design is ready to explore across identity, shadow and light, decisions, relationships, and growth.'],
  ['Build your Baseline to give Sovereign a consistent starting point.', 'Build your Baseline Design to begin exploring the qualities, roles, strengths, and tensions that shape your life.'],
  ['Temporary current context is available.', 'Current timing is available to help show which parts of your Baseline may be more active now.'],
  ['No current-condition context is active.', 'No current timing context is active.'],
  ['Nothing about today is treated as fact until you confirm it.', 'Your lived experience remains yours to confirm and correct.'],
  ['Your context for today.', 'What is active in your life now.'],
  ['Start with what tends to be steady. Add what may be louder now. You confirm what is true.', 'Explore the qualities, roles, and tensions becoming more relevant now, then apply them to any decision, relationship, behavior, or direction you choose.'],
  ['Does this fit today?', 'Does this feel true for you now?'],
  ['Your answer helps this conversation stay grounded in your experience.', 'Your answer keeps the experience grounded in your own life.'],
  ['Work through one real question.', 'Explore any part of who you are.'],
  ['Choose an area and name what feels difficult or unclear. Sovereign will use your Baseline as a starting point, not a verdict.', 'Choose an area or ask naturally about identity, shadow and light, alignment, decisions, relationships, purpose, or growth.'],
  ['Example: Why does this decision feel harder than it should?', 'Example: What is the shadow and light expression of this quality?'],
  ['Your Baseline, the current moment, facts you provide, and anything still unknown remain distinct.', 'Your Baseline Design, current timing, facts you provide, and anything still unknown remain distinct.'],
  ['Understand the relationship—not just the latest moment.', 'See the relationship from both sides.'],
  ['Start with what you know about the interaction. If the other person joins, Sovereign can compare both perspectives using only what each of you agrees to share.', 'Bring two permitted Baseline Designs together to explore needs, communication, roles, tension, connection, boundaries, and mutual influence.'],
  ['Compare our permitted context', 'Explore our relationship'],
  ['See the structure around the group.', 'Understand the whole system.'],
  ['A family, household, friendship, or team is more than a set of personalities. Add roles, authority, responsibility, dependence, and shared goals to see what the situation may actually require.', 'Map a family, household, friendship, team, or workplace to see how people, roles, pressures, loyalties, authority, and responsibility function together.'],
  ['Interaction patterns, role conflicts, responsibility boundaries, missing information, and one grounded next step—without pretending to know anyone’s private motives.', 'Fixed roles, emotional pressure, authority, responsibility, alliances, missing perspectives, and how one person’s change affects the whole—without pretending to know anyone’s private motives.'],
  ['Review this group', 'Explore this system'],
  ['Return to what was worth keeping.', 'Return to what changed your understanding.'],
  ['Save an answer when it changes how you see a decision, relationship, or recurring pattern. It will return here with the context that made it useful.', 'Save an understanding when it helps you see yourself, a choice, a relationship, or a system more clearly. Revisit it with the context that made it meaningful.'],
  ['Your Library is a collection of chosen insights, not a feed of every conversation.', 'Your Library holds only the understandings you deliberately chose to keep.'],
  ['Build your starting map.', 'Meet your Baseline Design.'],
  ['Your Baseline translates selected symbolic frameworks into practical themes for decisions, communication, connection, learning, expression, and pressure. Treat it as material for reflection—not a fixed label.', 'Explore the archetypal qualities, roles, strengths, tensions, shadow and light expressions, communication, decisions, relationships, and pressure responses that shape how you move through life.'],
  ['Choose the depth you need.', 'Choose how far you want to explore.'],
  ['Free includes the complete personal Baseline experience. Sovereign+ adds more conversations, permission-based relationship comparisons, group views, and saved continuity.', 'Free includes the complete personal Baseline Design experience. Sovereign+ adds deeper relationship comparisons, family and team systems, Library continuity, Covenant, and more conversations.'],
  ['Optional Scripture lens. Off unless you enable it for this thread.', 'Optional Christian and biblical lens. Off unless you enable it for this thread.'],
  ['Save Covenant choice for this thread', 'Save Covenant for this thread'],
  ['Build my Baseline', 'Explore my Baseline']
]);

function replaceText(root: Node): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }

  for (const node of nodes) {
    const raw = node.nodeValue ?? '';
    const trimmed = raw.trim();
    const replacement = replacements.get(trimmed);
    if (!replacement) continue;
    const start = raw.indexOf(trimmed);
    node.nodeValue = `${raw.slice(0, start)}${replacement}${raw.slice(start + trimmed.length)}`;
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
