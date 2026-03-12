'use client'
import { useBomSimulation } from '@/hooks/useBomSimulation'

interface Props {
  productId: string
  orderQtyCs: number
  productionKg: number
}

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  '充足': { bg:'var(--ok-bg)',     color:'var(--ok)',     border:'rgba(52,211,153,0.25)' },
  '注意': { bg:'var(--warn-bg)',   color:'var(--warn)',   border:'rgba(251,191,36,0.25)' },
  '不足': { bg:'var(--danger-bg)', color:'var(--danger)', border:'rgba(248,113,113,0.25)' },
}

export default function BomSimulation({ productId, orderQtyCs, productionKg }: Props) {
  const { results, loading } = useBomSimulation(productId, orderQtyCs, productionKg)

  if (loading) return (
    <div className="card" style={{ padding:'20px', display:'flex', flexDirection:'column', gap:'10px' }}>
      {[...Array(5)].map((_,i) => (
        <div key={i} style={{ height:'36px', borderRadius:'8px', background:'var(--surface-2)', opacity: 1 - i*0.15 }} />
      ))}
    </div>
  )
  if (!results.length) return null

  const shortage = results.filter(r => r.status === '不足').length
  const warning  = results.filter(r => r.status === '注意').length
  const rawMats  = results.filter(r => r.item_type === 'raw_material')
  const mats     = results.filter(r => r.item_type !== 'raw_material')

  const Section = ({ title, rows }: { title: string; rows: typeof results }) => (
    rows.length === 0 ? null : (
      <div style={{ marginBottom:'20px' }}>
        <p style={{ fontSize:'0.6875rem', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase',
          color:'var(--text-muted)', marginBottom:'8px', paddingLeft:'2px' }}>
          {title}
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
          {rows.map(r => {
            const st = STATUS_STYLE[r.status]
            return (
              <div key={r.item_id} style={{
                display:'grid', gridTemplateColumns:'80px 1fr 90px 90px 80px 64px',
                alignItems:'center', gap:'8px',
                padding:'10px 14px', borderRadius:'10px',
                background: r.status === '不足' ? 'rgba(248,113,113,0.05)' : 'var(--surface-2)',
                border: r.status === '不足' ? '1px solid rgba(248,113,113,0.2)' : '1px solid var(--border)',
              }}>
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:'0.6875rem', color:'var(--text-muted)' }}>
                  {r.item_id}
                </span>
                <span style={{ fontSize:'0.8125rem', fontWeight:600, color:'var(--text-primary)' }}>
                  {r.item_name}
                </span>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontSize:'0.625rem', color:'var(--text-muted)' }}>必要</p>
                  <p style={{ fontSize:'0.8125rem', fontWeight:700, color:'var(--text-primary)' }}>
                    {r.required_qty}<span style={{ fontSize:'0.625rem', marginLeft:'2px', color:'var(--text-muted)' }}>{r.unit}</span>
                  </p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontSize:'0.625rem', color:'var(--text-muted)' }}>在庫</p>
                  <p style={{ fontSize:'0.8125rem', fontWeight:700, color:'var(--text-secondary)' }}>
                    {r.current_stock}<span style={{ fontSize:'0.625rem', marginLeft:'2px', color:'var(--text-muted)' }}>{r.unit}</span>
                  </p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontSize:'0.625rem', color:'var(--text-muted)' }}>差分</p>
                  <p style={{ fontSize:'0.8125rem', fontWeight:700,
                    color: r.diff < 0 ? 'var(--danger)' : 'var(--ok)' }}>
                    {r.diff > 0 ? '+' : ''}{r.diff}
                  </p>
                </div>
                <div style={{ textAlign:'center' }}>
                  <span style={{
                    display:'inline-block', padding:'3px 8px', borderRadius:'999px',
                    fontSize:'0.6875rem', fontWeight:700,
                    background: st.bg, color: st.color, border:`1px solid ${st.border}`,
                  }}>
                    {r.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  )

  return (
    <div className="card" style={{ overflow:'hidden' }}>
      {/* ヘッダー */}
      <div style={{
        padding:'14px 20px', borderBottom:'1px solid var(--border)',
        background:'var(--surface-2)', display:'flex', alignItems:'center', gap:'8px'
      }}>
        <div className="accent-line" />
        <span style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)' }}>
          原材料・資材 在庫シミュレーション
        </span>
        <div style={{ marginLeft:'auto', display:'flex', gap:'8px' }}>
          {shortage > 0 && (
            <span className="badge badge-danger">不足 {shortage}件</span>
          )}
          {warning > 0 && (
            <span className="badge badge-warn">注意 {warning}件</span>
          )}
          {shortage === 0 && warning === 0 && (
            <span className="badge badge-ok">在庫充足</span>
          )}
        </div>
      </div>

      <div style={{ padding:'20px' }}>
        {/* 列ヘッダー */}
        <div style={{
          display:'grid', gridTemplateColumns:'80px 1fr 90px 90px 80px 64px',
          gap:'8px', padding:'0 14px 8px',
        }}>
          {['品目ID','品目名','必要数','現在庫','差分','状態'].map(h => (
            <span key={h} style={{ fontSize:'0.625rem', fontWeight:600, letterSpacing:'0.08em',
              textTransform:'uppercase', color:'var(--text-muted)' }}>
              {h}
            </span>
          ))}
        </div>

        <Section title="原材料" rows={rawMats} />
        <Section title="資材"   rows={mats} />
      </div>
    </div>
  )
}
