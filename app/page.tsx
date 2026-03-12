'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import StockAlert    from '@/components/dashboard/StockAlert'
import TodaySchedule from '@/components/dashboard/TodaySchedule'
import Announcements from '@/components/dashboard/Announcements'
import { ShoppingCart, Factory, Package } from 'lucide-react'
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '@/lib/utils'

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  return (
    <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px',
        background: `${color}1a`,
        border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</p>
      </div>
    </div>
  )
}

function OrderSummary() {
  const [counts, setCounts] = useState({ received: 0, in_production: 0, shipped: 0 })
  useEffect(() => {
    supabase.from('orders').select('status').then(({ data }) => {
      if (!data) return
      const c = { received: 0, in_production: 0, shipped: 0 }
      data.forEach(d => { if (d.status in c) c[d.status as keyof typeof c]++ })
      setCounts(c)
    })
  }, [])

  const total = counts.received + counts.in_production + counts.shipped

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>受注状況</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)' }}>
        {(Object.entries(counts) as [string, number][]).map(([status, count]) => (
          <div key={status} style={{ padding: '16px', background: 'var(--surface-1)', textAlign: 'center' }}>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{count}</p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {ORDER_STATUS_LABEL[status]}
            </p>
          </div>
        ))}
      </div>
      {total > 0 && (
        <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border)' }}>
          <div style={{ height: '4px', background: 'var(--surface-2)', borderRadius: '2px', overflow: 'hidden', display: 'flex' }}>
            {(Object.entries(counts) as [string, number][]).map(([status, count]) => {
              const colors: Record<string, string> = { received: 'var(--accent)', in_production: 'var(--warn)', shipped: 'var(--ok)' }
              return count > 0 ? (
                <div key={status} style={{ width: `${(count / total) * 100}%`, background: colors[status], transition: 'width 0.5s' }} />
              ) : null
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ orders: 0, plans: 0, stocks: 0 })
  useEffect(() => {
    Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }).neq('status', 'shipped'),
      supabase.from('production_plans').select('*', { count: 'exact', head: true }).neq('status', 'completed'),
      supabase.from('product_stocks').select('*', { count: 'exact', head: true }),
    ]).then(([o, p, s]) => setStats({ orders: o.count ?? 0, plans: p.count ?? 0, stocks: s.count ?? 0 }))
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-in">
      {/* サマリー */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        <StatCard label="進行中の受注" value={stats.orders} icon={ShoppingCart} color="var(--accent)" />
        <StatCard label="製造計画中"   value={stats.plans}  icon={Factory}      color="var(--warn)" />
        <StatCard label="製品在庫Lot"  value={stats.stocks} icon={Package}       color="var(--ok)" />
      </div>

      {/* メインコンテンツ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <StockAlert />
        <OrderSummary />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <TodaySchedule />
        <Announcements />
      </div>
    </div>
  )
}
