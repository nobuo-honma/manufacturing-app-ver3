'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Item, ItemType } from '@/lib/types'

function EditableCell({ value, onSave }: { value: string | number; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(String(value))
  if (editing) return (
    <input className="input" style={{ padding: '3px 6px', minWidth: '60px', fontSize: '0.75rem' }}
      value={val} onChange={e => setVal(e.target.value)}
      onBlur={() => { onSave(val); setEditing(false) }}
      onKeyDown={e => { if (e.key === 'Enter') { onSave(val); setEditing(false) } if (e.key === 'Escape') setEditing(false) }}
      autoFocus />
  )
  return <span onClick={() => { setVal(String(value)); setEditing(true) }}
    style={{ cursor: 'pointer', padding: '2px 4px', borderRadius: '4px', display: 'block' }}
    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-3)'}
    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
  >{value}</span>
}

export default function ItemMaster() {
  const [data, setData] = useState<Item[]>([])
  const [filterType, setFilterType] = useState<'all' | ItemType>('all')
  const [search, setSearch] = useState('')

  const fetch = async () => {
    const { data: d } = await supabase.from('items').select('*').order('item_type').order('id')
    setData(d || [])
  }
  useEffect(() => { fetch() }, [])

  const handleUpdate = async (id: string, field: string, value: string) => {
    await supabase.from('items').update({ [field]: ['unit_size','safety_stock'].includes(field) ? Number(value) : value }).eq('id', id); fetch()
  }

  const filtered = data.filter(d => (filterType === 'all' || d.item_type === filterType) && (!search || d.name.includes(search) || d.id.includes(search)))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>品目マスタ <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>({data.length}件)</span></span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input type="text" placeholder="品目名・IDで検索" className="input" style={{ width: '160px', padding: '6px 10px', fontSize: '0.75rem' }}
            value={search} onChange={e => setSearch(e.target.value)} />
          <div className="tab-bar">
            {(['all','raw_material','material'] as const).map(t => (
              <button key={t} onClick={() => setFilterType(t)} className={`tab-item ${filterType === t ? 'active' : ''}`} style={{ fontSize: '0.75rem', padding: '5px 12px' }}>
                {t === 'all' ? 'すべて' : t === 'raw_material' ? '原材料' : '資材'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <table className="data-table">
          <thead><tr>{['品目ID','品目名','区分','規格量','単位','安全在庫'].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(row => (
              <tr key={row.id}>
                <td style={{ fontFamily: 'DM Mono', fontSize: '0.6875rem', color: 'var(--accent)' }}>{row.id}</td>
                <td><EditableCell value={row.name} onSave={v => handleUpdate(row.id, 'name', v)} /></td>
                <td><span className={`badge ${row.item_type === 'raw_material' ? 'badge-blue' : 'badge-gray'}`}>{row.item_type === 'raw_material' ? '原材料' : '資材'}</span></td>
                <td><EditableCell value={row.unit_size} onSave={v => handleUpdate(row.id, 'unit_size', v)} /></td>
                <td style={{ color: 'var(--text-muted)' }}>{row.unit}</td>
                <td><EditableCell value={row.safety_stock} onSave={v => handleUpdate(row.id, 'safety_stock', v)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
