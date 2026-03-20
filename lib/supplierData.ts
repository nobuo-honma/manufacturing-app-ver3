export const ITEM_SUPPLIER_MAP: Record<string, string> = {
  // 橋谷㈱
  'R008': '橋谷㈱', // あすなろミックス
  'R010': '橋谷㈱', // P15菓子パンミックス
  'R011': '橋谷㈱', // 凍結全卵
  'R012': '橋谷㈱', // オレンジカット５㎜ A
  'R013': '橋谷㈱', // かのこ黒豆
  'R014': '橋谷㈱', // キャラメルチョコチップ
  'R015': '橋谷㈱', // Eオイルスーパー６０
  'R016': '橋谷㈱', // ミックスフルーツ
  'R017': '橋谷㈱', // アップルチップ
  'R018': '橋谷㈱', // ホワイトチョコチップ
  'R021': '橋谷㈱', // FRイースト
  'R022': '橋谷㈱', // ミルシア
  'R023': '橋谷㈱', // ルミナスグランデ
  'R024': '橋谷㈱', // ショコラクリュホワイト
  'R019': '橋谷㈱', // ドライストロベリー
  'R020': '橋谷㈱', // パンプキンパウダー

  // ㈱ネクス
  'R026': '㈱ネクス', // シーベリーペースト
  'R027': '㈱ネクス', // ハスカップペースト
  'R025': '㈱ネクス', // プチヴェールパウダー
};

export const SUPPLIER_INFO: Record<string, { tel: string, fax: string }> = {
  '橋谷㈱': { tel: '0134-21-0011', fax: '0134-21-0022' },
  '㈱ネクス': { tel: '011-788-1234', fax: '011-788-1235' }, // 仮
};

export interface StandardOrderItem {
  code: string;
  manufacturer: string;
  name: string;
  spec: string;
  unit: string;
}

export const STANDARD_ORDER_ITEMS: Record<string, StandardOrderItem[]> = {
  '橋谷㈱': [
    { code: '', manufacturer: '横山製粉', name: 'あすなろミックス', spec: '20kg', unit: '1袋' },
    { code: '', manufacturer: '日本製粉', name: 'P15菓子パンミックス', spec: '20kg', unit: '1袋' },
    { code: '', manufacturer: 'キューピー', name: '凍結全卵', spec: '1kg×12本', unit: '1ケース' },
    { code: '', manufacturer: 'うめはら', name: 'オレンジカット5mm A', spec: '1kg', unit: '1パック' },
    { code: '', manufacturer: '川西製餡', name: 'かのこ黒豆', spec: '2kg×1p', unit: '1袋' },
    { code: '', manufacturer: '', name: 'かのこ黒豆', spec: '2kg×2p', unit: '1ケース' },
    { code: '', manufacturer: '森永商事', name: 'キャラメル チョコチップ', spec: '5kg×2p', unit: '1ケース' },
    { code: '', manufacturer: '理研', name: 'Eオイルスーパー60', spec: '5kg', unit: '1缶' },
    { code: '', manufacturer: '', name: 'ミックスフルーツ', spec: '1kg×12p', unit: '1ケース' },
    { code: '', manufacturer: '', name: 'アップルチップ', spec: '2kg×6p', unit: '1ケース' },
    { code: '', manufacturer: '', name: 'ホワイトチョコチップ', spec: '5kg×2p', unit: '1ケース' },
    { code: '', manufacturer: 'ニッテン', name: 'FRイースト', spec: '500g×25', unit: '1ケース' },
    { code: '', manufacturer: '月島食品', name: 'ラクトザック', spec: '10kg', unit: '1缶' },
    { code: '', manufacturer: '', name: 'ミルシア', spec: '5kg', unit: '1ケース' },
    { code: '', manufacturer: '', name: 'ルミナスグランデ', spec: '10kg', unit: '1ケース' },
    { code: '', manufacturer: '', name: 'ショコラクリュ ホワイト', spec: '5kg', unit: '1ケース' },
    { code: '', manufacturer: '', name: 'ドライストロベリーダイス', spec: '2.5kg×2', unit: '1ケース' },
    { code: '', manufacturer: '川西フーズ', name: 'パンプキンパウダー', spec: '1kg×5p', unit: '1ケース' },
  ],
  '㈱ネクス': [
    { code: '', manufacturer: '', name: 'シーベリーペースト', spec: '1kg×15', unit: '1ケース' },
    { code: '', manufacturer: '', name: 'ハスカップペースト', spec: '1kg×15', unit: '1ケース' },
    { code: '', manufacturer: '', name: 'プチヴェール', spec: '1kg×10', unit: '1ケース' },
    { code: '', manufacturer: '', name: 'シーベリーペースト', spec: '1kg', unit: '1袋' },
    { code: '', manufacturer: '', name: 'ハスカップペースト', spec: '1kg', unit: '1袋' },
  ],
};

export const DEFAULT_SENDER = {
  organization: '社会福祉法人 小樽高島福祉会',
  facility: 'ワークセンター・やまびこ',
  tel: '0134-21-0011',
  fax: '0134-21-0022',
  manager: '本間'
};
