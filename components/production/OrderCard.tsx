'use client'
import { Order } from '@/lib/types'
import { fmtDate, ORDER_STATUS_LABEL } from '@/lib/utils'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const STATUS_BADGE: Record<string, string> = {
  ordered:       'badge-blue',
  in_production: 'badge-warn',
  shipped:       'badge-ok',
}

export default function OrderCard({ order }: { order: Order }) {
  return (
    <div className="card" style={{
      padding:'16px', display:'flex', flexDirection:'column', gap:'10px',
      transition:'border-color 0.15s, transform 0.15s',
    }}
    onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(56,189,248,0.35)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
    onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = ''; (e.currentTarget as HTMLElement).style.transform = '' }}
    >
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <p style={{ fontSize:'0.9375rem', fontWeight:700, color:'var(--text-primary)', marginBottom:'2px' }}>
            {order.products?.variant_name ?? order.products?.name}
          </p>
          <p style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>{order.customers?.name}</p>
        </div>
        <span className={`badge ${STATUS_BADGE[order.status] ?? 'badge-gray'}`}>
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>
      <div style={{ display:'flex', gap:'16px', fontSize:'0.75rem', color:'var(--text-secondary)' }}>
        <span><span style={{ color:'var(--text-muted)' }}>受注数</span>　<strong style={{ color:'var(--text-primary)' }}>{order.quantity} c/s</strong></span>
        <span><span style={{ color:'var(--text-muted)' }}>出荷希望</span>　<strong style={{ color:'var(--text-primary)' }}>{fmtDate(order.desired_ship_date)}</strong></span>
      </div>
      <p style={{ fontFamily:'DM Mono,monospace', fontSize:'0.625rem', color:'var(--text-muted)' }}>{order.id}</p>
      <Link href={`/production/${order.id}`} className="btn-primary"
        style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', textDecoration:'none', fontSize:'0.8125rem', padding:'9px' }}>
        製造計画を登録する <ChevronRight size={14} />
      </Link>
    </div>
  )
}
