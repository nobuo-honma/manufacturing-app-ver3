'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ProductionPlan, PlanStatus } from '@/lib/types'

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

// 当日の製造予定
export function useTodayProduction() {
  const [plans, setPlans]     = useState<ProductionPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    supabase
      .from('production_plans')
      .select('*, products(*), orders(*, customers(*))')
      .eq('production_date', today)
      .then(({ data }) => { setPlans(data ?? []); setLoading(false) })
  }, [])

  return { plans, loading }
}
