import { readFileSync } from 'fs';

const envFile = readFileSync('.env.local', 'utf-8');
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .map(line => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testInsert() {
  const payload = {
    id: 'TEST' + Date.now().toString().slice(-6),
    order_date: new Date().toISOString(),
    desired_ship_date: new Date().toISOString(),
    customer_id: 'N001',
    product_id: 'C3',
    quantity: 1,
    status: 'received'
  };

  try {
    const res = await fetch(`${url}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      const err = await res.json();
      console.error('INSERT FAILED:', JSON.stringify(err, null, 2));
    } else {
      const data = await res.json();
      console.log('INSERT SUCCESS:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('FETCH ERROR:', error);
  }
}

testInsert();
