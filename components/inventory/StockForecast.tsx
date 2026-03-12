'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface ForecastRow {
  item_id: string; item_name: string; unit: string
  current_stock: number; planned_usage: number; after_stock: number
  safety_stock: number; status: '充足' | '注意' | '不足'
}

const STATUS_STYLE: Record<string, { bg:string; color:string; border:string }> = {
  '充足': { bg:'var(--ok-bg)',     color:'var(--ok)',     border:'rgba(52,211,153,0.25)' },
  '注意': { bg:'var(--warn-bg)',   color:'var(--warn)',   border:'rgba(251,191,36,0.25)' },
  '不足': { bg:'var(--danger-bg)', color:'var(--danger)', border:'rgba(248,113,113,0.25)' },
}

export default function StockForecast() {
  const [rows, setRows]       = useState<ForecastRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const calc = async () => {
      setLoading(true)
      const { data: plans } = await supabase
        .from('production_plans').select('product_id, production_kg, orders(status)')
        .in('status', ['planned', 'in_progress'])
      const usageMap: Record<string, number> = {}
      for (const plan of plans ?? []) {
        const { data: bom } = await supabase.from('bom')
          .select('item_id, usage_rate, basis_type').eq('product_id', plan.product_id)
        for (const b of bom ?? []) {
          const usage = b.basis_type === 'production_qty' ? plan.production_kg * b.usage_rate : 0
          usageMap[b.item_id] = (usageMap[b.item_id] ?? 0) + usage
        }
      }
      const { data: stocks } = await supabase.from('item_stocks').select('*, items(*)')
      setRows(
        (stocks ?? []).filter(s => s.items).map(s => {
          const planned = Math.round((usageMap[s.item_id] ?? 0) * 1000) / 1000
          const after   = Math.round((s.quantity - planned) * 1000) / 1000
          const status: '充足'|'注意'|'不足' =
            after < s.items.safety_stock        ? '不足'
            : after < s.items.safety_stock * 1.5 ? '注意' : '充足'
          return { item_id: s.item_id, item_name: s.items.name, unit: s.items.unit,
            current_stock: s.quantity, planned_usage: planned, after_stock: after,
            safety_stock: s.items.safety_stock, status }
        })
        .filter(r => r.planned_usage > 0 || r.status !== '充足')
        .sort((a, b) => a.status === '不足' ? -1 : b.status === '不足' ? 1 : 0)
      )
      setLoading(false)
    }
    calc()
  }, [])

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', gap:'8px', padding:'12px' }}>
      {[...Array(4)].map((_,i) => (
        <div key={i} style={{ height:'38px', borderRadius:'8px', background:'var(--surface-2)' }} />
      ))}
    </div>
  )

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
        <div className="accent-line" />
        <h3 style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)' }}>
          在庫予測（製造計画ベース）
        </h3>
      </div>
      <div className="card" style={{ overflow:'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              {['品目ID','品目名','現在庫','計画使用予定','計画後在庫','安全在庫','予測ステータス'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign:'center', color:'var(--text-muted)', padding:'32px' }}>
                計画中の製造はありません
              </td></tr>
            ) : rows.map(r => {
              const st = STATUS_STYLE[r.status]
              return (
                <tr key={r.item_id} style={{ background: r.status === '不足' ? 'rgba(248,113,113,0.04)' : '' }}>
                  <td style={{ fontFamily:'DM Mono,monospace', fontSize:'0.6875rem', color:'var(--text-muted)' }}>{r.item_id}</td>
                  <td style={{ fontWeight:600 }}>{r.item_name}</td>
                  <td>{r.current_stock} <span style={{ color:'var(--text-muted)', fontSize:'0.6875rem' }}>{r.unit}</span></td>
                  <td style={{ color:'var(--warn)' }}>{r.planned_usage} <span style={{ color:'var(--text-muted)', fontSize:'0.6875rem' }}>{r.unit}</span></td>
                  <td style={{ fontWeight:600, color: r.after_stock < 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
                    {r.after_stock} <span style={{ color:'var(--text-muted)', fontSize:'0.6875rem' }}>{r.unit}</span>
                  </td>
                  <td style={{ color:'var(--text-muted)' }}>{r.safety_stock} <span style={{ fontSize:'0.6875rem' }}>{r.unit}</span></td>
                  <td>
                    <span style={{
                      display:'inline-block', padding:'3px 10px', borderRadius:'999px',
                      fontSize:'0.6875rem', fontWeight:700,
                      background: st.bg, color: st.color, border:`1px solid ${st.border}`,
                    }}>{r.status}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
