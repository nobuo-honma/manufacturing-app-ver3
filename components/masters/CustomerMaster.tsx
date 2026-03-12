'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

function EditableCell({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  if (editing) return (
    <input className="input" style={{ padding: '3px 6px', minWidth: '80px', fontSize: '0.75rem' }}
      value={val} onChange={e => setVal(e.target.value)}
      onBlur={() => { onSave(val); setEditing(false) }}
      onKeyDown={e => { if (e.key === 'Enter') { onSave(val); setEditing(false) } if (e.key === 'Escape') setEditing(false) }}
      autoFocus />
  )
  return <span onClick={() => { setVal(value); setEditing(true) }} title={value}
    style={{ cursor: 'pointer', padding: '2px 4px', borderRadius: '4px', display: 'block', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-3)'}
    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
  >{value || <span style={{ color: 'var(--text-muted)' }}>-</span>}</span>
}

export default function CustomerMaster() {
  const [data, setData] = useState<any[]>([])
  const [search, setSearch] = useState('')

  const fetch = async () => {
    const { data: d } = await supabase.from('customers').select('*').order('id')
    setData(d || [])
  }
  useEffect(() => { fetch() }, [])

  const handleUpdate = async (id: string, field: string, value: string) => {
    await supabase.from('customers').update({ [field]: value || null }).eq('id', id); fetch()
  }

  const filtered = data.filter(c => !search || c.name.includes(search) || c.id.includes(search) || (c.address ?? '').includes(search))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>出荷先マスタ <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>({data.length}件 / {filtered.length}件表示)</span></span>
        <input type="text" placeholder="名前・ID・住所で検索" className="input" style={{ width: '220px', padding: '6px 10px', fontSize: '0.75rem' }}
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
        <table className="data-table">
          <thead><tr>{['出荷先ID','出荷先名','担当者','郵便番号','住所','電話','FAX','備考'].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(row => (
              <tr key={row.id}>
                <td style={{ fontFamily: 'DM Mono', fontSize: '0.6875rem', color: 'var(--accent)', whiteSpace: 'nowrap' }}>{row.id}</td>
                <td><EditableCell value={row.name} onSave={v => handleUpdate(row.id, 'name', v)} /></td>
                <td><EditableCell value={row.contact_name ?? ''} onSave={v => handleUpdate(row.id, 'contact_name', v)} /></td>
                <td><EditableCell value={row.postal_code ?? ''} onSave={v => handleUpdate(row.id, 'postal_code', v)} /></td>
                <td><EditableCell value={row.address ?? ''} onSave={v => handleUpdate(row.id, 'address', v)} /></td>
                <td><EditableCell value={row.phone ?? ''} onSave={v => handleUpdate(row.id, 'phone', v)} /></td>
                <td><EditableCell value={row.fax ?? ''} onSave={v => handleUpdate(row.id, 'fax', v)} /></td>
                <td><EditableCell value={row.notes ?? ''} onSave={v => handleUpdate(row.id, 'notes', v)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
