import { createClient } from '@/lib/supabase/server'
import ProductsClient from './ProductsClient'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('name')

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Товары</h1>
      <ProductsClient products={products ?? []} />
    </div>
  )
}
