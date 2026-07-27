import { useEffect, useMemo, useState } from 'react';

type Json = Record<string, any>;

export function SystemMembershipManager() {
  const [open, setOpen] = useState(false);
  const [systems, setSystems] = useState<Json[]>([]);
  const [people, setPeople] = useState<Json[]>([]);
  const [systemId, setSystemId] = useState('');
  const [personId, setPersonId] = useState('');
  const [role, setRole] = useState('member');
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

  useEffect(() => {
    if (open) void refresh();
  }, [open]);

  const selectedSystem = systems.find((system) => system.id === systemId) ?? null;
  const eligible = useMemo(() => people.filter((person) =>
    person.identityBound === true && Array.isArray(person.activeScopes) && person.activeScopes.includes('system.include')
  ), [people]);
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
            authority: 'none assumed',
            responsibility: 'shared objective',
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
      <button className="system-membership-trigger" onClick={() => setOpen(true)}>System members</button>
      {open && (
        <div className="system-membership-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <section className="system-membership-dialog" role="dialog" aria-modal="true" aria-labelledby="system-membership-title">
            <header>
              <div><p>SYSTEM MEMBERSHIP</p><h2 id="system-membership-title">Add only permitted people.</h2></div>
              <button onClick={() => setOpen(false)} aria-label="Close system membership">×</button>
            </header>
            <p className="system-membership-intro">A person appears in a system only while their identity is connected and their <strong>Include in a system</strong> permission remains active.</p>
            <label>System<select value={systemId} onChange={(event) => { setSystemId(event.target.value); setPersonId(''); }}><option value="">Choose a system</option>{systems.map((system) => <option key={system.id} value={system.id}>{system.name}</option>)}</select></label>
            {selectedSystem && (
              <section className="current-system-members">
                <span>CURRENT MEMBERS</span>
                {(Array.isArray(selectedSystem.members) ? selectedSystem.members : []).length === 0
                  ? <p>No permitted members have been added yet.</p>
                  : (selectedSystem.members as Json[]).map((member) => <article key={member.personId}><strong>{member.displayName}</strong><small>{member.roleLabel ?? 'member'} · consent active</small></article>)}
              </section>
            )}
            <label>Permitted person<select value={personId} onChange={(event) => setPersonId(event.target.value)} disabled={!systemId}><option value="">Choose a person</option>{available.map((person) => <option key={person.id} value={person.id}>{person.displayName}</option>)}</select></label>
            <label>Role in this system<select value={role} onChange={(event) => setRole(event.target.value)}><option value="member">Member</option><option value="parent">Parent</option><option value="partner">Partner</option><option value="child">Child</option><option value="caregiver">Caregiver</option><option value="leader">Leader</option><option value="teammate">Teammate</option></select></label>
            <button className="system-membership-primary" disabled={!systemId || !personId || loading} onClick={() => void addMember()}>Add permitted member</button>
            <p className="system-membership-status" role="status" aria-live="polite">{status || (available.length === 0 && systemId ? 'No additional connected people currently allow system inclusion.' : '')}</p>
          </section>
        </div>
      )}
    </>
  );
}
