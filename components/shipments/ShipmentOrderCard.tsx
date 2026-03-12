'use client'
import { Order } from '@/lib/types'
import { ORDER_STATUS_LABEL } from '@/lib/utils'
import { fmtDate } from '@/lib/utils'

interface Props { order: Order; shippedCs: number; selected: boolean; onClick: () => void }

export default function ShipmentOrderCard({ order, shippedCs, selected, onClick }: Props) {
  const progress    = order.quantity > 0 ? Math.min(100, (shippedCs / order.quantity) * 100) : 0
  const remainCs    = order.quantity - shippedCs
  const isCompleted = remainCs <= 0

  return (
    <button onClick={onClick} style={{
      width:'100%', textAlign:'left', padding:'14px 18px',
      borderBottom:'1px solid var(--border)',
      background: selected ? 'rgba(56,189,248,0.08)' : 'transparent',
      borderLeft: selected ? '3px solid var(--accent)' : '3px solid transparent',
      cursor:'pointer', transition:'all 0.15s',
      opacity: isCompleted ? 0.55 : 1,
    }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'6px' }}>
        <p style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--text-primary)', flex:1, marginRight:'8px' }}>
          {order.customers?.name}
        </p>
        <span className={`badge ${order.status === 'shipped' ? 'badge-ok' : order.status === 'in_production' ? 'badge-warn' : 'badge-blue'}`}
          style={{ flexShrink:0 }}>
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>
      <p style={{ fontSize:'0.75rem', color:'var(--text-secondary)', marginBottom:'8px' }}>
        {order.products?.variant_name}
      </p>
      <div style={{ display:'flex', gap:'14px', fontSize:'0.6875rem', color:'var(--text-muted)', marginBottom:'8px' }}>
        <span>受注: <strong style={{ color:'var(--text-primary)' }}>{order.quantity}</strong> c/s</span>
        <span>出荷済: <strong style={{ color:'var(--ok)' }}>{shippedCs}</strong> c/s</span>
        <span style={{ color: remainCs < 0 ? 'var(--danger)' : 'inherit' }}>残: <strong>{remainCs}</strong> c/s</span>
      </div>
      <div style={{ height:'4px', background:'var(--surface-3)', borderRadius:'999px', overflow:'hidden' }}>
        <div style={{
          height:'100%', borderRadius:'999px', transition:'width 0.3s',
          background: isCompleted ? 'var(--ok)' : 'var(--accent)',
          width:`${progress}%`,
        }} />
      </div>
      <p style={{ fontSize:'0.625rem', color:'var(--text-muted)', marginTop:'6px' }}>
        希望出荷日: {fmtDate(order.desired_ship_date)}
      </p>
    </button>
  )
}
