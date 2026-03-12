'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ItemStock, ProductStock, ItemType } from '@/lib/types'
import { getStockStatus } from '@/lib/utils'

export function useItemStocks(typeFilter?: ItemType) {
  const [stocks, setStocks]   = useState<ItemStock[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    setLoading(true)
    let q = supabase.from('item_stocks').select('*, items(*)')
    if (typeFilter) q = q.eq('items.item_type', typeFilter)
    const { data } = await q
    setStocks(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [typeFilter])

  return { stocks, loading, refresh: fetch }
}

export function useProductStocks() {
  const [stocks, setStocks]   = useState<ProductStock[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('product_stocks')
      .select('*, products(*)')
      .order('expiry_date', { ascending: true })
    setStocks(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])
  return { stocks, loading, refresh: fetch }
}

// 在庫ページ用統合フック
export function useInventory(tab: string) {
  const [itemStocks, setItemStocks]       = useState<ItemStock[]>([])
  const [productStocks, setProductStocks] = useState<ProductStock[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = async () => {
    setLoading(true)
    const [{ data: items }, { data: products }] = await Promise.all([
      supabase.from('item_stocks').select('*, items(*)'),
      supabase.from('product_stocks').select('*, products(*)').order('expiry_date', { ascending: true }),
    ])
    setItemStocks(items ?? [])
    setProductStocks(products ?? [])
    setLoading(false)
  }

  useEffect(() => { refetch() }, [tab])
  return { itemStocks, productStocks, loading, refetch }
}

// アラート対象（安全在庫割れ）の品目を返す
export function useStockAlerts() {
  const [alerts, setAlerts]   = useState<ItemStock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const { data } = await supabase.from('item_stocks').select('*, items(*)')
      const alertItems = (data ?? []).filter(s =>
        getStockStatus(s.quantity, s.items?.safety_stock ?? 0) !== '充足'
      )
      setAlerts(alertItems)
      setLoading(false)
    }
    fetch()
  }, [])

  return { alerts, loading }
}
