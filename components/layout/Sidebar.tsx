'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingCart, Factory,
  Package, Truck, Ship, Settings, BookOpen,
} from 'lucide-react'

const NAV = [
  { href: '/',           label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/orders',     label: '受注管理',       icon: ShoppingCart },
  { href: '/production', label: '製造管理',       icon: Factory },
  { href: '/inventory',  label: '在庫管理',       icon: Package },
  { href: '/arrivals',   label: '入荷管理',       icon: Truck },
  { href: '/shipments',  label: '出荷管理',       icon: Ship },
  { href: '/masters',    label: 'マスタ管理',     icon: Settings },
  { href: '/manual',     label: '操作マニュアル', icon: BookOpen },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside style={{
      width: '220px',
      minHeight: '100vh',
      background: 'var(--navy-900)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* ロゴ */}
      <div style={{
        padding: '20px 18px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, var(--accent-dim), var(--accent))',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px',
            boxShadow: '0 0 16px var(--accent-glow)',
          }}>🍞</div>
          <div>
            <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>製造管理</p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '1px' }}>DisasterBread</p>
          </div>
        </div>
      </div>

      {/* ナビ */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              borderRadius: '8px',
              marginBottom: '2px',
              fontSize: '0.8125rem',
              fontWeight: active ? 600 : 400,
              color: active ? '#fff' : 'var(--text-secondary)',
              background: active ? 'var(--accent-dim)' : 'transparent',
              boxShadow: active ? '0 0 14px var(--accent-glow)' : 'none',
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'var(--surface-3)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)' } }}
            onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' } }}
            >
              <Icon size={16} style={{ opacity: active ? 1 : 0.7 }} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* フッター */}
      <div style={{
        padding: '14px 18px',
        borderTop: '1px solid var(--border)',
        fontSize: '0.6875rem',
        color: 'var(--text-muted)',
      }}>
        v1.0.0
      </div>
    </aside>
  )
}
