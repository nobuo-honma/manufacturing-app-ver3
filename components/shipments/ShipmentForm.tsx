'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Order, ProductStock } from '@/lib/types'
import { Plus, Trash2 } from 'lucide-react'

const MAX_LOTS = 10
interface LotRow { lot_code: string; qty_cs: number; qty_piece: number }

export default function ShipmentForm({ order, onSaved }: { order: Order; onSaved: () => void }) {
  const [shipDate, setShipDate]   = useState(new Date().toISOString().slice(0, 10))
  const [lotRows, setLotRows]     = useState<LotRow[]>([{ lot_code:'', qty_cs:0, qty_piece:0 }])
  const [availLots, setAvailLots] = useState<ProductStock[]>([])
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    supabase.from('product_stocks').select('*, products(*)')
      .eq('product_id', order.product_id).gt('qty_cs', 0)
      .then(({ data }) => setAvailLots(data ?? []))
  }, [order.product_id])

  const totalCs    = lotRows.reduce((s, r) => s + r.qty_cs, 0)
  const totalPiece = lotRows.reduce((s, r) => s + r.qty_piece, 0)
  const updateRow  = (idx: number, field: Partial<LotRow>) =>
    setLotRows(prev => prev.map((r, i) => i === idx ? { ...r, ...field } : r))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const ts = new Date().toISOString().replace(/[-:T.Z]/g,'').slice(0,14)
    for (const [i, row] of lotRows.entries()) {
      if (!row.lot_code || (row.qty_cs === 0 && row.qty_piece === 0)) continue
      await supabase.from('shipments').insert({
        id: `SHP-${shipDate.replace(/-/g,'')}-${ts}-${String(i+1).padStart(2,'0')}`,
        order_id: order.id, ship_date: shipDate,
        lot_code: row.lot_code, qty_cs: row.qty_cs, qty_piece: row.qty_piece, status:'scheduled',
      })
    }
    setSaving(false)
    onSaved()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>

      {/* 受注サマリ */}
      <div style={{
        background:'rgba(56,189,248,0.05)', border:'1px solid rgba(56,189,248,0.15)',
        borderRadius:'12px', padding:'14px 18px', display:'flex', flexDirection:'column', gap:'6px',
      }}>
        {[
          ['受注ID',   order.id,                                         true],
          ['製品',     `${order.products?.name} / ${order.products?.variant_name}`, false],
          ['出荷先',   order.customers?.name ?? '',                      false],
          ['受注数',   `${order.quantity} c/s`,                          false],
        ].map(([label, val, mono]) => (
          <div key={label as string} style={{ display:'flex', gap:'10px', fontSize:'0.8125rem' }}>
            <span style={{ color:'var(--text-muted)', minWidth:'60px' }}>{label}</span>
            <span style={{ color:'var(--text-primary)', fontWeight:600,
              fontFamily: mono ? 'DM Mono,monospace' : undefined, fontSize: mono ? '0.75rem' : undefined }}>
              {val}
            </span>
          </div>
        ))}
      </div>

      {/* 出荷日 */}
      <div className="form-group" style={{ marginBottom:0 }}>
        <label className="label">出荷日</label>
        <input type="date" required className="input"
          value={shipDate} onChange={e => setShipDate(e.target.value)} />
      </div>

      {/* Lot行 */}
      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
        <label className="label">出荷 Lot（最大 {MAX_LOTS} Lot）</label>
        {lotRows.map((row, idx) => (
          <div key={idx} style={{
            display:'grid', gridTemplateColumns:'auto 1fr 90px 72px auto',
            gap:'8px', alignItems:'center',
            background:'var(--surface-2)', borderRadius:'12px', padding:'10px 14px',
            border:'1px solid var(--border)',
          }}>
            <span style={{ fontSize:'0.6875rem', color:'var(--text-muted)', minWidth:'16px', textAlign:'center' }}>
              {idx + 1}
            </span>
            <select className="input" style={{ fontSize:'0.8125rem', padding:'10px 16px' }}
              value={row.lot_code} onChange={e => updateRow(idx, { lot_code: e.target.value })}>
              <option value="">Lot を選択</option>
              {availLots.map(l => (
                <option key={l.lot_code} value={l.lot_code}>
                  {l.lot_code}（在庫: {l.qty_cs}c/s {l.qty_piece}p）
                </option>
              ))}
            </select>
            <div style={{ position:'relative' }}>
              <input type="number" min="0" placeholder="0" className="input"
                style={{ fontSize:'0.875rem', paddingRight:'32px', textAlign:'right' }}
                value={row.qty_cs || ''}
                onChange={e => updateRow(idx, { qty_cs: Number(e.target.value) })} />
              <span style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)',
                fontSize:'0.6875rem', color:'var(--text-muted)', pointerEvents:'none' }}>c/s</span>
            </div>
            <div style={{ position:'relative' }}>
              <input type="number" min="0" placeholder="0" className="input"
                style={{ fontSize:'0.875rem', paddingRight:'24px', textAlign:'right' }}
                value={row.qty_piece || ''}
                onChange={e => updateRow(idx, { qty_piece: Number(e.target.value) })} />
              <span style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)',
                fontSize:'0.6875rem', color:'var(--text-muted)', pointerEvents:'none' }}>p</span>
            </div>
            {lotRows.length > 1 ? (
              <button type="button" onClick={() => setLotRows(p => p.filter((_,i) => i !== idx))}
                style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:'4px', display:'flex' }}
                onMouseOver={e => (e.currentTarget.style.color='var(--danger)')}
                onMouseOut={e => (e.currentTarget.style.color='var(--text-muted)')}>
                <Trash2 size={15} />
              </button>
            ) : <span style={{ width:'24px' }} />}
          </div>
        ))}

        {lotRows.length < MAX_LOTS && (
          <button type="button" onClick={() => setLotRows(p => [...p, { lot_code:'', qty_cs:0, qty_piece:0 }])}
            style={{
              width:'100%', padding:'10px', background:'none',
              border:'2px dashed rgba(56,189,248,0.2)', borderRadius:'12px',
              color:'var(--text-muted)', fontSize:'0.8125rem', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
              transition:'all 0.15s',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)' }}
            onMouseOut={e => { e.currentTarget.style.borderColor='rgba(56,189,248,0.2)'; e.currentTarget.style.color='var(--text-muted)' }}>
            <Plus size={14} /> Lot を追加
          </button>
        )}
      </div>

      {/* 合計 */}
      <div style={{
        display:'flex', gap:'24px', fontSize:'0.875rem',
        background:'var(--surface-2)', borderRadius:'10px', padding:'12px 18px',
        border:'1px solid var(--border)',
      }}>
        <span style={{ color:'var(--text-muted)' }}>
          合計: <strong style={{ color:'var(--accent)' }}>
            {totalCs} c/s{totalPiece > 0 ? ` + ${totalPiece}p` : ''}
          </strong>
        </span>
        <span style={{ color: order.quantity - totalCs < 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
          残出荷: <strong style={{ color: order.quantity - totalCs < 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
            {order.quantity - totalCs} c/s
          </strong>
        </span>
      </div>

      <button type="submit" disabled={saving} className="btn-submit" style={{ width:'100%' }}>
        {saving ? '登録中...' : '出荷予定を登録する'}
      </button>
    </form>
  )
}
