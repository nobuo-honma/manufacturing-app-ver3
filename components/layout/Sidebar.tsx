'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingCart, Factory,
  Package, Truck, Ship, Settings, BookOpen, FileText, X
} from 'lucide-react'

export const NAV = [
  { href: '/',           label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/orders',     label: '受注管理',       icon: ShoppingCart },
  { href: '/orders/new', label: '受注登録',       icon: ShoppingCart },
  { href: '/production', label: '製造管理',       icon: Factory },
  { href: '/production/calendar', label: '製造予定表',   icon: Factory },
  { href: '/inventory',  label: '在庫管理',       icon: Package },
  { href: '/arrivals',   label: '入荷管理',       icon: Truck },
  { href: '/orders/purchase', label: '発注書作成',   icon: FileText },
  { href: '/shipments',  label: '出荷管理',       icon: Ship },
  { href: '/masters',    label: 'マスタ管理',     icon: Settings },
  { href: '/manual',     label: '操作マニュアル', icon: BookOpen },
]

export default function Sidebar({ isOpen = false, closeMenu }: { isOpen?: boolean; closeMenu?: () => void }) {
  const pathname = usePathname()
  return (
    <aside 
      className={`
        flex flex-col
        fixed inset-y-0 left-0 z-[50] transition-transform duration-300 ease-in-out
        md:sticky md:top-0 md:translate-x-0
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}
      style={{
        width: '220px',
        minHeight: '100vh',
        background: 'var(--navy-900)',
        borderRight: '1px solid var(--border)',
        flexShrink: 0,
      }}
      aria-hidden={!isOpen && typeof window !== 'undefined' && window.innerWidth < 768}
    >
      {/* ロゴ */}
      <div style={{
        padding: '20px 18px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
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
        
        {/* スマホのみ表示する閉じるボタン */}
        {closeMenu && (
          <button 
            className="md:hidden p-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded"
            onClick={closeMenu}
            aria-label="Close Navigation Menu"
          >
            <X size={20} color="var(--text-secondary)" aria-hidden="true" />
          </button>
        )}
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
            onClick={() => {
              if (window.innerWidth < 768 && closeMenu) closeMenu();
            }}
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
