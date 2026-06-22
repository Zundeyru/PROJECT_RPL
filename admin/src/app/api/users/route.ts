import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), '..', 'core', 'Database.js');

function getUsersData() {
  const content = fs.readFileSync(dbPath, 'utf-8');
  const startMarker = '// DYNAMIC_USERS_START';
  const endMarker = '// DYNAMIC_USERS_END';
  
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);
  
  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Dynamic markers not found in Database.js');
  }

  // Extract the JSON array
  const slice = content.substring(startIndex + startMarker.length, endIndex);
  const jsonStart = slice.indexOf('[');
  const jsonEnd = slice.lastIndexOf(']') + 1;
  const jsonStr = slice.substring(jsonStart, jsonEnd);
  
  return JSON.parse(jsonStr);
}

function saveUsersData(users: any[]) {
  const content = fs.readFileSync(dbPath, 'utf-8');
  const startMarker = '// DYNAMIC_USERS_START';
  const endMarker = '// DYNAMIC_USERS_END';
  
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);
  
  const before = content.substring(0, startIndex + startMarker.length);
  const after = content.substring(endIndex);
  
  const jsonStr = JSON.stringify(users, null, 12);
  const replacement = `\n        const usersData = ${jsonStr};\n        `;
  
  const newContent = before + replacement + after;
  fs.writeFileSync(dbPath, newContent, 'utf-8');
}

export async function GET() {
  try {
    const users = getUsersData();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error reading users:", error);
    return NextResponse.json({ error: "Failed to read users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newUser = await request.json();
    const users = getUsersData();
    
    // Check if user already exists
    if (users.find((u: any) => u.username === newUser.username)) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    users.push(newUser);
    saveUsersData(users);

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error("Error saving user:", error);
    return NextResponse.json({ error: "Failed to save user" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const username = url.searchParams.get("username");
    
    if (!username) {
      return NextResponse.json({ error: "Missing username" }, { status: 400 });
    }

    const users = getUsersData();
    const newUsers = users.filter((u: any) => u.username !== username);
    saveUsersData(newUsers);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
