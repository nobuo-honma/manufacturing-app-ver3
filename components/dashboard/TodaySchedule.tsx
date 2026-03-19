'use client'
import { useTodayProduction } from '@/hooks/useProduction'
import { Factory, Truck, Calendar } from 'lucide-react'
import { PLAN_STATUS_LABEL } from '@/lib/types'

export default function TodaySchedule() {
  const { plans, shipments, internalEvents, loading } = useTodayProduction()

  if (loading) return <div className="card" style={{ height: '300px' }} />

  const hasEvents = plans.length > 0 || shipments.length > 0 || internalEvents.length > 0

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Calendar size={15} style={{ color: 'var(--accent)' }} />
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>本日の予定</span>
      </div>
      {!hasEvents
        ? <p style={{ padding: '14px 18px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>本日の予定はありません</p>
        : (
          <ul style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {/* 社内イベント */}
            {internalEvents.map(e => (
              <li key={e.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 18px', borderBottom: '1px solid var(--border)', fontSize: '0.8125rem',
                background: 'rgba(255,255,255,0.03)'
              }}>
                <div style={{ width:'24px', height:'24px', borderRadius:'6px', background:'var(--surface-3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{e.title}</span>
                  <span className="badge badge-gray" style={{ marginLeft: '8px' }}>社内行事</span>
                </div>
              </li>
            ))}

            {/* 出荷予定 */}
            {shipments.map(s => (
              <li key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 18px', borderBottom: '1px solid var(--border)', fontSize: '0.8125rem',
                background: 'rgba(139,92,246,0.03)'
              }}>
                <div style={{ width:'24px', height:'24px', borderRadius:'6px', background:'rgba(139,92,246,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Truck size={12} style={{ color: '#a78bfa' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.orders?.customers?.name} への出荷</span>
                    <span className="badge" style={{ background:'rgba(139,92,246,0.1)', color:'#a78bfa', border:'none' }}>出荷</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop:'2px' }}>
                    {s.orders?.products?.variant_name} - {s.qty_cs} c/s
                  </p>
                </div>
              </li>
            ))}

            {/* 製造予定 */}
            {plans.map(p => (
              <li key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 18px', borderBottom: '1px solid var(--border)', fontSize: '0.8125rem'
              }}>
                <div style={{ width:'24px', height:'24px', borderRadius:'6px', background:'rgba(56,189,248,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Factory size={12} style={{ color: 'var(--accent)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.products?.name}</span>
                      <span style={{ color: 'var(--text-secondary)', marginLeft: '6px' }}>{p.products?.variant_name}</span>
                    </div>
                    <span className={`badge ${
                      p.status === 'completed'   ? 'badge-ok'
                      : p.status === 'in_progress' ? 'badge-warn'
                      : 'badge-gray'}`}>
                      {PLAN_STATUS_LABEL[p.status]}
                    </span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:'2px', fontSize:'0.75rem', color:'var(--text-muted)' }}>
                    <span>{p.production_kg}kg / {p.planned_cs}c/s</span>
                    <span style={{ fontFamily:'DM Mono', color:'var(--accent)' }}>{p.lot_code}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )
      }
    </div>
  )
}
