'use client'
import { useState } from 'react'
import ProductMaster  from '@/components/masters/ProductMaster'
import ItemMaster     from '@/components/masters/ItemMaster'
import CustomerMaster from '@/components/masters/CustomerMaster'
import BomMaster      from '@/components/masters/BomMaster'

type MasterTab = 'products' | 'items' | 'customers' | 'bom'

const TABS: { key: MasterTab; label: string }[] = [
  { key: 'products',  label: '製品マスタ' },
  { key: 'items',     label: '品目マスタ' },
  { key: 'customers', label: '出荷先マスタ' },
  { key: 'bom',       label: 'BOM（部品表）' },
]

export default function MastersPage() {
  const [tab, setTab] = useState<MasterTab>('products')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h1 className="page-title">マスタ管理</h1>
      <div className="tab-bar" style={{ alignSelf: 'flex-start' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`tab-item ${tab === t.key ? 'active' : ''}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="card" style={{ padding: '20px' }}>
        {tab === 'products'  && <ProductMaster />}
        {tab === 'items'     && <ItemMaster />}
        {tab === 'customers' && <CustomerMaster />}
        {tab === 'bom'       && <BomMaster />}
      </div>
    </div>
  )
}
