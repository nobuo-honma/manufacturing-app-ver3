'use client'
import { useState } from 'react'
import { useOrders } from '@/hooks/useOrders'
import { Order } from '@/lib/types'
import { fmtDate } from '@/lib/utils'
import { ORDER_STATUS_LABEL } from '@/lib/utils'
import ProductionPlanForm from '@/components/production/ProductionPlanForm'
import Link from 'next/link'
import { Calendar, ChevronRight, Package } from 'lucide-react'

const STATUS_STYLE: Record<string, { dot: string; badge: string }> = {
  ordered:      { dot: 'var(--accent)',  badge: 'badge-blue'   },
  in_production:{ dot: 'var(--warn)',   badge: 'badge-warn'   },
  shipped:      { dot: 'var(--ok)',     badge: 'badge-ok'     },
}

export default function ProductionPage() {
  const { orders, loading } = useOrders()
  const active = orders.filter(o => o.status !== 'shipped')
  const [selected, setSelected] = useState<Order | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>

      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className="page-title">製造管理</h1>
        <Link href="/production/calendar" className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.875rem' }}>
          <Calendar size={15} />
          製造予定表
        </Link>
      </div>

      {/* 2カラムレイアウト */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', alignItems: 'start' }}>

        {/* ── 左：受注カード一覧 ── */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface-2)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <div className="accent-line" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              受注一覧
            </span>
            <span className="badge badge-blue" style={{ marginLeft: 'auto' }}>
              {active.length}件
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '20px' }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{
                  height: '80px', borderRadius: '10px', marginBottom: '10px',
                  background: 'var(--surface-2)', animation: 'pulse 1.5s infinite'
                }} />
              ))}
            </div>
          ) : active.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              対象の受注がありません
            </div>
          ) : (
            <div style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
              {active.map(order => {
                const st = STATUS_STYLE[order.status] ?? STATUS_STYLE.ordered
                const isSelected = selected?.id === order.id
                return (
                  <button key={order.id} onClick={() => setSelected(order)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '14px 18px',
                      borderBottom: '1px solid var(--border)',
                      background: isSelected ? 'rgba(56,189,248,0.08)' : 'transparent',
                      borderLeft: isSelected ? '3px solid var(--accent)' : '3px solid transparent',
                      cursor: 'pointer', transition: 'all 0.15s', display: 'block',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                          {order.products?.variant_name ?? order.products?.name}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {order.customers?.name}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`badge ${st.badge}`}>{ORDER_STATUS_LABEL[order.status]}</span>
                        <ChevronRight size={14} color="var(--text-muted)" />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '14px', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      <span>
                        <span style={{ color: 'var(--text-secondary)' }}>{order.quantity}</span> c/s
                      </span>
                      <span>出荷希望: <span style={{ color: 'var(--text-secondary)' }}>{fmtDate(order.desired_ship_date)}</span></span>
                    </div>
                    <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'DM Mono, monospace' }}>
                      {order.id}
                    </p>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ── 右：製造計画入力フォーム ── */}
        <div>
          {selected ? (
            <div className="card" style={{ overflow: 'hidden' }}>
              {/* 選択中受注ヘッダー */}
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--surface-2)',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <div className="accent-line" />
                <div>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {selected.products?.variant_name ?? selected.products?.name}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {selected.customers?.name} ／ {selected.quantity} c/s ／ 出荷希望 {fmtDate(selected.desired_ship_date)}
                  </p>
                </div>
                <button onClick={() => setSelected(null)}
                  className="btn-secondary"
                  style={{ marginLeft: 'auto', fontSize: '0.75rem', padding: '4px 12px' }}>
                  選択解除
                </button>
              </div>

              <div style={{ padding: '24px' }}>
                <ProductionPlanForm order={selected} />
              </div>
            </div>
          ) : (
            <div className="card" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              minHeight: '320px', gap: '14px'
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'rgba(56,189,248,0.08)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Package size={24} color="var(--text-muted)" />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', fontWeight: 600 }}>
                受注を選択してください
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                左側の受注カードをクリックすると製造計画を登録できます
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
