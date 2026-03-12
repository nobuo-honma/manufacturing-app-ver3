'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Customer, Product } from '@/lib/types'
import { generateOrderId } from '@/lib/utils'
import BomSimulation from '@/components/orders/BomSimulation'
import Link from 'next/link'
import { ChevronLeft, CheckCircle } from 'lucide-react'

export default function NewOrderPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts]   = useState<Product[]>([])
  const [search, setSearch]       = useState('')
  const [form, setForm] = useState({
    desired_ship_date: '', customer_id: '', product_id: '', quantity: '', notes: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('customers').select('id,name').order('name'),
      supabase.from('products').select('*').order('name'),
    ]).then(([{ data: c }, { data: p }]) => {
      setCustomers(c ?? [])
      setProducts(p ?? [])
    })
  }, [])

  const filteredCustomers = customers.filter(c =>
    c.name.includes(search) || c.id.includes(search)
  )
  const productGroups = products.reduce<Record<string, Product[]>>((acc, p) => {
    if (!acc[p.name]) acc[p.name] = []
    acc[p.name].push(p)
    return acc
  }, {})
  const selectedProduct = products.find(p => p.id === form.product_id)
  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setSubmitted(false) }

  const showSim = !!(form.product_id && form.quantity && Number(form.quantity) > 0 && selectedProduct)
  const productionKg = showSim
    ? (Number(form.quantity) * selectedProduct!.unit_per_cs) / selectedProduct!.unit_per_kg
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: latest } = await supabase.from('orders').select('id')
      .like('id', `ORD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-%%`)
      .order('id', { ascending: false }).limit(1)
    const seq = latest?.length ? parseInt(latest[0].id.slice(-3)) + 1 : 1
    const { error } = await supabase.from('orders').insert({
      id:                generateOrderId(new Date(), seq),
      order_date:        new Date().toISOString(),
      desired_ship_date: form.desired_ship_date,
      customer_id:       form.customer_id,
      product_id:        form.product_id,
      quantity:          Number(form.quantity),
      notes:             form.notes || null,
      status:            'ordered',
    })
    setSaving(false)
    if (!error) {
      setSubmitted(true)
      setForm({ desired_ship_date:'', customer_id:'', product_id:'', quantity:'', notes:'' })
      setSearch('')
    }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

      {/* ヘッダー */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
        <Link href="/orders" style={{ color:'var(--text-muted)', display:'flex', alignItems:'center' }}>
          <ChevronLeft size={20} />
        </Link>
        <h1 className="page-title">受注登録</h1>
      </div>

      {/* 2カラム */}
      <div style={{ display:'grid', gridTemplateColumns:'440px 1fr', gap:'20px', alignItems:'start' }}>

        {/* ── 左：入力フォーム ── */}
        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'var(--surface-2)', display:'flex', alignItems:'center', gap:'8px' }}>
            <div className="accent-line" />
            <span style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)' }}>受注情報の入力</span>
          </div>

          <div style={{ padding:'24px' }}>

            {/* 登録完了 */}
            {submitted && (
              <div style={{
                display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px',
                background:'var(--ok-bg)', border:'1px solid rgba(52,211,153,0.3)',
                borderRadius:'10px', padding:'12px 16px',
                color:'var(--ok)', fontSize:'0.875rem', fontWeight:600,
              }}>
                <CheckCircle size={16} /> 受注登録が完了しました
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">希望出荷日</label>
                <input type="date" required className="input"
                  value={form.desired_ship_date} onChange={e => set('desired_ship_date', e.target.value)} />
              </div>

              <div className="form-group">
                <label className="label">出荷先を検索</label>
                <input type="text" placeholder="出荷先名・IDで検索..." className="input"
                  style={{ marginBottom:'10px' }}
                  value={search} onChange={e => setSearch(e.target.value)} />
                <label className="label">出荷先</label>
                <select required className="input"
                  value={form.customer_id} onChange={e => set('customer_id', e.target.value)}>
                  <option value="">選択してください</option>
                  {filteredCustomers.map(c => (
                    <option key={c.id} value={c.id}>{c.id}　{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">製品名 / 製造種類</label>
                <select required className="input"
                  value={form.product_id} onChange={e => set('product_id', e.target.value)}>
                  <option value="">選択してください</option>
                  {Object.entries(productGroups).map(([name, prods]) => (
                    <optgroup key={name} label={name}>
                      {prods.map(p => (
                        <option key={p.id} value={p.id}>{p.variant_name}（{p.id}）</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">受注数（c/s）</label>
                <input type="number" required min="1" className="input"
                  value={form.quantity} onChange={e => set('quantity', e.target.value)} />
                {selectedProduct && form.quantity && (
                  <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'6px', paddingLeft:'4px' }}>
                    ≈ <span style={{ color:'var(--accent)' }}>
                      {(Number(form.quantity) * selectedProduct.unit_per_cs).toLocaleString()}個
                    </span>
                    　（1c/s = {selectedProduct.unit_per_cs}個）
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="label">備考</label>
                <textarea rows={3} className="input" style={{ borderRadius:'14px' }}
                  value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>

              <button type="submit" disabled={saving} className="btn-submit"
                style={{ width:'100%', marginTop:'4px' }}>
                {saving ? '登録中...' : '受注を登録する'}
              </button>
            </form>
          </div>
        </div>

        {/* ── 右：BOMシミュレーション ── */}
        <div>
          {showSim ? (
            <BomSimulation
              productId={form.product_id}
              orderQtyCs={Number(form.quantity)}
              productionKg={productionKg}
            />
          ) : (
            <div className="card" style={{
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              minHeight:'300px', gap:'12px', padding:'40px',
            }}>
              <div style={{
                width:'52px', height:'52px', borderRadius:'50%',
                background:'rgba(56,189,248,0.06)', border:'1px solid var(--border)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'1.5rem',
              }}>📊</div>
              <p style={{ color:'var(--text-secondary)', fontWeight:600, fontSize:'0.9375rem' }}>
                在庫シミュレーション
              </p>
              <p style={{ color:'var(--text-muted)', fontSize:'0.8125rem', textAlign:'center', lineHeight:1.7 }}>
                製品と受注数を入力すると<br />原材料・資材の在庫充足状況を表示します
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
