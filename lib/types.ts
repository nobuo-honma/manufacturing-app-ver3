// ===== 製品 =====
export interface Product {
  id: string           // C3, MA, FD-TP, YC50 等
  name: string         // キュウメイパン / ECOボックス 等
  variant_name: string // チョコチップ / エコ三味 等
  unit_per_kg: number  // 1kgあたり個数
  unit_per_cs: number  // 1c/sあたり個数
  parent_id?: string   // MA→MA-C3等の親子
}

// ===== 品目（原材料・資材） =====
export type ItemType = 'raw_material' | 'material'

export interface Item {
  id: string           // R001〜R028 / M001〜M042
  name: string
  item_type: ItemType
  unit_size: number    // 規格量
  unit: string         // kg / 枚 / 本 / 袋
  safety_stock: number
}

// ===== BOM =====
export type BomBasis = 'production_qty' | 'order_qty'

export interface BomEntry {
  id: string
  product_id: string
  item_id: string
  usage_rate: number
  unit: string
  basis_type: BomBasis
  items?: Item
}

// ===== 出荷先 =====
export interface Customer {
  id: string           // N001〜N451
  name: string
  contact_name?: string
  postal_code?: string
  address?: string
  phone?: string
  fax?: string
  notes?: string
}

// ===== 受注 =====
export type OrderStatus = 'received' | 'in_production' | 'shipped'
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  received: '受注済',
  in_production: '製造中',
  shipped: '出荷済',
}

export interface Order {
  id: string           // ORD-YYYYMMDD-NNN
  order_date: string
  desired_ship_date: string
  customer_id: string
  product_id: string
  quantity: number     // c/s単位
  status: OrderStatus
  notes?: string
  customers?: Customer
  products?: Product
}

// ===== 製造計画 =====
export type PlanStatus = 'planned' | 'in_progress' | 'completed'
export const PLAN_STATUS_LABEL: Record<PlanStatus, string> = {
  planned: '計画',
  in_progress: '製造中',
  completed: '完了',
}

export interface ProductionPlan {
  id: string           // PLN-xxxxxxxx
  order_id: string
  product_id: string
  production_date: string
  production_kg: number
  planned_units: number
  planned_cs: number
  lot_code?: string
  expiry_date?: string
  status: PlanStatus
  notes?: string
  orders?: Order
  products?: Product
}

// ===== 製造実績 =====
export interface ProductionResult {
  id: string
  plan_id: string
  lot_code: string
  actual_units: number
  actual_cs: number
  actual_piece: number
  notes?: string
}

// ===== 入荷 =====
export type ArrivalStatus = 'pending' | 'arrived'
export const ARRIVAL_STATUS_LABEL: Record<ArrivalStatus, string> = {
  pending: '未入荷',
  arrived: '入荷済',
}

export interface Arrival {
  id: string           // INC-YYYYMMDD-NNN
  item_id: string
  order_date: string
  expected_date: string
  quantity: number
  unit: string
  status: ArrivalStatus
  notes?: string
  items?: Item
}

// ===== 品目在庫 =====
export interface ItemStock {
  item_id: string
  quantity: number
  updated_at: string
  items?: Item
}

// ===== 製品在庫（Lot単位） =====
export interface ProductStock {
  id: string
  lot_code: string
  product_id: string
  qty_cs: number
  qty_piece: number
  expiry_date?: string
  products?: Product
}

// ===== 出荷 =====
export type ShipmentStatus = 'scheduled' | 'shipped'
export const SHIPMENT_STATUS_LABEL: Record<ShipmentStatus, string> = {
  scheduled: '出荷予定',
  shipped: '出荷済',
}

export interface Shipment {
  id: string
  order_id: string
  ship_date: string
  lot_code: string
  qty_cs: number
  qty_piece: number
  status: ShipmentStatus
  notes?: string
  orders?: Order
}

// ===== 棚卸調整 =====
export interface InventoryAdjustment {
  id: string
  adjusted_at: string
  item_id: string
  before_qty: number
  after_qty: number
  diff: number
  reason: string
  notes?: string
  items?: Item
}

// ===== お知らせ =====
export interface Announcement {
  id: string
  title: string
  content?: string
  published_at: string
}

// ===== BOMシミュレーション結果 =====
export interface SimulationResult {
  item_id: string
  item_name: string
  item_type: ItemType
  unit: string
  basis_type: BomBasis
  required_qty: number
  current_stock: number
  diff: number
  status: '充足' | '注意' | '不足'
}
