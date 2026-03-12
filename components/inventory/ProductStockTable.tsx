'use client'
import { ProductStock } from '@/lib/types'

interface Props { stocks: ProductStock[]; search?: string }

export default function ProductStockTable({ stocks, search = '' }: Props) {
  const today    = new Date()
  const warnDate = new Date(today); warnDate.setMonth(warnDate.getMonth() + 3)
  const filtered = stocks.filter(s => !search || s.products?.name.includes(search) || s.lot_code.includes(search))

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <table className="data-table">
        <thead>
          <tr>{['製造Lot','製品名','製造種類','在庫(c/s)','在庫(p)','賞味期限','期限状態'].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(s => {
            const expiry    = s.expiry_date ? new Date(s.expiry_date) : null
            const isExpired = expiry && expiry < today
            const isWarn    = expiry && !isExpired && expiry < warnDate
            return (
              <tr key={s.id} style={{ background: isExpired ? 'rgba(248,113,113,0.05)' : undefined }}>
                <td style={{ fontFamily: 'DM Mono', fontSize: '0.6875rem', color: 'var(--accent)' }}>{s.lot_code}</td>
                <td>{s.products?.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{s.products?.variant_name}</td>
                <td style={{ fontWeight: 600 }}>{s.qty_cs}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{s.qty_piece > 0 ? s.qty_piece : '-'}</td>
                <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.expiry_date ?? '-'}</td>
                <td>
                  {isExpired && <span className="badge badge-danger">期限切れ</span>}
                  {isWarn    && <span className="badge badge-warn">要注意</span>}
                  {!isExpired && !isWarn && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>正常</span>}
                </td>
              </tr>
            )
          })}
          {filtered.length === 0 && (
            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>データがありません</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
