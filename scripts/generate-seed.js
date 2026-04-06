// Generate complete SQL: migration + seed data from Excel
// Usage: node scripts/generate-seed.js > scripts/full-setup.sql

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read Excel
const wb = XLSX.readFile(path.join(__dirname, '../Мои файла/Задачи ТА ло скю.xlsx'));

// Agent sheet names
const AGENTS = ['Ciumacenco', 'Lomaca', 'Molceanov', 'Sasnitan'];

// Collect unique products from "Ассортимент ЛР" sheet
const assortSheet = wb.Sheets['Ассортимент ЛР'];
const assortData = XLSX.utils.sheet_to_json(assortSheet, { header: 1, defval: '' });
const products = new Map(); // sku_id -> { name, category, subcategory }

for (let i = 1; i < assortData.length; i++) {
  const row = assortData[i];
  if (!row[0]) continue;
  const name = String(row[0]).trim();
  const id = String(row[3]).trim();
  if (name && id) {
    products.set(id, { name, category: String(row[1]).trim(), subcategory: String(row[2]).trim() });
  }
}

// Also collect products from agent sheets (may have products not in assortment sheet)
for (const agentName of AGENTS) {
  const ws = wb.Sheets[agentName];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    const name = String(row[1]).trim();
    const id = String(row[4]).trim();
    if (name && id && !products.has(id)) {
      products.set(id, { name, category: String(row[2]).trim(), subcategory: String(row[3]).trim() });
    }
  }
}

// Collect clients per agent with visit days and products
const agentData = {};
for (const agentName of AGENTS) {
  const ws = wb.Sheets[agentName];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  const clients = new Map(); // client_name -> { visit_day, products: Set<sku_id> }

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const clientName = String(row[0]).trim();
    const productId = String(row[4]).trim();
    let visitDay = parseInt(row[6]) || 0;
    if (visitDay < 1 || visitDay > 5) visitDay = 1; // fix invalid days

    if (!clientName || !productId) continue;

    if (!clients.has(clientName)) {
      clients.set(clientName, { visit_day: visitDay, products: new Set() });
    }
    clients.get(clientName).products.add(productId);
  }

  agentData[agentName] = clients;
}

// --- Generate SQL ---
const lines = [];

function esc(str) {
  return str.replace(/'/g, "''");
}

// 1. Migration
lines.push('-- ============================================');
lines.push('-- FULL SETUP: Migration + Seed Data');
lines.push('-- Generated from Задачи ТА ло скю.xlsx');
lines.push('-- ============================================');
lines.push('');
lines.push(fs.readFileSync(path.join(__dirname, '../supabase/migrations/004_simplified_schema.sql'), 'utf8'));
lines.push('');

// 2. Insert products
lines.push('-- ── SEED: Products ──────────────────────────');
const productIds = {}; // sku -> generated ref name
let pIdx = 0;
for (const [sku, prod] of products) {
  pIdx++;
  const varName = `p${pIdx}`;
  productIds[sku] = varName;
}

// Use a DO block with variables for proper UUID references
lines.push('DO $$');
lines.push('DECLARE');

// Product UUID vars
pIdx = 0;
for (const [sku, prod] of products) {
  pIdx++;
  lines.push(`  p${pIdx} UUID;`);
}

// Agent UUID vars
for (const agentName of AGENTS) {
  lines.push(`  agent_${agentName.toLowerCase()} UUID;`);
}

// Client UUID vars
let cIdx = 0;
const clientVarMap = {};
for (const agentName of AGENTS) {
  for (const [clientName] of agentData[agentName]) {
    cIdx++;
    const varName = `c${cIdx}`;
    clientVarMap[`${agentName}:${clientName}`] = varName;
    lines.push(`  ${varName} UUID;`);
  }
}

lines.push('BEGIN');
lines.push('');

// Insert products
lines.push('-- Insert products');
pIdx = 0;
for (const [sku, prod] of products) {
  pIdx++;
  lines.push(`  INSERT INTO products (name, sku, unit) VALUES ('${esc(prod.name)}', '${esc(sku)}', 'pcs')`);
  lines.push(`    ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name`);
  lines.push(`    RETURNING id INTO p${pIdx};`);
}
lines.push('');

// Create agent profiles (auth users need to be created separately)
lines.push('-- Get or create agent profiles');
lines.push('-- NOTE: Auth users must be created first in Supabase dashboard or via script');
lines.push('-- These will be updated once auth users exist');
for (const agentName of AGENTS) {
  const varName = `agent_${agentName.toLowerCase()}`;
  // For now, just SELECT existing agents or create placeholder profiles
  lines.push(`  -- Agent: ${agentName}`);
  lines.push(`  SELECT id INTO ${varName} FROM profiles WHERE full_name = '${esc(agentName)}' LIMIT 1;`);
  lines.push(`  IF ${varName} IS NULL THEN`);
  lines.push(`    RAISE NOTICE 'Agent ${agentName} not found in profiles. Create auth user first.';`);
  lines.push(`    RETURN;`);
  lines.push(`  END IF;`);
}
lines.push('');

// Insert clients
lines.push('-- Insert clients');
for (const agentName of AGENTS) {
  const varName = `agent_${agentName.toLowerCase()}`;
  for (const [clientName, data] of agentData[agentName]) {
    const cVar = clientVarMap[`${agentName}:${clientName}`];
    lines.push(`  INSERT INTO clients (name, agent_id, visit_day) VALUES ('${esc(clientName)}', ${varName}, ${data.visit_day}) RETURNING id INTO ${cVar};`);
  }
}
lines.push('');

// Insert client_products
lines.push('-- Insert client_products');
for (const agentName of AGENTS) {
  for (const [clientName, data] of agentData[agentName]) {
    const cVar = clientVarMap[`${agentName}:${clientName}`];
    for (const productSku of data.products) {
      // Find product var
      let pVarIdx = 0;
      for (const [sku] of products) {
        pVarIdx++;
        if (sku === productSku) break;
      }
      if (pVarIdx > 0) {
        lines.push(`  INSERT INTO client_products (client_id, product_id) VALUES (${cVar}, p${pVarIdx}) ON CONFLICT DO NOTHING;`);
      }
    }
  }
}

lines.push('');
lines.push('  RAISE NOTICE \'Seed data inserted successfully!\';');
lines.push('END $$;');

// Output
console.log(lines.join('\n'));
