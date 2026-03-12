'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Order, ProductStock } from '@/lib/types'
import { ORDER_STATUS_LABEL, SHIPMENT_STATUS_LABEL, fmtDate } from '@/lib/utils'
import { Plus, Package } from 'lucide-react'
import { Trash2 } from 'lucide-react'

const MAX_LOTS = 10
interface LotRow { lot_code: string; qty_cs: number; qty_piece: number }

// ── 受注カード（左カラム） ──────────────────────────────
function OrderCard({ order, shippedCs, selected, onClick }: {
  order: Order; shippedCs: number; selected: boolean; onClick: () => void
}) {
  const progress    = order.quantity > 0 ? Math.min(100, (shippedCs / order.quantity) * 100) : 0
  const remainCs    = order.quantity - shippedCs
  const isCompleted = remainCs <= 0
  const badge       = order.status === 'shipped' ? 'badge-ok' : order.status === 'in_production' ? 'badge-warn' : 'badge-blue'
  return (
    <button onClick={onClick} style={{
      width:'100%', textAlign:'left', padding:'14px 18px',
      borderBottom:'1px solid var(--border)',
      background: selected ? 'rgba(56,189,248,0.08)' : 'transparent',
      borderLeft: selected ? '3px solid var(--accent)' : '3px solid transparent',
      cursor:'pointer', transition:'all 0.15s', opacity: isCompleted ? 0.6 : 1,
    }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'5px' }}>
        <p style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--text-primary)', flex:1, marginRight:'8px' }}>
          {order.customers?.name}
        </p>
        <span className={`badge ${badge}`} style={{ flexShrink:0 }}>{ORDER_STATUS_LABEL[order.status]}</span>
      </div>
      <p style={{ fontSize:'0.75rem', color:'var(--text-secondary)', marginBottom:'8px' }}>
        {order.products?.variant_name}
      </p>
      <div style={{ display:'flex', gap:'14px', fontSize:'0.6875rem', color:'var(--text-muted)', marginBottom:'8px' }}>
        <span>受注 <strong style={{ color:'var(--text-primary)' }}>{order.quantity}</strong> c/s</span>
        <span>済 <strong style={{ color:'var(--ok)' }}>{shippedCs}</strong> c/s</span>
        <span style={{ color: remainCs < 0 ? 'var(--danger)' : 'inherit' }}>
          残 <strong style={{ color: remainCs < 0 ? 'var(--danger)' : 'var(--text-primary)' }}>{remainCs}</strong> c/s
        </span>
      </div>
      <div style={{ height:'3px', background:'var(--surface-3)', borderRadius:'999px', overflow:'hidden' }}>
        <div style={{ width:`${progress}%`, height:'100%', borderRadius:'999px',
          background: isCompleted ? 'var(--ok)' : 'var(--accent)', transition:'width 0.4s' }} />
      </div>
      <p style={{ fontSize:'0.625rem', color:'var(--text-muted)', marginTop:'5px' }}>
        希望出荷日: {fmtDate(order.desired_ship_date)}
      </p>
    </button>
  )
}

// ── メインページ ───────────────────────────────────────
export default function ShipmentsPage() {
  const [orders, setOrders]               = useState<Order[]>([])
  const [shipments, setShipments]         = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [productStocks, setProductStocks] = useState<ProductStock[]>([])
  const [lotRows, setLotRows]             = useState<LotRow[]>([{ lot_code:'', qty_cs:0, qty_piece:0 }])
  const [shipDate, setShipDate]           = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving]               = useState(false)

  const fetchOrders    = async () => {
    const { data } = await supabase.from('orders')
      .select('*, customers(*), products(*)').in('status', ['received','in_production','shipped'])
      .order('desired_ship_date')
    setOrders(data || [])
  }
  const fetchShipments = async () => {
    const { data } = await supabase.from('shipments')
      .select('*, orders(*, customers(*), products(*))').order('ship_date', { ascending: false })
    setShipments(data || [])
  }
  useEffect(() => { fetchOrders(); fetchShipments() }, [])

  const shippedCsFor = (orderId: string) =>
    shipments.filter(s => s.order_id === orderId).reduce((sum, s) => sum + s.qty_cs, 0)

  const handleSelectOrder = async (order: Order) => {
    setSelectedOrder(order)
    setLotRows([{ lot_code:'', qty_cs:0, qty_piece:0 }])
    const { data } = await supabase.from('product_stocks').select('*, products(*)')
      .eq('product_id', order.product_id).order('expiry_date')
    setProductStocks(data || [])
  }

  const updateRow = (idx: number, field: Partial<LotRow>) =>
    setLotRows(prev => prev.map((r, i) => i === idx ? { ...r, ...field } : r))

  const totalCs    = lotRows.reduce((s, r) => s + r.qty_cs, 0)
  const totalPiece = lotRows.reduce((s, r) => s + r.qty_piece, 0)
  const shippedCs  = selectedOrder ? shippedCsFor(selectedOrder.id) : 0
  const remainToShip = (selectedOrder?.quantity ?? 0) - shippedCs

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder) return
    setSaving(true)
    const ts = new Date().toISOString().replace(/[-:T.Z]/g,'').slice(0,14)
    for (const [i, row] of lotRows.entries()) {
      if (!row.lot_code || (row.qty_cs === 0 && row.qty_piece === 0)) continue
      await supabase.from('shipments').insert({
        id: `SHP-${shipDate.replace(/-/g,'')}-${ts}-${String(i+1).padStart(2,'0')}`,
        order_id: selectedOrder.id, ship_date: shipDate,
        lot_code: row.lot_code, qty_cs: row.qty_cs, qty_piece: row.qty_piece, status:'scheduled',
      })
      const { data: stock } = await supabase.from('product_stocks')
        .select('qty_cs,qty_piece').eq('lot_code', row.lot_code).single()
      if (stock) await supabase.from('product_stocks').update({
        qty_cs: Math.max(0, stock.qty_cs - row.qty_cs),
        qty_piece: Math.max(0, stock.qty_piece - row.qty_piece),
        updated_at: new Date().toISOString(),
      }).eq('lot_code', row.lot_code)
    }
    setLotRows([{ lot_code:'', qty_cs:0, qty_piece:0 }])
    fetchShipments(); setSaving(false)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <h1 className="page-title">出荷管理</h1>

      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:'20px', alignItems:'start' }}>

        {/* ── 左：受注一覧 ── */}
        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{ padding:'12px 18px', borderBottom:'1px solid var(--border)', background:'var(--surface-2)', display:'flex', alignItems:'center', gap:'8px' }}>
            <div className="accent-line" />
            <span style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)' }}>受注一覧</span>
            <span className="badge badge-blue" style={{ marginLeft:'auto' }}>{orders.length}件</span>
          </div>
          <div style={{ maxHeight:'calc(100vh - 200px)', overflowY:'auto' }}>
            {orders.length === 0 ? (
              <div style={{ padding:'32px', textAlign:'center', color:'var(--text-muted)', fontSize:'0.875rem' }}>
                受注がありません
              </div>
            ) : orders.map(o => (
              <OrderCard key={o.id} order={o} shippedCs={shippedCsFor(o.id)}
                selected={selectedOrder?.id === o.id} onClick={() => handleSelectOrder(o)} />
            ))}
          </div>
        </div>

        {/* ── 右：出荷登録フォーム ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {selectedOrder ? (<>

            {/* 選択受注サマリ */}
            <div className="card" style={{ overflow:'hidden' }}>
              <div style={{ padding:'12px 20px', borderBottom:'1px solid var(--border)', background:'var(--surface-2)', display:'flex', alignItems:'center', gap:'8px' }}>
                <div className="accent-line" />
                <div>
                  <p style={{ fontSize:'0.9375rem', fontWeight:700, color:'var(--text-primary)' }}>{selectedOrder.customers?.name}</p>
                  <p style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>{selectedOrder.products?.variant_name}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="btn-secondary"
                  style={{ marginLeft:'auto', fontSize:'0.75rem', padding:'4px 12px' }}>
                  解除
                </button>
              </div>
              <div style={{ padding:'14px 20px', display:'flex', gap:'28px', fontSize:'0.875rem' }}>
                {[
                  { label:'受注数',  val:`${selectedOrder.quantity} c/s`, color:'var(--text-primary)' },
                  { label:'出荷済',  val:`${shippedCs} c/s`,              color:'var(--ok)' },
                  { label:'残り',    val:`${remainToShip} c/s`,           color: remainToShip < 0 ? 'var(--danger)' : 'var(--text-primary)' },
                ].map(({ label, val, color }) => (
                  <div key={label}>
                    <p style={{ fontSize:'0.625rem', color:'var(--text-muted)', marginBottom:'2px' }}>{label}</p>
                    <p style={{ fontWeight:700, color }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 出荷登録フォーム */}
            <div className="card" style={{ overflow:'hidden' }}>
              <div style={{ padding:'12px 20px', borderBottom:'1px solid var(--border)', background:'var(--surface-2)', display:'flex', alignItems:'center', gap:'8px' }}>
                <div className="accent-line" />
                <span style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)' }}>出荷予定登録</span>
              </div>
              <div style={{ padding:'20px' }}>
                <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="label">出荷日</label>
                    <input type="date" required className="input" style={{ maxWidth:'240px' }}
                      value={shipDate} onChange={e => setShipDate(e.target.value)} />
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    <label className="label">出荷 Lot（最大 {MAX_LOTS} Lot）</label>
                    {lotRows.map((row, idx) => (
                      <div key={idx} style={{
                        display:'grid', gridTemplateColumns:'auto 1fr 100px 80px auto',
                        gap:'8px', alignItems:'center',
                        background:'var(--surface-2)', borderRadius:'12px', padding:'10px 14px',
                        border:'1px solid var(--border)',
                      }}>
                        <span style={{ fontSize:'0.6875rem', color:'var(--text-muted)', minWidth:'16px', textAlign:'center' }}>{idx + 1}</span>
                        <select className="input" style={{ fontSize:'0.8125rem', padding:'10px 16px' }}
                          value={row.lot_code} onChange={e => updateRow(idx, { lot_code: e.target.value })}>
                          <option value="">Lot を選択</option>
                          {productStocks.map(s => (
                            <option key={s.lot_code} value={s.lot_code}>
                              {s.lot_code}（在庫: {s.qty_cs}c/s）
                            </option>
                          ))}
                        </select>
                        <div style={{ position:'relative' }}>
                          <input type="number" min="0" placeholder="0" className="input"
                            style={{ paddingRight:'32px', textAlign:'right' }}
                            value={row.qty_cs || ''} onChange={e => updateRow(idx, { qty_cs: Number(e.target.value) })} />
                          <span style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
                            fontSize:'0.6875rem', color:'var(--text-muted)', pointerEvents:'none' }}>c/s</span>
                        </div>
                        <div style={{ position:'relative' }}>
                          <input type="number" min="0" placeholder="0" className="input"
                            style={{ paddingRight:'24px', textAlign:'right' }}
                            value={row.qty_piece || ''} onChange={e => updateRow(idx, { qty_piece: Number(e.target.value) })} />
                          <span style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
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
                          display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', transition:'all 0.15s',
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
                    <span style={{ color:'var(--text-muted)' }}>合計:
                      <strong style={{ color:'var(--accent)', marginLeft:'6px' }}>
                        {totalCs} c/s{totalPiece > 0 ? ` + ${totalPiece}p` : ''}
                      </strong>
                    </span>
                    <span style={{ color:'var(--text-muted)' }}>残出荷:
                      <strong style={{ marginLeft:'6px', color: remainToShip - totalCs < 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
                        {remainToShip - totalCs} c/s
                      </strong>
                    </span>
                  </div>

                  <button type="submit" disabled={saving} className="btn-submit" style={{ width:'100%' }}>
                    {saving ? '登録中...' : '出荷予定を登録する'}
                  </button>
                </form>
              </div>
            </div>

            {/* 出荷履歴 */}
            <div className="card" style={{ overflow:'hidden' }}>
              <div style={{ padding:'12px 20px', borderBottom:'1px solid var(--border)', background:'var(--surface-2)', display:'flex', alignItems:'center', gap:'8px' }}>
                <div className="accent-line" />
                <span style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)' }}>この受注の出荷履歴</span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>{['出荷日','Lot番号','c/s','p','ステータス'].map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {shipments.filter(s => s.order_id === selectedOrder.id).length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--text-muted)', padding:'24px' }}>
                      出荷履歴がありません
                    </td></tr>
                  ) : shipments.filter(s => s.order_id === selectedOrder.id).map(s => (
                    <tr key={s.id}>
                      <td style={{ color:'var(--text-secondary)' }}>{fmtDate(s.ship_date)}</td>
                      <td style={{ fontFamily:'DM Mono,monospace', fontSize:'0.6875rem', color:'var(--accent)' }}>{s.lot_code}</td>
                      <td style={{ fontWeight:600 }}>{s.qty_cs}</td>
                      <td style={{ color:'var(--text-secondary)' }}>{s.qty_piece}</td>
                      <td><span className={`badge ${s.status === 'shipped' ? 'badge-ok' : 'badge-warn'}`}>
                        {SHIPMENT_STATUS_LABEL[s.status]}
                      </span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </>) : (
            <div className="card" style={{
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              minHeight:'320px', gap:'14px',
            }}>
              <div style={{
                width:'52px', height:'52px', borderRadius:'50%',
                background:'rgba(56,189,248,0.06)', border:'1px solid var(--border)',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <Package size={24} color="var(--text-muted)" />
              </div>
              <p style={{ color:'var(--text-secondary)', fontWeight:600, fontSize:'0.9375rem' }}>
                受注を選択してください
              </p>
              <p style={{ color:'var(--text-muted)', fontSize:'0.8125rem' }}>
                左の受注カードをクリックして出荷登録を行います
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
