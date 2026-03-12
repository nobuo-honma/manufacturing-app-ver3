'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

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
  >{value || <span style={{ color: 'var(--text-muted)' }}>-</span>}</span>
}

export default function ProductMaster() {
  const [data, setData] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ id: '', name: '', variant_name: '', unit_per_kg: 29, unit_per_cs: 48, parent_id: '' })

  const fetch = async () => {
    const { data: d } = await supabase.from('products').select('*').order('name').order('variant_name')
    setData(d || [])
  }
  useEffect(() => { fetch() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('products').insert({ ...form, parent_id: form.parent_id || null })
    if (error) { alert(error.message); return }
    setShowForm(false); setForm({ id: '', name: '', variant_name: '', unit_per_kg: 29, unit_per_cs: 48, parent_id: '' }); fetch()
  }
  const handleUpdate = async (id: string, field: string, value: string) => {
    await supabase.from('products').update({ [field]: ['unit_per_kg','unit_per_cs'].includes(field) ? Number(value) : value }).eq('id', id); fetch()
  }
  const handleDelete = async (id: string) => {
    if (!confirm(`製品ID "${id}" を削除しますか？`)) return
    await supabase.from('products').delete().eq('id', id); fetch()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>製品マスタ <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>({data.length}件)</span></span>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
          {showForm ? 'キャンセル' : '＋ 追加'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: 'var(--surface-2)', borderRadius: '10px', padding: '16px', marginBottom: '14px', border: '1px solid var(--border)' }}>
          {[['id','製品ID *','text'],['name','製品名 *','text'],['variant_name','製造種類 *','text'],['unit_per_kg','1kg個数 *','number'],['unit_per_cs','1c/s個数 *','number'],['parent_id','親製品ID','text']].map(([key, label, type]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input type={type} className="input" required={label.endsWith('*')}
                value={(form as any)[key]}
                onChange={e => setForm(p => ({ ...p, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))} />
            </div>
          ))}
          <div style={{ gridColumn: 'span 3' }}>
            <button type="submit" className="btn-primary">登録する</button>
          </div>
        </form>
      )}

      <table className="data-table">
        <thead><tr>{['製品ID','製品名','製造種類','1kg個数','1c/s個数','親ID',''].map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id}>
              <td style={{ fontFamily: 'DM Mono', fontSize: '0.6875rem', color: 'var(--accent)' }}>{row.id}</td>
              <td><EditableCell value={row.name} onSave={v => handleUpdate(row.id, 'name', v)} /></td>
              <td><EditableCell value={row.variant_name} onSave={v => handleUpdate(row.id, 'variant_name', v)} /></td>
              <td><EditableCell value={row.unit_per_kg} onSave={v => handleUpdate(row.id, 'unit_per_kg', v)} /></td>
              <td><EditableCell value={row.unit_per_cs} onSave={v => handleUpdate(row.id, 'unit_per_cs', v)} /></td>
              <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{row.parent_id ?? '-'}</td>
              <td><button onClick={() => handleDelete(row.id)} style={{ fontSize: '0.75rem', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>削除</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
