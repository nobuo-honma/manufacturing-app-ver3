import React from 'react';
import { PurchaseOrder } from '@/lib/types';

interface OrderTemplateProps {
  data: PurchaseOrder;
}

const OrderTemplate: React.FC<OrderTemplateProps> = ({ data }) => {
  return (
    /* 印刷用設定: A4サイズ固定、背景白 */
    <div className="bg-white p-8 w-[210mm] min-h-[297mm] mx-auto text-black font-sans leading-relaxed shadow-lg md:shadow-none" id="purchase-order">
      
      {/* ヘッダー部分 */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h1 className="border-b-2 border-black text-2xl font-bold mb-2 tracking-widest inline-block min-w-[300px]">
            {data.supplierName} 御中
          </h1>
          <h2 className="text-3xl font-extrabold ml-12 mt-4">発注書</h2>
        </div>
        <div className="text-right text-sm">
          <p>発注日：{data.orderDate}</p>
          {data.deliveryDate && <p>納期希望日：{data.deliveryDate}</p>}
        </div>
      </div>

      {/* 送り主情報 */}
      <div className="flex justify-end mb-4">
        <div className="text-sm border border-black p-3 min-w-[240px]">
          <p className="font-bold border-b border-black mb-1 pb-1">{data.sender.organization}</p>
          <p className="font-bold">{data.sender.facility}</p>
          <div className="mt-2 space-y-0.5">
            <p className="flex justify-between"><span>TEL</span> <span>{data.sender.tel}</span></p>
            <p className="flex justify-between"><span>FAX</span> <span>{data.sender.fax}</span></p>
            <p className="mt-2 text-right">担当者：{data.sender.manager}</p>
          </div>
        </div>
      </div>

      {/* メインテーブル */}
      <table className="w-full border-collapse border-t-2 border-l-2 border-black">
        <thead>
          <tr className="bg-gray-100">
            <th className="border-r-2 border-b-2 border-black p-2 text-[10px] w-16">コード</th>
            <th className="border-r-2 border-b-2 border-black p-2 text-[10px] w-32">メーカー</th>
            <th className="border-r-2 border-b-2 border-black p-2 text-[10px]">品名・規格</th>
            <th className="border-r-2 border-b-2 border-black p-2 text-[10px] w-16">単位</th>
            <th className="border-r-2 border-b-2 border-black p-2 text-[10px] w-20">数量</th>
            <th className="border-r-2 border-b-2 border-black p-2 text-[10px] w-24">備考</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index} className="h-10">
              <td className="border-r-2 border-b-2 border-black p-2 text-center text-xs font-mono">{item.code}</td>
              <td className="border-r-2 border-b-2 border-black p-2 text-xs">{item.manufacturer}</td>
              <td className="border-r-2 border-b-2 border-black p-2 text-sm font-semibold">
                {item.name}
                {item.spec && <span className="ml-2 text-xs font-normal text-gray-600">[{item.spec}]</span>}
              </td>
              <td className="border-r-2 border-b-2 border-black p-2 text-center text-xs">{item.unit}</td>
              <td className="border-r-2 border-b-2 border-black p-2 text-center font-bold text-lg italic">
                {item.quantity}
              </td>
              <td className="border-r-2 border-b-2 border-black p-2 text-xs"></td>
            </tr>
          ))}
          {/* 空行の補充（Excel風にするため） */}
          {[...Array(Math.max(0, 12 - data.items.length))].map((_, i) => (
            <tr key={`empty-${i}`} className="h-10">
              <td className="border-r-2 border-b-2 border-black"></td>
              <td className="border-r-2 border-b-2 border-black"></td>
              <td className="border-r-2 border-b-2 border-black"></td>
              <td className="border-r-2 border-b-2 border-black"></td>
              <td className="border-r-2 border-b-2 border-black"></td>
              <td className="border-r-2 border-b-2 border-black"></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* フッター / 連絡事項 */}
      <div className="mt-8">
        <p className="text-xs font-bold mb-1 underline">【備考・連絡事項】</p>
        <div className="border-2 border-black p-4 h-32 text-sm">
          <p>※ 納品時は本状のコピーを添付してください。</p>
        </div>
      </div>
    </div>
  );
};

export default OrderTemplate;
