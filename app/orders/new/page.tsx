'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Customer, Product } from '@/lib/types'
import { generateOrderId } from '@/lib/utils'
import OrderForm from '@/components/orders/OrderForm'
import Link from 'next/link'
import { ChevronLeft, CheckCircle } from 'lucide-react'

export default function NewOrderPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Link href="/orders" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={20} />
        </Link>
        <h1 className="page-title">受注登録</h1>
      </div>

      <OrderForm />
    </div>
  )
}
