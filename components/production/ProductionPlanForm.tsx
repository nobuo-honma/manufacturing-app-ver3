'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Order, Product } from '@/lib/types'
import { generateLotCode, calcExpiryDate, calcProductionCounts } from '@/lib/utils'
import { Plus, Trash2, CheckCircle } from 'lucide-react'

const MAX_DAYS = 8

interface DayPlan {
  date: string; kg: number; units: number; cs: number
  piece: number; lot_code: string; expiry: string; notes: string
}
const emptyDay = (): DayPlan => ({ date:'', kg:0, units:0, cs:0, piece:0, lot_code:'', expiry:'', notes:'' })

interface Props {
  order: Order
  existingCs?: number
  comboSeqStart?: number
}

export default function ProductionPlanForm({ order, existingCs = 0, comboSeqStart = 1 }: Props) {
  const [product, setProduct]   = useState<Product | null>(null)
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([emptyDay()])
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)

  useEffect(() => {
    supabase.from('products').select('*').eq('id', order.product_id).single()
      .then(({ data }) => setProduct(data))
    setDayPlans([emptyDay()])
    setSaved(false)
  }, [order.product_id, order.id])

  const update = (idx: number, field: Partial<DayPlan>) => {
    setDayPlans(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], ...field }
      const d = next[idx]
      if (d.kg > 0 && d.date && product) {
        const { units, cs, piece } = calcProductionCounts(d.kg, product.unit_per_kg, product.unit_per_cs)
        const dt = new Date(d.date)
        const expiry   = calcExpiryDate(dt).toISOString().slice(0, 10)
        const lot_code = generateLotCode({ date: dt, productId: order.product_id, seqInDay: idx, comboSeq: comboSeqStart + idx })
        next[idx] = { ...d, ...field, units, cs, piece, expiry, lot_code }
      }
      return next
    })
  }

  const totalCs  = dayPlans.reduce((s, d) => s + d.cs, 0)
  const remainCs = order.quantity - existingCs - totalCs

  const handleSubmit = async () => {
    setSaving(true)
    for (const day of dayPlans) {
      if (!day.date || day.kg <= 0) continue
      await supabase.from('production_plans').insert({
        id:              `PLN-${crypto.randomUUID().slice(0, 8)}`,
        order_id:        order.id,
        product_id:      order.product_id,
        production_date: day.date,
        production_kg:   day.kg,
        planned_units:   day.units,
        planned_cs:      day.cs,
        lot_code:        day.lot_code,
        expiry_date:     day.expiry || null,
        status:          'planned',
        notes:           day.notes || null,
      })
    }
    await supabase.from('orders').update({ status: 'in_production' }).eq('id', order.id)
    setSaving(false)
    setSaved(true)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* サマリバー */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px'
      }}>
        {[
          { label: '受注数',        val: `${order.quantity} c/s`,   color: 'var(--text-primary)' },
          { label: '今回登録合計',  val: `${totalCs} c/s`,          color: 'var(--accent)' },
          { label: '残り必要量',    val: `${remainCs} c/s`,
            color: remainCs < 0 ? 'var(--danger)' : remainCs === 0 ? 'var(--ok)' : 'var(--text-primary)' },
        ].map(({ label, val, color }) => (
          <div key={label} className="card-inner" style={{ padding: '12px 16px' }}>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
            <p style={{ fontSize: '1.0625rem', fontWeight: 700, color }}>{val}</p>
          </div>
        ))}
      </div>

      {/* 登録成功メッセージ */}
      {saved && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--ok-bg)', border: '1px solid rgba(52,211,153,0.3)',
          borderRadius: '10px', padding: '12px 16px',
          color: 'var(--ok)', fontSize: '0.875rem', fontWeight: 600
        }}>
          <CheckCircle size={16} />
          製造計画を登録しました
        </div>
      )}

      {/* 日程入力 */}
      {dayPlans.map((day, idx) => (
        <div key={idx} className="card-inner" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent)' }}>
              {idx + 1}日目
            </span>
            {dayPlans.length > 1 && (
              <button onClick={() => setDayPlans(p => p.filter((_, i) => i !== idx))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
                onMouseOver={e => (e.currentTarget.style.color = 'var(--danger)')}
                onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                <Trash2 size={15} />
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="label">製造予定日</label>
              <input type="date" className="input"
                value={day.date} onChange={e => update(idx, { date: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="label">製造量（kg）</label>
              <input type="number" min="0" step="0.5" className="input"
                value={day.kg || ''}
                onChange={e => update(idx, { kg: Number(e.target.value) })} />
            </div>
          </div>

          {/* 自動計算結果 */}
          {day.kg > 0 && day.date && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '8px',
              marginTop: '12px', padding: '12px 14px',
              background: 'rgba(56,189,248,0.05)',
              border: '1px solid rgba(56,189,248,0.15)',
              borderRadius: '10px',
            }}>
              {[
                { label: '個数',     val: `${day.units}` },
                { label: 'c/s',      val: `${day.cs}` },
                { label: '端数(p)',  val: `${day.piece}` },
                { label: '賞味期限', val: day.expiry },
                { label: 'Lot番号',  val: day.lot_code, mono: true },
              ].map(({ label, val, mono }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginBottom: '3px' }}>{label}</p>
                  <p style={{
                    fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)',
                    fontFamily: mono ? 'DM Mono, monospace' : undefined
                  }}>{val}</p>
                </div>
              ))}
            </div>
          )}

          <div className="form-group" style={{ marginTop: '14px', marginBottom: 0 }}>
            <label className="label">備考</label>
            <input type="text" placeholder="例: 50kg×4回" className="input"
              value={day.notes} onChange={e => update(idx, { notes: e.target.value })} />
          </div>
        </div>
      ))}

      {/* 日程追加ボタン */}
      {dayPlans.length < MAX_DAYS && (
        <button onClick={() => setDayPlans(p => [...p, emptyDay()])}
          style={{
            width: '100%', padding: '12px',
            border: '2px dashed rgba(56,189,248,0.25)', borderRadius: '10px',
            background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)',
            fontSize: '0.8125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            transition: 'all 0.15s',
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(56,189,248,0.25)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
          <Plus size={15} />
          製造予定日を追加（最大{MAX_DAYS}日）
        </button>
      )}

      {/* 登録ボタン */}
      <button onClick={handleSubmit} disabled={saving} className="btn-submit"
        style={{ width: '100%', marginTop: '4px' }}>
        {saving ? '登録中...' : '製造計画を登録する'}
      </button>
    </div>
  )
}
