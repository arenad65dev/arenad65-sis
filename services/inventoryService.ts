import api from './api';

export interface PurchaseOrderItem {
  productId: string;
  quantity: number;
  cost: number;
}

export interface PurchaseOrder {
  items: PurchaseOrderItem[];
  reason?: string;
  reference?: string;
}

export interface Product {
  id?: string;
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  purchasePrice?: number;
  stock?: number;
  minStock?: number;
  unit?: string;
  sku?: string;
  imageUrl?: string;
  categoryId?: string;
  type?: 'PRODUCT' | 'SERVICE' | 'RENTAL';
  isActive?: boolean;
  category?: {
    id: string;
    name: string;
  };
}

export interface StockMovement {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    sku?: string;
  };
  type: 'IN' | 'OUT' | 'ADJ' | 'LOSS';
  quantity: number;
  unitCost?: number;
  reason?: string;
  reference?: string;
  user?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface StockAdjustment {
  productId: string;
  quantity: number;
  reason?: string;
}

export interface TurnoverData {
  productId: string;
  productName: string;
  currentStock: number;
  totalIn: number;
  totalOut: number;
  avgStock: number;
  turnover: number;
}

export const inventoryService = {
  // Registrar entrada de mercadoria
  async recordPurchaseOrder(data: PurchaseOrder) {
    const response = await api.post('/inventory/purchase-order', data);
    return response.data;
  },

  // Criar ou atualizar produto
  async createOrUpdateProduct(data: Product) {
    const response = await api.post('/inventory/products', data);
    return response.data;
  },

  // Ajuste manual de estoque
  async adjustStock(data: StockAdjustment) {
    const response = await api.post('/inventory/stock-adjustment', data);
    return response.data;
  },

  // Buscar histórico de movimentações
  async getStockMovements(filters?: {
    productId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<StockMovement[]> {
    const params = new URLSearchParams();
    if (filters?.productId) params.append('productId', filters.productId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/inventory/movements?${params.toString()}`);
    return response.data;
  },

  // Calcular giro mensal
  async getMonthlyTurnover(productId?: string): Promise<TurnoverData[]> {
    const params = productId ? `?productId=${productId}` : '';
    const response = await api.get(`/inventory/turnover${params}`);
    return response.data;
  },

  // Buscar produtos com estoque crítico
  async getCriticalStock(): Promise<Product[]> {
    const response = await api.get('/inventory/critical-stock');
    return response.data;
  },

  // Buscar produtos
  async getProducts(filters?: {
    search?: string;
    categoryId?: string;
    includeInactive?: boolean;
  }): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.includeInactive) params.append('includeInactive', 'true');

    const response = await api.get(`/inventory/products?${params.toString()}`);
    return response.data;
  },

  // Deletar produto
  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/inventory/products/${id}`);
  }
};