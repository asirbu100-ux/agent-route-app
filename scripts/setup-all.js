// Complete setup: create users + import data from Excel
// Usage: node scripts/setup-all.js

const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Load env
const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const [key, ...rest] = line.split('=');
  if (key?.trim() && rest.length) env[key.trim()] = rest.join('=').trim();
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Agent config: sheet name -> user details
const AGENTS = [
  { sheet: 'Ciumacenco', name: 'Ciumacenco', email: 'ciumacenco@agent.local', password: 'Agent123!' },
  { sheet: 'Lomaca', name: 'Lomaca', email: 'lomaca@agent.local', password: 'Agent123!' },
  { sheet: 'Molceanov', name: 'Molceanov', email: 'molceanov@agent.local', password: 'Agent123!' },
  { sheet: 'Sasnitan', name: 'Sasnitan', email: 'sasnitan@agent.local', password: 'Agent123!' },
];

const MANAGER = { name: 'Manager', email: 'manager@agent.local', password: 'Manager123!' };

async function main() {
  console.log('=== Setup: Creating users and importing data ===\n');

  // Step 1: Create manager user
  console.log('1. Creating manager...');
  const managerId = await createUser(MANAGER.email, MANAGER.password, MANAGER.name, 'manager');
  console.log(`   Manager: ${managerId}\n`);

  // Step 2: Create agent users
  console.log('2. Creating agents...');
  const agentIds = {};
  for (const agent of AGENTS) {
    const id = await createUser(agent.email, agent.password, agent.name, 'agent');
    agentIds[agent.sheet] = id;
    console.log(`   ${agent.name}: ${id}`);
  }
  console.log('');

  // Step 3: Import products from Excel
  console.log('3. Importing products...');
  const wb = XLSX.readFile(path.join(__dirname, '../Мои файла/Задачи ТА ло скю.xlsx'));
  const productIds = await importProducts(wb);
  console.log(`   ${Object.keys(productIds).length} products imported\n`);

  // Step 4: Import clients and client_products
  console.log('4. Importing clients and assortment...');
  let totalClients = 0;
  let totalCp = 0;

  for (const agent of AGENTS) {
    const ws = wb.Sheets[agent.sheet];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    const agentId = agentIds[agent.sheet];

    // Group by client
    const clients = new Map();
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const clientName = String(row[0]).trim();
      const productSku = String(row[4]).trim();
      let visitDay = parseInt(row[6]) || 0;
      if (visitDay < 1 || visitDay > 5) visitDay = 1;

      if (!clientName || !productSku) continue;

      if (!clients.has(clientName)) {
        clients.set(clientName, { visit_day: visitDay, products: new Set() });
      }
      clients.get(clientName).products.add(productSku);
    }

    // Insert clients
    for (const [clientName, clientData] of clients) {
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('name', clientName)
        .eq('agent_id', agentId)
        .single();

      let clientId;
      if (existing) {
        clientId = existing.id;
      } else {
        const { data: newClient, error } = await supabase
          .from('clients')
          .insert({
            name: clientName,
            agent_id: agentId,
            visit_day: clientData.visit_day,
          })
          .select('id')
          .single();

        if (error) {
          console.log(`   ERROR inserting client "${clientName}": ${error.message}`);
          continue;
        }
        clientId = newClient.id;
        totalClients++;
      }

      // Insert client_products
      for (const sku of clientData.products) {
        const productId = productIds[sku];
        if (!productId) continue;

        const { error } = await supabase
          .from('client_products')
          .insert({ client_id: clientId, product_id: productId })
          .select('id');

        if (error && !error.message.includes('duplicate')) {
          console.log(`   ERROR: ${error.message}`);
        } else if (!error) {
          totalCp++;
        }
      }
    }

    console.log(`   ${agent.name}: ${clients.size} clients`);
  }

  console.log(`   Total: ${totalClients} clients, ${totalCp} product assignments\n`);

  console.log('=== DONE ===');
  console.log('\nLogin credentials:');
  console.log(`  Manager: ${MANAGER.email} / ${MANAGER.password}`);
  for (const agent of AGENTS) {
    console.log(`  ${agent.name}: ${agent.email} / ${agent.password}`);
  }
}

async function createUser(email, password, fullName, role) {
  // Check if exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('full_name', fullName)
    .single();

  if (existingProfile) return existingProfile.id;

  // Create auth user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { user_role: role },
  });

  if (error) {
    // Maybe email exists with different name
    if (error.message.includes('already been registered')) {
      const { data: users } = await supabase.auth.admin.listUsers();
      const existing = users?.users?.find(u => u.email === email);
      if (existing) return existing.id;
    }
    throw new Error(`Failed to create user ${email}: ${error.message}`);
  }

  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: data.user.id,
      full_name: fullName,
      role: role,
    });

  if (profileError) {
    console.log(`   Warning: profile creation for ${fullName}: ${profileError.message}`);
  }

  return data.user.id;
}

async function importProducts(wb) {
  const productIds = {};

  // From Ассортимент ЛР sheet
  const assortSheet = wb.Sheets['Ассортимент ЛР'];
  const assortData = XLSX.utils.sheet_to_json(assortSheet, { header: 1, defval: '' });

  const allProducts = new Map();
  for (let i = 1; i < assortData.length; i++) {
    const row = assortData[i];
    const name = String(row[0]).trim();
    const sku = String(row[3]).trim();
    if (name && sku) allProducts.set(sku, name);
  }

  // Also from agent sheets
  for (const sheetName of ['Ciumacenco', 'Lomaca', 'Molceanov', 'Sasnitan']) {
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const name = String(row[1]).trim();
      const sku = String(row[4]).trim();
      if (name && sku && !allProducts.has(sku)) allProducts.set(sku, name);
    }
  }

  // Insert all
  for (const [sku, name] of allProducts) {
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('sku', sku)
      .single();

    if (existing) {
      productIds[sku] = existing.id;
      continue;
    }

    const { data: newProd, error } = await supabase
      .from('products')
      .insert({ name, sku, unit: 'pcs' })
      .select('id')
      .single();

    if (error) {
      console.log(`   Product error for "${name}": ${error.message}`);
      continue;
    }
    productIds[sku] = newProd.id;
  }

  return productIds;
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
