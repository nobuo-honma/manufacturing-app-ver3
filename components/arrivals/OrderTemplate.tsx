import React from 'react';
import { PurchaseOrder } from '@/lib/types';

interface OrderTemplateProps {
  data: PurchaseOrder;
}

const OrderTemplate: React.FC<OrderTemplateProps> = ({ data }) => {
  return (
    /* 印刷用設定: A4サイズ固定、背景白 */
    <div className="bg-white p-6 w-[210mm] min-h-[297mm] mx-auto text-black font-sans leading-relaxed shadow-lg md:shadow-none" id="purchase-order">
      
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

        {/* 3. 送信元情報: 右側（右端から2文字分程度の余裕を持たせる） */}
        <div className="text-right text-[15px] leading-relaxed pr-12">
          <p className="text-[17px] font-bold mb-2">{data.sender.organization}</p>
          <p className="mb-4">{data.sender.facility}</p>
          <p className="mb-1">TEL {data.sender.tel}</p>
          <p className="mb-4">FAX {data.sender.fax}</p>
          <p>担当者 {data.sender.manager}</p>
        </div>
      </div>

      {/* 4. 日付・納期: 左側 */}
      <div className="mb-12 space-y-3 text-[16px]">
        <div className="flex gap-16">
          <span className="w-24 font-semibold text-gray-700">発注日</span>
          <span className="border-b border-gray-300 pb-0.5 min-w-[150px]">{data.orderDate}</span>
        </div>
        <div className="flex gap-16">
          <span className="w-24 font-semibold text-gray-700">納期希望日</span>
          <span className="border-b border-gray-300 pb-0.5 min-w-[250px]">{data.deliveryDate || '最短納品でおねがいします。'}</span>
        </div>
      </div>

      {/* 5. メインテーブル */}
      <table
        className="w-full border-collapse border-b border-r border-black text-[15px]"
        style={{ borderCollapse: 'collapse', borderBottom: '1px solid black', borderRight: '1px solid black' }}
      >
        <thead>
          <tr className="bg-white h-14">
            <th className="border-t border-l border-black font-bold w-24 px-1 text-center bg-gray-50">コード</th>
            <th className="border-t border-l border-black font-bold w-32 px-1 text-center bg-gray-50">メーカー</th>
            <th className="border-t border-l border-black font-bold px-2 text-center bg-gray-50">商品名</th>
            <th className="border-t border-l border-black font-bold w-36 px-1 text-center bg-gray-50">規格</th>
            <th className="border-t border-l border-black font-bold w-28 px-1 text-center bg-gray-50">単位</th>
            <th className="border-t border-l border-black font-bold w-28 px-1 text-center bg-gray-50">発注数量</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index} className="h-14">
              <td className="border-t border-l border-black text-center font-mono">{item.code}</td>
              <td className="border-t border-l border-black px-2 text-[12px] leading-snug">{item.manufacturer}</td>
              <td className="border-t border-l border-black px-2 font-medium text-[15px]">
                {item.name}
              </td>
              <td className="border-t border-l border-black px-2 text-center text-[13px]">{item.spec}</td>
              <td className="border-t border-l border-black px-1 text-center">{item.unit}</td>
              <td className="border-t border-l border-black px-1 text-right pr-4 font-bold text-xl italic">
                {item.quantity && item.quantity > 0 ? item.quantity : ''}
              </td>
            </tr>
          ))}
          {/* 追加の空行（全体で15行以上に調整） */}
          {[...Array(Math.max(0, 15 - data.items.length))].map((_, i) => (
            <tr key={`empty-${i}`} className="h-14">
              <td className="border-t border-l border-black"></td>
              <td className="border-t border-l border-black"></td>
              <td className="border-t border-l border-black px-2 font-medium"></td>
              <td className="border-t border-l border-black px-1 text-center"></td>
              <td className="border-t border-l border-black px-1 text-center"></td>
              <td className="border-t border-l border-black px-1"></td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
};

export default OrderTemplate;
