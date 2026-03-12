'use client'
import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/':           'ダッシュボード',
  '/orders':     '受注管理',
  '/orders/new': '受注登録',
  '/production': '製造管理',
  '/production/calendar': '製造予定表',
  '/inventory':  '在庫管理',
  '/arrivals':   '入荷管理',
  '/shipments':  '出荷管理',
  '/masters':    'マスタ管理',
  '/manual':     '操作マニュアル',
}

export default function Header() {
  const pathname = usePathname()
  const title = Object.entries(PAGE_TITLES)
    .find(([key]) => pathname === key || pathname.startsWith(key + '/'))?.[1] ?? ''

  return (
    <header style={{
      height: '52px',
      background: 'var(--navy-900)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 28px',
      gap: '10px',
    }}>
      <div style={{ width: '3px', height: '16px', background: 'var(--accent)', borderRadius: '2px', boxShadow: '0 0 8px var(--accent-glow)' }} />
      <h1 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h1>
      <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
      </span>
    </header>
  )
}
