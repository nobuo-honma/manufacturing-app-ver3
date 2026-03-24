import React from 'react';
import { PurchaseOrder } from '@/lib/types';

interface OrderTemplateProps {
  data: PurchaseOrder;
}

const OrderTemplate: React.FC<OrderTemplateProps> = ({ data }) => {
  return (
    /* 印刷用設定: A4サイズ固定、背景白 */
    <div 
      className="relative bg-white p-6 w-[210mm] min-h-[297mm] mx-auto text-black font-sans leading-relaxed shadow-lg md:shadow-none" 
      id="purchase-order"
      style={{ border: '2px solid #ef4444' }} /* 確認用の赤い外枠（印刷時は消えます） */
    >
      {/* 開発用マーカー (表示) */}
      <div className="absolute top-0 left-0 bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold z-50 no-print">
        レイアウト更新済 (v5)
      </div>

      {/* 1. タイトル: 中央揃えで「発 注 書」 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-[1.5em] translate-x-[0.75em]">発注書</h1>
      </div>

      <div className="flex justify-between items-start mb-10">
        {/* 2. 宛名: 左側 */}
        <div className="pt-6">
          <h2 className="border-b-2 border-black text-2xl font-bold pb-2 min-w-[350px]">
            {data.supplierName} 御中
          </h2>
        </div>

        {/* 3. 送信元情報: 右側（右端からかなり大きめに余白を確保） */}
        <div 
          className="text-right text-[17px] leading-relaxed"
          style={{ paddingRight: '7rem', marginTop: '2rem' }}
        >
          <p className="text-[22px] font-bold mb-5 tracking-wider">{data.sender.organization}</p>
          <p className="text-[18px] mb-8">{data.sender.facility}</p>
          
          <div className="flex flex-col items-end space-y-4">
            <p className="tracking-widest">ＴＥＬ　　　　{data.sender.tel}</p>
            <p className="tracking-widest">ＦＡＸ　　　　{data.sender.fax}</p>
            <p className="mt-8 tracking-widest text-[18px] font-bold">担当者　　　　{data.sender.manager}</p>
          </div>
        </div>
      </div>

      {/* 4. 日付・納期: 左側 */}
      <div className="mb-14 space-y-5 text-[18px]">
        <div className="flex gap-20">
          <span className="w-28 font-bold text-gray-800">発注日</span>
          <span className="border-b-2 border-gray-400 pb-1 min-w-[200px]">{data.orderDate}</span>
        </div>
        <div className="flex gap-20">
          <span className="w-28 font-bold text-gray-800">納期希望日</span>
          <span className="border-b-2 border-gray-400 pb-1 min-w-[350px]">{data.deliveryDate || '最短納品でおねがいします。'}</span>
        </div>
      </div>

      {/* 5. メインテーブル */}
      <table
        className="w-full"
        style={{ 
          borderCollapse: 'collapse', 
          borderBottom: '3px solid black', 
          borderRight: '3px solid black',
          fontSize: '17px',
          width: '100%'
        }}
      >
        <thead>
          <tr className="bg-gray-100" style={{ height: '64px' }}>
            <th style={{ borderTop: '3px solid black', borderLeft: '3px solid black', width: '96px' }} className="font-bold px-1 text-center text-black">コード</th>
            <th style={{ borderTop: '3px solid black', borderLeft: '3px solid black', width: '128px' }} className="font-bold px-1 text-center text-black">メーカー</th>
            <th style={{ borderTop: '3px solid black', borderLeft: '3px solid black' }} className="font-bold px-2 text-center text-black">商品名</th>
            <th style={{ borderTop: '3px solid black', borderLeft: '3px solid black', width: '160px' }} className="font-bold px-1 text-center text-black">規格</th>
            <th style={{ borderTop: '3px solid black', borderLeft: '3px solid black', width: '112px' }} className="font-bold px-1 text-center text-black">単位</th>
            <th style={{ borderTop: '3px solid black', borderLeft: '3px solid black', width: '112px' }} className="font-bold px-1 text-center text-black">発注数量</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index} style={{ height: '64px' }}>
              <td style={{ borderTop: '3px solid black', borderLeft: '3px solid black' }} className="text-center font-mono font-bold text-black">{item.code}</td>
              <td style={{ borderTop: '3px solid black', borderLeft: '3px solid black' }} className="px-2 text-[14px] font-medium text-black">{item.manufacturer}</td>
              <td style={{ borderTop: '3px solid black', borderLeft: '3px solid black' }} className="px-4 font-bold text-[18px] text-black">
                {item.name}
              </td>
              <td style={{ borderTop: '3px solid black', borderLeft: '3px solid black' }} className="px-2 text-center text-[15px] text-black">{item.spec}</td>
              <td style={{ borderTop: '3px solid black', borderLeft: '3px solid black' }} className="px-1 text-center font-bold text-black">{item.unit}</td>
              <td style={{ borderTop: '3px solid black', borderLeft: '3px solid black' }} className="px-1 text-right pr-6 font-bold text-3xl italic text-black">
                {item.quantity && item.quantity > 0 ? item.quantity : ''}
              </td>
            </tr>
          ))}
          {[...Array(Math.max(0, 15 - data.items.length))].map((_, i) => (
            <tr key={`empty-${i}`} style={{ height: '64px' }}>
              <td style={{ borderTop: '3px solid black', borderLeft: '3px solid black' }}></td>
              <td style={{ borderTop: '3px solid black', borderLeft: '3px solid black' }}></td>
              <td style={{ borderTop: '3px solid black', borderLeft: '3px solid black' }}></td>
              <td style={{ borderTop: '3px solid black', borderLeft: '3px solid black' }}></td>
              <td style={{ borderTop: '3px solid black', borderLeft: '3px solid black' }}></td>
              <td style={{ borderTop: '3px solid black', borderLeft: '3px solid black' }}></td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
};

export default OrderTemplate;
