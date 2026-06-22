import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), '..', 'core', 'orders.json');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    if (!fs.existsSync(dbPath)) {
      return NextResponse.json([]);
    }

    const data = fs.readFileSync(dbPath, 'utf-8');
    let orders = JSON.parse(data);

    if (storeId) {
      orders = orders.filter((o: Record<string, unknown>) => o.storeId === storeId);
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error reading orders:", error);
    return NextResponse.json({ error: "Failed to read orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newOrder = await request.json();
    
    let orders = [];
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8');
      orders = JSON.parse(data);
    }

    // Assign ID and Date if missing
    newOrder.id = newOrder.id || `ORD-${Date.now()}`;
    newOrder.date = newOrder.date || new Date().toISOString();

    orders.push(newOrder);

    fs.writeFileSync(dbPath, JSON.stringify(orders, null, 2), 'utf-8');

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    console.error("Error saving order:", error);
    return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
  }
}
