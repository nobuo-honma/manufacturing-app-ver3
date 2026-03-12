'use client'
import { ItemStock } from '@/lib/types'
import { getStockStatus } from '@/lib/utils'

interface Props {
  stocks: ItemStock[]
  onStocktaking: (stock: ItemStock) => void
  search?: string
}

export default function ItemStockTable({ stocks, onStocktaking, search = '' }: Props) {
  const filtered = stocks.filter(s =>
    !search || s.items?.name.includes(search) || s.item_id.includes(search)
  )

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <table className="data-table">
        <thead>
          <tr>
            {['品目ID','品目名','在庫数','単位','安全在庫','差分','ステータス',''].map(h => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map(s => {
            const status = s.items ? getStockStatus(s.quantity, s.items.safety_stock) : '充足'
            const diff   = Math.round((s.quantity - (s.items?.safety_stock ?? 0)) * 1000) / 1000
            return (
              <tr key={s.item_id}>
                <td style={{ fontFamily: 'DM Mono', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{s.item_id}</td>
                <td style={{ fontWeight: 500 }}>{s.items?.name}</td>
                <td style={{ fontWeight: 600, color: diff < 0 ? 'var(--danger)' : 'var(--text-primary)' }}>{s.quantity}</td>
                <td style={{ color: 'var(--text-muted)' }}>{s.items?.unit}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{s.items?.safety_stock}</td>
                <td style={{ fontWeight: 500, color: diff < 0 ? 'var(--danger)' : 'var(--ok)' }}>
                  {diff >= 0 ? '+' : ''}{diff}
                </td>
                <td>
                  <span className={`badge ${status === '不足' ? 'badge-danger' : status === '注意' ? 'badge-warn' : 'badge-ok'}`}>
                    {status}
                  </span>
                </td>
                <td>
                  <button onClick={() => onStocktaking(s)} style={{ fontSize: '0.75rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    棚卸
                  </button>
                </td>
              </tr>
            )
          })}
          {filtered.length === 0 && (
            <tr><td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
              {search ? `"${search}" に一致する品目がありません` : 'データがありません'}
            </td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
