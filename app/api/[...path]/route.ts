import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db.json');

// Memory cache to survive between function calls on Vercel (while warm)
let memoryDb: any = null;

// Helper to read the JSON file
function getDbData() {
  // If we have data in memory, use it (handles persistence during warm Lambda)
  if (memoryDb) return memoryDb;

  try {
    const fileData = fs.readFileSync(DB_PATH, 'utf8');
    memoryDb = JSON.parse(fileData);
    return memoryDb;
  } catch (error) {
    console.error('Read error:', error);
    return {};
  }
}

// Helper to write to the JSON file
function saveDbData(data: any) {
  memoryDb = data; // Always update memory cache
  try {
    // Try to write to disk (will work locally, might fail on Vercel)
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    // Fail silently on Vercel read-only FS
    console.warn('Persistence to disk failed (expected behavior on Vercel). Using in-memory store.');
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
    const data = getDbData();
    
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
    const data = getDbData();
    
    if (!data[resource]) {
      data[resource] = [];
    }

    const newItem = { 
      id: body.id || Math.random().toString(36).substr(2, 9), 
      ...body 
    };
    
    data[resource].push(newItem);
    saveDbData(data);
    
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
    const data = getDbData();

    if (!data[resource] || !id) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const index = data[resource].findIndex((i: any) => String(i.id) === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    data[resource][index] = { ...body, id }; 
    saveDbData(data);

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
    const data = getDbData();

    if (!data[resource] || !id) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const index = data[resource].findIndex((i: any) => String(i.id) === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    data[resource][index] = { ...data[resource][index], ...body, id };
    saveDbData(data);

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
    const data = getDbData();

    if (!data[resource] || !id) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const index = data[resource].findIndex((i: any) => String(i.id) === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const deletedItem = data[resource].splice(index, 1);
    saveDbData(data);

    return NextResponse.json(deletedItem[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
