import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  usePersonGroups, useGroupMembers,
  useCreatePersonGroup, useUpdatePersonGroup, useDeletePersonGroup,
  useAddGroupMember, useRemoveGroupMember,
} from '../hooks/usePersonGroups'
import { useResidents } from '../hooks/useResidents'
import { useNotableFigures } from '../hooks/useNotableFigures'
import ConfirmModal from '../components/ConfirmModal'
import type { PersonGroup, CreatePersonGroupRequest, PersonGroupMember } from '../types'

// ── Color presets ──────────────────────────────────────────────────────────────

const COLOR_PRESETS = [
  { label: 'Gold',    value: '#c8a020' },
  { label: 'Blue',   value: '#1a3f7a' },
  { label: 'Green',  value: '#1a5c1a' },
  { label: 'Red',    value: '#8b1a1a' },
  { label: 'Purple', value: '#4a1a6a' },
  { label: 'Slate',  value: '#3a4a5c' },
]

function groupColor(color?: string) {
  return color ?? '#3a4a5c'
}

// ── Portrait helpers ───────────────────────────────────────────────────────────

function MemberPortrait({ name, imageUrl }: { name?: string; imageUrl?: string }) {
  const n = name ?? '?'
  const parts = n.trim().split(' ')
  const initials = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : n.slice(0, 2)
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: 'var(--blue-mid)', border: '2px solid var(--gold)',
      overflow: 'hidden', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {imageUrl
        ? <img src={imageUrl} alt={n} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ fontSize: 11, color: 'var(--gold)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{initials.toUpperCase()}</span>
      }
    </div>
  )
}

// ── Group form modal ───────────────────────────────────────────────────────────

interface GroupFormProps {
  initial?: PersonGroup
  onClose: () => void
  onSave: (data: CreatePersonGroupRequest) => void
  saving: boolean
}

function GroupForm({ initial, onClose, onSave, saving }: GroupFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreatePersonGroupRequest>({
    defaultValues: {
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      color: initial?.color ?? '#3a4a5c',
    },
  })
  const watchedColor = watch('color')

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initial ? 'Edit Group' : 'New Group'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="modal-form">
          <div className="form-group">
            <label className="form-label">Group Name *</label>
            <input className="form-input" {...register('name', { required: 'Name is required' })} placeholder="e.g. Council of Six" />
            {errors.name && <span className="form-error">{errors.name.message}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={2} {...register('description')} placeholder="What is this group for?" />
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <input type="hidden" {...register('color')} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {COLOR_PRESETS.map(p => (
                <button
                  key={p.value}
                  type="button"
                  title={p.label}
                  onClick={() => setValue('color', p.value)}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: p.value, border: `3px solid ${watchedColor === p.value ? 'var(--gold)' : 'transparent'}`,
                    cursor: 'pointer', flexShrink: 0,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Add member modal ───────────────────────────────────────────────────────────

interface AddMemberModalProps {
  groupId: number
  existingMembers: PersonGroupMember[]
  onClose: () => void
}

function AddMemberModal({ groupId, existingMembers, onClose }: AddMemberModalProps) {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'residents' | 'figures'>('residents')

  const { data: residents = [] } = useResidents()
  const { data: figures = [] } = useNotableFigures()
  const addMember = useAddGroupMember()

  const existingResidentIds = new Set(existingMembers.map(m => m.residentId).filter(Boolean))
  const existingFigureIds = new Set(existingMembers.map(m => m.notableFigureId).filter(Boolean))

  const term = search.toLowerCase()
  const filteredResidents = residents.filter(r =>
    !existingResidentIds.has(r.id) &&
    (r.name.toLowerCase().includes(term) || (r.role ?? '').toLowerCase().includes(term))
  )
  const filteredFigures = figures.filter(f =>
    !existingFigureIds.has(f.id) &&
    (f.name.toLowerCase().includes(term) || (f.role ?? '').toLowerCase().includes(term))
  )

  const handleAdd = async (residentId?: number, notableFigureId?: number) => {
    await addMember.mutateAsync({ groupId, data: { residentId, notableFigureId } })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Member</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '0 24px 16px' }}>
          <input
            className="search-input"
            style={{ width: '100%', marginBottom: 12 }}
            placeholder="Search by name or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              className={`chip ${tab === 'residents' ? 'chip-active' : ''}`}
              onClick={() => setTab('residents')}
            >
              Residents ({filteredResidents.length})
            </button>
            <button
              className={`chip ${tab === 'figures' ? 'chip-active' : ''}`}
              onClick={() => setTab('figures')}
            >
              Notable Figures ({filteredFigures.length})
            </button>
          </div>

          <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {tab === 'residents' && (
              filteredResidents.length === 0
                ? <p style={{ color: 'var(--ink-muted)', fontStyle: 'italic', padding: '12px 0' }}>No residents to add.</p>
                : filteredResidents.map(r => (
                    <div key={r.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px', borderRadius: 6,
                      background: 'var(--blue-pale)', border: '1px solid var(--border)',
                    }}>
                      <MemberPortrait name={r.name} imageUrl={r.imageUrl} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 13 }}>{r.name}</div>
                        {r.role && <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{r.role}</div>}
                      </div>
                      <button
                        className="btn-primary"
                        style={{ fontSize: 11, padding: '4px 12px' }}
                        onClick={() => handleAdd(r.id, undefined)}
                        disabled={addMember.isPending}
                      >
                        Add
                      </button>
                    </div>
                  ))
            )}
            {tab === 'figures' && (
              filteredFigures.length === 0
                ? <p style={{ color: 'var(--ink-muted)', fontStyle: 'italic', padding: '12px 0' }}>No figures to add.</p>
                : filteredFigures.map(f => (
                    <div key={f.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px', borderRadius: 6,
                      background: 'var(--blue-pale)', border: '1px solid var(--border)',
                    }}>
                      <MemberPortrait name={f.name} imageUrl={f.imageUrl} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 13 }}>{f.name}</div>
                        {f.role && <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{f.role}</div>}
                      </div>
                      <button
                        className="btn-primary"
                        style={{ fontSize: 11, padding: '4px 12px' }}
                        onClick={() => handleAdd(undefined, f.id)}
                        disabled={addMember.isPending}
                      >
                        Add
                      </button>
                    </div>
                  ))
            )}
          </div>
        </div>
        <div className="modal-actions" style={{ padding: '12px 24px 24px' }}>
          <button className="btn-secondary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function GroupsPage() {
  const { data: groups = [], isLoading } = usePersonGroups()
  const createGroup = useCreatePersonGroup()
  const updateGroup = useUpdatePersonGroup()
  const deleteGroup = useDeletePersonGroup()
  const removeMember = useRemoveGroupMember()

  const [selected, setSelected] = useState<PersonGroup | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<PersonGroup | null>(null)
  const [showAddMember, setShowAddMember] = useState(false)
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState<PersonGroup | null>(null)
  const [confirmRemoveMember, setConfirmRemoveMember] = useState<PersonGroupMember | null>(null)

  const { data: members = [] } = useGroupMembers(selected?.id ?? null)

  function handleSave(data: CreatePersonGroupRequest) {
    if (editTarget) {
      updateGroup.mutate({ id: editTarget.id, data }, {
        onSuccess: () => { setShowForm(false); setEditTarget(null) },
      })
    } else {
      createGroup.mutate(data, {
        onSuccess: () => setShowForm(false),
      })
    }
  }

  function handleDeleteGroup(group: PersonGroup) {
    setConfirmDeleteGroup(group)
  }
  function handleConfirmDeleteGroup() {
    if (!confirmDeleteGroup) return
    deleteGroup.mutate(confirmDeleteGroup.id, {
      onSuccess: () => { if (selected?.id === confirmDeleteGroup.id) setSelected(null); setConfirmDeleteGroup(null) },
    })
  }

  function handleRemoveMember(member: PersonGroupMember) {
    setConfirmRemoveMember(member)
  }
  function handleConfirmRemoveMember() {
    if (!confirmRemoveMember) return
    removeMember.mutate({ groupId: confirmRemoveMember.groupId, memberId: confirmRemoveMember.id })
    setConfirmRemoveMember(null)
  }

  return (
    <div className="page" style={{ display: 'flex', gap: 0, padding: 0, height: '100%' }}>

      {/* Left: group list */}
      <div style={{
        width: 280, flexShrink: 0,
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        background: '#3d2c0e',
      }}>
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ color: 'var(--gold)', fontFamily: 'var(--font-heading)', fontSize: '1.1rem', margin: 0 }}>Groups</h2>
            <button className="btn-primary" style={{ fontSize: 11, padding: '4px 12px' }}
              onClick={() => { setEditTarget(null); setShowForm(true) }}>
              + New
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {isLoading && <p style={{ color: 'var(--ink-muted)', padding: '16px 20px', fontSize: 13 }}>Loading…</p>}
          {!isLoading && groups.length === 0 && (
            <p style={{ color: 'var(--ink-muted)', padding: '24px 20px', fontSize: 13, fontStyle: 'italic' }}>
              No groups yet. Create one to start organizing people.
            </p>
          )}
          {groups.map(g => (
            <button
              key={g.id}
              onClick={() => setSelected(selected?.id === g.id ? null : g)}
              style={{
                width: '100%', textAlign: 'left', border: 'none',
                padding: '10px 20px', cursor: 'pointer',
                borderLeft: `4px solid ${selected?.id === g.id ? groupColor(g.color) : 'transparent'}`,
                background: selected?.id === g.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <span style={{
                width: 10, height: 10, borderRadius: '50%',
                background: groupColor(g.color), flexShrink: 0,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--parchment)', fontFamily: 'var(--font-heading)', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {g.name}
                </div>
                <div style={{ color: 'var(--ink-muted)', fontSize: 11, marginTop: 1 }}>
                  {g.memberCount ?? 0} {(g.memberCount ?? 0) === 1 ? 'member' : 'members'}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: group detail */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
        {!selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--ink-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>👥</div>
            <p style={{ fontStyle: 'italic' }}>Select a group to view its members.</p>
          </div>
        ) : (
          <>
            {/* Group header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: groupColor(selected.color), flexShrink: 0, display: 'inline-block',
                }} />
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.6rem' }}>{selected.name}</h1>
                  {selected.description && (
                    <p style={{ color: 'var(--ink-muted)', marginTop: 4, fontSize: '0.9rem' }}>{selected.description}</p>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button className="btn-secondary" style={{ fontSize: 12 }}
                  onClick={() => { setEditTarget(selected); setShowForm(true) }}>
                  Edit
                </button>
                <button className="btn-danger" style={{ fontSize: 12 }}
                  onClick={() => handleDeleteGroup(selected)}>
                  Delete
                </button>
              </div>
            </div>

            {/* Members section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>
                MEMBERS ({members.length})
              </h3>
              <button className="btn-primary" style={{ fontSize: 11, padding: '5px 14px' }}
                onClick={() => setShowAddMember(true)}>
                + Add Member
              </button>
            </div>

            {members.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-muted)' }}>
                <p style={{ fontStyle: 'italic' }}>No members yet. Add residents or notable figures to this group.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {members.map(m => {
                  const name = m.residentName ?? m.notableFigureName ?? 'Unknown'
                  const imageUrl = m.residentImageUrl ?? m.notableFigureImageUrl
                  const type = m.residentId != null ? 'Resident' : 'Notable Figure'
                  return (
                    <div key={m.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px', borderRadius: 8,
                      background: 'var(--blue-pale)', border: '1px solid var(--border)',
                    }}>
                      <MemberPortrait name={name} imageUrl={imageUrl} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 14 }}>{name}</span>
                      </div>
                      <span className={`badge ${m.residentId != null ? 'badge-resident' : 'badge-info'}`} style={{ fontSize: 11 }}>
                        {type}
                      </span>
                      <button
                        className="btn-icon btn-icon-danger"
                        title={`Remove ${name}`}
                        onClick={() => handleRemoveMember(m)}
                        disabled={removeMember.isPending}
                      >
                        ✕
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {showForm && (
        <GroupForm
          initial={editTarget ?? undefined}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
          onSave={handleSave}
          saving={createGroup.isPending || updateGroup.isPending}
        />
      )}

      {showAddMember && selected && (
        <AddMemberModal
          groupId={selected.id}
          existingMembers={members}
          onClose={() => setShowAddMember(false)}
        />
      )}

      {confirmDeleteGroup != null && (
        <ConfirmModal
          title="Delete Group"
          message={`Delete "${confirmDeleteGroup.name}"? This will remove all memberships.`}
          confirmLabel="Delete"
          onConfirm={handleConfirmDeleteGroup}
          onCancel={() => setConfirmDeleteGroup(null)}
        />
      )}

      {confirmRemoveMember != null && (
        <ConfirmModal
          title="Remove Member"
          message={`Remove ${confirmRemoveMember.residentName ?? confirmRemoveMember.notableFigureName ?? 'this person'} from the group?`}
          confirmLabel="Remove"
          onConfirm={handleConfirmRemoveMember}
          onCancel={() => setConfirmRemoveMember(null)}
        />
      )}
    </div>
  )
}
