const jsonServer = require('json-server');
const fs = require('fs');
const path = require('path');
const server = jsonServer.create();
const middlewares = jsonServer.defaults();

// Helper to construct paths
const dataFiles = {
  users: path.join(__dirname, 'users.json'),
  stores: path.join(__dirname, 'stores.json'),
  menus: path.join(__dirname, 'menus.json'),
  orders: path.join(__dirname, 'orders.json')
};

// Ensure files exist
for (const [key, filePath] of Object.entries(dataFiles)) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]');
  }
}

// Function to read all separate JSON files and combine them into one state
function loadDatabase() {
  return {
    users: JSON.parse(fs.readFileSync(dataFiles.users, 'utf-8')),
    stores: JSON.parse(fs.readFileSync(dataFiles.stores, 'utf-8')),
    menus: JSON.parse(fs.readFileSync(dataFiles.menus, 'utf-8')),
    orders: JSON.parse(fs.readFileSync(dataFiles.orders, 'utf-8'))
  };
}

// Initialize router with the combined data
const router = jsonServer.router(loadDatabase());

server.use(middlewares);
const express = require('express');
server.use(express.json({ limit: '50mb' }));
server.use(express.urlencoded({ limit: '50mb', extended: true }));

// Allow CORS for all Next.js apps (ports 3000, 3001, 3002)
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Intercept router output to save back to disk
router.render = (req, res) => {
  // If request is a mutation, write the entire database state back to individual files
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const dbState = router.db.getState();
    fs.writeFileSync(dataFiles.users, JSON.stringify(dbState.users, null, 2));
    fs.writeFileSync(dataFiles.stores, JSON.stringify(dbState.stores, null, 2));
    fs.writeFileSync(dataFiles.menus, JSON.stringify(dbState.menus, null, 2));
    fs.writeFileSync(dataFiles.orders, JSON.stringify(dbState.orders, null, 2));
  }
  res.jsonp(res.locals.data);
};

server.use(router);

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`✅ JSON Server is running on http://localhost:${PORT}`);
  console.log(`📁 Database files in core/ directory:`);
  console.log(`   users   → ${dataFiles.users}`);
  console.log(`   stores  → ${dataFiles.stores}`);
  console.log(`   menus   → ${dataFiles.menus}`);
  console.log(`   orders  → ${dataFiles.orders}`);
});
