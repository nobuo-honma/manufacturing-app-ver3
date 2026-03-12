'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Item } from '@/lib/types'
import { generateArrivalId } from '@/lib/utils'

export default function ArrivalForm({ onSaved, onCancel }: { onSaved: () => void; onCancel?: () => void }) {
  const [items, setItems]   = useState<Item[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm]     = useState({
    item_id: '', expected_date: '', quantity: '', notes: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('items').select('*').order('id').then(({ data }) => setItems(data ?? []))
  }, [])

  const filtered = items.filter(i =>
    i.name.includes(search) || i.id.includes(search)
  )
  const selected = items.find(i => i.id === form.item_id)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: latest } = await supabase
      .from('arrivals').select('id')
      .like('id', `INC-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-%%`)
      .order('id', { ascending: false }).limit(1)
    const seq = latest?.length ? parseInt(latest[0].id.slice(-3)) + 1 : 1
    await supabase.from('arrivals').insert({
      id:            generateArrivalId(new Date(), seq),
      item_id:       form.item_id,
      order_date:    new Date().toISOString(),
      expected_date: form.expected_date,
      quantity:      Number(form.quantity),
      unit:          selected?.unit ?? '',
      status:        'pending',
      notes:         form.notes || null,
    })
    setSaving(false)
    setForm({ item_id:'', expected_date:'', quantity:'', notes:'' })
    setSearch('')
    onSaved()
  }

  return (
    <div className="form-card" style={{ maxWidth: '560px' }}>
      <div className="form-card-header">入荷予定の登録</div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label">品目検索</label>
          <input type="text" placeholder="品目名・IDで検索..."
            className="input" style={{ marginBottom: '8px' }}
            value={search} onChange={e => setSearch(e.target.value)} />
          <select required className="input"
            value={form.item_id} onChange={e => set('item_id', e.target.value)}>
            <option value="">選択してください</option>
            {filtered.map(i => (
              <option key={i.id} value={i.id}>
                {i.id} {i.name}（{i.item_type === 'raw_material' ? '原材料' : '資材'}）
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="label">入荷予定日</label>
          <input type="date" required className="input"
            value={form.expected_date} onChange={e => set('expected_date', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="label">
            入荷予定数{selected && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>（{selected.unit}）</span>}
          </label>
          <input type="number" required min="0" step="0.001" className="input"
            value={form.quantity} onChange={e => set('quantity', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="label">備考</label>
          <input type="text" className="input"
            value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '8px' }}>
          <button type="submit" disabled={saving} className="btn-submit">
            {saving ? '登録中...' : '登録する'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-secondary" style={{ borderRadius: '999px', padding: '13px 28px' }}>
              キャンセル
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
