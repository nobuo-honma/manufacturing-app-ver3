'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useOrders } from '@/hooks/useOrders'
import { OrderStatus } from '@/lib/types'
import { ORDER_STATUS_LABEL } from '@/lib/utils'

const STATUS_STYLE: Record<string, string> = {
  received:      'badge badge-blue',
  in_production: 'badge badge-warn',
  shipped:       'badge badge-ok',
}

export default function OrderList() {
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')
  const { orders, loading } = useOrders(filterStatus === 'all' ? undefined : filterStatus)

  const tabs = [
    { value: 'all',           label: 'すべて' },
    { value: 'received',      label: '受注済' },
    { value: 'in_production', label: '製造中' },
    { value: 'shipped',       label: '出荷済' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="tab-bar" style={{ alignSelf: 'flex-start' }}>
        {tabs.map(t => (
          <button key={t.value} onClick={() => setFilterStatus(t.value as any)}
            className={`tab-item ${filterStatus === t.value ? 'active' : ''}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              {['受注ID','受注日','希望出荷日','出荷先','製品名','製造種類','受注数','ステータス',''].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td style={{ fontFamily: 'DM Mono', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{o.id}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{new Date(o.order_date).toLocaleDateString('ja-JP')}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{new Date(o.desired_ship_date).toLocaleDateString('ja-JP')}</td>
                <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.customers?.name}</td>
                <td>{o.products?.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{o.products?.variant_name}</td>
                <td style={{ fontWeight: 600 }}>{o.quantity} c/s</td>
                <td><span className={STATUS_STYLE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</span></td>
                <td>
                  <Link href={`/production/detail?orderId=${o.id}`} style={{ fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none' }}>
                    製造計画 →
                  </Link>
                </td>
              </tr>
            ))}
            {!loading && orders.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>受注データがありません</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
