'use client'
import React, { useState } from 'react'
import { STANDARD_ORDER_ITEMS, DEFAULT_SENDER, StandardOrderItem } from '@/lib/supplierData'
import { PurchaseOrder, PurchaseOrderItem } from '@/lib/types'
import { toJapaneseEraDate } from '@/lib/utils'
import OrderTemplate from '@/components/arrivals/OrderTemplate'
import { Printer, X, Eye, FileText, Save } from 'lucide-react'

export default function PurchaseOrderForm() {
  const [supplier, setSupplier] = useState<string>('橋谷㈱')
  const [quantities, setQuantities] = useState<Record<number, string>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [poData, setPoData] = useState<PurchaseOrder | null>(null)

  const items = STANDARD_ORDER_ITEMS[supplier] || []

  const handleQtyChange = (index: number, val: string) => {
    setQuantities(prev => ({ ...prev, [index]: val }))
  }

  const saveToHistory = (po: PurchaseOrder) => {
    if (typeof window === 'undefined') return
    const history = JSON.parse(localStorage.getItem('po_history') || '[]')
    // IDを付与して保存
    const newEntry = { ...po, id: Date.now().toString(), createdAt: new Date().toISOString() }
    localStorage.setItem('po_history', JSON.stringify([newEntry, ...history]))
  }

  const handlePreview = () => {
    const poItems: PurchaseOrderItem[] = items.map((item, index) => ({
      ...item,
      quantity: quantities[index] ? Number(quantities[index]) : undefined
    }))

    const hasAnyQty = poItems.some(item => item.quantity !== undefined && item.quantity > 0)
    if (!hasAnyQty) {
      alert('発注数量を少なくとも1つ入力してください')
      return
    }

    const po: PurchaseOrder = {
      supplierName: supplier,
      orderDate: toJapaneseEraDate(new Date()),
      sender: DEFAULT_SENDER,
      items: poItems // 全項目を渡す
    }
    setPoData(po)
    setShowPreview(true)
    saveToHistory(po)
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-text-secondary">発注先を選択:</label>
            <select 
              className="form-input py-1.5 px-3 min-w-[200px]"
              value={supplier}
              onChange={(e) => {
                setSupplier(e.target.value)
                setQuantities({})
              }}
            >
              {Object.keys(STANDARD_ORDER_ITEMS).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button onClick={handlePreview} className="btn-primary flex items-center gap-2">
            <Eye size={16} /> プレビュー表示
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-b border-r border-navy-700 text-sm">
            <thead>
              <tr className="bg-navy-800">
                <th className="border-t border-l border-navy-700 p-2 font-semibold text-center w-16">コード</th>
                <th className="border-t border-l border-navy-700 p-2 font-semibold text-center w-28">メーカー</th>
                <th className="border-t border-l border-navy-700 p-2 font-semibold text-center">商品名</th>
                <th className="border-t border-l border-navy-700 p-2 font-semibold text-center w-32">規格</th>
                <th className="border-t border-l border-navy-700 p-2 font-semibold text-center w-20">単位</th>
                <th className="border-t border-l border-navy-700 p-2 font-semibold text-center w-24">発注数量</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-navy-850/50 transition-colors">
                  <td className="border-t border-l border-navy-700 p-2 text-center text-xs font-mono text-text-muted">{item.code || '-'}</td>
                  <td className="border-t border-l border-navy-700 p-2 text-xs">{item.manufacturer || '-'}</td>
                  <td className="border-t border-l border-navy-700 p-2 font-medium">{item.name}</td>
                  <td className="border-t border-l border-navy-700 p-2 text-sm text-text-secondary text-center">{item.spec}</td>
                  <td className="border-t border-l border-navy-700 p-2 text-sm text-text-muted text-center">{item.unit}</td>
                  <td className="border-t border-l border-navy-700 p-1 text-right">
                    <input 
                      type="number" 
                      className="w-full bg-navy-950 border-none text-right py-1 px-2 focus:ring-1 focus:ring-accent rounded-sm outline-none"
                      placeholder="0"
                      value={quantities[index] || ''}
                      onChange={(e) => handleQtyChange(index, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPreview && poData && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex flex-col items-center justify-center p-10 overflow-y-auto no-print">
          <div className="flex gap-4 mb-6 w-[210mm] justify-end">
            <button onClick={() => window.print()} className="btn-primary flex items-center gap-2">
              <Printer size={18} /> 印刷する
            </button>
            <button onClick={() => setShowPreview(false)} className="btn-secondary flex items-center gap-2 bg-surface-1">
              <X size={18} /> 閉じる
            </button>
          </div>
          <div className="bg-white rounded p-4 scale-90 origin-top print-only">
            <OrderTemplate data={poData} />
          </div>
        </div>
      )}

      {/* 印刷用 */}
      <div className="hidden print:block print-only">
        {poData && <OrderTemplate data={poData} />}
      </div>
    </div>
  )
}
