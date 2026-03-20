'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Arrival } from '@/lib/types'
import { generateArrivalId, ARRIVAL_STATUS_LABEL, toJapaneseEraDate } from '@/lib/utils'
import ArrivalCalendar from '@/components/arrivals/ArrivalCalendar'
import ArrivalForm     from '@/components/arrivals/ArrivalForm'
import { Plus, Pencil, Trash2, FileText, Printer, X, Check } from 'lucide-react'
import { ITEM_SUPPLIER_MAP, SUPPLIER_INFO, DEFAULT_SENDER } from '@/lib/supplierData'
import OrderTemplate from '@/components/arrivals/OrderTemplate'
import { PurchaseOrder } from '@/lib/types'

export default function ArrivalsPage() {
  const [arrivals, setArrivals] = useState<Arrival[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingArrival, setEditingArrival] = useState<Arrival | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [poData, setPoData] = useState<PurchaseOrder | null>(null)

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

  const handleDelete = async (a: Arrival) => {
    if (!confirm(`入荷予定 ${a.id} を削除しますか？`)) return
    
    if (a.status === 'arrived') {
      const { data: stock } = await supabase.from('item_stocks').select('quantity').eq('item_id', a.item_id).single()
      const newQty = (stock?.quantity ?? 0) - a.quantity
      await supabase.from('item_stocks').upsert({ item_id: a.item_id, quantity: newQty, updated_at: new Date().toISOString() })
    }
    
    const { error } = await supabase.from('arrivals').delete().eq('id', a.id)
    if (error) {
      alert(error.message)
      return
    }
    fetchArrivals()
  }

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleCreatePO = (supplier: string) => {
    const selectedArrivals = arrivals.filter(a => selectedIds.has(a.id) && ITEM_SUPPLIER_MAP[a.item_id] === supplier)
    if (selectedArrivals.length === 0) return

    const po: PurchaseOrder = {
      supplierName: supplier,
      orderDate: toJapaneseEraDate(new Date()),
      sender: DEFAULT_SENDER,
      items: selectedArrivals.map(a => ({
        code: a.item_id,
        manufacturer: ITEM_SUPPLIER_MAP[a.item_id] || '',
        name: a.items?.name || '',
        spec: a.items ? `${a.items.unit_size}${a.items.unit}` : '',
        unit: '1ケース',
        quantity: a.quantity
      }))
    }
    setPoData(po)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className="page-title">入荷管理</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {selectedIds.size > 0 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {Array.from(new Set(Array.from(selectedIds).map(id => {
                const a = arrivals.find(x => x.id === id)
                return a ? ITEM_SUPPLIER_MAP[a.item_id] : null
              }).filter(Boolean))).map(s => (
                <button key={s!} onClick={() => handleCreatePO(s!)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', padding: '6px 12px', borderColor: 'var(--accent)' }}>
                  <FileText size={14} /> {s}の発注書作成
                </button>
              ))}
            </div>
          )}
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
        <ArrivalCalendar arrivals={arrivals} onRefresh={fetchArrivals} />
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>{[<input type="checkbox" checked={selectedIds.size === arrivals.length && arrivals.length > 0} onChange={() => {
                if (selectedIds.size === arrivals.length) setSelectedIds(new Set())
                else setSelectedIds(new Set(arrivals.map(a => a.id)))
              }} />, '入荷ID','品目','発注日','入荷予定日','予定数','単位','ステータス',''].map((h, i) => <th key={i}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {arrivals.map(a => (
                <tr key={a.id}>
                  <td>
                    <input type="checkbox" checked={selectedIds.has(a.id)} onChange={() => handleToggleSelect(a.id)} />
                  </td>
                  <td style={{ fontFamily: 'DM Mono', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{a.id}</td>
                  <td>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'DM Mono' }}>{a.item_id}</p>
                    <p style={{ fontWeight: 500 }}>{a.items?.name}</p>
                    <p style={{ fontSize: '0.625rem', color: 'var(--accent)' }}>{ITEM_SUPPLIER_MAP[a.item_id] || '発注先未設定'}</p>
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
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {a.status === 'pending' && (
                        <>
                          <button onClick={() => handleArrive(a.id, a.item_id, a.quantity)}
                            style={{ fontSize: '0.75rem', background: 'var(--ok-bg)', color: 'var(--ok)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}>
                            入荷処理
                          </button>
                          <button onClick={() => setEditingArrival(a)} title="編集"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <Pencil size={14} />
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDelete(a)} title="削除"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                        <Trash2 size={14} />
                      </button>
                    </div>
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
      {editingArrival && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}
          onClick={() => setEditingArrival(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px' }}>
            <ArrivalForm 
              initialData={editingArrival}
              onSaved={() => { setEditingArrival(null); fetchArrivals() }} 
              onCancel={() => setEditingArrival(null)} 
            />
          </div>
        </div>
      )}
      {poData && (
        <div className="no-print" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '40px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', width: '210mm', justifyContent: 'flex-end' }}>
            <button onClick={() => window.print()} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Printer size={18} /> 印刷する
            </button>
            <button onClick={() => setPoData(null)} className="btn-secondary" style={{ background: 'var(--surface-1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <X size={18} /> 閉じる
            </button>
          </div>
          <div style={{ background: 'white', borderRadius: '4px', transform: 'scale(0.9)', transformOrigin: 'top center' }}>
            <OrderTemplate data={poData} />
          </div>
        </div>
      )}

      {/* 印刷用表示 (画面には見えないが、printメディアではこれだけが見えるように調整が必要な場合がある) */}
      <div className="hidden print:block">
        {poData && <OrderTemplate data={poData} />}
      </div>
    </div>
  )
}
