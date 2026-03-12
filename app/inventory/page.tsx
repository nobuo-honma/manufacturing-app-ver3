'use client'
import { useState } from 'react'
import { useInventory } from '@/hooks/useInventory'
import ItemStockTable    from '@/components/inventory/ItemStockTable'
import ProductStockTable from '@/components/inventory/ProductStockTable'
import StocktakingForm   from '@/components/inventory/StocktakingForm'
import StockForecast     from '@/components/inventory/StockForecast'
import { ItemStock } from '@/lib/types'
import { Search } from 'lucide-react'

type TabType = 'raw_material' | 'material' | 'product' | 'forecast'

export default function InventoryPage() {
  const [tab, setTab]     = useState<TabType>('raw_material')
  const [search, setSearch] = useState('')
  const [stocktakingTarget, setStocktakingTarget] = useState<ItemStock | null>(null)
  const { itemStocks, productStocks, refetch } = useInventory(tab)

  const tabs: { key: TabType; label: string }[] = [
    { key: 'raw_material', label: '原材料' },
    { key: 'material',     label: '資材' },
    { key: 'product',      label: '製品' },
    { key: 'forecast',     label: '在庫予測' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className="page-title">在庫管理</h1>
        {tab !== 'forecast' && (
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="品目名・IDで検索" className="input" style={{ paddingLeft: '32px', width: '200px' }}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        )}
      </div>

      <div className="tab-bar" style={{ alignSelf: 'flex-start' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`tab-item ${tab === t.key ? 'active' : ''}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'forecast' ? (
        <StockForecast />
      ) : tab === 'product' ? (
        <ProductStockTable stocks={productStocks} search={search} />
      ) : (
        <ItemStockTable stocks={itemStocks} onStocktaking={setStocktakingTarget} search={search} />
      )}

      {stocktakingTarget && (
        <StocktakingForm stock={stocktakingTarget} onClose={() => setStocktakingTarget(null)} onSaved={refetch} />
      )}
    </div>
  )
}
