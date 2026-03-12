'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function BomMaster() {
  const [bom, setBom]           = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [items, setItems]       = useState<any[]>([])
  const [filterProduct, setFilterProduct] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ product_id: '', item_id: '', usage_rate: '', unit: '', basis_type: 'production_qty' })

  const fetchAll = async () => {
    const [{ data: b }, { data: p }, { data: i }] = await Promise.all([
      supabase.from('bom').select('*, items(*)').order('product_id'),
      supabase.from('products').select('*').order('name'),
      supabase.from('items').select('*').order('item_type').order('id'),
    ])
    setBom(b || []); setProducts(p || []); setItems(i || [])
  }
  useEffect(() => { fetchAll() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('bom').insert({ ...form, usage_rate: Number(form.usage_rate) })
    if (error) { alert(error.message); return }
    setShowForm(false); setForm({ product_id: '', item_id: '', usage_rate: '', unit: '', basis_type: 'production_qty' }); fetchAll()
  }
  const handleDelete = async (id: string) => {
    if (!confirm('削除しますか？')) return
    await supabase.from('bom').delete().eq('id', id); fetchAll()
  }

  const selectedItem = items.find(i => i.id === form.item_id)
  const filtered = bom.filter(b => !filterProduct || b.product_id === filterProduct)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>BOM（部品表）<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>({bom.length}行)</span></span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select className="input" style={{ width: '220px', padding: '6px 10px', fontSize: '0.75rem' }}
            value={filterProduct} onChange={e => setFilterProduct(e.target.value)}>
            <option value="">すべての製品</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.id} - {p.variant_name}</option>)}
          </select>
          <button onClick={() => setShowForm(v => !v)} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
            {showForm ? 'キャンセル' : '＋ 追加'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: 'var(--surface-2)', borderRadius: '10px', padding: '16px', marginBottom: '14px', border: '1px solid var(--border)' }}>
          <div>
            <label className="label">製品 *</label>
            <select required className="input" style={{ fontSize: '0.75rem' }} value={form.product_id} onChange={e => setForm(p => ({ ...p, product_id: e.target.value }))}>
              <option value="">選択</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.id} - {p.variant_name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">品目 *</label>
            <select required className="input" style={{ fontSize: '0.75rem' }} value={form.item_id}
              onChange={e => { const item = items.find(i => i.id === e.target.value); setForm(p => ({ ...p, item_id: e.target.value, unit: item?.unit ?? '' })) }}>
              <option value="">選択</option>
              <optgroup label="原材料">{items.filter(i => i.item_type === 'raw_material').map(i => <option key={i.id} value={i.id}>{i.id} {i.name}</option>)}</optgroup>
              <optgroup label="資材">{items.filter(i => i.item_type === 'material').map(i => <option key={i.id} value={i.id}>{i.id} {i.name}</option>)}</optgroup>
            </select>
          </div>
          <div>
            <label className="label">使用率 *</label>
            <input type="number" required step="0.0001" min="0" className="input" style={{ fontSize: '0.75rem' }} value={form.usage_rate} onChange={e => setForm(p => ({ ...p, usage_rate: e.target.value }))} />
          </div>
          <div>
            <label className="label">単位</label>
            <input type="text" className="input" style={{ fontSize: '0.75rem' }} value={form.unit || (selectedItem?.unit ?? '')} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} />
          </div>
          <div>
            <label className="label">計算基準 *</label>
            <select required className="input" style={{ fontSize: '0.75rem' }} value={form.basis_type} onChange={e => setForm(p => ({ ...p, basis_type: e.target.value }))}>
              <option value="production_qty">製造量（原材料kg計算）</option>
              <option value="order_qty">受注数（資材枚数計算）</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn-primary">登録する</button>
          </div>
        </form>
      )}

      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <table className="data-table">
          <thead><tr>{['製品ID','製造種類','品目ID','品目名','種別','使用率','単位','計算基準',''].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(row => (
              <tr key={row.id}>
                <td style={{ fontFamily: 'DM Mono', fontSize: '0.6875rem', color: 'var(--accent)' }}>{row.product_id}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{products.find(p => p.id === row.product_id)?.variant_name}</td>
                <td style={{ fontFamily: 'DM Mono', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{row.item_id}</td>
                <td>{row.items?.name}</td>
                <td><span className={`badge ${row.items?.item_type === 'raw_material' ? 'badge-blue' : 'badge-gray'}`}>{row.items?.item_type === 'raw_material' ? '原材料' : '資材'}</span></td>
                <td style={{ fontWeight: 600 }}>{row.usage_rate}</td>
                <td style={{ color: 'var(--text-muted)' }}>{row.unit}</td>
                <td><span className={`badge ${row.basis_type === 'production_qty' ? 'badge-blue' : 'badge-warn'}`}>{row.basis_type === 'production_qty' ? '製造量' : '受注数'}</span></td>
                <td><button onClick={() => handleDelete(row.id)} style={{ fontSize: '0.75rem', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>削除</button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>データがありません</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
