'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Printer, ChevronLeft, ChevronRight } from 'lucide-react'
import { Arrival } from '@/lib/types'

const DAY_NAMES = ['日','月','火','水','木','金','土']
const MONTH_NAMES = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']

interface ArrivalCalendarProps {
  arrivals: Arrival[]
  onRefresh: () => void
}

import { X, Trash2, Pencil } from 'lucide-react'
import ArrivalForm from './ArrivalForm'

export default function ArrivalCalendar({ arrivals, onRefresh }: ArrivalCalendarProps) {
  const [events, setEvents] = useState<any[]>([])
  const [year, setYear]   = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [selectedArrival, setSelectedArrival] = useState<Arrival | null>(null)
  const [editingArrival, setEditingArrival] = useState<Arrival | null>(null)

  useEffect(() => {
    setEvents((arrivals ?? []).map(a => ({
      id: a.id,
      title: `${a.items?.name} ${a.quantity}${a.items?.unit ?? ''}`,
      date:  a.expected_date.slice(0, 10),
      arrived: a.status === 'arrived',
      raw: a
    })))
  }, [arrivals])

  const handleDelete = async (a: Arrival) => {
    if (!confirm(`入荷予定 ${a.id} を削除しますか？`)) return
    if (a.status === 'arrived') {
      const { data: stock } = await supabase.from('item_stocks').select('quantity').eq('item_id', a.item_id).single()
      const newQty = (stock?.quantity ?? 0) - a.quantity
      await supabase.from('item_stocks').upsert({ item_id: a.item_id, quantity: newQty, updated_at: new Date().toISOString() })
    }
    await supabase.from('arrivals').delete().eq('id', a.id)
    setSelectedArrival(null)
    onRefresh()
  }

  const prev = () => month === 0 ? (setYear(y => y-1), setMonth(11)) : setMonth(m => m-1)
  const next = () => month === 11 ? (setYear(y => y+1), setMonth(0))  : setMonth(m => m+1)

  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(firstDay).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  const eventsForDay = (day: number) => {
    const d = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return events.filter(e => e.date === d)
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
            const isSun = idx % 7 === 0, isSat = idx % 7 === 6
            return (
              <div key={idx} style={{
                minHeight:'72px', borderBottom:'1px solid var(--border)', borderRight:'1px solid var(--border)',
                padding:'6px', background: !day?'rgba(4,9,26,0.3)':isToday?'rgba(56,189,248,0.07)':'transparent',
              }}>
                {day && (
                  <>
                    <p style={{ fontSize:'0.75rem', fontWeight:isToday?700:400, marginBottom:'4px',
                      color: isSun?'var(--danger)':isSat?'var(--accent)':isToday?'var(--accent)':'var(--text-3)' }}>
                      {day}
                    </p>
                    {ev.map((e,i) => (
                      <div key={i} onClick={() => setSelectedArrival(e.raw)} style={{
                        fontSize:'0.6rem', padding:'2px 5px', borderRadius:'4px', marginBottom:'2px',
                        background: e.arrived?'rgba(52,211,153,0.15)':'rgba(56,189,248,0.12)',
                        color: e.arrived?'var(--ok)':'var(--accent)',
                        border: `1px solid ${e.arrived?'rgba(52,211,153,0.3)':'rgba(56,189,248,0.25)'}`,
                        overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', cursor:'pointer'
                      }}
                      onMouseEnter={el => el.currentTarget.style.filter = 'brightness(1.2)'}
                      onMouseLeave={el => el.currentTarget.style.filter = 'brightness(1)'}>
                        {e.title}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="no-print" style={{ display:'flex', gap:'16px', marginTop:'10px', fontSize:'0.75rem', color:'var(--text-3)' }}>
        <span style={{ display:'flex', alignItems:'center', gap:'5px' }}>
          <span style={{ width:'10px', height:'10px', borderRadius:'2px', background:'rgba(56,189,248,0.2)', display:'inline-block' }}/>未入荷
        </span>
        <span style={{ display:'flex', alignItems:'center', gap:'5px' }}>
          <span style={{ width:'10px', height:'10px', borderRadius:'2px', background:'rgba(52,211,153,0.2)', display:'inline-block' }}/>入荷済
        </span>
      </div>

      {/* 詳細モーダル */}
      {selectedArrival && (
        <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={() => setSelectedArrival(null)}>
          <div className="card" style={{ width:'400px', padding:'24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' }}>
              <div>
                <h3 style={{ fontSize:'1.125rem', fontWeight:700, color:'var(--text-1)' }}>
                  {selectedArrival.items?.name}
                </h3>
                <p style={{ fontSize:'0.75rem', color:'var(--text-3)', marginTop:'4px', fontFamily:'DM Mono' }}>
                  {selectedArrival.id}
                </p>
              </div>
              <button onClick={() => setSelectedArrival(null)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display:'grid', gap:'12px', background:'var(--surface-2)', padding:'16px', borderRadius:'8px', fontSize:'0.8125rem', marginBottom:'20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'var(--text-3)' }}>ステータス</span>
                <span className={`badge ${selectedArrival.status === 'arrived' ? 'badge-ok' : 'badge-warn'}`}>
                  {selectedArrival.status === 'arrived' ? '入荷済' : '未入荷'}
                </span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'var(--text-3)' }}>予定日</span>
                <span>{new Date(selectedArrival.expected_date).toLocaleDateString('ja-JP')}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'var(--text-3)' }}>予定数</span>
                <span style={{ fontWeight:600 }}>{selectedArrival.quantity} {selectedArrival.unit}</span>
              </div>
              {selectedArrival.notes && (
                <div style={{ display:'flex', flexDirection:'column', gap:'4px', marginTop:'4px', borderTop:'1px solid var(--border)', paddingTop:'8px' }}>
                  <span style={{ color:'var(--text-3)' }}>備考</span>
                  <span>{selectedArrival.notes}</span>
                </div>
              )}
            </div>

            <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end' }}>
              <button onClick={() => handleDelete(selectedArrival)}
                className="btn-secondary" style={{ color:'var(--danger)', borderColor:'rgba(248,113,113,0.3)', display:'flex', alignItems:'center', gap:'6px' }}>
                <Trash2 size={14} /> 削除
              </button>
              {selectedArrival.status === 'pending' && (
                <button onClick={() => setEditingArrival(selectedArrival)}
                  className="btn-submit" style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                  <Pencil size={14} /> 編集
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 編集モーダル */}
      {editingArrival && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, backdropFilter: 'blur(4px)' }}
          onClick={() => setEditingArrival(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '560px' }}>
            <ArrivalForm 
              initialData={editingArrival}
              onSaved={() => { setEditingArrival(null); setSelectedArrival(null); onRefresh() }} 
              onCancel={() => setEditingArrival(null)} 
            />
          </div>
        </div>
      )}
    </div>
  )
}
