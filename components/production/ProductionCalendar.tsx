'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Printer, ChevronLeft, ChevronRight } from 'lucide-react'

const DAY_NAMES   = ['日','月','火','水','木','金','土']
const MONTH_NAMES = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
const STATUS_COLOR: Record<string, {bg:string; text:string; border:string}> = {
  planned:     { bg:'rgba(56,189,248,0.12)',  text:'var(--accent)', border:'rgba(56,189,248,0.25)' },
  in_progress: { bg:'rgba(251,191,36,0.12)',  text:'var(--warn)',   border:'rgba(251,191,36,0.25)' },
  completed:   { bg:'rgba(52,211,153,0.12)',  text:'var(--ok)',     border:'rgba(52,211,153,0.25)' },
}

export default function ProductionCalendar() {
  const [events, setEvents] = useState<any[]>([])
  const [year, setYear]   = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())

  useEffect(() => {
    supabase.from('production_plans')
      .select('*, products(*), orders(*, customers(*))')
      .then(({ data }) => setEvents(data ?? []))
  }, [])

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
                        <div key={i} style={{
                          fontSize:'0.6rem', padding:'2px 5px', borderRadius:'4px', marginBottom:'2px',
                          background:c.bg, color:c.text, border:`1px solid ${c.border}`,
                          overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis',
                        }}>
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
    </div>
  )
}
