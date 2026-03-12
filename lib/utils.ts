// ===== 製造Lot番号生成（確定版） =====
// ア〜ヤ タ行抜き 31文字（日付1〜31に対応）
export const LOT_KANA: string[] = [
  'ア','イ','ウ','エ','オ',  // 1〜5
  'カ','キ','ク','ケ','コ',  // 6〜10
  'サ','シ','ス','セ','ソ',  // 11〜15
  'ナ','ニ','ヌ','ネ','ノ',  // 16〜20  ← タ行なし
  'ハ','ヒ','フ','ヘ','ホ',  // 21〜25
  'マ','ミ','ム','メ','モ',  // 26〜30
  'ヤ',                      // 31
]

export function monthToAlpha(month: number): string {
  return String.fromCharCode('A'.charCodeAt(0) + month - 1)
}
export function yearToYY(year: number): string {
  return String(year).slice(-2)
}

/** 通常品: カナ(日付)+月英字+年2桁+製品ID  例: スB26SB
 *  seqInDay: 同日複数Lot時の連番（0始まり） */
export function generateNormalLotCode(date: Date, productId: string, seqInDay = 0): string {
  const kana = LOT_KANA[(date.getDate() - 1 + seqInDay) % LOT_KANA.length]
  return `${kana}${monthToAlpha(date.getMonth() + 1)}${yearToYY(date.getFullYear())}${productId}`
}

/** YC50/YO50: dd+月英字+年2桁+製品ID  例: 13B26YC50 */
export function generateDdLotCode(date: Date, productId: string): string {
  const dd = String(date.getDate()).padStart(2, '0')
  return `${dd}${monthToAlpha(date.getMonth() + 1)}${yearToYY(date.getFullYear())}${productId}`
}

/** MA/FD複合製品: yy+種別+連番2桁  例: 26MA01, 26FD03 */
export function generateComboLotCode(fiscalYear: number, type: 'MA' | 'FD', seq: number): string {
  return `${yearToYY(fiscalYear)}${type}${String(seq).padStart(2, '0')}`
}

/** 製品IDから自動でLot生成関数を選択するメイン関数 */
export function generateLotCode(params: {
  date: Date
  productId: string
  seqInDay?: number
  comboSeq?: number
  fiscalYear?: number
}): string {
  const { date, productId, seqInDay = 0, comboSeq = 1, fiscalYear } = params
  const fy = fiscalYear ?? date.getFullYear()

  if (productId === 'MA' || productId.startsWith('MA-')) return generateComboLotCode(fy, 'MA', comboSeq)
  if (productId === 'FD' || productId.startsWith('FD-')) return generateComboLotCode(fy, 'FD', comboSeq)
  if (productId === 'YC50' || productId === 'YO50')      return generateDdLotCode(date, productId)
  return generateNormalLotCode(date, productId, seqInDay)
}

// ===== 賞味期限（製造日+5年6ヶ月） =====
export function calcExpiryDate(productionDate: Date): Date {
  const d = new Date(productionDate)
  d.setFullYear(d.getFullYear() + 5)
  d.setMonth(d.getMonth() + 6)
  return d
}

// ===== 製造量 → 個数・c/s・端数p =====
export function calcProductionCounts(
  productionKg: number,
  unitPerKg: number,
  unitPerCs: number
): { units: number; cs: number; piece: number } {
  const units = Math.floor(productionKg * unitPerKg)
  return { units, cs: Math.floor(units / unitPerCs), piece: units % unitPerCs }
}

// ===== ID採番 =====
export function generateOrderId(date: Date, seq: number): string {
  return `ORD-${date.toISOString().slice(0,10).replace(/-/g,'')}-${String(seq).padStart(3,'0')}`
}
export function generateArrivalId(date: Date, seq: number): string {
  return `INC-${date.toISOString().slice(0,10).replace(/-/g,'')}-${String(seq).padStart(3,'0')}`
}

// ===== 在庫ステータス判定 =====
export function getStockStatus(stock: number, safety: number): '充足' | '注意' | '不足' {
  if (stock < safety)        return '不足'
  if (stock < safety * 1.5)  return '注意'
  return '充足'
}

// ===== ステータスラベル・カラー =====
export const ORDER_STATUS_LABEL: Record<string, string> = {
  ordered:      '受注済',
  in_production:'製造中',
  shipped:      '出荷済',
  cancelled:    'キャンセル',
}
export const ORDER_STATUS_COLOR: Record<string, string> = {
  ordered:       'badge-blue',
  in_production: 'badge-warn',
  shipped:       'badge-ok',
  cancelled:     'badge-gray',
}
export const ARRIVAL_STATUS_LABEL: Record<string, string> = {
  scheduled: '入荷予定',
  arrived:   '入荷済',
  cancelled: 'キャンセル',
}
export const SHIPMENT_STATUS_LABEL: Record<string, string> = {
  pending:   '出荷待ち',
  shipped:   '出荷済',
  cancelled: 'キャンセル',
}
export const STATUS_COLOR: Record<string, string> = {
  '充足': 'badge-ok',
  '注意': 'badge-warn',
  '不足': 'badge-danger',
}

// ===== 日付フォーマット =====
export function fmtDate(d: string | Date): string {
  return new Date(d).toLocaleDateString('ja-JP', { year:'numeric', month:'2-digit', day:'2-digit' })
}
export function fmtDateTime(d: string | Date): string {
  return new Date(d).toLocaleString('ja-JP', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' })
}
