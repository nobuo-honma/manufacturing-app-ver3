'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Bell } from 'lucide-react'

export default function Announcements() {
  const [items, setItems] = useState<any[]>([])
  useEffect(() => {
    supabase.from('announcements').select('*').order('published_at', { ascending: false }).limit(5)
      .then(({ data }) => setItems(data || []))
  }, [])

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Bell size={15} style={{ color: 'var(--accent)' }} />
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>お知らせ</span>
      </div>
      {items.length === 0
        ? <p style={{ padding: '14px 18px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>お知らせはありません</p>
        : items.map(a => (
          <div key={a.id} style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>{a.title}</p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '3px' }}>
              {new Date(a.published_at).toLocaleDateString('ja-JP')}
            </p>
          </div>
        ))
      }
    </div>
  )
}
