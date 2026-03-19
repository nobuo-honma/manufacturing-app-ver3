'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ProductionPlan, PlanStatus, InternalEvent, Shipment } from '@/lib/types'

export function useProductionPlans(orderId?: string) {
  const [plans, setPlans]     = useState<ProductionPlan[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    setLoading(true)
    let q = supabase
      .from('production_plans')
      .select('*, orders(*, customers(*)), products(*)')
      .order('production_date', { ascending: true })
    if (orderId) q = q.eq('order_id', orderId)
    const { data } = await q
    setPlans(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [orderId])

  const updateStatus = async (id: string, status: PlanStatus) => {
    await supabase.from('production_plans').update({ status }).eq('id', id)
    fetch()
  }

  return { plans, loading, refresh: fetch, updateStatus }
}

// 当日の全予定（製造・出荷・行事）
export function useTodayProduction() {
  const [plans, setPlans]           = useState<ProductionPlan[]>([])
  const [shipments, setShipments]   = useState<Shipment[]>([])
  const [internalEvents, setInternalEvents] = useState<InternalEvent[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    const fetchToday = async () => {
      // ローカル日付を取得 (YYYY-MM-DD)
      const now = new Date()
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      const d = String(now.getDate()).padStart(2, '0')
      const today = `${y}-${m}-${d}`

      const [pRes, sRes, iRes] = await Promise.all([
        supabase.from('production_plans').select('*, products(*), orders(*, customers(*))').eq('production_date', today),
        supabase.from('shipments').select('*, orders(*, products(*), customers(*))').eq('ship_date', today),
        supabase.from('internal_events').select('*').eq('event_date', today)
      ])

      setPlans(pRes.data || [])
      setShipments(sRes.data || [])
      setInternalEvents(iRes.data || [])
      setLoading(false)
    }

    fetchToday()
  }, [])

  return { plans, shipments, internalEvents, loading }
}
