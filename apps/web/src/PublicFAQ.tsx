import type { ReactNode } from 'react';
import { BrandMark } from './BrandMark';

const FAQ_CONTENT = {
  hero: {
    kicker: 'QUESTIONS · KNOW YOURSELF. UNDERSTAND YOUR PEOPLE. SEE THE WHOLE SYSTEM.',
    title: 'What can Sovereign help you understand?',
    subtitle: 'What Sovereign is. What you can ask. What it never pretends to know. Know yourself. Understand your people. See the whole system.',
  },
  categories: [
    {
      kicker: 'THE PRODUCT',
      questions: [
        {
          question: 'What is Sovereign.OS?',
          answer: 'Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the systems around you. It carries your Baseline across questions so you do not have to rebuild your personal reference from scratch every time.',
        },
        {
          question: 'What is Baseline Design?',
          answer: 'Baseline Design is a private, explorable reference built around you. It helps Sovereign understand how you may think, decide, communicate, create, connect, lead, respond under pressure, and grow. It is interpretive and correctable, not a score or verdict.',
        },
        {
          question: 'How is Sovereign different from a general AI assistant?',
          answer: 'A general assistant can work with whatever you explain in a conversation. Sovereign can carry your private Baseline across questions, use another person\'s Baseline only when that person chose to share it, expand into a family or team when the wider situation matters, and let you inspect the source details used for an interpretation.',
        },
        {
          question: 'What can I use Sovereign to explore about myself?',
          answer: 'Identity and orientation, decisions, communication, learning, creativity and expression, love and connection, leadership, boundaries, response to pressure and change, Shadow, Gift, Alignment, underused qualities, and recurring patterns you want to understand more clearly.',
        },
        {
          question: 'Can Sovereign help before I describe a problem?',
          answer: 'Yes. Your Baseline can support self-exploration across communication, decisions, learning, creativity, connection, leadership, boundaries, pressure, change, Shadow, Gift, Alignment, and underused qualities. You do not need to arrive with a conflict or incident for Sovereign to be useful.',
        },
        {
          question: 'What does Sovereign need me to describe?',
          answer: 'A specific event, what you are actually feeling now, a real relationship loop, practical constraints, decision tradeoffs, or a family or team role often depends on what you observe or confirm. Sovereign should give useful context first, then ask only for information that would materially change the answer.',
        },
        {
          question: 'What are Shadow, Gift, and Alignment?',
          answer: 'Shadow describes how a valid quality may narrow, protect, avoid, or overreach under pressure. Gift describes what that same quality can make possible when used with awareness. Alignment helps you examine what supports a choice, what pulls against it, the tradeoff, what is still needed, and a closer version. None is a score.',
        },
        {
          question: 'Does Sovereign make decisions for me?',
          answer: 'No. It can help you see patterns, differences, tradeoffs, and context more clearly. The decision and final judgment remain yours.',
        },
      ],
    },
    {
      kicker: 'PEOPLE + PERMISSION',
      questions: [
        {
          question: 'How do relationships work?',
          answer: 'Another person connects their own account and chooses what they want to share. Sovereign keeps each person separate, then helps explain why the same moment may land differently, what each person may be bringing, what happens when those patterns meet, and what can reduce avoidable pressure without pretending to know private motives or feelings.',
        },
        {
          question: 'Can I add someone\'s Baseline without them agreeing?',
          answer: 'No. A name or birth detail does not create permission. The other person connects their own account and controls whether their Baseline may be used with yours.',
        },
        {
          question: 'Can Sovereign tell me what another person feels?',
          answer: 'No. It can describe differences and interaction patterns using information both people chose to share, but it cannot know someone else\'s exact feelings, motives, private experience, or future behavior.',
        },
        {
          question: 'Can Sovereign help us figure out when to speak, pause, or return to a conversation?',
          answer: 'It can examine differences in processing, communication, pressure, and the actual situation you describe. It may suggest a lower-pressure sequence—for example, reassurance now and a defined time to return—without predicting how the conversation will end.',
        },
        {
          question: 'What happens in a System?',
          answer: 'Sovereign expands from one relationship to a family, household, friendship group, workplace, team, or other human system. It can help you see who is involved, what each person is responsible for, where pressure builds, how people respond to one another, which roles keep repeating, and what may change when one person responds differently.',
        },
        {
          question: 'Can permission be changed later?',
          answer: 'Yes. Each person can change or revoke their own sharing choices. New relationship and system use follows the choices that are active at that time.',
        },
      ],
    },
    {
      kicker: 'FRAMEWORKS + LIMITS',
      questions: [
        {
          question: 'Where does Baseline Design come from?',
          answer: 'Baseline Design is first a private reference used to make Sovereign more continuous and specific across your questions. Underneath that experience, it combines calculated astronomical data with selected interpretive frameworks and translates those sources into patterns you can examine and correct.',
        },
        {
          question: 'Which frameworks are included?',
          answer: 'The launch Baseline uses calculated astronomical positions, astrology, partial Human Design and Gene Keys activations, and numerology. Tarot is not part of Sovereign.OS. These frameworks support sovereign reflection and personal discernment; they are not clinical measurements or proof of future outcomes.',
        },
        {
          question: 'Is this therapy or medical care?',
          answer: 'No. Sovereign.OS is an instrument for personal discernment and sovereign reflection, not therapy, treatment, or medical care. It helps you understand personal, relationship, decision, and system dynamics in clear language while keeping your agency and judgment primary.',
        },
        {
          question: 'Can Sovereign prove an absolute verdict, hidden motive, spiritual cause, or future outcome?',
          answer: 'No. A framework, coincidence, current astronomical condition, or strong feeling is not treated as proof of an internal condition, hidden motive, spiritual cause, or future outcome. Sovereign is designed for sovereign reflection and thoughtful discernment.',
        },
        {
          question: 'Can I see what information Sovereign used for an answer?',
          answer: 'Yes. Open source details beneath an answer when you want to inspect the exact source information that materially shaped the interpretation. Those values come from the product\'s approved source layer rather than being invented by the language model.',
        },
        {
          question: 'Do those source details prove the interpretation is true?',
          answer: 'No. Source details show which approved information was used. They do not prove personality, motive, emotion, compatibility, current state, or an outcome. You can review, correct, partly accept, or reject the interpretation.',
        },
        {
          question: 'Does Sovereign reduce me to a type?',
          answer: 'No. Your Baseline is an interpretation you can explore, correct, partly accept, or reject. Sovereign does not use a compatibility score, Alignment score, or single type as a verdict about you.',
        },
      ],
    },
    {
      kicker: 'CAPABILITY + LIMITS',
      questions: [
        {
          question: 'What can Baseline Design answer without me describing a problem?',
          answer: 'It can help explain enduring personal tendencies across identity, communication, decisions, learning, connection, leadership, boundaries, responsibility, conflict, pressure, change, Shadow, Gift, and Alignment. These are interpretive possibilities connected to exact source data, not measured personality facts.',
        },
        {
          question: 'What does Sovereign need me to describe?',
          answer: 'A specific event, actual emotion, current relationship loop, practical constraint, decision tradeoff, or family or team role usually requires your observation or confirmation. Sovereign should separate what comes from your Baseline Design from what only your real-life context can establish.',
        },
        {
          question: 'Can Sovereign tell me what another person feels?',
          answer: 'No. With permission, it can show how two Baseline Designs may interact and why the same moment may land differently. It cannot know another person\'s exact feelings, motives, private experience, or future behavior.',
        },
        {
          question: 'Can it tell me when to speak or wait?',
          answer: 'It can help examine timing, processing differences, current pressure, and what information is missing. It can suggest a lower-pressure sequence, such as speaking briefly now and agreeing when to return, but it does not predict the result.',
        },
        {
          question: 'What do the Sources prove?',
          answer: 'Sources show the exact approved source values that materially supported an interpretation. They verify what data was used. They do not prove personality, motive, emotion, compatibility, current state, or an outcome.',
        },
        {
          question: 'Can Sovereign evaluate or diagnose personal conditions?',
          answer: 'No. Sovereign is dedicated to sovereign reflection and personal discernment. It describes observable dynamics, relational friction, and possible pressure responses in plain language, without assigning clinical labels or diagnosing conditions.',
        },
        {
          question: 'What happens when the interpretation does not fit?',
          answer: 'You can mark it as fitting, partly fitting, or not fitting and add a correction. Future answers in the thread can use that correction instead of treating the earlier interpretation as unquestioned truth.',
        },
      ],
    },
    {
      kicker: 'PRIVACY + ACCOUNT',
      questions: [
        {
          question: 'What reaches the language model?',
          answer: 'Sovereign sends only the information needed to answer the question. Raw birth details, exact private location, authentication material, payment identifiers, invitation tokens, and unrelated account history stay out of the model input.',
        },
        {
          question: 'Can I correct or remove an interpretation?',
          answer: 'Yes. You can confirm what fits, mark what partly fits, reject what does not fit, control what enters Library, revoke sharing permission, download your account data, and request account deletion.',
        },
        {
          question: 'What happens when an interpretation does not fit?',
          answer: 'You can mark it as fitting, partly fitting, or not fitting and add a correction. Future answers in the thread can use that correction instead of treating the earlier interpretation as unquestioned truth.',
        },
        {
          question: 'Do I need to open my email every time I sign in?',
          answer: 'No. After the account is verified, you can add a passkey and use a supported device authentication method such as Face ID, Touch ID, Windows Hello, or your device lock. Email remains available for verification and recovery.',
        },
        {
          question: 'What happens to my plan if a payment fails or I cancel?',
          answer: 'Free remains available without a card. Sovereign+ stays active while the paid subscription is active. If paid access ends, your account stays open and returns to Free.',
        },
        {
          question: 'Can I report an accuracy, privacy, or safety problem?',
          answer: 'Yes. Use the correction controls beneath an ordinary answer or contact <a href="mailto:info@sovereign.defrag.app">Sovereign.OS</a>. Do not include passwords, API keys, exact private location, or another person\'s private information.',
        },
      ],
    },
    {
      kicker: 'PLANS + SUPPORT',
      questions: [
        {
          question: 'What does Free include?',
          answer: 'Free includes your complete private Baseline, self exploration, Today and temporary current context, fit corrections, and 10 Sovereign AI turns each month. It is permanent and requires no card.',
        },
        {
          question: 'What does Sovereign+ include?',
          answer: 'Sovereign+ adds 300 monthly turns, permission-based relationship comparisons, family and team Systems, Library continuity, and contextual Covenant exploration. It costs $20 monthly or $99 annually.',
        },
        {
          question: 'What is Covenant?',
          answer: 'Covenant is an optional Sovereign+ lens for exploring a relevant personal, relationship, or family situation through Christian teaching and clearly cited Scripture. It appears only when you choose it and does not replace the ordinary Sovereign answer.',
        },
        {
          question: 'Can I support Sovereign.OS without subscribing?',
          answer: 'Yes. <a href="https://donate.stripe.com/dRm6oG61T2KSaAhdjO67S02" target="_blank" rel="noopener noreferrer">Support Sovereign.OS</a> with any one-time amount from $1. Support is separate from Free and Sovereign+, is not presented as tax-deductible, and does not unlock paid features or change your plan.',
        },
      ],
    },
    {
      kicker: 'SAFETY',
      questions: [
        {
          question: 'What happens when a message may indicate immediate danger?',
          answer: 'Sovereign pauses ordinary interpretation and gives a direct, human-support-first response. It does not turn that moment into an upgrade prompt.',
        },
        {
          question: 'Does safety depend on my plan?',
          answer: 'No. Safety responses are available on every plan and do not use one of your monthly Sovereign AI turns.',
        },
      ],
    },
  ],
};

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={`faq-section ${className ?? ''}`}>{children}</section>;
}

function FAQCategory({ kicker, questions }: { kicker: string; questions: { question: string; answer: string }[] }) {
  return (
    <div className="faq-category">
      <p className="faq-kicker">{kicker}</p>
      <div className="faq-list">
        {questions.map((item, index) => (
          <details key={index} open={index === 0}>
            <summary>{item.question}</summary>
            <div dangerouslySetInnerHTML={{ __html: item.answer }} />
          </details>
        ))}
      </div>
    </div>
  );
}

function FAQSectionWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={`faq-section ${className ?? ''}`}>{children}</section>;
}

export function PublicFAQ() {
  return (
    <main className="faq-page public-page" data-visual-contract="founder-v0-static" data-route-cohesion="v1">
      <header className="public-nav">
        <div className="public-nav-inner">
          <a className="public-wordmark" href="/" aria-label="Sovereign.OS home">
            <BrandMark />
          </a>
          <nav className="public-nav-links" aria-label="Public navigation">
            <a href="/how-it-works">How it works</a>
            <a href="/pricing">Pricing</a>
            <a href="/faq" aria-current="page">FAQ</a>
          </nav>
          <div className="public-nav-actions">
            <a className="public-sign-in" href="/login">Sign in</a>
            <a className="public-cta" href="/signup">Get started <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </header>

      <main>
        <section className="faq-hero">
          <p className="faq-kicker">{FAQ_CONTENT.hero.kicker}</p>
          <h1>{FAQ_CONTENT.hero.title}</h1>
          <p>{FAQ_CONTENT.hero.subtitle}</p>
        </section>

{FAQ_CONTENT.categories.map((category, index) => (
          <FAQSectionWrapper key={index}>
            <FAQCategory kicker={category.kicker} questions={category.questions} />
          </FAQSectionWrapper>
        ))}

        <FAQSectionWrapper className="faq-cta">
          <div className="launch-callout">
            <div>
              <p className="faq-kicker">START FREE</p>
              <h2>Start with yourself.</h2>
              <p>Know yourself. Understand your people. See the whole system. Build your Baseline, explore what fits, and bring other people in only with permission.</p>
            </div>
            <a className="public-cta" href="/signup">Build your Baseline <span aria-hidden="true">→</span></a>
          </div>
        </FAQSectionWrapper>
      </main>

      <footer className="public-footer">
        <div className="public-footer-inner">
          <a className="public-footer-wordmark" href="/"><BrandMark /></a>
          <nav aria-label="Footer navigation">
            <a href="/how-it-works">How it works</a>
            <a href="/pricing">Pricing</a>
            <a href="/faq">FAQ</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/pricing#support">Support</a>
          </nav>
          <p>© 2026 Sovereign.OS</p>
        </div>
      </footer>
    </main>
  );
}

function FAQSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={`faq-section ${className ?? ''}`}>{children}</section>;
}

