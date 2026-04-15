import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper to read the JSON file
function getDbData() {
  const filePath = path.join(process.cwd(), 'db.json');
  const fileData = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileData);
}

// GET handler
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const key = resolvedParams.path[0];
    const data = getDbData();
    
    if (data[key]) {
      return NextResponse.json(data[key]);
    }
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// POST handler
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const key = resolvedParams.path[0];
    const body = await request.json();
    const data = getDbData();
    
    if (data[key]) {
      const newItem = { 
        id: body.id || Math.random().toString(36).substr(2, 9), 
        ...body 
      };
      return NextResponse.json(newItem);
    }
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
