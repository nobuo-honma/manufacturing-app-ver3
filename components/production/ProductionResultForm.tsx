'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ProductionPlan } from '@/lib/types'
import { CheckCircle } from 'lucide-react'

interface Props { plan: ProductionPlan; onSaved: () => void }

export default function ProductionResultForm({ plan, onSaved }: Props) {
  const [form, setForm] = useState({
    actual_units: plan.planned_units, actual_cs: plan.planned_cs,
    actual_piece: 0, notes: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await supabase.from('production_results').insert({
      plan_id: plan.id, lot_code: plan.lot_code ?? '',
      actual_units: form.actual_units, actual_cs: form.actual_cs,
      actual_piece: form.actual_piece, notes: form.notes || null,
    })
    await supabase.from('production_plans').update({ status: 'completed' }).eq('id', plan.id)
    if (plan.lot_code) {
      const { data: existing } = await supabase
        .from('product_stocks').select('qty_cs,qty_piece').eq('lot_code', plan.lot_code).single()
      if (existing) {
        await supabase.from('product_stocks').update({
          qty_cs: existing.qty_cs + form.actual_cs,
          qty_piece: existing.qty_piece + form.actual_piece,
          updated_at: new Date().toISOString(),
        }).eq('lot_code', plan.lot_code)
      } else {
        await supabase.from('product_stocks').insert({
          lot_code: plan.lot_code, product_id: plan.product_id,
          qty_cs: form.actual_cs, qty_piece: form.actual_piece,
          expiry_date: plan.expiry_date ?? null,
        })
      }
    }
    setLoading(false)
    onSaved()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
      {/* 計画値サマリ */}
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px',
        background:'rgba(56,189,248,0.05)', border:'1px solid rgba(56,189,248,0.15)',
        borderRadius:'10px', padding:'12px 16px',
      }}>
        {[
          { label:'計画個数', val: plan.planned_units },
          { label:'計画c/s',  val: plan.planned_cs },
          { label:'Lot番号',  val: plan.lot_code ?? '-', mono:true },
        ].map(({ label, val, mono }) => (
          <div key={label}>
            <p style={{ fontSize:'0.625rem', color:'var(--text-muted)', marginBottom:'3px' }}>{label}</p>
            <p style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--accent)',
              fontFamily: mono ? 'DM Mono,monospace' : undefined }}>
              {val}
            </p>
          </div>
        ))}
      </div>

      {/* 実績入力 */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
        {[
          { label:'実績個数', key:'actual_units', val:form.actual_units },
          { label:'実績c/s',  key:'actual_cs',    val:form.actual_cs },
          { label:'端数(p)',  key:'actual_piece',  val:form.actual_piece },
        ].map(({ label, key, val }) => (
          <div className="form-group" key={key} style={{ marginBottom:0 }}>
            <label className="label" style={{ fontSize:'0.6875rem' }}>{label}</label>
            <input type="number" min="0" required className="input"
              value={val}
              onChange={e => setForm(p => ({ ...p, [key]: Number(e.target.value) }))} />
          </div>
        ))}
      </div>

      <div className="form-group" style={{ marginBottom:0 }}>
        <label className="label">備考</label>
        <input type="text" className="input"
          value={form.notes}
          onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
      </div>

      <button type="submit" disabled={loading} className="btn-submit"
        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
        {loading ? '登録中...' : <><CheckCircle size={15} /> 実績を登録する（完了）</>}
      </button>
    </form>
  )
}
