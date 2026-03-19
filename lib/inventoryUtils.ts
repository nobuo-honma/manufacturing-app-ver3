import { supabase } from './supabase'
import { ProductionPlan, BomEntry, ItemStock } from './types'

/**
 * 製造計画に基づいて在庫を減算し、履歴を記録する
 */
export async function subtractInventoryForPlan(plan: ProductionPlan) {
  if (!plan.product_id) return

  // 1. BOMを取得
  const { data: bomEntries, error: bomError } = await supabase
    .from('bom')
    .select('*, items(*)')
    .eq('product_id', plan.product_id)

  if (bomError || !bomEntries || bomEntries.length === 0) {
    console.warn('BOMが見つかりません:', plan.product_id)
    return
  }

  // 計画に関連する受注情報を取得（c/sが必要な場合）
  // basis_type が 'order_qty' の場合は受注量（c/s）を使用
  let orderQtyCs = 0
  if (bomEntries.some(e => e.basis_type === 'order_qty')) {
    const { data: order } = await supabase
      .from('orders')
      .select('quantity')
      .eq('id', plan.order_id)
      .single()
    orderQtyCs = order?.quantity || 0
  }

  const results = []

  for (const entry of bomEntries) {
    // 2. 必要量を計算
    const required = entry.basis_type === 'production_qty'
      ? plan.production_kg * entry.usage_rate
      : orderQtyCs * entry.usage_rate
    
    if (required <= 0) continue

    // 3. 現在の在庫を取得
    const { data: stock, error: stockError } = await supabase
      .from('item_stocks')
      .select('quantity')
      .eq('item_id', entry.item_id)
      .single()

    if (stockError) continue

    const beforeQty = stock.quantity
    const afterQty = beforeQty - required

    // 4. 在庫を更新
    const { error: updateError } = await supabase
      .from('item_stocks')
      .update({ 
        quantity: afterQty,
        updated_at: new Date().toISOString()
      })
      .eq('item_id', entry.item_id)

    if (updateError) {
      console.error('在庫更新エラー:', updateError)
      continue
    }

    // 5. 履歴を記録
    await supabase.from('inventory_adjustments').insert({
      item_id: entry.item_id,
      before_qty: beforeQty,
      after_qty: afterQty,
      reason: '製造開始による自動減算',
      notes: `製造計画: ${plan.id} (${plan.products?.name || ''})`
    })

    results.push({ item_id: entry.item_id, required })
  }

  return results
}
