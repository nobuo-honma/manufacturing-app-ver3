-- ============================================================
-- 製造管理システム DBスキーマ（Supabase / PostgreSQL）
-- DisasterBreadSystem Ver2.xlsx 準拠
-- ============================================================

-- ===== 製品マスタ =====
CREATE TABLE products (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  variant_name  TEXT NOT NULL,
  unit_per_kg   INT  NOT NULL DEFAULT 29,
  unit_per_cs   INT  NOT NULL DEFAULT 48,
  parent_id     TEXT REFERENCES products(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO products (id, name, variant_name, unit_per_kg, unit_per_cs) VALUES
  ('C3',    'キュウメイパン',    'チョコチップ',           29, 48),
  ('M3',    'キュウメイパン',    'ミックスフルーツ',       29, 48),
  ('D3',    'キュウメイパン',    'ドライリンゴ',           29, 48),
  ('H3',    'キュウメイパン',    'ハスカップ',             29, 48),
  ('SB',    'キュウメイパン',    'シーベリー',             29, 48),
  ('MA',    'キュウメイパン',    'エコ三味',               29, 10),
  ('MA-C3', 'キュウメイパン',    'エコ三味（チョコ）',     29, 10),
  ('MA-M3', 'キュウメイパン',    'エコ三味（ミックス）',   29, 10),
  ('MA-D3', 'キュウメイパン',    'エコ三味（ドライ）',     29, 10),
  ('TP',    'ECOボックス',       'プチヴェール',           31, 48),
  ('TO',    'ECOボックス',       'オレンジ',               32, 48),
  ('TK',    'ECOボックス',       '黒豆',                   32, 20),
  ('CB',    'ECOボックス',       'クランベリー',           33, 48),
  ('FD',    'ECOボックス',       'オリジナル三味',         31, 20),
  ('FD-TP', 'ECOボックス',       'オリジナル三味（プチ）', 31, 20),
  ('FD-TO', 'ECOボックス',       'オリジナル三味（オレンジ）', 32, 20),
  ('FD-TK', 'ECOボックス',       'オリジナル三味（黒豆）', 32, 20),
  ('YC50',  'e-パン',            'キャラメルチョコ50入',   31, 50),
  ('YC',    'e-パン',            'キャラメルチョコ',       31, 48),
  ('YO50',  'e-パン',            'ヨコエ オレンジ50入',    32, 50),
  ('YO',    'e-パン',            'ヨコエ オレンジ',        32, 48),
  ('CO',    '我が家の救急パン',  'チョコ＆オレンジ',       32, 48),
  ('PA',    '我が家の救急パン',  'パンプキン',             32, 48),
  ('ST',    '我が家の救急パン',  'ストロベリー',           32, 48);

-- parent_id 設定（複合製品）
UPDATE products SET parent_id = 'MA' WHERE id IN ('MA-C3','MA-M3','MA-D3');
UPDATE products SET parent_id = 'FD' WHERE id IN ('FD-TP','FD-TO','FD-TK');

-- ===== 品目マスタ（原材料・資材統合） =====
CREATE TABLE items (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  item_type    TEXT NOT NULL CHECK (item_type IN ('raw_material','material')),
  unit_size    NUMERIC NOT NULL,
  unit         TEXT NOT NULL,
  safety_stock NUMERIC NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO items VALUES
  ('R001','デリソフト',                 'raw_material', 10,   'kg',  50),
  ('R002','チョコチップHCEE',           'raw_material', 10,   'kg',  30),
  ('R003','アクアクーベルホワイトカカオ','raw_material', 10,   'kg',  20),
  ('R004','マスカルポーネ・レジェ',     'raw_material',  1,   'kg',  20),
  ('R005','まめまーじゅUSA',            'raw_material',  5,   'kg',  50),
  ('R006','ドライクランベリーBR',       'raw_material',  1,   'kg',   5),
  ('R007','デザーンココアパウダーテラロッサ','raw_material', 1,'kg',   3),
  ('R008','あすなろミックス',           'raw_material', 20,   'kg',   0),
  ('R009','コア粉',                     'raw_material', 20,   'kg', 100),
  ('R010','P15菓子パンミックス',        'raw_material', 20,   'kg', 300),
  ('R011','凍結全卵',                   'raw_material', 12,   'kg',  50),
  ('R012','オレンジカット５ｍｍ　A',    'raw_material',  1,   'kg',   5),
  ('R013','かのこ黒豆',                 'raw_material',  4,   'kg',   0),
  ('R014','キャラメルチョコチップ',     'raw_material', 10,   'kg',  20),
  ('R015','Eオイルスーパー６０',        'raw_material',  5,   'kg', 0.5),
  ('R016','ミックスフルーツ',           'raw_material', 12,   'kg',  30),
  ('R017','アップルチップ',             'raw_material', 12,   'kg',  30),
  ('R018','ホワイトチョコチップ',       'raw_material', 10,   'kg',  30),
  ('R019','ドライストロベリー',         'raw_material',  4,   'kg',   3),
  ('R020','パンプキンパウダー',         'raw_material',  5,   'kg',   2),
  ('R021','FRイースト',                 'raw_material', 12.5, 'kg',   5),
  ('R022','ミルシア',                   'raw_material',  5,   'kg', 7.5),
  ('R023','ルミナスグランデ',           'raw_material', 10,   'kg',  30),
  ('R024','ショコラクリュホワイト',     'raw_material',  5,   'kg',  10),
  ('R025','プチヴェールパウダー',       'raw_material', 10,   'kg',   1),
  ('R026','シーベリーペースト',         'raw_material',  1,   'kg',   3),
  ('R027','ハスカップペースト',         'raw_material',  1,   'kg',   3),
  ('R028','ブルーベリー',               'raw_material',  1,   'kg',   1),
  ('M001','三方袋',                     'material',   2800,   '枚',5000),
  ('M002','マフィンカップ',             'material',   1500,   '枚',5000),
  ('M003','グラシン紙',                 'material',   1000,   '枚',5000),
  ('M004','シュリンクロール',           'material',      2,   '本',   2),
  ('M005','メルト',                     'material',      1,   '袋',   2),
  ('M006','キャラメルチョコ用シール',   'material',   5000,   '枚',   0),
  ('M007','オレンジ用シール',           'material',   5000,   '枚',   0),
  ('M008','（小）チョコチップ',         'material',    300,   '枚',   0),
  ('M009','（小）ミックスフルーツ',     'material',    300,   '枚',   0),
  ('M010','（小）ドライリンゴ',         'material',    300,   '枚',   0),
  ('M011','（小）ハスカップ',           'material',    300,   '枚',   0),
  ('M012','（小）シーベリー',           'material',    300,   '枚',   0),
  ('M013','（小）プチヴェール',         'material',    400,   '枚',   0),
  ('M014','（小）オレンジ',             'material',    400,   '枚',   0),
  ('M015','（小）クランベリー',         'material',    400,   '枚',   0),
  ('M016','（小）キャラメルチョコ',     'material',    400,   '枚',   0),
  ('M017','（小）ヨコエ オレンジ',      'material',    400,   '枚',   0),
  ('M018','（小）チョコ＆オレンジ',     'material',    500,   '枚', 360),
  ('M019','（小）パンプキン',           'material',    500,   '枚', 360),
  ('M020','（小）ストロベリー',         'material',    500,   '枚', 360),
  ('M021','（小）エコ三味',             'material',    500,   '枚',   0),
  ('M022','（小）オリジナル三味',       'material',    500,   '枚',   0),
  ('M023','（外）チョコチップ',         'material',     20,   '枚',   0),
  ('M024','（外）ミックスフルーツ',     'material',     20,   '枚',   0),
  ('M025','（外）ドライリンゴ',         'material',     20,   '枚',   0),
  ('M026','（外）ハスカップ',           'material',     20,   '枚',   0),
  ('M027','（外）シーベリー',           'material',     20,   '枚',   0),
  ('M028','（外）プチヴェール',         'material',     20,   '枚',   0),
  ('M029','（外）オレンジ',             'material',     20,   '枚',   0),
  ('M030','（外）クランベリー',         'material',     20,   '枚',   0),
  ('M031','（外）キャラメルチョコ50入', 'material',     20,   '枚',   0),
  ('M032','（外）キャラメルチョコ',     'material',     20,   '枚',   0),
  ('M033','（外）ヨコエ オレンジ50入',  'material',     20,   '枚',   0),
  ('M034','（外）ヨコエ オレンジ',      'material',     20,   '枚',   0),
  ('M035','（外）チョコ＆オレンジ',     'material',     20,   '枚',  15),
  ('M036','（外）パンプキン',           'material',     20,   '枚',  15),
  ('M037','（外）ストロベリー',         'material',     20,   '枚',  15),
  ('M038','（外）エコ三味',             'material',     20,   '枚',   0),
  ('M039','（外）オリジナル三味',       'material',     20,   '枚',   0),
  ('M040','ふるさと納税12入',           'material',     20,   '枚',  40),
  ('M041','ふるさと納税6入',            'material',     20,   '枚',  40),
  ('M042','角当て',                     'material',     50,   '枚', 300);

-- ===== BOM =====
CREATE TABLE bom (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  item_id     TEXT NOT NULL REFERENCES items(id),
  usage_rate  NUMERIC NOT NULL,
  unit        TEXT NOT NULL,
  basis_type  TEXT NOT NULL CHECK (basis_type IN ('production_qty','order_qty')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ===== 出荷先マスタ =====
CREATE TABLE customers (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  contact_name TEXT,
  postal_code  TEXT,
  address      TEXT,
  phone        TEXT,
  fax          TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ===== 受注管理 =====
CREATE TABLE orders (
  id                TEXT PRIMARY KEY,
  order_date        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  desired_ship_date TIMESTAMPTZ NOT NULL,
  customer_id       TEXT NOT NULL REFERENCES customers(id),
  product_id        TEXT NOT NULL REFERENCES products(id),
  quantity          NUMERIC NOT NULL,
  status            TEXT NOT NULL DEFAULT 'received'
                    CHECK (status IN ('received','in_production','shipped')),
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ===== 製造計画 =====
CREATE TABLE production_plans (
  id              TEXT PRIMARY KEY,
  order_id        TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id      TEXT NOT NULL REFERENCES products(id),
  production_date DATE NOT NULL,
  production_kg   NUMERIC NOT NULL,
  planned_units   NUMERIC NOT NULL,
  planned_cs      NUMERIC NOT NULL,
  lot_code        TEXT,
  expiry_date     DATE,
  status          TEXT NOT NULL DEFAULT 'planned'
                  CHECK (status IN ('planned','in_progress','completed')),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ===== 製造実績 =====
CREATE TABLE production_results (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id      TEXT NOT NULL REFERENCES production_plans(id),
  lot_code     TEXT NOT NULL,
  actual_units NUMERIC NOT NULL DEFAULT 0,
  actual_cs    NUMERIC NOT NULL DEFAULT 0,
  actual_piece NUMERIC NOT NULL DEFAULT 0,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ===== 入荷管理 =====
CREATE TABLE arrivals (
  id            TEXT PRIMARY KEY,
  item_id       TEXT NOT NULL REFERENCES items(id),
  order_date    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expected_date TIMESTAMPTZ NOT NULL,
  quantity      NUMERIC NOT NULL,
  unit          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','arrived')),
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ===== 品目在庫 =====
CREATE TABLE item_stocks (
  item_id    TEXT PRIMARY KEY REFERENCES items(id),
  quantity   NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- item_stocks を items から初期化
INSERT INTO item_stocks (item_id, quantity)
SELECT id, 0 FROM items;

-- ===== 製品在庫（Lot単位） =====
CREATE TABLE product_stocks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_code    TEXT NOT NULL UNIQUE,
  product_id  TEXT NOT NULL REFERENCES products(id),
  qty_cs      NUMERIC NOT NULL DEFAULT 0,
  qty_piece   NUMERIC NOT NULL DEFAULT 0,
  expiry_date DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ===== 出荷管理 =====
CREATE TABLE shipments (
  id        TEXT PRIMARY KEY,
  order_id  TEXT NOT NULL REFERENCES orders(id),
  ship_date TIMESTAMPTZ NOT NULL,
  lot_code  TEXT NOT NULL,
  qty_cs    NUMERIC NOT NULL DEFAULT 0,
  qty_piece NUMERIC NOT NULL DEFAULT 0,
  status    TEXT NOT NULL DEFAULT 'scheduled'
            CHECK (status IN ('scheduled','shipped')),
  notes     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== 棚卸調整履歴 =====
CREATE TABLE inventory_adjustments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adjusted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  item_id     TEXT NOT NULL REFERENCES items(id),
  before_qty  NUMERIC NOT NULL,
  after_qty   NUMERIC NOT NULL,
  diff        NUMERIC GENERATED ALWAYS AS (after_qty - before_qty) STORED,
  reason      TEXT NOT NULL DEFAULT '定例棚卸',
  notes       TEXT,
  created_by  TEXT
);

-- ===== お知らせ =====
CREATE TABLE announcements (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  content      TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ===== RLS（Row Level Security）=====
ALTER TABLE products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE items              ENABLE ROW LEVEL SECURITY;
ALTER TABLE bom                ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_plans   ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE arrivals           ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_stocks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_stocks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements      ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーに全操作を許可（社内ツールのためシンプルに）
CREATE POLICY "authenticated_all" ON products           FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_all" ON items              FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_all" ON bom                FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_all" ON customers          FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_all" ON orders             FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_all" ON production_plans   FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_all" ON production_results FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_all" ON arrivals           FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_all" ON item_stocks        FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_all" ON product_stocks     FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_all" ON shipments          FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_all" ON inventory_adjustments FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_all" ON announcements      FOR ALL TO authenticated USING (true);
