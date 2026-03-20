'use client'
import React, { useEffect, useState } from 'react'
import { PurchaseOrder } from '@/lib/types'
import { FileText, Printer, Trash2, ArrowRight } from 'lucide-react'
import OrderTemplate from '@/components/arrivals/OrderTemplate'

interface HistoryEntry extends PurchaseOrder {
  id: string
  createdAt: string
}

export default function PurchaseOrderList() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [selectedPO, setSelectedPO] = useState<HistoryEntry | null>(null)

  useEffect(() => {
    const data = localStorage.getItem('po_history')
    if (data) setHistory(JSON.parse(data))
  }, [])

  const deleteEntry = (id: string) => {
    if (!confirm('この履歴を削除しますか？')) return
    const newHistory = history.filter(entry => entry.id !== id)
    setHistory(newHistory)
    localStorage.setItem('po_history', JSON.stringify(newHistory))
  }

  if (selectedPO) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedPO(null)}
            className="btn-secondary flex items-center gap-2"
          >
            ← 戻る
          </button>
          <button onClick={() => window.print()} className="btn-primary flex items-center gap-2">
            <Printer size={18} /> 印刷する
          </button>
        </div>
        <div className="bg-white p-8 border rounded shadow-sm print-only overflow-x-auto">
          <OrderTemplate data={selectedPO} />
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      {history.length === 0 ? (
        <div className="p-20 text-center text-text-muted">
          作成履歴はありません
        </div>
      ) : (
        <table className="w-full border-collapse border-b border-r border-navy-700">
          <thead>
            <tr className="bg-navy-800">
              <th className="border-t border-l border-navy-700 p-3 text-left w-48">作成日時</th>
              <th className="border-t border-l border-navy-700 p-3 text-left w-32">発注先</th>
              <th className="border-t border-l border-navy-700 p-3 text-left">商品名（抜粋）</th>
              <th className="border-t border-l border-navy-700 p-3 text-center w-20">操作</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry) => (
              <tr key={entry.id} className="hover:bg-navy-850">
                <td className="border-t border-l border-navy-700 p-3 text-sm font-mono whitespace-nowrap">
                  {new Date(entry.createdAt).toLocaleString('ja-JP')}
                </td>
                <td className="border-t border-l border-navy-700 p-3 font-medium whitespace-nowrap">
                  {entry.supplierName}
                </td>
                <td className="border-t border-l border-navy-700 p-3 text-sm text-text-secondary truncate max-w-0">
                  {entry.items.map(i => i.name).join(', ')}
                </td>
                <td className="border-t border-l border-navy-700 p-2 text-center">
                  <div className="flex justify-center gap-1">
                    <button 
                      onClick={() => setSelectedPO(entry)}
                      className="p-1.5 hover:bg-surface-3 rounded text-accent"
                      title="詳細表示・印刷"
                    >
                      <ArrowRight size={18} />
                    </button>
                    <button 
                      onClick={() => deleteEntry(entry.id)}
                      className="p-1.5 hover:bg-danger-bg rounded text-danger"
                      title="削除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
