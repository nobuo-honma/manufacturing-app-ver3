'use client'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // ハイドレーションエラー防止
  useEffect(() => {
    setMounted(true)
  }, [])

  // ウィンドウサイズが変更された際にメニューの開閉状態をリセット
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!mounted) {
    // ハイドレーション中は骨組みだけ表示するか、何も表示しない
    // ここではレイアウト崩れを防ぐため、最低限のラッパーを返す
    return <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--navy-950)' }} />
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', position: 'relative', background: 'var(--navy-950)' }}>
      {/* スマホ展開時の背景オーバーレイ */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-[40] bg-black/50 md:hidden transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* サイドバー本体（PC用＋スマホオーバーレイ兼用） */}
      <Sidebar isOpen={isMenuOpen} closeMenu={() => setIsMenuOpen(false)} />

      {/* メインコンテンツエリア */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Header 
          isOpen={isMenuOpen} 
          toggleMenu={() => setIsMenuOpen(!isMenuOpen)} 
        />
        <main style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', '@media (min-width: 768px)': { padding: '28px 32px' } } as any} className="md:p-[28px_32px]">
          {children}
        </main>
      </div>
    </div>
  )
}
