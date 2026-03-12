'use client'
import { useStockAlerts } from '@/hooks/useInventory'
import { getStockStatus } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'

export default function StockAlert() {
  const { alerts, loading } = useStockAlerts()

  if (loading) return <div className="card" style={{ height: '120px', animation: 'pulse 1.5s infinite' }} />

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertTriangle size={15} style={{ color: alerts.length > 0 ? 'var(--danger)' : 'var(--ok)' }} />
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>在庫アラート</span>
        {alerts.length > 0 && (
          <span className="badge badge-danger" style={{ marginLeft: 'auto' }}>{alerts.length}件</span>
        )}
      </div>
      {alerts.length === 0 ? (
        <div style={{ padding: '14px 18px', fontSize: '0.8125rem', color: 'var(--ok)' }}>✓ アラートはありません</div>
      ) : (
        <ul style={{ maxHeight: '220px', overflowY: 'auto' }}>
          {alerts.map(s => {
            const status = getStockStatus(s.quantity, s.items?.safety_stock ?? 0)
            return (
              <li key={s.item_id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 18px',
                borderBottom: '1px solid var(--border)',
                fontSize: '0.8125rem',
              }}>
                <div>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.items?.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', marginLeft: '6px', fontFamily: 'DM Mono' }}>{s.item_id}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {s.quantity} <span style={{ color: 'var(--text-muted)' }}>/ {s.items?.safety_stock}{s.items?.unit}</span>
                  </span>
                  <span className={`badge ${status === '不足' ? 'badge-danger' : 'badge-warn'}`}>{status}</span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
