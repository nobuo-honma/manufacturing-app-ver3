import ProductionCalendar from '@/components/production/ProductionCalendar'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function ProductionCalendarPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 no-print">
        <Link href="/production" style={{ color:"var(--text-muted)", display:"flex", alignItems:"center" }}>
          <ChevronLeft size={20} />
        </Link>
      </div>
      <ProductionCalendar />
    </div>
  )
}
