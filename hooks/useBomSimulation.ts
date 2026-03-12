'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { SimulationResult } from '@/lib/types'

export function useBomSimulation(
  productId: string,
  orderQtyCs: number,
  productionKg: number
) {
  const [results, setResults] = useState<SimulationResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!productId || (!orderQtyCs && !productionKg)) return
    const simulate = async () => {
      setLoading(true)
      const { data: bomEntries } = await supabase
        .from('bom')
        .select('*, items(*)')
        .eq('product_id', productId)

      if (!bomEntries) { setLoading(false); return }

      const itemIds = bomEntries.map(e => e.item_id)
      const { data: stocks } = await supabase
        .from('item_stocks')
        .select('item_id, quantity')
        .in('item_id', itemIds)

      const stockMap = Object.fromEntries((stocks ?? []).map(s => [s.item_id, s.quantity]))

      const simResults: SimulationResult[] = bomEntries.map(entry => {
        const required = entry.basis_type === 'production_qty'
          ? productionKg * entry.usage_rate
          : orderQtyCs * entry.usage_rate
        const stock = stockMap[entry.item_id] ?? 0
        const diff  = stock - required
        const safety = entry.items.safety_stock

        return {
          item_id:       entry.item_id,
          item_name:     entry.items.name,
          item_type:     entry.items.item_type,
          unit:          entry.unit,
          basis_type:    entry.basis_type,
          required_qty:  Math.round(required * 1000) / 1000,
          current_stock: stock,
          diff:          Math.round(diff * 1000) / 1000,
          status:        diff < 0 ? '不足' : diff < safety * 0.5 ? '注意' : '充足',
        }
      })

      setResults(simResults)
      setLoading(false)
    }
    simulate()
  }, [productId, orderQtyCs, productionKg])

  return { results, loading }
}
