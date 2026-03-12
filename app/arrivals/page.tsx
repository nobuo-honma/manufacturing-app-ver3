'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Arrival } from '@/lib/types'
import { generateArrivalId, ARRIVAL_STATUS_LABEL } from '@/lib/utils'
import ArrivalCalendar from '@/components/arrivals/ArrivalCalendar'
import ArrivalForm     from '@/components/arrivals/ArrivalForm'
import { Plus } from 'lucide-react'

export default function ArrivalsPage() {
  const [arrivals, setArrivals] = useState<Arrival[]>([])
  const [showForm, setShowForm] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  const fetchArrivals = async () => {
    const { data } = await supabase.from('arrivals').select('*, items(*)').order('expected_date')
    setArrivals(data || [])
  }
  useEffect(() => { fetchArrivals() }, [])

  const handleArrive = async (id: string, itemId: string, qty: number) => {
    await supabase.from('arrivals').update({ status: 'arrived' }).eq('id', id)
    const { data: stock } = await supabase.from('item_stocks').select('quantity').eq('item_id', itemId).single()
    await supabase.from('item_stocks').upsert({ item_id: itemId, quantity: (stock?.quantity ?? 0) + qty, updated_at: new Date().toISOString() })
    fetchArrivals()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className="page-title">入荷管理</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="tab-bar">
            <button onClick={() => setViewMode('list')}     className={`tab-item ${viewMode === 'list'     ? 'active' : ''}`}>一覧</button>
            <button onClick={() => setViewMode('calendar')} className={`tab-item ${viewMode === 'calendar' ? 'active' : ''}`}>カレンダー</button>
          </div>
          <button onClick={() => setShowForm(v => !v)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={15} /> 入荷予定登録
          </button>
        </div>
      </div>

      {showForm && (
        <ArrivalForm onSaved={() => { setShowForm(false); fetchArrivals() }} onCancel={() => setShowForm(false)} />
      )}

      {viewMode === 'calendar' ? (
        <ArrivalCalendar arrivals={arrivals} />
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>{['入荷ID','品目','発注日','入荷予定日','予定数','単位','ステータス',''].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {arrivals.map(a => (
                <tr key={a.id}>
                  <td style={{ fontFamily: 'DM Mono', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{a.id}</td>
                  <td>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'DM Mono' }}>{a.item_id}</p>
                    <p style={{ fontWeight: 500 }}>{a.items?.name}</p>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{new Date(a.order_date).toLocaleDateString('ja-JP')}</td>
                  <td>{new Date(a.expected_date).toLocaleDateString('ja-JP')}</td>
                  <td style={{ fontWeight: 600 }}>{a.quantity}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{a.unit}</td>
                  <td>
                    <span className={`badge ${a.status === 'arrived' ? 'badge-ok' : 'badge-warn'}`}>
                      {ARRIVAL_STATUS_LABEL[a.status]}
                    </span>
                  </td>
                  <td>
                    {a.status === 'pending' && (
                      <button onClick={() => handleArrive(a.id, a.item_id, a.quantity)}
                        style={{ fontSize: '0.75rem', background: 'var(--ok-bg)', color: 'var(--ok)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}>
                        入荷処理
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {arrivals.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>入荷データがありません</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
