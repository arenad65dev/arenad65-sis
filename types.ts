
export enum Module {
  DASHBOARD = 'Dashboard',
  POS = 'Bar / PDV',
  INVENTORY = 'Estoque'
}

export interface UserPreferences {
  notifications: boolean;
  sound: boolean;
  weeklyReport: boolean;
  autoTheme: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  avatar: string;
  points?: number;
  lastVisit?: string;
  level?: 'Ouro' | 'Prata' | 'Bronze';
  birthday?: string; // format: 'MM-DD'
  totalSpent?: number; // LTV (Lifetime Value)
  lastActivityDays?: number; // For churn detection
  phone?: string;
  cpf?: string;
  preferences?: UserPreferences;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  type: 'inventory' | 'maintenance' | 'crm' | 'finance';
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
  read: boolean;
  targetModule?: Module;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  purchasePrice?: number;
  margin?: number;
  category?: Category;
  categoryId?: string;
  sku?: string;
  stock: number;
  minStock: number;
  unit?: string;
  image?: string;
  imageUrl?: string;
  isActive?: boolean;
  type?: 'PRODUCT' | 'SERVICE' | 'RENTAL';
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  type?: string;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CostItem {
  name: string;
  value: number;
}

export interface Court {
  id: string;
  name: string;
  type: 'Beach Tennis' | 'Futebol Society' | 'Vôlei';
  status: 'excellent' | 'attention' | 'maintenance';
  healthScore: number; // 0-100%
  image: string;
  lastMaintenance: string;
  nextMaintenance: string;
  monthlyFixedCost: number;
  costBreakdown?: CostItem[];
  equipment: { name: string; status: 'ok' | 'issue' }[];
  recentIncidents: number;
}

export interface CashierSession {
  isOpen: boolean;
  openedBy: string;
  openedAt: string;
  initialBalance: number;
  totalSales?: number;
  totalSkimmings?: number; // Sangrias acumuladas
  skimmingHistory?: Array<{ amount: number; reason: string; time: string }>;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  title: string;
  date: string;
  amount: number;
  category?: string;
}

export interface Log {
  id: string;
  timestamp: string;
  ip: string;
  userAvatar: string;
  userName: string;
  module: string;
  action: string;
  description: string;
  critical: boolean;
}

export interface MaintenanceTask {
  id?: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  installationId: string;
  affectedItems?: string[];
  status?: 'pending' | 'in_progress' | 'completed';
  estimatedCost?: number;
  reportedBy?: string;
  createdAt?: string;
}
