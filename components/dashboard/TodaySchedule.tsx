'use client'
import { useTodayProduction } from '@/hooks/useProduction'
import { Factory } from 'lucide-react'
import { PLAN_STATUS_LABEL } from '@/lib/types'

export default function TodaySchedule() {
  const { plans, loading } = useTodayProduction()

  if (loading) return <div className="card" style={{ height: '120px' }} />

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Factory size={15} style={{ color: 'var(--accent)' }} />
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>本日の製造予定</span>
        <span className="badge badge-blue" style={{ marginLeft: 'auto' }}>{plans.length}件</span>
      </div>
      {plans.length === 0
        ? <p style={{ padding: '14px 18px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>本日の製造予定はありません</p>
        : (
          <ul>
            {plans.map(p => (
              <li key={p.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 18px',
                borderBottom: '1px solid var(--border)',
                fontSize: '0.8125rem',
              }}>
                <div>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{p.products?.name}</span>
                  <span style={{ color: 'var(--text-secondary)', marginLeft: '6px' }}>{p.products?.variant_name}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', marginLeft: '8px' }}>{p.orders?.customers?.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                  <span>{p.production_kg}kg / {p.planned_cs}c/s</span>
                  {p.lot_code && <span style={{ fontFamily: 'DM Mono', fontSize: '0.6875rem', color: 'var(--accent)' }}>{p.lot_code}</span>}
                  <span className={`badge ${
                    p.status === 'completed'   ? 'badge-ok'
                    : p.status === 'in_progress' ? 'badge-warn'
                    : 'badge-gray'}`}>
                    {PLAN_STATUS_LABEL[p.status]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )
      }
    </div>
  )
}
