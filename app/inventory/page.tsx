'use client'
import { useState } from 'react'
import { useInventory } from '@/hooks/useInventory'
import ItemStockTable    from '@/components/inventory/ItemStockTable'
import ProductStockTable from '@/components/inventory/ProductStockTable'
import StocktakingForm   from '@/components/inventory/StocktakingForm'
import BulkStocktakingForm from '../../components/inventory/BulkStocktakingForm'
import StockForecast     from '@/components/inventory/StockForecast'
import { ItemStock } from '@/lib/types'
import { Search } from 'lucide-react'

type TabType = 'raw_material' | 'material' | 'product' | 'forecast'

export default function InventoryPage() {
  const [tab, setTab]     = useState<TabType>('raw_material')
  const [search, setSearch] = useState('')
  const [stocktakingTarget, setStocktakingTarget] = useState<ItemStock | null>(null)
  const [isBulkMode, setIsBulkMode] = useState(false)
  const { itemStocks, productStocks, refetch } = useInventory(tab)

  const filteredItems = itemStocks.filter(s => s.items?.item_type === tab)

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
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" placeholder="品目名・IDで検索" className="input" style={{ paddingLeft: '32px', width: '200px' }}
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {(tab === 'raw_material' || tab === 'material') && (
              <button className="btn-primary" onClick={() => setIsBulkMode(true)}>一括棚卸</button>
            )}
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
        <ItemStockTable stocks={filteredItems} onStocktaking={setStocktakingTarget} search={search} />
      )}

      {isBulkMode && (
        <BulkStocktakingForm 
          stocks={filteredItems.filter(s => !search || s.items?.name.includes(search) || s.item_id.includes(search))}
          onClose={() => setIsBulkMode(false)}
          onSaved={refetch}
        />
      )}

      {stocktakingTarget && (
        <StocktakingForm stock={stocktakingTarget} onClose={() => setStocktakingTarget(null)} onSaved={refetch} />
      )}
    </div>
  )
}
