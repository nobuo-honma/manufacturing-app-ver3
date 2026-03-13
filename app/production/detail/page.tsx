'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Order, ProductionPlan } from '@/lib/types'
import ProductionPlanForm from '@/components/production/ProductionPlanForm'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { fmtDate } from '@/lib/utils'
import { PLAN_STATUS_LABEL } from '@/lib/types'

function ProductionDetailContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder]     = useState<Order | null>(null)
  const [plans, setPlans]     = useState<ProductionPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }
    Promise.all([
      supabase.from('orders').select('*, customers(*), products(*)').eq('id', orderId).single(),
      supabase.from('production_plans').select('*, products(*)').eq('order_id', orderId).order('production_date'),
    ]).then(([{ data: o }, { data: p }]) => {
      setOrder(o); setPlans(p ?? []); setLoading(false)
    })
  }, [orderId])

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', gap:'16px', padding:'8px' }}>
      {[...Array(3)].map((_,i) => (
        <div key={i} style={{ height:'80px', borderRadius:'12px', background:'var(--surface-2)' }} />
      ))}
    </div>
  )
  if (!order) return (
    <div style={{ color:'var(--danger)', padding:'20px' }}>受注が見つかりません</div>
  )

  const registeredCs = plans.reduce((s, p) => s + p.planned_cs, 0)

  return (
    <div style={{ maxWidth:'760px', display:'flex', flexDirection:'column', gap:'20px' }}>

      {/* ヘッダー */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
        <Link href="/production" style={{ color:'var(--text-muted)', display:'flex', alignItems:'center' }}>
          <ChevronLeft size={20} />
        </Link>
        <h1 className="page-title">製造計画登録</h1>
      </div>

      {/* 受注情報 */}
      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'var(--surface-2)', display:'flex', alignItems:'center', gap:'8px' }}>
          <div className="accent-line" />
          <span style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)' }}>受注情報</span>
        </div>
        <div style={{ padding:'16px 20px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px' }}>
          {[
            { label:'製品',       val: `${order.products?.name} / ${order.products?.variant_name}` },
            { label:'出荷先',     val: order.customers?.name ?? '' },
            { label:'受注数',     val: `${order.quantity} c/s` },
            { label:'希望出荷日', val: fmtDate(order.desired_ship_date) },
            { label:'登録済み',   val: `${registeredCs} c/s` },
            { label:'残り',       val: `${order.quantity - registeredCs} c/s` },
          ].map(({ label, val }) => (
            <div key={label}>
              <p style={{ fontSize:'0.625rem', color:'var(--text-muted)', marginBottom:'3px', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</p>
              <p style={{ fontSize:'0.9375rem', fontWeight:700, color:'var(--text-primary)' }}>{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 登録済み計画テーブル */}
      {plans.length > 0 && (
        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{ padding:'12px 20px', borderBottom:'1px solid var(--border)', background:'var(--surface-2)', display:'flex', alignItems:'center', gap:'8px' }}>
            <div className="accent-line" />
            <span style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)' }}>登録済み製造計画</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>{['製造予定日','製造量','c/s','Lot番号','賞味期限','ステータス','備考'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {plans.map(p => (
                <tr key={p.id}>
                  <td style={{ color:'var(--text-secondary)' }}>{fmtDate(p.production_date)}</td>
                  <td style={{ color:'var(--accent)', fontWeight:600 }}>{p.production_kg}kg</td>
                  <td style={{ fontWeight:600 }}>{p.planned_cs}</td>
                  <td style={{ fontFamily:'DM Mono,monospace', fontSize:'0.6875rem', color:'var(--accent)' }}>{p.lot_code}</td>
                  <td style={{ color:'var(--text-secondary)' }}>{p.expiry_date}</td>
                  <td><span className="badge badge-blue">{PLAN_STATUS_LABEL[p.status]}</span></td>
                  <td style={{ color:'var(--text-muted)', fontSize:'0.75rem' }}>{p.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 製造計画フォーム */}
      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'var(--surface-2)', display:'flex', alignItems:'center', gap:'8px' }}>
          <div className="accent-line" />
          <span style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)' }}>新しい製造計画を追加</span>
        </div>
        <div style={{ padding:'24px' }}>
          <ProductionPlanForm order={order} existingCs={registeredCs} comboSeqStart={plans.length + 1} />
        </div>
      </div>

    </div>
  )
}

export default function ProductionDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductionDetailContent />
    </Suspense>
  )
}
