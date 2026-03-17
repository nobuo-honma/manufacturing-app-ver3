'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Customer, Product } from '@/lib/types'
import { generateOrderId } from '@/lib/utils'
import OrderForm from '@/components/orders/OrderForm'
import Link from 'next/link'
import { ChevronLeft, CheckCircle } from 'lucide-react'

export default function NewOrderPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    desired_ship_date: '', customer_id: '', product_id: '', quantity: '', notes: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('customers').select('id,name').order('name'),
      supabase.from('products').select('*').order('name'),
    ]).then(([{ data: c }, { data: p }]) => {
      setCustomers(c ?? [])
      setProducts(p ?? [])
    })
  }, [])

  const filteredCustomers = customers.filter(c =>
    c.name.includes(search) || c.id.includes(search)
  )
  const productGroups = products.reduce<Record<string, Product[]>>((acc, p) => {
    if (!acc[p.name]) acc[p.name] = []
    acc[p.name].push(p)
    return acc
  }, {})
  const selectedProduct = products.find(p => p.id === form.product_id)
  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setSubmitted(false) }

  const showSim = !!(form.product_id && form.quantity && Number(form.quantity) > 0 && selectedProduct)
  const productionKg = showSim
    ? (Number(form.quantity) * selectedProduct!.unit_per_cs) / selectedProduct!.unit_per_kg
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: latest } = await supabase.from('orders').select('id')
      .like('id', `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-%%`)
      .order('id', { ascending: false }).limit(1)
    const seq = latest?.length ? parseInt(latest[0].id.slice(-3)) + 1 : 1
    const { error } = await supabase.from('orders').insert({
      id: generateOrderId(new Date(), seq),
      order_date: new Date().toISOString(),
      desired_ship_date: form.desired_ship_date,
      customer_id: form.customer_id,
      product_id: form.product_id,
      quantity: Number(form.quantity),
      notes: form.notes || null,
      status: 'received',
    })
    setSaving(false)
    if (!error) {
      setSubmitted(true)
      setForm({ desired_ship_date: '', customer_id: '', product_id: '', quantity: '', notes: '' })
      setSearch('')
    } else {
      console.error('Failed to create order:', error)
      alert(`受注登録に失敗しました: ${error.message}`)
    }
  }

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
