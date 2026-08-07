(() => {
  const script = document.currentScript;
  const params = new URL(script?.src || location.href).searchParams;
  const attribute = params.get('attribute') || 'data-sovereign-route-cohesion-audit';
  const rootSelector = params.get('root') || '';
  const headingSelector = params.get('heading') || '';
  const navSelector = params.get('nav') || '';
  const contentSelector = params.get('content') || '';
  const deadlineMs = Math.min(120000, Math.max(1000, Number(params.get('deadline') || 30000)));
  const pollInterval = Math.min(1000, Math.max(10, Number(params.get('poll') || 50)));
  const deadline = Date.now() + deadlineMs;
  let started = false;

  const errorMessage = (error) => {
    if (error && typeof error === 'object' && 'name' in error && 'message' in error) {
      return String(error.name) + ': ' + String(error.message);
    }
    return String(error || 'unknown browser audit error');
  };

  const encode = (payload) => {
    const bytes = new TextEncoder().encode(JSON.stringify(payload));
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  };

  const fallbackPayload = {
    pathname: '',
    auditError: 'audit payload serialization failed'
  };

  const publish = (payload) => {
    const documentRoot = document.documentElement;
    if (!documentRoot) return false;
    try {
      documentRoot.setAttribute(attribute, encode(payload));
    } catch {
      try {
        documentRoot.setAttribute(attribute, encode(fallbackPayload));
      } catch {
        return false;
      }
    }
    return documentRoot.hasAttribute(attribute);
  };

  const inspect = () => {
    try {
      const documentRoot = document.documentElement;
      const body = document.body;
      const root = rootSelector ? document.querySelector(rootSelector) : null;

      if (!documentRoot || !body || !root) {
        if (Date.now() < deadline) {
          setTimeout(inspect, pollInterval);
          return;
        }
        publish({
          pathname: location.pathname,
          rootPresent: Boolean(root),
          auditError: 'route root did not become available before the browser audit deadline'
        });
        return;
      }

      const heading = headingSelector ? document.querySelector(headingSelector) : null;
      const nav = navSelector ? document.querySelector(navSelector) : null;
      const content = contentSelector ? document.querySelector(contentSelector) : null;
      const bodyCopySelector = 'p:not(.eyebrow):not(.launch-kicker):not(.policy-kicker):not(.not-found-code):not([class*="kicker"]), li, dd';
      let firstParagraph = content?.querySelector(bodyCopySelector) || document.querySelector(bodyCopySelector);
      if (!firstParagraph) {
        if (Date.now() < deadline) {
          setTimeout(inspect, pollInterval);
          return;
        }
        firstParagraph = document.querySelector("p, li, dd");
      }
      const styleOf = (element) => element ? getComputedStyle(element) : null;
      const rectOf = (element) => {
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        return {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          top: Math.round(rect.top + scrollY),
          left: Math.round(rect.left + scrollX)
        };
      };
      const headingStyle = styleOf(heading);
      const paragraphStyle = styleOf(firstParagraph);
      const rootStyle = styleOf(root);
      const payload = {
        pathname: location.pathname,
        rootPresent: Boolean(root),
        headingPresent: Boolean(heading),
        navPresent: Boolean(nav),
        contentPresent: Boolean(content),
        bodyCopyPresent: Boolean(firstParagraph),
        routeCohesion: body.dataset?.routeCohesion || '',
        stylesheetPresent: [...document.querySelectorAll('link[rel="stylesheet"]')].some((link) => String(link.getAttribute('href') || '').includes('/deployed-route-cohesion.css')),
        compiledAuthorityPresent: [...document.styleSheets].some((sheet) => {
          try {
            return [...(sheet.cssRules || [])].some((rule) => String(rule.cssText || '').includes('--route-blue'));
          } catch {
            return false;
          }
        }),
        document: {
          width: Math.max(documentRoot.scrollWidth, body.scrollWidth || 0),
          height: Math.max(documentRoot.scrollHeight, body.scrollHeight || 0),
          overflowX: Math.max(0, Math.max(documentRoot.scrollWidth, body.scrollWidth || 0) - innerWidth)
        },
        boxes: {
          root: rectOf(root),
          heading: rectOf(heading),
          nav: rectOf(nav),
          content: rectOf(content)
        },
        typography: {
          headingFamily: headingStyle?.fontFamily || '',
          headingSize: parseFloat(headingStyle?.fontSize || '0'),
          headingLineHeight: parseFloat(headingStyle?.lineHeight || '0'),
          paragraphFamily: paragraphStyle?.fontFamily || '',
          paragraphSize: parseFloat(paragraphStyle?.fontSize || '0'),
          paragraphLineHeight: parseFloat(paragraphStyle?.lineHeight || '0')
        },
        color: {
          rootBackground: rootStyle?.backgroundColor || '',
          bodyBackground: getComputedStyle(body).backgroundColor
        },
        textLength: (body.innerText || '').replace(/\s+/g, ' ').trim().length,
        auditError: ''
      };
      publish(payload);
    } catch (error) {
      publish({
        pathname: location.pathname,
        auditError: errorMessage(error)
      });
    }
  };

  const start = () => {
    if (started) return;
    started = true;
    try {
      inspect();
    } catch (error) {
      publish({
        pathname: location.pathname,
        auditError: errorMessage(error)
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
    setTimeout(start, 0);
  } else {
    start();
  }
})();
