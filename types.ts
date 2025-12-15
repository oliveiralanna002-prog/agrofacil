export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string; // ISO string
  category: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string; // kg, liters, units
  minThreshold: number;
}

export interface ProductionRecord {
  id: string;
  name: string; // e.g., "Milho", "Leite"
  type: 'CROP' | 'ANIMAL';
  amount: number;
  unit: string;
  date: string;
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  isDone: boolean;
  date: string;
}

export enum AlertType {
  GENERAL = 'Geral',
  FERTILIZATION = 'Adubação',
  HARVEST = 'Colheita',
  VACCINATION = 'Vacinação',
  WEATHER = 'Clima'
}

export interface Alert {
  id: string;
  title: string;
  date: string; // ISO String
  type: AlertType;
  notifySystem: boolean; // Browser notification
}

export type Screen = 'DASHBOARD' | 'PRODUCTION' | 'FINANCE' | 'INVENTORY' | 'ALERTS';

// --- Weather Types ---
export interface DailyForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  rainProb: number;
  weatherCode: number;
}

export interface CurrentWeather {
  temp: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
}

export interface WeatherData {
  current: CurrentWeather;
  daily: DailyForecast[];
  locationName?: string;
}