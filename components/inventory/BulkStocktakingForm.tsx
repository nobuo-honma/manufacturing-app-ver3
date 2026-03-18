'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ItemStock } from '@/lib/types'
import { X, Save, AlertCircle } from 'lucide-react'

interface Props {
  stocks: ItemStock[]
  onClose: () => void
  onSaved: () => void
}

export default function BulkStocktakingForm({ stocks, onClose, onSaved }: Props) {
  const [counts, setCounts] = useState<{ [itemId: string]: number }>(
    Object.fromEntries(stocks.map(s => [s.item_id, s.quantity]))
  )
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      const now = new Date().toISOString()
      
      // 変更があったものだけ抽出
      const adjustments = stocks.filter(s => counts[s.item_id] !== s.quantity).map(s => ({
        item_id: s.item_id,
        before_qty: s.quantity,
        after_qty: counts[s.item_id],
        reason: '定例棚卸',
        adjusted_at: now
      }))

      if (adjustments.length === 0) {
        onClose()
        return
      }

      // 在庫更新
      for (const adj of adjustments) {
        await supabase.from('item_stocks')
          .update({ quantity: adj.after_qty, updated_at: now })
          .eq('item_id', adj.item_id)
      }

      // 履歴登録
      await supabase.from('inventory_adjustments').insert(adjustments)

      onSaved()
      onClose()
    } catch (error) {
      console.error('Error saving stocktaking:', error)
      alert('保存中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(6,13,31,0.85)',
      display: 'flex', flexDirection: 'column', zIndex: 100, backdropFilter: 'blur(8px)'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px', background: 'var(--surface-1)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>一括棚卸</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>実際の在庫数を入力してください</p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={24} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '12px' : '24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {isMobile ? (
            // Mobile Card View
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '80px' }}>
              {stocks.map(s => (
                <div key={s.item_id} className="card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontFamily: 'DM Mono' }}>{s.item_id}</span>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.items?.name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>帳簿在庫</div>
                      <div style={{ fontWeight: 500 }}>{s.quantity} {s.items?.unit}</div>
                    </div>
                  </div>
                  <div>
                    <label className="label" style={{ fontSize: '0.75rem' }}>実棚卸数 ({s.items?.unit})</label>
                    <input
                      type="number"
                      step="0.001"
                      className="input"
                      style={{ fontSize: '1.125rem', padding: '10px 16px' }}
                      value={counts[s.item_id]}
                      onChange={e => setCounts({ ...counts, [s.item_id]: Number(e.target.value) })}
                    />
                  </div>
                  {counts[s.item_id] !== s.quantity && (
                    <div style={{
                      marginTop: '12px', fontSize: '0.75rem', fontWeight: 600,
                      color: counts[s.item_id] > s.quantity ? 'var(--ok)' : 'var(--danger)'
                    }}>
                      差異: {Math.round((counts[s.item_id] - s.quantity) * 1000) / 1000} {s.items?.unit}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Desktop Table View
            <div className="card" style={{ overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>品目ID</th>
                    <th>品目名</th>
                    <th style={{ textAlign: 'right' }}>帳簿在庫</th>
                    <th>実棚卸数</th>
                    <th>単位</th>
                    <th>差異</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map(s => {
                    const diff = Math.round((counts[s.item_id] - s.quantity) * 1000) / 1000
                    return (
                      <tr key={s.item_id}>
                        <td style={{ fontFamily: 'DM Mono', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.item_id}</td>
                        <td style={{ fontWeight: 500 }}>{s.items?.name}</td>
                        <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{s.quantity}</td>
                        <td style={{ width: '140px' }}>
                          <input
                            type="number"
                            step="0.001"
                            className="input"
                            style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.875rem' }}
                            value={counts[s.item_id]}
                            onChange={e => setCounts({ ...counts, [s.item_id]: Number(e.target.value) })}
                          />
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{s.items?.unit}</td>
                        <td style={{ fontWeight: 600, color: diff === 0 ? 'var(--text-muted)' : diff > 0 ? 'var(--ok)' : 'var(--danger)' }}>
                          {diff > 0 ? '+' : ''}{diff}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Footer */}
      <div style={{
        padding: '16px 24px', background: 'var(--surface-1)', borderTop: '1px solid var(--border)',
        display: 'flex', gap: '12px', justifyContent: 'flex-end',
        position: isMobile ? 'fixed' : 'relative', bottom: 0, left: 0, right: 0, boxShadow: '0 -4px 20px rgba(0,0,0,0.3)'
      }}>
        <button onClick={onClose} className="btn-secondary" style={{ flex: isMobile ? 1 : 'none' }}>キャンセル</button>
        <button onClick={handleSave} disabled={loading} className="btn-primary" style={{ flex: isMobile ? 1 : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Save size={18} />
          {loading ? '保存中...' : '在庫を更新する'}
        </button>
      </div>
    </div>
  )
}
