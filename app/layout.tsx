import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import Header  from '@/components/layout/Header'

export const metadata: Metadata = {
  title: '製造管理システム',
  description: 'DisasterBread 製造・在庫・出荷管理',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body style={{ display: 'flex', minHeight: '100vh', background: 'var(--navy-950)' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Header />
          <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
