
import { User, Product, Court, Transaction, Module, Log } from './types';

export const MOCK_USERS: User[] = [
  {
    id: '83920',
    name: 'Ana Silva',
    email: 'ana@arenad65.com',
    phone: '(11) 98765-4321',
    role: 'Atleta',
    department: 'Externo',
    status: 'active',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDEorOAladS6ciYPhMMx9VP9m95jZNhgLqT9syHtPuwnlp9V6gEJObmj50_mishbbQfplyGUUDL5xj7b1YBGd8EpBTDc_dA2u0Og0132rDJ_oIfZVyMujRTK-kMWAduQriw9RuW5my6nNcNgGCFoxgnMtjd_wgDrBFOmuJT6ZQPCam6kZWLuFCW4R6yTVMMzm15hpmsJlYBJ-WyPTjD628R8iWIWbB90pItYgPCkx6L2gckshpoA2slzcwVooJ2ylaeS9_L2HHzX0',
    points: 2450,
    lastVisit: 'Hoje, 10:00',
    level: 'Ouro',
    birthday: '05-15',
    totalSpent: 4500.00,
    lastActivityDays: 0
  },
  {
    id: '19283',
    name: 'Carlos Souza',
    email: 'carlos@arenad65.com',
    phone: '(11) 91234-5678',
    role: 'Atleta',
    department: 'Externo',
    status: 'active',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCse7jYtnUI5xz62pUUp400QEpJBwvnnoTN8S3WINjePuOyRiWmf02H7dKSvxJ7Hk3XLtcsuCa24xeeoYRFv23ev6TCQ9PkyhTSShu10JHAKKWgCL6W6xdCkT_6Onnubud1rwCaulX9D70MOL7oQdasWbUa9eQTSw2HNg3YNC99xei3g3whkz4WOhmLJeEkfkY98xS-Beteb-pJPBIj2D2QPAyc4FZB2ULnciD5KVHVjeYySiY7iXK9wDIR7BwVycUZfO3lPmagOjo',
    points: 1200,
    lastVisit: 'Ontem, 18:30',
    level: 'Prata',
    birthday: '12-20',
    totalSpent: 1250.50,
    lastActivityDays: 1
  }
];

export const MOCK_COURTS: Court[] = [
  {
    id: 'c1',
    name: 'Quadra 01 - Areia Principal',
    type: 'Beach Tennis',
    status: 'excellent',
    healthScore: 95,
    lastMaintenance: '10/12/2025',
    nextMaintenance: '15/01/2026 (Troca de Areia)',
    monthlyFixedCost: 1200.00,
    costBreakdown: [
      { name: 'Energia (Refletores LED)', value: 450 },
      { name: 'Manutenção Mensal Areia', value: 350 },
      { name: 'Limpeza e Conservação', value: 400 }
    ],
    recentIncidents: 0,
    equipment: [
      { name: 'Rede Profissional', status: 'ok' },
      { name: '4 Refletores LED', status: 'ok' },
      { name: 'Nivelador Manual', status: 'ok' }
    ],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCi5OECURyLO8-vxXyl9gm1VLAnGSyzSjSTh8B-a1WLHgfIfO68DslqyNEX0dIiGIcAtL1W96Jeg3Ga8s63MQ3LRkgG_tBzIq0SwD_erm0RgyZZA36Ikrbji8S3J1Jz2n7S2ce0m17u4flV1FKDJWGpLBvs7eng5hdQSjXN4B3yCr9rAyWvc3IJpIM532f3O41bhwEAgObhkiv5O9GgR_sXiWuznQ69UR0arelf26s2ZhCYUOzaDoEsH5Hl0ymas_EEqjFmKc2Lb5A'
  },
  {
    id: 'c2',
    name: 'Quadra 02 - Areia',
    type: 'Beach Tennis',
    status: 'attention',
    healthScore: 65,
    lastMaintenance: '05/11/2025',
    nextMaintenance: '20/12/2025 (Revisão Elétrica)',
    monthlyFixedCost: 1150.00,
    costBreakdown: [
      { name: 'Energia (Refletores LED)', value: 400 },
      { name: 'Manutenção Mensal Areia', value: 350 },
      { name: 'Limpeza e Conservação', value: 400 }
    ],
    recentIncidents: 2,
    equipment: [
      { name: 'Rede Profissional', status: 'issue' },
      { name: '4 Refletores LED', status: 'ok' },
      { name: 'Nivelador Manual', status: 'ok' }
    ],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCS7PlKUNshHe6qL8DPUunzo46zBSd536qmZWM3wgR49gz8mOvKLXWL_lpsbsafFIe4b0UNeT5AhEslUA3Zh6I4nvUY2ZqvLlOvmiw0dvLnb6yo6IS7GPEs260giVyJopoch0T6XNw8396otlLOuDuyxtjW2FL08ZS1Im8TO-vRGx9ClkwhKnm_GIn6NEh9iEalx1ghdJpqzoWfiuLZbNPeNI6mAp3aTikicuW0yKyrsle4ucqkx39ExS81JCg3kcwQKD56ClFT33c'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Heineken Long Neck',
    price: 12.00,
    purchasePrice: 6.50,
    margin: 84.62,
    category: {
      id: 'cat-1',
      name: 'Bebidas',
      type: 'PRODUCT'
    },
    sku: 'BEER-H-01',
    stock: 12,
    minStock: 50,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7usK6HkWzvL1exiZF_aT2ACzwQ5e-LkQyh1VTXrqpGesY1R-KxOrLIQUehyB8IeVJPuiLs7Zsl9pFUlgY7XMrOFeiQZWmPLFwX9fvlGtdyF7Ga-IaQQ81g1Bc7QZ0y2Iqt22D_AxFLIjbGbqto_aXqkPMz-JGSnjGSiXRFeeIU1gC9EAe49TqdHRxX34-ed3syBVUU6ISQ30sFQoKEoCcd_stRa-vy7Byi7YQSXriYw1Sw2VTdcH_isxtn2-Byf2MXvzIyhSrLRw'
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [];

export const MOCK_LOGS: Log[] = [];

export const NAV_ITEMS = [
  { id: Module.DASHBOARD, icon: 'dashboard' },
  { id: Module.POS, icon: 'point_of_sale', label: 'Bar / PDV' },
  { id: Module.INVENTORY, icon: 'inventory_2', label: 'Estoque' },
];
