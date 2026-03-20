'use client'
import React, { useState } from 'react'
import PurchaseOrderForm from '@/components/orders/PurchaseOrderForm'
import PurchaseOrderList from '@/components/orders/PurchaseOrderList'
import { FileText } from 'lucide-react'

export default function PurchaseOrderPage() {
  const [view, setView] = useState<'form' | 'list'>('form')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg text-accent">
            <FileText size={24} />
          </div>
          <h1 className="page-title">{view === 'form' ? '発注書作成' : '発注書履歴'}</h1>
        </div>

        <div className="tab-bar">
          <button 
            className={`tab-item ${view === 'form' ? 'active' : ''}`}
            onClick={() => setView('form')}
          >
            新規作成
          </button>
          <button 
            className={`tab-item ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
          >
            作成履歴
          </button>
        </div>
      </div>

      {view === 'form' ? (
        <PurchaseOrderForm />
      ) : (
        <PurchaseOrderList />
      )}
    </div>
  )
}
