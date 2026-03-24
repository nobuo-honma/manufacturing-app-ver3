'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, X, ChevronRight } from 'lucide-react'
import { NAV } from './Sidebar'

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
  '/orders/purchase': '発注書作成',
}

export default function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const title = mounted 
    ? (Object.entries(PAGE_TITLES).find(([key]) => pathname === key || pathname.startsWith(key + '/'))?.[1] ?? '')
    : ''
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // ページ遷移時にメニューを閉じる
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const dateString = mounted ? new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }) : ''

  return (
    <>
      <header 
        className="flex items-center h-[52px] px-4 lg:px-[28px] gap-[10px] bg-navy-900 border-b border-border sticky lg:static top-0 z-[100] lg:z-auto"
        style={{
          background: 'var(--navy-900)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* モバイル用ハンバーガーボタン */}
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="lg:hidden p-1.5 hover:bg-surface-3 rounded-lg text-text-secondary transition-colors"
        >
          <Menu size={20} />
        </button>

        <div style={{ width: '3px', height: '16px', background: 'var(--accent)', borderRadius: '2px', boxShadow: '0 0 8px var(--accent-glow)' }} />
        <h1 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {mounted ? title : ''}
        </h1>
        
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }} className="hidden lg:inline-block">
          {dateString}
        </span>
        <span className="ml-auto text-[11px] text-text-muted lg:hidden">
          {dateString}
        </span>
      </header>

      {/* モバイルメニュー（ドロワー） */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          {/* 背景オーバーレイ */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* メニュー本体 */}
          <aside 
            className="absolute left-0 top-0 bottom-0 w-[280px] bg-navy-900 shadow-2xl flex flex-col animate-in slide-in-from-left duration-200"
            style={{ borderRight: '1px solid var(--border)' }}
          >
            {/* ヘッダーエリア */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-lg shadow-[0_0_12px_rgba(34,197,94,0.15)]">
                  🍞
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white line-height-1">製造管理</p>
                  <p className="text-[10px] text-text-muted">DisasterBread</p>
                </div>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 hover:bg-surface-3 rounded-full text-text-secondary"
              >
                <X size={20} />
              </button>
            </div>

            {/* ナビ項目 */}
            <nav 
              className="flex-1 overflow-y-auto p-3"
              style={{ display: 'flex !important' as any, flexDirection: 'column !important' as any, gap: '4px' }}
            >
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== '/' && pathname.startsWith(href))
                return (
                  <Link 
                    key={href} 
                    href={href}
                    className={`rounded-xl transition-all transition-colors ${
                      active 
                        ? 'bg-accent-dim text-white shadow-[0_0_12px_var(--accent-glow)]' 
                        : 'text-text-secondary hover:bg-surface-3 hover:text-white'
                    }`}
                    style={{
                      display: 'flex !important' as any,
                      flexDirection: 'row !important' as any,
                      alignItems: 'center',
                      gap: '16px',
                      padding: '14px 16px',
                      textDecoration: 'none',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <Icon size={20} style={{ opacity: active ? 1 : 0.7, flexShrink: 0 }} />
                    <span style={{ fontSize: '15px', fontWeight: 500, flex: 1 }}>{label}</span>
                    <ChevronRight size={14} style={{ opacity: 0.3 }} />
                  </Link>
                )
              })}
            </nav>

            {/* フッター */}
            <div className="p-5 border-t border-border text-[11px] text-text-muted text-center tracking-wider">
              VER 1.0.0
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
