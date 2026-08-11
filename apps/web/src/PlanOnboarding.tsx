import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

type Plan = 'free' | 'sovereign_plus';
type BillingInterval = 'monthly' | 'annual';
type JourneyPhase = 'loading' | 'baseline' | 'baseline_building' | 'baseline_result' | 'plan' | 'error';
type BaselineStage = 'idle' | 'validating' | 'calculating' | 'complete';
type BirthTimeCertainty = 'exact' | 'approximate' | 'unknown';
type BaselineField =
  | 'birthDate'
  | 'birthplaceCity'
  | 'birthplaceCountry'
  | 'birthTimezone'
  | 'timezoneConfirmed'
  | 'birthTime';

type BaselineStatus = {
  status?: string;
  ready?: boolean;
  readinessState?: string;
  readinessMessage?: string;
  nextAction?: string;
  uncertainty?: string;
  providerStatus?: string;
  facetProfileStatus?: string;
  reducedContext?: Record<string, unknown>;
  provenance?: Record<string, unknown>;
};

type OnboardingStatus = {
  completed?: boolean;
  planIntent?: Plan;
  effectivePlan?: Plan;
};

type BaselineForm = {
  birthDate: string;
  birthplaceCity: string;
  birthplaceRegion: string;
  birthplaceCountry: string;
  birthTimezone: string;
  timezoneConfirmed: boolean;
  birthTimeCertainty: BirthTimeCertainty;
  birthTime: string;
};

type BaselineErrors = Record<BaselineField, string>;

const emptyErrors = (): BaselineErrors => ({
  birthDate: '',
  birthplaceCity: '',
  birthplaceCountry: '',
  birthTimezone: '',
  timezoneConfirmed: '',
  birthTime: ''
});

const baselineStages = [
  'Checking time and place',
  'Calculating source positions',
  'Translating the result',
  'Preparing your first overview'
] as const;

export function PlanOnboarding() {
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [currentPlan, setCurrentPlan] = useState<Plan>('free');
  const [accountAlreadyOnboarded, setAccountAlreadyOnboarded] = useState(false);
  const [phase, setPhase] = useState<JourneyPhase>('loading');
  const [status, setStatus] = useState('Loading your account…');
  const [baselineStage, setBaselineStage] = useState<BaselineStage>('idle');
  const [baseline, setBaseline] = useState<BaselineStatus | null>(null);
  const [errors, setErrors] = useState<BaselineErrors>(emptyErrors);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutUnavailable, setCheckoutUnavailable] = useState(false);
  const [showBaselineReview, setShowBaselineReview] = useState(false);
  const [form, setForm] = useState<BaselineForm>({
    birthDate: '',
    birthplaceCity: '',
    birthplaceRegion: '',
    birthplaceCountry: '',
    birthTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    timezoneConfirmed: false,
    birthTimeCertainty: 'unknown',
    birthTime: ''
  });
  const timeZones = useMemo(() => supportedTimeZones(), []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadJourney() {
      setPhase('loading');
      setStatus('Loading your account…');
      try {
        const [onboardingResponse, baselineResponse] = await Promise.all([
          fetch('/api/v1/account/onboarding', {
            credentials: 'same-origin',
            cache: 'no-store',
            headers: { accept: 'application/json' },
            signal: controller.signal
          }),
          fetch('/api/v1/baseline/status', {
            credentials: 'same-origin',
            cache: 'no-store',
            headers: { accept: 'application/json' },
            signal: controller.signal
          })
        ]);

        if (onboardingResponse.status === 401 || baselineResponse.status === 401) {
          location.replace('/login?returnTo=%2Fonboarding');
          return;
        }
        if (!onboardingResponse.ok || !baselineResponse.ok) {
          throw new Error('Your account setup is temporarily unavailable.');
        }

        const onboardingBody = await onboardingResponse.json() as OnboardingStatus;
        const baselineBody = await baselineResponse.json() as { baseline?: BaselineStatus };
        const nextBaseline = baselineBody.baseline ?? { status: 'not_started' };
        const effectivePlan: Plan = onboardingBody.effectivePlan === 'sovereign_plus' ? 'sovereign_plus' : 'free';
        const completed = onboardingBody.completed === true;

        setCurrentPlan(effectivePlan);
        setAccountAlreadyOnboarded(completed);
        setBaseline(nextBaseline);

        if (baselineIsReady(nextBaseline)) {
          if (completed) {
            location.replace('/app');
            return;
          }
          if (effectivePlan === 'sovereign_plus') {
            setStatus('Opening your Sovereign+ workspace…');
            await completeOnboarding('sovereign_plus', controller.signal);
            location.replace('/app');
            return;
          }
          setPhase('plan');
          setStatus(new URLSearchParams(location.search).get('billing') === 'cancelled'
            ? 'Stripe checkout was cancelled. Nothing changed. Continue with Free or try again.'
            : 'Choose how you want to continue.');
          return;
        }

        setPhase('baseline');
        setStatus(nextBaseline.readinessMessage || 'Add the birth details you know.');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setPhase('error');
        setStatus(error instanceof Error ? error.message : 'Your account setup is temporarily unavailable.');
      }
    }

    void loadJourney();
    return () => controller.abort();
  }, []);

  async function submitBaseline(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validateBaseline(form);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      setStatus('Review the highlighted Baseline details.');
      return;
    }

    setSubmitting(true);
    setPhase('baseline_building');
    setBaselineStage('validating');
    setStatus('Checking time and place…');

    try {
      const birthplace = [form.birthplaceCity, form.birthplaceRegion, form.birthplaceCountry]
        .map((value) => value.trim())
        .filter(Boolean)
        .join(', ');
      const payload = {
        birthDate: form.birthDate,
        birthplace,
        birthTimezone: form.birthTimezone.trim(),
        birthTimeCertainty: form.birthTimeCertainty,
        ...(form.birthTimeCertainty === 'unknown' ? {} : { birthTime: form.birthTime }),
        locationPrecision: 'city_or_regional' as const
      };

      setBaselineStage('calculating');
      setStatus('Calculating source positions and translating the result…');
      const response = await fetch('/api/v1/baseline/onboarding', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'content-type': 'application/json',
          'x-idempotency-key': crypto.randomUUID()
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        location.replace('/login?returnTo=%2Fonboarding');
        return;
      }
      const body = await response.json().catch(() => ({})) as { baseline?: BaselineStatus; error?: string; message?: string };
      if (!response.ok || !body.baseline) {
        throw new Error(body.message || body.error || 'Your Baseline could not be completed yet.');
      }

      setBaseline(body.baseline);
      if (!baselineIsReady(body.baseline)) {
        setPhase('baseline');
        setBaselineStage('idle');
        setStatus(body.baseline.readinessMessage || body.message || 'Your source data is saved, but the facet profile is not ready yet. Try Baseline again.');
        return;
      }

      setBaselineStage('complete');

      if (accountAlreadyOnboarded) {
        setStatus('Your Baseline is ready. Opening your workspace…');
        location.replace('/app');
        return;
      }
      if (currentPlan === 'sovereign_plus') {
        setStatus('Your Baseline is ready. Opening your Sovereign+ workspace…');
        await completeOnboarding('sovereign_plus');
        location.replace('/app');
        return;
      }

      setPhase('baseline_result');
      setStatus('Your Baseline is ready.');
    } catch (error) {
      setPhase('baseline');
      setBaselineStage('idle');
      setStatus(error instanceof Error ? error.message : 'Your Baseline could not be completed yet.');
    } finally {
      setSubmitting(false);
    }
  }

  async function confirm(plan: Plan) {
    if (submitting) return;
    setSubmitting(true);
    setCheckoutUnavailable(false);
    setStatus(plan === 'free' ? 'Opening your Free workspace…' : 'Preparing secure Stripe checkout…');

    try {
      if (plan === 'free') {
        await completeOnboarding('free');
        location.assign('/app');
        return;
      }

      const checkout = await fetch('/api/v1/billing/checkout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'content-type': 'application/json',
          'x-idempotency-key': crypto.randomUUID()
        },
        body: JSON.stringify({ interval })
      });
      const data = await checkout.json().catch(() => ({})) as { checkout?: { url?: string }; error?: string };
      if (!checkout.ok || !data.checkout?.url) {
        setCheckoutUnavailable(true);
        setStatus(data.error || 'Secure checkout is temporarily unavailable. You can continue with Free and upgrade later.');
        return;
      }

      setStatus('Opening secure Stripe checkout…');
      location.assign(data.checkout.url);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'That plan could not be confirmed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function completeOnboarding(plan: Plan, signal?: AbortSignal) {
    const response = await fetch('/api/v1/account/onboarding', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'content-type': 'application/json',
        'x-idempotency-key': crypto.randomUUID()
      },
      body: JSON.stringify({ plan }),
      ...(signal ? { signal } : {})
    });
    if (response.status === 401) {
      location.replace('/login?returnTo=%2Fonboarding');
      throw new Error('Sign-in required.');
    }
    if (!response.ok) {
      const body = await response.json().catch(() => ({})) as { error?: string; message?: string };
      throw new Error(body.message || body.error || 'That plan could not be confirmed. Please try again.');
    }
  }

  const progress = progressState(phase);

  return (
    <main className="plan-onboarding" data-onboarding-phase={phase}>
      <header className="plan-nav">
        <a href="https://sovereign.defrag.app">SOVEREIGN.OS</a>
        <span>{phase === 'plan' ? 'Choose a plan' : phase === 'baseline_result' ? 'Baseline ready' : 'Build your Baseline'}</span>
      </header>

      <div className="plan-layout">
        <section className="plan-choice">
          <ol className="onboarding-progress" aria-label="Account setup progress">
            <ProgressItem number="1" label="Account" state="complete" />
            <ProgressItem number="2" label="Baseline" state={progress.baseline} />
            <ProgressItem number="3" label="Plan" state={progress.plan} />
            <ProgressItem number="4" label="Workspace" state={progress.workspace} />
          </ol>

          {phase === 'loading' && <JourneyMessage eyebrow="ACCOUNT SETUP" title="Preparing your private account." body={status} />}
          {phase === 'error' && (
            <JourneyMessage eyebrow="ACCOUNT SETUP" title="Sovereign.OS could not continue yet." body={status}>
              <button className="primary-button" type="button" onClick={() => location.reload()}>Try again</button>
            </JourneyMessage>
          )}
          {phase === 'baseline' && (
            <BaselineFormView
              form={form}
              errors={errors}
              timeZones={timeZones}
              submitting={submitting}
              notice={baseline && !baselineIsReady(baseline) ? status : undefined}
              onSubmit={submitBaseline}
              onUpdate={(field, value) => {
                setForm((current) => ({ ...current, [field]: value }));
                if (field !== 'birthplaceRegion') {
                  setErrors((current) => ({ ...current, [field]: '' }));
                }
              }}
              onCertainty={(certainty) => {
                setForm((current) => ({
                  ...current,
                  birthTimeCertainty: certainty,
                  birthTime: certainty === 'unknown' ? '' : current.birthTime
                }));
                setErrors((current) => ({ ...current, birthTime: '' }));
              }}
              onTimezoneConfirmed={(confirmed) => {
                setForm((current) => ({ ...current, timezoneConfirmed: confirmed }));
                setErrors((current) => ({ ...current, timezoneConfirmed: '' }));
              }}
            />
          )}
          {phase === 'baseline_building' && <BaselineBuildingView stage={baselineStage} status={status} />}
          {phase === 'baseline_result' && baseline && (
            <BaselineResultView
              baseline={baseline}
              certainty={form.birthTimeCertainty}
              reviewOpen={showBaselineReview}
              onToggleReview={() => setShowBaselineReview((value) => !value)}
              onContinue={() => {
                setPhase('plan');
                setStatus('Choose how you want to continue.');
              }}
            />
          )}
          {phase === 'plan' && (
            <PlanChoiceView
              interval={interval}
              currentPlan={currentPlan}
              status={status}
              submitting={submitting}
              checkoutUnavailable={checkoutUnavailable}
              onInterval={setInterval}
              onConfirm={(plan) => void confirm(plan)}
            />
          )}
        </section>

        <aside className="plan-visual" aria-label="Why your Baseline comes first">
          <div className="onboarding-baseline-preview">
            <span>YOUR BASELINE</span>
            <h2>A living reference for the questions that matter.</h2>
            <p>Begin with what remains steady. Add current, relationship, or system context only when it belongs.</p>
            <div><strong>Plain-language understanding</strong><small>Exact approved Basis remains available beneath it.</small></div>
          </div>
          <p>Your Baseline stays beneath every exploration. Plan selection changes access, not who you are.</p>
        </aside>
      </div>
    </main>
  );
}

function BaselineFormView({
  form,
  errors,
  timeZones,
  submitting,
  notice,
  onSubmit,
  onUpdate,
  onCertainty,
  onTimezoneConfirmed
}: {
  form: BaselineForm;
  errors: BaselineErrors;
  timeZones: string[];
  submitting: boolean;
  notice: string | undefined;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdate: <K extends keyof BaselineForm>(field: K, value: BaselineForm[K]) => void;
  onCertainty: (certainty: BirthTimeCertainty) => void;
  onTimezoneConfirmed: (confirmed: boolean) => void;
}) {
  return (
    <>
      <p className="eyebrow">BUILD YOUR BASELINE</p>
      <h1>Create the personal foundation Sovereign uses.</h1>
      <p className="plan-intro">Add the birth details you know. Sovereign.OS uses them to calculate your Baseline, then translates the result into plain language you can explore and correct.</p>
      {notice && <p className="plan-status baseline-retry-status" role="status" aria-live="polite">{notice}</p>}

      <form className="baseline-onboarding-form" onSubmit={onSubmit} noValidate>
        <div className="baseline-form-grid">
          <Field label="Birth date" error={errors.birthDate} errorId="baseline-birth-date-error">
            <input
              name="birthDate"
              type="date"
              value={form.birthDate}
              max={localDateToday()}
              onChange={(event) => onUpdate('birthDate', event.target.value)}
              aria-invalid={Boolean(errors.birthDate)}
              aria-describedby={errors.birthDate ? 'baseline-birth-date-error' : undefined}
              required
            />
          </Field>
          <Field label="Birthplace city" error={errors.birthplaceCity} errorId="baseline-birthplace-city-error">
            <input
              name="birthplaceCity"
              value={form.birthplaceCity}
              autoComplete="address-level2"
              onChange={(event) => onUpdate('birthplaceCity', event.target.value)}
              aria-invalid={Boolean(errors.birthplaceCity)}
              aria-describedby={errors.birthplaceCity ? 'baseline-birthplace-city-error' : undefined}
              required
            />
          </Field>
          <Field label="Region or state" error="" errorId="baseline-birthplace-region-error">
            <input
              name="birthplaceRegion"
              value={form.birthplaceRegion}
              autoComplete="address-level1"
              onChange={(event) => onUpdate('birthplaceRegion', event.target.value)}
              placeholder="Optional when not applicable"
            />
          </Field>
          <Field label="Birthplace country" error={errors.birthplaceCountry} errorId="baseline-birthplace-country-error">
            <input
              name="birthplaceCountry"
              value={form.birthplaceCountry}
              autoComplete="country-name"
              onChange={(event) => onUpdate('birthplaceCountry', event.target.value)}
              aria-invalid={Boolean(errors.birthplaceCountry)}
              aria-describedby={errors.birthplaceCountry ? 'baseline-birthplace-country-error' : undefined}
              required
            />
          </Field>
          <Field label="Birthplace timezone" error={errors.birthTimezone} errorId="baseline-birth-timezone-error">
            <input
              name="birthTimezone"
              type="search"
              list="baseline-timezone-options"
              value={form.birthTimezone}
              placeholder="America/Los_Angeles"
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => {
                onUpdate('birthTimezone', event.target.value);
                onTimezoneConfirmed(false);
              }}
              aria-invalid={Boolean(errors.birthTimezone)}
              aria-describedby={errors.birthTimezone ? 'baseline-birth-timezone-error' : 'baseline-timezone-help'}
              required
            />
            <datalist id="baseline-timezone-options">
              {timeZones.map((timeZone) => <option value={timeZone} key={timeZone}>{timeZone.replaceAll('_', ' ')}</option>)}
            </datalist>
            <small id="baseline-timezone-help">Use the historical timezone that applied at the birthplace on the birth date.</small>
          </Field>
        </div>

        <label className={`baseline-timezone-confirmation ${errors.timezoneConfirmed ? 'has-error' : ''}`}>
          <input
            type="checkbox"
            checked={form.timezoneConfirmed}
            onChange={(event) => onTimezoneConfirmed(event.target.checked)}
            aria-invalid={Boolean(errors.timezoneConfirmed)}
            aria-describedby={errors.timezoneConfirmed ? 'baseline-timezone-confirmation-error' : undefined}
          />
          <span>
            <strong>I confirm this timezone for the birthplace and date.</strong>
            <small>Sovereign does not silently replace an unconfirmed timezone.</small>
            {errors.timezoneConfirmed && <small id="baseline-timezone-confirmation-error" className="field-error">{errors.timezoneConfirmed}</small>}
          </span>
        </label>

        <fieldset className="baseline-certainty-fieldset">
          <legend>How certain is the birth time?</legend>
          <div className="baseline-choice-row">
            {(['exact', 'approximate', 'unknown'] as const).map((certainty) => (
              <label key={certainty}>
                <input
                  type="radio"
                  name="birthTimeCertainty"
                  value={certainty}
                  checked={form.birthTimeCertainty === certainty}
                  onChange={() => onCertainty(certainty)}
                />
                <span>{certainty === 'exact' ? 'Exact' : certainty === 'approximate' ? 'Approximate' : 'Unknown'}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {form.birthTimeCertainty !== 'unknown' && (
          <Field label={form.birthTimeCertainty === 'exact' ? 'Birth time' : 'Approximate birth time'} error={errors.birthTime} errorId="baseline-birth-time-error">
            <input
              name="birthTime"
              type="time"
              value={form.birthTime}
              onChange={(event) => onUpdate('birthTime', event.target.value)}
              aria-invalid={Boolean(errors.birthTime)}
              aria-describedby={errors.birthTime ? 'baseline-birth-time-error' : undefined}
              required
            />
          </Field>
        )}

        {form.birthTimeCertainty === 'unknown' && (
          <p className="baseline-limited-note">You can continue without a birth time. Time-dependent details will remain visibly limited rather than being guessed.</p>
        )}

        <p className="baseline-current-location-note">Current conditions stay separate from your birth data. City-level current location can be enabled later from You and is never required to build a Baseline.</p>
        <p className="baseline-privacy-boundary">Raw birth details and exact private location are not sent to the language model. Sovereign receives only the reduced themes needed for an exploration.</p>
        <button className="primary-button" type="submit" disabled={submitting}>Build my Baseline</button>
      </form>
    </>
  );
}

function BaselineBuildingView({ stage, status }: { stage: BaselineStage; status: string }) {
  return (
    <section className="baseline-building-state" role="status" aria-live="polite">
      <p className="eyebrow">BUILDING YOUR BASELINE</p>
      <h1>Turning source data into something you can use.</h1>
      <div className="baseline-progress-light" aria-hidden="true"><i /></div>
      <ol>
        {baselineStages.map((label, index) => (
          <li className={stageState(stage, index)} key={label}><span>{index + 1}</span><strong>{label}</strong></li>
        ))}
      </ol>
      <p>{status}</p>
    </section>
  );
}

function BaselineResultView({ baseline, certainty, reviewOpen, onToggleReview, onContinue }: {
  baseline: BaselineStatus;
  certainty: BirthTimeCertainty;
  reviewOpen: boolean;
  onToggleReview: () => void;
  onContinue: () => void;
}) {
  return (
    <section className="baseline-result-state">
      <p className="eyebrow">YOUR BASELINE IS READY</p>
      <h1>Your Baseline is ready.</h1>
      <p className="plan-intro">Your exact source and validated plain-language facet profile are ready beneath every question, relationship, and system you choose to explore.</p>
      <div className="baseline-result-summary">
        <div><span>Result</span><strong>Source and facets validated</strong></div>
        <div><span>Birth-time certainty</span><strong>{certainty}</strong></div>
        <div><span>Interpretive uncertainty</span><strong>{baseline.uncertainty ?? 'stated in context'}</strong></div>
      </div>
      {reviewOpen && (
        <div className="baseline-review" role="region" aria-label="Baseline availability">
          <h2>What is available now</h2>
          <p>Stable Baseline themes, exact approved Basis values, and visible uncertainty can now be used in the workspace. Current conditions remain separate and permission-based.</p>
        </div>
      )}
      <div className="baseline-result-actions">
        <button className="primary-button" type="button" onClick={onContinue}>Continue</button>
        <button type="button" onClick={onToggleReview}>{reviewOpen ? 'Hide review' : 'Review my Baseline'}</button>
      </div>
    </section>
  );
}

function PlanChoiceView({ interval, currentPlan, status, submitting, checkoutUnavailable, onInterval, onConfirm }: {
  interval: BillingInterval;
  currentPlan: Plan;
  status: string;
  submitting: boolean;
  checkoutUnavailable: boolean;
  onInterval: (interval: BillingInterval) => void;
  onConfirm: (plan: Plan) => void;
}) {
  return (
    <>
      <p className="eyebrow">CHOOSE HOW TO CONTINUE</p>
      <h1>Keep your personal Baseline free. Add the wider system when you need it.</h1>
      <p className="plan-intro">Free is an ongoing plan, not a trial. Sovereign+ adds permission-based relationships, systems, and longer continuity.</p>

      <div className="onboarding-plan-grid">
        <article className={currentPlan === 'free' ? 'current' : ''}>
          <header><span>FREE</span><strong>$0</strong></header>
          <h2>Your personal foundation.</h2>
          <p>Use your private Baseline across Today, Explore, Shadow and Gift, Alignment, decisions, and behavior.</p>
          <ul>
            <li>Complete private Baseline Design</li>
            <li>Today and Explore</li>
            <li>10 Sovereign responses each UTC month</li>
            <li>Correction controls and active-retention history</li>
          </ul>
          <button className="primary-button" type="button" disabled={submitting} onClick={() => onConfirm('free')}>Continue with Free</button>
        </article>

        <article className="plus-plan">
          <header><span>SOVEREIGN+</span><strong>{interval === 'annual' ? 'Annual billing' : 'Monthly billing'}</strong></header>
          <h2>Relationships, systems, and continuity.</h2>
          <p>Bring permitted Baselines together and keep the wider human system in view.</p>
          <ul>
            <li>Everything in Free</li>
            <li>People, Systems, Library, and optional Covenant</li>
            <li>300 Sovereign responses each UTC month</li>
            <li>Permission-aware invitations and controls</li>
          </ul>
          <div className="billing-toggle" role="group" aria-label="Billing interval">
            <button type="button" aria-pressed={interval === 'monthly'} className={interval === 'monthly' ? 'active' : ''} onClick={() => onInterval('monthly')}>Monthly billing</button>
            <button type="button" aria-pressed={interval === 'annual'} className={interval === 'annual' ? 'active' : ''} onClick={() => onInterval('annual')}>Annual billing</button>
          </div>
          <p className="annual-value">Stripe checkout shows the current price before you confirm.</p>
          <button className="primary-button" type="button" disabled={submitting} onClick={() => onConfirm('sovereign_plus')}>Choose Sovereign+</button>
        </article>
      </div>
      {checkoutUnavailable && <button className="checkout-free-fallback" type="button" disabled={submitting} onClick={() => onConfirm('free')}>Continue with Free instead</button>}
      <p className="plan-status" role="status" aria-live="polite">{status}</p>
    </>
  );
}

function Field({ label, error, errorId, children }: { label: string; error: string; errorId: string; children: ReactNode }) {
  return (
    <label className={`baseline-field ${error ? 'has-error' : ''}`}>
      <span>{label}</span>
      {children}
      {error && <small id={errorId} className="field-error">{error}</small>}
    </label>
  );
}

function ProgressItem({ number, label, state }: { number: string; label: string; state: 'complete' | 'active' | 'upcoming' }) {
  return <li className={state === 'upcoming' ? '' : state}><span>{number}</span>{label}</li>;
}

function JourneyMessage({ eyebrow, title, body, children }: { eyebrow: string; title: string; body: string; children?: ReactNode }) {
  return (
    <section className="onboarding-message" role="status" aria-live="polite">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="plan-intro">{body}</p>
      {children}
    </section>
  );
}

function validateBaseline(form: BaselineForm): BaselineErrors {
  const errors = emptyErrors();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.birthDate) || form.birthDate > localDateToday()) {
    errors.birthDate = 'Enter a valid birth date that is not in the future.';
  }
  if (form.birthplaceCity.trim().length < 2) errors.birthplaceCity = 'Enter the city of birth.';
  if (form.birthplaceCountry.trim().length < 2) errors.birthplaceCountry = 'Enter the country of birth.';
  if (!isValidTimeZone(form.birthTimezone.trim())) errors.birthTimezone = 'Choose a valid IANA timezone.';
  if (!form.timezoneConfirmed) errors.timezoneConfirmed = 'Confirm the birthplace timezone before continuing.';
  if (form.birthTimeCertainty !== 'unknown' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(form.birthTime)) {
    errors.birthTime = 'Enter the birth time or choose Unknown.';
  }
  return errors;
}

function localDateToday(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

function supportedTimeZones(): string[] {
  const supportedValuesOf = (Intl as unknown as { supportedValuesOf?: (key: 'timeZone') => string[] }).supportedValuesOf;
  const values = supportedValuesOf?.('timeZone');
  if (Array.isArray(values) && values.length > 0) return values;
  return ['UTC', 'America/Los_Angeles', 'America/Denver', 'America/Chicago', 'America/New_York', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney'];
}

function baselineIsReady(baseline: BaselineStatus): boolean {
  return baseline.status === 'completed'
    && baseline.ready === true
    && baseline.facetProfileStatus === 'ready';
}

function progressState(phase: JourneyPhase) {
  if (phase === 'plan') return { baseline: 'complete', plan: 'active', workspace: 'upcoming' } as const;
  if (phase === 'baseline_result') return { baseline: 'complete', plan: 'upcoming', workspace: 'upcoming' } as const;
  if (phase === 'baseline' || phase === 'baseline_building') return { baseline: 'active', plan: 'upcoming', workspace: 'upcoming' } as const;
  return { baseline: 'upcoming', plan: 'upcoming', workspace: 'upcoming' } as const;
}

function stageState(current: BaselineStage, index: number): 'complete' | 'active' | 'upcoming' {
  if (current === 'complete') return 'complete';
  if (current === 'calculating') {
    if (index === 0) return 'complete';
    if (index === 1) return 'active';
    return 'upcoming';
  }
  if (current === 'validating' && index === 0) return 'active';
  return 'upcoming';
}
