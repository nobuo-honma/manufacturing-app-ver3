'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Order, OrderStatus } from '@/lib/types'

export function useOrders(statusFilter?: OrderStatus) {
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    setLoading(true)
    let q = supabase
      .from('orders')
      .select('*, customers(*), products(*)')
      .order('desired_ship_date', { ascending: true })

    if (statusFilter) q = q.eq('status', statusFilter)

    const { data } = await q
    setOrders(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [statusFilter])

  const updateStatus = async (id: string, status: OrderStatus) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    fetch()
  }

  return { orders, loading, refresh: fetch, updateStatus }
}
