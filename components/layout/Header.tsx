'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

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

interface HeaderProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

export default function Header({ isOpen, toggleMenu }: HeaderProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  const title = mounted 
    ? (Object.entries(PAGE_TITLES).find(([key]) => pathname === key || pathname.startsWith(key + '/'))?.[1] ?? '')
    : ''
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const dateString = mounted ? new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }) : ''

  return (
    <header 
      className="flex items-center h-[52px] px-4 md:px-[28px] gap-[10px] bg-navy-900 border-b border-border sticky md:static top-0 z-[30] md:z-auto"
      style={{
        background: 'var(--navy-900)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* モバイル用ハンバーガーボタン */}
      <button 
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-controls="sidebar-menu"
        aria-label="Toggle Navigation Menu"
        className="md:hidden p-1.5 hover:bg-surface-3 rounded-lg text-text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      >
        {isOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>

      <div style={{ width: '3px', height: '16px', background: 'var(--accent)', borderRadius: '2px', boxShadow: '0 0 8px var(--accent-glow)' }} className="hidden md:block" />
      <h1 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
        {mounted ? title : ''}
      </h1>
      
      <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }} className="hidden md:inline-block">
        {dateString}
      </span>
      <span className="ml-auto text-[11px] text-text-muted md:hidden">
        {dateString}
      </span>
    </header>
  )
}
