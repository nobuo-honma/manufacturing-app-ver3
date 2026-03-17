'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Printer, ChevronLeft, ChevronRight, X, Trash2, Pencil, Save, ChevronLeft as Back } from 'lucide-react'
import { calcProductionCounts, generateLotCode, calcExpiryDate } from '@/lib/utils'

const DAY_NAMES   = ['日','月','火','水','木','金','土']
const MONTH_NAMES = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
const STATUS_COLOR: Record<string, {bg:string; text:string; border:string; label:string}> = {
  planned:     { bg:'rgba(56,189,248,0.12)',  text:'var(--accent)', border:'rgba(56,189,248,0.25)', label:'計画済' },
  in_progress: { bg:'rgba(251,191,36,0.12)',  text:'var(--warn)',   border:'rgba(251,191,36,0.25)', label:'製造中' },
  completed:   { bg:'rgba(52,211,153,0.12)',  text:'var(--ok)',     border:'rgba(52,211,153,0.25)', label:'完了' },
}

export default function ProductionCalendar() {
  const [events, setEvents] = useState<any[]>([])
  const [year, setYear]   = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)
  const [selectedResult, setSelectedResult] = useState<any | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ date: '', kg: 0 })

  const fetchPlans = () => {
    supabase.from('production_plans')
      .select('*, products(*), orders(*, customers(*))')
      .gte('production_date', `${year}-${String(month+1).padStart(2,'0')}-01`)
      .lte('production_date', `${year}-${String(month+1).padStart(2,'0')}-31`)
      .then(({ data }) => setEvents(data || []))
  }

  const fetchResult = async (planId: string) => {
    const { data } = await supabase.from('production_results').select('*').eq('plan_id', planId).single()
    setSelectedResult(data)
  }

  useEffect(() => {
    if (selectedEvent?.status === 'completed') {
      fetchResult(selectedEvent.id)
    } else {
      setSelectedResult(null)
    }
  }, [selectedEvent])
  useEffect(() => {
    fetchPlans()
  }, [year, month])

  const handleDelete = async (id: string, orderId: string) => {
    if (!confirm('この製造計画を削除しますか？')) return
    await supabase.from('production_plans').delete().eq('id', id)
    // Check if order needs status revert
    const { data: plans } = await supabase.from('production_plans').select('id').eq('order_id', orderId)
    if (!plans || plans.length === 0) {
      await supabase.from('orders').update({ status: 'received' }).eq('id', orderId)
    }
    setSelectedEvent(null)
    fetchPlans()
  }

  const handleEditStart = () => {
    setEditForm({
      date: selectedEvent.production_date.slice(0, 10),
      kg: selectedEvent.production_kg
    })
    setIsEditing(true)
  }

  const handleUpdate = async () => {
    if (!selectedEvent) return
    const { units, cs, piece } = calcProductionCounts(editForm.kg, selectedEvent.products.unit_per_kg, selectedEvent.products.unit_per_cs)
    const dt = new Date(editForm.date)
    const lot = generateLotCode({ date: dt, productId: selectedEvent.product_id })
    const exp = calcExpiryDate(dt).toISOString().slice(0, 10)

    const { error } = await supabase.from('production_plans').update({
      production_date: editForm.date,
      production_kg: editForm.kg,
      planned_units: units,
      planned_cs: cs,
      lot_code: lot,
      expiry_date: exp
    }).eq('id', selectedEvent.id)

    if (error) {
      alert(error.message)
      return
    }
    setIsEditing(false)
    setSelectedEvent(null)
    fetchPlans()
  }

  const handleDeleteResult = async () => {
    if (!selectedEvent || !selectedResult) return
    if (!confirm('この製造実績を削除し、計画を未完了に戻しますか？（在庫も差し引かれます）')) return

    // 在庫を戻す（減算）
    const { data: stock } = await supabase.from('product_stocks')
      .select('qty_cs,qty_piece').eq('lot_code', selectedResult.lot_code).single()
    if (stock) {
      await supabase.from('product_stocks').update({
        qty_cs: Math.max(0, stock.qty_cs - selectedResult.actual_cs),
        qty_piece: Math.max(0, stock.qty_piece - selectedResult.actual_piece),
        updated_at: new Date().toISOString(),
      }).eq('lot_code', selectedResult.lot_code)
    }

    // 実績削除 & 計画ステータス戻し
    await supabase.from('production_results').delete().eq('id', selectedResult.id)
    await supabase.from('production_plans').update({ status: 'planned' }).eq('id', selectedEvent.id)

    setSelectedEvent(null)
    fetchPlans()
  }

  const prev = () => month === 0 ? (setYear(y=>y-1), setMonth(11)) : setMonth(m=>m-1)
  const next = () => month === 11 ? (setYear(y=>y+1), setMonth(0))  : setMonth(m=>m+1)

  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(firstDay).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)]
  while (cells.length % 7 !== 0) cells.push(null)

  const eventsForDay = (day: number) => {
    const d = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return events.filter(e => e.production_date?.slice(0,10) === d)
  }
  const today = new Date()

  return (
    <div>
      <div className="no-print" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <button onClick={prev} className="btn-secondary" style={{ padding:'6px 10px' }}><ChevronLeft size={16}/></button>
          <span style={{ fontWeight:700, color:'var(--text-1)', fontSize:'1rem', minWidth:'100px', textAlign:'center' }}>
            {year}年 {MONTH_NAMES[month]}
          </span>
          <button onClick={next} className="btn-secondary" style={{ padding:'6px 10px' }}><ChevronRight size={16}/></button>
        </div>
        <button onClick={() => window.print()} className="btn-secondary" style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'0.8125rem' }}>
          <Printer size={14}/> 印刷
        </button>
      </div>

      <div className="hidden print:block" style={{ textAlign:'center', marginBottom:'16px' }}>
        <p style={{ fontSize:'1.25rem', fontWeight:700 }}>{year}年 {MONTH_NAMES[month]} 製造予定表</p>
      </div>

      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
          {DAY_NAMES.map((d,i) => (
            <div key={d} style={{ padding:'8px 4px', textAlign:'center', fontSize:'0.6875rem', fontWeight:600,
              color: i===0?'var(--danger)':i===6?'var(--accent)':'var(--text-3)',
              borderBottom:'1px solid var(--border)', background:'rgba(23,45,87,0.4)' }}>
              {d}
            </div>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
          {cells.map((day, idx) => {
            const ev = day ? eventsForDay(day) : []
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
            const isSun = idx%7===0, isSat = idx%7===6
            return (
              <div key={idx} style={{
                minHeight:'88px', borderBottom:'1px solid var(--border)', borderRight:'1px solid var(--border)',
                padding:'6px', background:!day?'rgba(4,9,26,0.3)':isToday?'rgba(56,189,248,0.06)':'transparent',
              }}>
                {day && (
                  <>
                    <p style={{ fontSize:'0.75rem', fontWeight:isToday?700:400, marginBottom:'4px',
                      color:isSun?'var(--danger)':isSat?'var(--accent)':isToday?'var(--accent)':'var(--text-3)' }}>
                      {day}
                    </p>
                    {ev.map((e,i) => {
                      const c = STATUS_COLOR[e.status] ?? STATUS_COLOR.planned
                      return (
                        <div key={i} onClick={() => setSelectedEvent(e)} style={{
                          fontSize:'0.6rem', padding:'2px 5px', borderRadius:'4px', marginBottom:'4px',
                          background:c.bg, color:c.text, border:`1px solid ${c.border}`,
                          overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', cursor:'pointer',
                        }}
                        onMouseEnter={el => el.currentTarget.style.filter = 'brightness(1.2)'}
                        onMouseLeave={el => el.currentTarget.style.filter = 'brightness(1)'}>
                          {e.products?.variant_name} {e.production_kg}kg
                          {e.lot_code && <span style={{ opacity:0.7, marginLeft:'3px' }}>{e.lot_code}</span>}
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="no-print" style={{ display:'flex', gap:'16px', marginTop:'10px', fontSize:'0.75rem', color:'var(--text-3)' }}>
        {Object.entries({planned:'計画済', in_progress:'製造中', completed:'完了'}).map(([k,v]) => {
          const c = STATUS_COLOR[k]
          return (
            <span key={k} style={{ display:'flex', alignItems:'center', gap:'5px' }}>
              <span style={{ width:'10px', height:'10px', borderRadius:'2px', background:c.bg, display:'inline-block' }}/>
              {v}
            </span>
          )
        })}
      </div>

      {/* 詳細モーダル */}
      {selectedEvent && (() => {
        const c = STATUS_COLOR[selectedEvent.status] || STATUS_COLOR.planned
        return (
          <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center' }}
            onClick={() => { setSelectedEvent(null); setIsEditing(false) }}>
            <div className="card" style={{ width:'400px', padding:'24px' }} onClick={e => e.stopPropagation()}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' }}>
                <div>
                  <h3 style={{ fontSize:'1.125rem', fontWeight:700, color:'var(--text-1)' }}>
                    {selectedEvent.products?.name} <span style={{ fontSize:'0.875rem', color:'var(--text-2)' }}>{selectedEvent.products?.variant_name}</span>
                  </h3>
                  <p style={{ fontSize:'0.75rem', color:'var(--text-3)', marginTop:'4px' }}>
                    {selectedEvent.orders?.customers?.name}
                  </p>
                </div>
                <button onClick={() => { setSelectedEvent(null); setIsEditing(false) }} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {!isEditing ? (
                <>
                  <div style={{ display:'grid', gap:'12px', background:'var(--surface-2)', padding:'16px', borderRadius:'8px', fontSize:'0.8125rem', marginBottom:'20px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ color:'var(--text-3)' }}>ステータス</span>
                      <span style={{ color:c.text, fontWeight:600 }}>{c.label}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ color:'var(--text-3)' }}>製造予定日</span>
                      <span>{new Date(selectedEvent.production_date).toLocaleDateString('ja-JP')}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ color:'var(--text-3)' }}>製造量</span>
                      <span style={{ fontWeight:600 }}>{selectedEvent.production_kg} kg</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ color:'var(--text-3)' }}>予定個数</span>
                      <span>{selectedEvent.planned_units} 個 / {selectedEvent.planned_cs} c/s</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid var(--border)', paddingTop:'8px' }}>
                      <span style={{ color:'var(--text-3)' }}>Lot番号</span>
                      <span style={{ fontFamily:'DM Mono' }}>{selectedEvent.lot_code}</span>
                    </div>
                    {selectedEvent.status === 'completed' && selectedResult && (
                      <div style={{ display:'grid', gap:'8px', marginTop:'8px', background:'rgba(52,211,153,0.05)', padding:'12px', borderRadius:'6px', border:'1px solid rgba(52,211,153,0.1)' }}>
                        <p style={{ fontSize:'0.75rem', fontWeight:600, color:'var(--ok)', marginBottom:'4px' }}>実績値</p>
                        <div style={{ display:'flex', justifyContent:'space-between' }}>
                          <span style={{ color:'var(--text-3)' }}>実績ケース数</span>
                          <span style={{ fontWeight:600 }}>{selectedResult.actual_cs} c/s</span>
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between' }}>
                          <span style={{ color:'var(--text-3)' }}>実績端数</span>
                          <span>{selectedResult.actual_piece} p</span>
                        </div>
                      </div>
                    )}
                    {selectedEvent.notes && (
                      <div style={{ display:'flex', flexDirection:'column', gap:'4px', marginTop:'4px', borderTop:'1px solid var(--border)', paddingTop:'8px' }}>
                        <span style={{ color:'var(--text-3)' }}>備考</span>
                        <span>{selectedEvent.notes}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end' }}>
                    {selectedEvent.status === 'planned' && (
                      <>
                        <button onClick={() => handleDelete(selectedEvent.id, selectedEvent.order_id)}
                          className="btn-secondary" style={{ color:'var(--danger)', borderColor:'rgba(248,113,113,0.3)', display:'flex', alignItems:'center', gap:'6px' }}>
                          <Trash2 size={14} /> 削除
                        </button>
                        <button onClick={handleEditStart}
                          className="btn-submit" style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                          <Pencil size={14} /> 編集
                        </button>
                      </>
                    )}
                    {selectedEvent.status === 'completed' && (
                      <button onClick={handleDeleteResult}
                        className="btn-secondary" style={{ color:'var(--danger)', borderColor:'rgba(248,113,113,0.3)', display:'flex', alignItems:'center', gap:'6px' }}>
                        <Trash2 size={14} /> 実績を削除して未完了に戻す
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display:'grid', gap:'16px', marginBottom:'24px' }}>
                    <div className="form-group" style={{ marginBottom:0 }}>
                      <label className="label">製造予定日</label>
                      <input type="date" className="input" 
                        value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} />
                    </div>
                    <div className="form-group" style={{ marginBottom:0 }}>
                      <label className="label">製造量（kg）</label>
                      <input type="number" step="0.5" className="input" 
                        value={editForm.kg} onChange={e => setEditForm(f => ({ ...f, kg: Number(e.target.value) }))} />
                    </div>
                    <p style={{ fontSize:'0.75rem', color:'var(--text-3)', lineHeight:1.5 }}>
                      ※製造量を変更すると個数・ケース数・Lot番号が自動再計算されます。
                    </p>
                  </div>

                  <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end' }}>
                    <button onClick={() => setIsEditing(false)} className="btn-secondary">
                      キャンセル
                    </button>
                    <button onClick={handleUpdate} className="btn-submit" style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      <Save size={14} /> 保存する
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
