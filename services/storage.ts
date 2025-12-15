import { Transaction, InventoryItem, ProductionRecord, Task, TransactionType, Alert, AlertType } from '../types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'agro_transactions',
  INVENTORY: 'agro_inventory',
  PRODUCTION: 'agro_production',
  TASKS: 'agro_tasks',
  ALERTS: 'agro_alerts',
  INIT: 'agro_init'
};

// --- Helper to generate ID ---
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Initialization ---
export const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.INIT)) {
    const initialTasks: Task[] = [
      { id: '1', title: 'Verificar cerca do pasto', isDone: false, date: new Date().toISOString() },
      { id: '2', title: 'Comprar vacina aftosa', isDone: false, date: new Date().toISOString() },
    ];
    const initialInventory: InventoryItem[] = [
      { id: '1', name: 'Milho (Saca)', quantity: 50, unit: 'sc', minThreshold: 10 },
      { id: '2', name: 'Adubo NPK', quantity: 5, unit: 'kg', minThreshold: 20 },
    ];
    const initialAlerts: Alert[] = [
      { id: '1', title: 'Vacinação Aftosa', date: new Date(Date.now() + 86400000).toISOString(), type: AlertType.VACCINATION, notifySystem: true }
    ];
    
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(initialTasks));
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(initialInventory));
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(initialAlerts));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PRODUCTION, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.INIT, 'true');
  }
};

// --- Transactions ---
export const getTransactions = (): Transaction[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return data ? JSON.parse(data) : [];
};

export const addTransaction = (t: Omit<Transaction, 'id'>) => {
  const list = getTransactions();
  const newItem = { ...t, id: generateId() };
  list.unshift(newItem); // Newest first
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
  return newItem;
};

// --- Inventory ---
export const getInventory = (): InventoryItem[] => {
  const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
  return data ? JSON.parse(data) : [];
};

export const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
  const list = getInventory();
  const newItem = { ...item, id: generateId() };
  list.push(newItem);
  localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(list));
  return newItem;
};

export const updateInventoryItem = (item: InventoryItem) => {
  const list = getInventory();
  const index = list.findIndex(i => i.id === item.id);
  if (index >= 0) {
    list[index] = item;
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(list));
  }
};

export const deleteInventoryItem = (id: string) => {
  const list = getInventory().filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(list));
}

// --- Production ---
export const getProduction = (): ProductionRecord[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTION);
  return data ? JSON.parse(data) : [];
};

export const addProduction = (p: Omit<ProductionRecord, 'id'>) => {
  const list = getProduction();
  const newItem = { ...p, id: generateId() };
  list.unshift(newItem);
  localStorage.setItem(STORAGE_KEYS.PRODUCTION, JSON.stringify(list));
  return newItem;
};

// --- Tasks ---
export const getTasks = (): Task[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TASKS);
  return data ? JSON.parse(data) : [];
};

export const toggleTask = (id: string) => {
  const list = getTasks();
  const item = list.find(t => t.id === id);
  if (item) item.isDone = !item.isDone;
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(list));
  return list;
};

export const addTask = (title: string) => {
  const list = getTasks();
  const newItem = { id: generateId(), title, isDone: false, date: new Date().toISOString() };
  list.push(newItem);
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(list));
  return list;
};

// --- Alerts ---
export const getAlerts = (): Alert[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
  return data ? JSON.parse(data) : [];
};

export const addAlert = (alert: Omit<Alert, 'id'>) => {
  const list = getAlerts();
  const newItem = { ...alert, id: generateId() };
  list.push(newItem);
  // Sort by date (ascending)
  list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(list));
  return list;
};

export const deleteAlert = (id: string) => {
  const list = getAlerts().filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(list));
  return list;
};