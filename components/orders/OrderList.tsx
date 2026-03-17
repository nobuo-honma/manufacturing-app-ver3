import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useOrders } from '@/hooks/useOrders'
import { Order, OrderStatus } from '@/lib/types'
import { ORDER_STATUS_LABEL } from '@/lib/utils'
import { Pencil, Trash2 } from 'lucide-react'
import OrderForm from './OrderForm'

const STATUS_STYLE: Record<string, string> = {
  received:      'badge badge-blue',
  in_production: 'badge badge-warn',
  shipped:       'badge badge-ok',
}

export default function OrderList() {
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')
  const { orders, loading, refresh } = useOrders(filterStatus === 'all' ? undefined : filterStatus)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)

  const handleDelete = async (order: Order) => {
    if (order.status !== 'received') {
      alert('製造中または出荷済の受注は削除できません。')
      return
    }
    if (!confirm(`受注ID "${order.id}" を削除しますか？\n紐づく製造計画等も削除される場合があります。`)) return
    
    // First delete related production plans if any, then the order itself
    await supabase.from('production_plans').delete().eq('order_id', order.id)
    const { error } = await supabase.from('orders').delete().eq('id', order.id)
    if (error) {
      alert(error.message)
      return
    }
    refresh()
  }

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
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Link href={`/production/detail?orderId=${o.id}`} style={{ fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none', marginRight: '8px' }}>
                      製造計画 →
                    </Link>
                    {o.status === 'received' && (
                      <button onClick={() => setEditingOrder(o)} title="編集"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                        <Pencil size={14} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(o)} title={o.status !== 'received' ? '未処理のみ削除可' : '削除'}
                      disabled={o.status !== 'received'}
                      style={{ background: 'none', border: 'none', cursor: o.status !== 'received' ? 'not-allowed' : 'pointer', color: o.status !== 'received' ? 'var(--text-3)' : 'var(--text-muted)', opacity: o.status !== 'received' ? 0.3 : 1 }}
                      onMouseEnter={e => { if(o.status === 'received') e.currentTarget.style.color = 'var(--danger)' }}
                      onMouseLeave={e => { if(o.status === 'received') e.currentTarget.style.color = 'var(--text-muted)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && orders.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>受注データがありません</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 編集モーダル */}
      {editingOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}
          onClick={() => setEditingOrder(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px' }}>
            <OrderForm 
              initialData={editingOrder}
              onSaved={() => { setEditingOrder(null); refresh() }} 
              onCancel={() => setEditingOrder(null)} 
            />
          </div>
        </div>
      )}
    </div>
  )
}
