import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper to read the JSON file
function getDbData() {
  const filePath = path.join(process.cwd(), 'db.json');
  const fileData = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileData);
}

// GET handler (for reading users, products, etc.)
export async function GET(request: Request, { params }: { params: { path: string[] } }) {
  try {
    const key = params.path[0];
    const data = getDbData();
    
    if (data[key]) {
      return NextResponse.json(data[key]);
    }
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read database' }, { status: 500 });
  }
}

// POST handler (for adding items)
export async function POST(request: Request, { params }: { params: { path: string[] } }) {
  try {
    const key = params.path[0];
    const body = await request.json();
    const data = getDbData();
    
    if (data[key]) {
      const newItem = { 
        id: body.id || Math.random().toString(36).substr(2, 9), 
        ...body 
      };
      
      // Note: In serverless, this won't persist to the file forever, 
      // but it will work for the session.
      return NextResponse.json(newItem);
    }
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write to database' }, { status: 500 });
  }
}
