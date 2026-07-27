import { useEffect, useMemo, useRef, useState } from 'react';

type Json = Record<string, any>;

export function SystemMembershipManager() {
  const [open, setOpen] = useState(false);
  const [systems, setSystems] = useState<Json[]>([]);
  const [people, setPeople] = useState<Json[]>([]);
  const [systemId, setSystemId] = useState('');
  const [personId, setPersonId] = useState('');
  const [role, setRole] = useState('member');
  const [authority, setAuthority] = useState('none assumed');
  const [responsibility, setResponsibility] = useState('shared objective');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  async function api(path: string, init: RequestInit = {}) {
    const response = await fetch(path, {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(init.method && init.method !== 'GET' ? { 'x-idempotency-key': crypto.randomUUID() } : {}),
        ...(init.headers ?? {})
      }
    });
    const body = await response.json().catch(() => ({})) as Json;
    if (!response.ok) throw new Error(body.message || body.error || 'That request could not be completed.');
    return body;
  }

  async function refresh() {
    setLoading(true);
    try {
      const [systemData, peopleData] = await Promise.all([api('/api/v1/systems'), api('/api/v1/people')]);
      const nextSystems = systemData.systems ?? [];
      const nextPeople = peopleData.people ?? [];
      setSystems(nextSystems);
      setPeople(nextPeople);
      setSystemId((current) => current || nextSystems[0]?.id || '');
      setStatus('');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'System membership is unavailable.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (open) void refresh(); }, [open]);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const focusable = (): HTMLElement[] => Array.from(dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), select:not([disabled]), input:not([disabled]), a[href]') ?? []);
    focusable()[0]?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keydown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', keydown);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [open]);

  const selectedSystem = systems.find((system) => system.id === systemId) ?? null;
  const eligible = useMemo(() => people.filter((person) => person.identityBound === true && Array.isArray(person.activeScopes) && person.activeScopes.includes('system.include')), [people]);
  const existingIds = new Set((Array.isArray(selectedSystem?.members) ? selectedSystem.members : []).map((member: Json) => member.personId));
  const available = eligible.filter((person) => !existingIds.has(person.id));

  async function addMember() {
    if (!systemId || !personId || loading) return;
    const person = people.find((item) => item.id === personId);
    if (!window.confirm(`Add ${person?.displayName ?? 'this person'} to ${selectedSystem?.name ?? 'this system'} using their active permission?`)) return;
    setLoading(true);
    setStatus('Adding permitted member…');
    try {
      await api(`/api/v1/systems/${encodeURIComponent(systemId)}/members`, {
        method: 'POST',
        body: JSON.stringify({
          personId,
          metadata: {
            formalRole: role,
            authority,
            responsibility,
            constraints: []
          }
        })
      });
      setPersonId('');
      setStatus('Member added with active consent.');
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'That person could not be added.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button ref={triggerRef} className="system-membership-trigger" onClick={() => setOpen(true)}>System members</button>
      {open && (
        <div className="system-membership-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <section ref={dialogRef} className="system-membership-dialog" role="dialog" aria-modal="true" aria-labelledby="system-membership-title">
            <header><div><p>SYSTEM MEMBERSHIP</p><h2 id="system-membership-title">Add only permitted people.</h2></div><button onClick={() => setOpen(false)} aria-label="Close system membership">×</button></header>
            <p className="system-membership-intro">A person appears in a system only while their identity is connected and their <strong>Include in a system</strong> permission remains active.</p>
            <label>System<select value={systemId} onChange={(event) => { setSystemId(event.target.value); setPersonId(''); }}><option value="">Choose a system</option>{systems.map((system) => <option key={system.id} value={system.id}>{system.name}</option>)}</select></label>
            {selectedSystem && <section className="current-system-members"><span>CURRENT MEMBERS</span>{(Array.isArray(selectedSystem.members) ? selectedSystem.members : []).length === 0 ? <p>No permitted members have been added yet.</p> : (selectedSystem.members as Json[]).map((member) => <article key={member.personId}><strong>{member.displayName}</strong><small>{member.roleLabel ?? 'member'} · consent active</small></article>)}</section>}
            <label>Permitted person<select value={personId} onChange={(event) => setPersonId(event.target.value)} disabled={!systemId}><option value="">Choose a person</option>{available.map((person) => <option key={person.id} value={person.id}>{person.displayName}</option>)}</select></label>
            <label>Role in this system<select value={role} onChange={(event) => setRole(event.target.value)}><option value="member">Member</option><option value="parent">Parent</option><option value="partner">Partner</option><option value="child">Child</option><option value="caregiver">Caregiver</option><option value="leader">Leader</option><option value="teammate">Teammate</option></select></label>
            <label>Authority<select value={authority} onChange={(event) => setAuthority(event.target.value)}><option value="none assumed">None assumed</option><option value="shared">Shared</option><option value="formal decision authority">Formal decision authority</option><option value="caregiving authority">Caregiving authority</option><option value="informal influence">Informal influence</option></select></label>
            <label>Responsibility<select value={responsibility} onChange={(event) => setResponsibility(event.target.value)}><option value="shared objective">Shared objective</option><option value="individual contribution">Individual contribution</option><option value="primary responsibility">Primary responsibility</option><option value="supporting responsibility">Supporting responsibility</option><option value="not established">Not established</option></select></label>
            <button className="system-membership-primary" disabled={!systemId || !personId || loading} onClick={() => void addMember()}>Add permitted member</button>
            <p className="system-membership-status" role="status" aria-live="polite">{status || (available.length === 0 && systemId ? 'No additional connected people currently allow system inclusion.' : '')}</p>
          </section>
        </div>
      )}
    </>
  );
}
