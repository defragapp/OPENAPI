const observer = new MutationObserver(() => enhanceLanding());
observer.observe(document.documentElement, { childList: true, subtree: true });
enhanceLanding();

function enhanceLanding() {
  if (location.pathname !== '/') return;
  const shell = document.querySelector('.entry-shell');
  const hero = shell?.querySelector(':scope > section');
  if (!shell || !hero || hero.dataset.innerRecognitionLanding === 'true') return;

  hero.dataset.innerRecognitionLanding = 'true';
  document.title = 'Sovereign.OS · Inner Recognition';
  const description = document.querySelector('meta[name="description"]');
  description?.setAttribute('content', 'Sovereign.OS helps you understand what a moment is bringing up in you—so you can respond with more clarity.');

  const eyebrow = hero.querySelector('.eyebrow');
  const heading = hero.querySelector('h1');
  const lede = hero.querySelector('.lede');
  const actions = hero.querySelector('.action-row');
  const note = shell.querySelector('.entry-note');

  if (eyebrow) eyebrow.textContent = 'INNER RECOGNITION';
  if (heading) heading.textContent = 'Understand what this moment is bringing up in you.';
  if (lede) lede.textContent = 'Sovereign.OS helps you slow down a difficult interaction, notice what is happening inside you, and find one clear next step. Your Baseline Design and current timing work quietly in the background.';

  if (actions) {
    const links = [...actions.querySelectorAll('a')];
    const primary = links[0];
    const secondary = links[1];
    if (primary) {
      primary.textContent = 'Talk it through';
      primary.setAttribute('href', '/signup');
    }
    if (secondary) {
      secondary.textContent = 'See how it works';
      secondary.setAttribute('href', '/how-it-works.html');
    }
    if (!actions.querySelector('[data-public-sign-in]')) {
      const signIn = document.createElement('a');
      signIn.dataset.publicSignIn = 'true';
      signIn.className = 'quiet-button';
      signIn.href = '/login';
      signIn.textContent = 'Sign in';
      actions.append(signIn);
    }
  }

  if (note) note.textContent = 'One clear recognition · One useful question · One practical next step';
}
