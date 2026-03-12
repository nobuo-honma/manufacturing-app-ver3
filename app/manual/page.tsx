const sections = [
  { title: 'ダッシュボード', content: '在庫アラート・当日の製造/入荷/出荷予定・受注状況・お知らせを一覧表示します。' },
  { title: '受注管理', content: ['「新規受注登録」から受注を登録します。', '出荷先は名前・IDで絞り込み検索が可能です。', '製造量(kg)を入力するとBOMシミュレーションが表示されます。'] },
  { title: '製造管理', content: ['受注カード一覧から製造計画を作成する受注を選択します。', '製造予定日・製造量(kg)を入力するとLot番号・賞味期限が自動計算されます。', '通常品: カタカナ(日付) + 月alpha + 年2桁 + 製品ID（例: スB26SB）', 'MA/FD複合製品: yy + MA/FD + 連番2桁（例: 26MA01）', 'YC50/YO50: dd(2桁) + 月alpha + 年2桁 + 製品ID（例: 13B26YC50）', '賞味期限: 製造日 + 5年6ヶ月で自動計算'] },
  { title: '在庫管理', content: ['原材料・資材・製品タブで切り替えます。', 'ステータス: 充足 / 注意（安全在庫×1.5未満）/ 不足（安全在庫未満）', '「棚卸」から実棚卸数を入力すると在庫が更新され調整履歴が記録されます。', '在庫予測タブで製造計画ベースの使用予定量を確認できます。'] },
  { title: '入荷管理', content: ['「入荷予定登録」から品目・発注日・入荷予定日・数量を登録します。', '「入荷処理」をクリックするとステータスが入荷済に変わり品目在庫に自動加算されます。'] },
  { title: '出荷管理', content: ['左の受注カードから出荷対象を選択します。', '製造LotはLot番号一覧から選択し、出荷数をc/s・p（ピース端数）で入力します。', '出荷登録と同時に製品在庫から自動減算されます。'] },
  { title: 'マスタ管理', content: ['製品マスタ / 品目マスタ / 出荷先マスタ / BOMを管理します。', 'セル内の値をクリックするとインライン編集ができます。'] },
]

export default function ManualPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '720px' }}>
      <h1 className="page-title" style={{ marginBottom: '8px' }}>操作マニュアル</h1>
      {sections.map(section => (
        <div key={section.title} className="card" style={{ padding: '20px' }}>
          <div className="section-header">
            <div className="accent-line" />
            <h3>{section.title}</h3>
          </div>
          {Array.isArray(section.content)
            ? <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {section.content.map((c, i) => (
                  <li key={i} style={{ fontSize: '0.8125rem', color: c.startsWith('・') || !c.startsWith('「') && i > 0 ? 'var(--text-secondary)' : 'var(--text-primary)', paddingLeft: c.startsWith('・') ? '8px' : '0' }}>
                    {c}
                  </li>
                ))}
              </ul>
            : <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{section.content}</p>
          }
        </div>
      ))}
    </div>
  )
}
