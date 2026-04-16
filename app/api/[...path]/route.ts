import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { kv } from '@vercel/kv';

const DB_PATH = path.join(process.cwd(), 'db.json');
const KV_KEY = 'inventory_db';

// Memory cache to survive between function calls on Vercel (while warm)
let memoryDb: any = null;

// Helper to read the JSON data
async function getDbData() {
  // 1. Try Memory Cache
  if (memoryDb) return memoryDb;

  // 2. Try Vercel KV (Cloud Persistence)
  try {
    const kvData = await kv.get(KV_KEY);
    if (kvData) {
      memoryDb = kvData;
      return memoryDb;
    }
  } catch (error) {
    console.log('KV check skipped or failed (common in local development)');
  }

  // 3. Fallback to local db.json (Seed data)
  try {
    if (fs.existsSync(DB_PATH)) {
      const fileData = fs.readFileSync(DB_PATH, 'utf8');
      memoryDb = JSON.parse(fileData);
      
      // If KV is available but empty, seed it with db.json once
      try {
        await kv.set(KV_KEY, memoryDb);
      } catch (e) {}
      
      return memoryDb;
    }
  } catch (error) {
    console.error('Read error:', error);
  }

  return {};
}

// Helper to write to the JSON data
async function saveDbData(data: any) {
  memoryDb = data; // Update memory cache

  // 1. Persist to Vercel KV (Cloud Persistence)
  try {
    await kv.set(KV_KEY, data);
  } catch (error) {
    // Fail silently, but log why (likely no KV configured)
    console.warn('Persistence to KV failed. Ensure KV_URL is set in Vercel environment.');
  }

  // 2. Persist to local disk (For local dev environment)
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    // Fail silently on Vercel read-only FS (this is normal)
  }
}

// GET handler
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const [resource, id] = resolvedParams.path;
    const data = await getDbData();
    
    if (!data[resource]) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    if (id) {
      const item = data[resource].find((i: any) => String(i.id) === id);
      if (item) return NextResponse.json(item);
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(data[resource]);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST handler
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const resource = resolvedParams.path[0];
    const body = await request.json();
    const data = await getDbData();
    
    if (!data[resource]) {
      data[resource] = [];
    }

    // Ensure numeric IDs if needed, otherwise generate a unique one
    const newItem = { 
      id: body.id || Math.random().toString(36).substr(2, 9), 
      ...body 
    };
    
    data[resource].push(newItem);
    await saveDbData(data);
    
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT handler
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const [resource, id] = resolvedParams.path;
    const body = await request.json();
    const data = await getDbData();

    if (!data[resource] || !id) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const index = data[resource].findIndex((i: any) => String(i.id) === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    data[resource][index] = { ...body, id }; 
    await saveDbData(data);

    return NextResponse.json(data[resource][index]);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH handler
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const [resource, id] = resolvedParams.path;
    const body = await request.json();
    const data = await getDbData();

    if (!data[resource] || !id) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const index = data[resource].findIndex((i: any) => String(i.id) === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    data[resource][index] = { ...data[resource][index], ...body, id };
    await saveDbData(data);

    return NextResponse.json(data[resource][index]);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE handler
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const [resource, id] = resolvedParams.path;
    const data = await getDbData();

    if (!data[resource] || !id) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const index = data[resource].findIndex((i: any) => String(i.id) === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const deletedItem = data[resource].splice(index, 1);
    await saveDbData(data);

    return NextResponse.json(deletedItem[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

