import OrderList from '@/components/orders/OrderList'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function OrdersPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className="page-title">受注管理</h1>
        <Link href="/orders/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
          <Plus size={15} /> 新規受注登録
        </Link>
      </div>
      <OrderList />
    </div>
  )
}
