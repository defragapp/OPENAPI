import { useEffect, useMemo, useState } from 'react';

type Json = Record<string, any>;

export function SystemMembershipManager() {
  const [open, setOpen] = useState(false);
  const [systems, setSystems] = useState<Json[]>([]);
  const [people, setPeople] = useState<Json[]>([]);
  const [systemId, setSystemId] = useState('');
  const [personId, setPersonId] = useState('');
  const [role, setRole] = useState('member');
  const [responsibility, setResponsibility] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

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
    if (!response.ok) {
      if (response.status === 403) throw new Error('That person cannot be added to this system right now.');
      if (response.status === 404) throw new Error('That person or system is no longer available.');
      if (response.status === 409) throw new Error('That membership changed before this request finished. Refresh and try again.');
      if (response.status === 429) throw new Error('Too many requests. Wait a moment and try again.');
      if (response.status >= 500) throw new Error('Sovereign.OS could not update this system. Try again in a moment.');
      throw new Error('That request could not be completed.');
    }
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
      setStatus(error instanceof Error ? error.message : 'System members are temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) void refresh();
  }, [open]);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener('sovereign:open-system-membership', show);
    return () => window.removeEventListener('sovereign:open-system-membership', show);
  }, []);

  const selectedSystem = systems.find((system) => system.id === systemId) ?? null;
  const eligible = useMemo(() => people.filter((person) =>
    person.identityBound === true && Array.isArray(person.activeScopes) && person.activeScopes.includes('system.include')
  ), [people]);
  const existingIds = new Set((Array.isArray(selectedSystem?.members) ? selectedSystem.members : []).map((member: Json) => member.personId));
  const available = eligible.filter((person) => !existingIds.has(person.id));

  async function addMember() {
    if (!systemId || !personId || loading) return;
    const person = people.find((item) => item.id === personId);
    if (!window.confirm(`Add ${person?.displayName ?? 'this person'} to ${selectedSystem?.name ?? 'this system'}? They can be included only while their sharing choice allows it.`)) return;
    setLoading(true);
    setStatus('Adding this person…');
    try {
      await api(`/api/v1/systems/${encodeURIComponent(systemId)}/members`, {
        method: 'POST',
        body: JSON.stringify({
          personId,
          metadata: {
            formalRole: role,
            ...(responsibility.trim() ? { responsibility: responsibility.trim() } : {}),
            constraints: []
          }
        })
      });
      setPersonId('');
      setResponsibility('');
      setStatus('Person added to this system.');
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'That person could not be added.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button className="system-membership-trigger" onClick={() => setOpen(true)}>System members</button>
      {open && (
        <div className="system-membership-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <section className="system-membership-dialog" role="dialog" aria-modal="true" aria-labelledby="system-membership-title">
            <header>
              <div><p>SYSTEM MEMBERS</p><h2 id="system-membership-title">Choose who belongs in this system.</h2></div>
              <button onClick={() => setOpen(false)} aria-label="Close system members">×</button>
            </header>
            <p className="system-membership-intro">A person can appear here only after they connect their own account and choose to allow <strong>Include in a system</strong>. If they change that choice later, future use follows the new choice.</p>
            <label>System<select value={systemId} onChange={(event) => { setSystemId(event.target.value); setPersonId(''); }}><option value="">Choose a system</option>{systems.map((system) => <option key={system.id} value={system.id}>{system.name}</option>)}</select></label>
            {selectedSystem && (
              <section className="current-system-members">
                <span>PEOPLE IN THIS SYSTEM</span>
                {(Array.isArray(selectedSystem.members) ? selectedSystem.members : []).length === 0
                  ? <p>No one has been added yet.</p>
                  : (selectedSystem.members as Json[]).map((member) => <article key={member.personId}><strong>{member.displayName}</strong><small>{member.roleLabel ?? 'Member'}</small></article>)}
              </section>
            )}
            <label>Person<select value={personId} onChange={(event) => setPersonId(event.target.value)} disabled={!systemId}><option value="">Choose a person</option>{available.map((person) => <option key={person.id} value={person.id}>{person.displayName}</option>)}</select></label>
            <label>Role in this system<select value={role} onChange={(event) => setRole(event.target.value)}><option value="member">Member</option><option value="parent">Parent</option><option value="partner">Partner</option><option value="child">Child</option><option value="caregiver">Caregiver</option><option value="leader">Leader</option><option value="teammate">Teammate</option></select></label>
            <label>Responsibility in this system · optional<input value={responsibility} onChange={(event) => setResponsibility(event.target.value)} placeholder="Only add what is actually known" /></label>
            <button className="system-membership-primary" disabled={!systemId || !personId || loading} onClick={() => void addMember()}>Add person</button>
            <p className="system-membership-status" role="status" aria-live="polite">{status || (available.length === 0 && systemId ? 'No additional connected people currently allow system inclusion.' : '')}</p>
          </section>
        </div>
      )}
    </>
  );
}