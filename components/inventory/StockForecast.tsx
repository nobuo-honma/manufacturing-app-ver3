'use client'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Item, ItemStock, Arrival, ProductionPlan, BomEntry } from '@/lib/types'
import { getStockStatus } from '@/lib/utils'

type TabType = 'raw_material' | 'material'

interface DailyStock {
  date: string
  stock: number
  status: '充足' | '注意' | '不足'
}

interface ForecastRow {
  item: Item
  currentStock: number
  dailyStocks: DailyStock[]
}

export default function StockForecast() {
  const [tab, setTab] = useState<TabType>('raw_material')
  const [items, setItems] = useState<Item[]>([])
  const [itemStocks, setItemStocks] = useState<ItemStock[]>([])
  const [arrivals, setArrivals] = useState<Arrival[]>([])
  const [productionPlans, setProductionPlans] = useState<ProductionPlan[]>([])
  const [bomEntries, setBomEntries] = useState<BomEntry[]>([])
  const [loading, setLoading] = useState(true)

  const days = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() + i)
      return d
    })
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [
      { data: itemsData },
      { data: stocksData },
      { data: arrivalsData },
      { data: plansData },
      { data: bomData }
    ] = await Promise.all([
      supabase.from('items').select('*'),
      supabase.from('item_stocks').select('*'),
      supabase.from('arrivals').select('*').in('status', ['pending', 'scheduled']).gte('expected_date', new Date().toISOString().slice(0, 10)),
      supabase.from('production_plans').select('*').in('status', ['planned', 'in_progress']).gte('production_date', new Date().toISOString().slice(0, 10)),
      supabase.from('bom').select('*')
    ])

    setItems(itemsData || [])
    setItemStocks(stocksData || [])
    setArrivals(arrivalsData || [])
    setProductionPlans(plansData || [])
    setBomEntries(bomData || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const rows: ForecastRow[] = useMemo(() => {
    const filteredItems = items.filter(i => i.item_type === tab)
    const stockMap: Record<string, number> = {}
    itemStocks.forEach(s => stockMap[s.item_id] = s.quantity)

    return filteredItems.map(item => {
      const currentStock = stockMap[item.id] ?? 0
      let runningStock = currentStock
      const dailyStocks: DailyStock[] = []

      days.forEach(dateObj => {
        const dateStr = dateObj.toISOString().slice(0, 10)
        
        // 入荷加算
        const dayArrivals = arrivals.filter(a => a.item_id === item.id && a.expected_date?.slice(0, 10) === dateStr)
        const incoming = dayArrivals.reduce((sum, a) => sum + a.quantity, 0)
        
        // 製造消費減算
        const dayPlans = productionPlans.filter(p => p.production_date?.slice(0, 10) === dateStr)
        let outgoing = 0
        dayPlans.forEach(plan => {
          const relevantBom = bomEntries.filter(b => b.product_id === plan.product_id && b.item_id === item.id)
          relevantBom.forEach(b => {
            if (b.basis_type === 'production_qty') {
              outgoing += plan.production_kg * b.usage_rate
            } else if (b.basis_type === 'order_qty') {
              outgoing += plan.planned_cs * b.usage_rate
            }
          })
        })

        runningStock = Math.round((runningStock + incoming - outgoing) * 1000) / 1000
        dailyStocks.push({
          date: dateStr,
          stock: runningStock,
          status: getStockStatus(runningStock, item.safety_stock)
        })
      })

      return { item, currentStock, dailyStocks }
    })
  }, [items, itemStocks, arrivals, productionPlans, bomEntries, tab, days])

  if (loading) return <div style={{ padding: '20px', color: 'var(--text-muted)' }}>読み込み中...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="tab-bar" style={{ alignSelf: 'flex-start', background: 'var(--surface-2)', padding: '4px', borderRadius: '8px' }}>
        <button onClick={() => setTab('raw_material')} className={`tab-item ${tab === 'raw_material' ? 'active' : ''}`} style={{ fontSize: '0.75rem', padding: '6px 16px' }}>原材料</button>
        <button onClick={() => setTab('material')} className={`tab-item ${tab === 'material' ? 'active' : ''}`} style={{ fontSize: '0.75rem', padding: '6px 16px' }}>資材</button>
      </div>

      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="data-table" style={{ borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                <th style={{ position: 'sticky', left: 0, zIndex: 10, background: 'var(--surface-2)', minWidth: '120px', borderRight: '1px solid var(--border)' }}>品目</th>
                <th style={{ position: 'sticky', left: '120px', zIndex: 10, background: 'var(--surface-2)', minWidth: '60px', borderRight: '1px solid var(--border)', textAlign: 'center' }}>現在庫</th>
                {days.map(d => {
                  const isSun = d.getDay() === 0
                  const isSat = d.getDay() === 6
                  return (
                    <th key={d.toISOString()} style={{ minWidth: '70px', textAlign: 'center', color: isSun ? 'var(--danger)' : isSat ? 'var(--accent)' : 'inherit' }}>
                      <div style={{ fontSize: '0.625rem', opacity: 0.7 }}>{d.getMonth() + 1}/{d.getDate()}</div>
                      <div>{['日', '月', '火', '水', '木', '金', '土'][d.getDay()]}</div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.item.id}>
                  <td style={{ position: 'sticky', left: 0, zIndex: 5, background: 'var(--surface-1)', borderRight: '1px solid var(--border)', fontWeight: 600 }}>
                    <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontFamily: 'DM Mono' }}>{row.item.id}</div>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '110px' }}>{row.item.name}</div>
                  </td>
                  <td style={{ position: 'sticky', left: '120px', zIndex: 5, background: 'var(--surface-1)', borderRight: '1px solid var(--border)', textAlign: 'right', paddingRight: '12px' }}>
                    {row.currentStock}
                  </td>
                  {row.dailyStocks.map((ds, i) => {
                    const isDanger = ds.stock < 0
                    const isWarn = ds.status === '不足' // 安全在庫割れ
                    return (
                      <td key={i} style={{ 
                        textAlign: 'right', 
                        background: isDanger ? 'rgba(248,113,113,0.15)' : isWarn ? 'rgba(251,191,36,0.12)' : 'transparent',
                        color: isDanger ? 'var(--danger)' : isWarn ? 'var(--warn)' : 'inherit',
                        fontWeight: isDanger || isWarn ? 600 : 400,
                        borderBottom: '1px solid var(--border)'
                      }}>
                        {ds.stock}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '16px', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '12px', height: '12px', background: 'rgba(248,113,113,0.2)', border: '1px solid var(--danger)', borderRadius: '2px' }} />
          <span>欠品（マイナス）</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '12px', height: '12px', background: 'rgba(251,191,36,0.15)', border: '1px solid var(--warn)', borderRadius: '2px' }} />
          <span>安全在庫割れ</span>
        </div>
      </div>
    </div>
  )
}
