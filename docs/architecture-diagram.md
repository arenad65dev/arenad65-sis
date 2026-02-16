# Arquitetura do Sistema Arena D65

## Visão Geral

```mermaid
graph TB
    subgraph "Frontend (React/TypeScript)"
        A[LoginView] --> B[DashboardView]
        B --> C[POSView]
        B --> D[FinanceView]
        B --> E[CRMView]
        B --> F[MaintenanceView]
        B --> G[InventoryView]
    end
    
    subgraph "API Gateway"
        H[Fastify Server]
        I[JWT Middleware]
        J[CORS Middleware]
    end
    
    subgraph "Backend Services"
        K[AuthService]
        L[DashboardService]
        M[POSService]
        N[FinanceService]
        O[CRMService]
        P[MaintenanceService]
        Q[InventoryService]
    end
    
    subgraph "Data Layer"
        R[(PostgreSQL)]
        S[Prisma ORM]
    end
    
    subgraph "External Services"
        T[WebSocket Server]
        U[Email Service]
    end
    
    A --> H
    B --> H
    C --> H
    D --> H
    E --> H
    F --> H
    G --> H
    
    H --> I
    H --> J
    
    I --> K
    I --> L
    I --> M
    I --> N
    I --> O
    I --> P
    I --> Q
    
    K --> S
    L --> S
    M --> S
    N --> S
    O --> S
    P --> S
    Q --> S
    
    S --> R
    
    H --> T
    N --> U
```

## Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as AuthController
    participant D as Database
    participant JWT as JWT Service
    
    U->>F: Login with email/password
    F->>A: POST /api/auth/login
    A->>D: Find user by email
    D-->>A: User data
    A->>A: Compare password hash
    alt Valid credentials
        A->>JWT: Generate token
        JWT-->>A: JWT token
        A-->>F: Token + user data
        F->>F: Store token in localStorage
        F-->>U: Redirect to dashboard
    else Invalid credentials
        A-->>F: 401 Unauthorized
        F-->>U: Show error message
    end
```

## Fluxo de Venda no POS

```mermaid
sequenceDiagram
    participant C as Cashier
    participant F as Frontend (POS)
    participant P as POSService
    participant I as InventoryService
    participant D as Database
    participant T as TransactionService
    
    C->>F: Add products to cart
    F->>P: POST /api/pos/orders
    P->>D: Create order with items
    D-->>P: Order created
    P-->>F: Order details
    
    C->>F: Process payment
    F->>P: POST /api/pos/orders/:id/pay
    P->>P: Validate payment
    P->>I: Update stock levels
    I->>D: Decrement product stock
    D-->>I: Stock updated
    P->>T: Create transaction record
    T->>D: Save transaction
    D-->>T: Transaction saved
    P-->>F: Payment confirmed
    F-->>C: Show success message
```

## Modelo de Dados

```mermaid
erDiagram
    User ||--o{ Order : creates
    User ||--o{ CashierSession : opens
    User ||--o{ ActivityLog : generates
    
    Order ||--|{ OrderItem : contains
    Order ||--|| Transaction : generates
    
    Product ||--o{ OrderItem : appears_in
    Product }o--|| Category : belongs_to
    
    Category ||--o{ Transaction : categorizes
    
    CashierSession ||--o{ Transaction : records
    CashierSession ||--o{ Skimming : has
    
    Maintenance ||--o{ MaintenanceTask : has
    
    Customer ||--o{ Order : places
```

## Arquitetura de Segurança

```mermaid
graph LR
    subgraph "Security Layers"
        A[Input Validation]
        B[JWT Authentication]
        C[Role-Based Access Control]
        D[Password Hashing]
        E[CORS Configuration]
        F[Rate Limiting]
    end
    
    subgraph "Protected Resources"
        G[API Endpoints]
        H[Database]
        I[File Storage]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    
    F --> G
    G --> H
    H --> I
```

## Estrutura de Pastas

```
arena-d65/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── middlewares/     # Auth, validation, etc.
│   │   ├── utils/           # Helper functions
│   │   ├── routes/          # Route definitions
│   │   ├── types/           # TypeScript types
│   │   └── lib/             # External libraries (Prisma)
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Database migrations
│   └── scripts/             # Seed scripts
├── frontend/
│   ├── components/          # Reusable UI components
│   ├── views/               # Page components
│   ├── services/            # API calls
│   ├── hooks/               # Custom React hooks
│   └── types/               # TypeScript types
├── docs/                    # Documentation
└── plans/                   # Implementation plans
```

## Tecnologias Utilizadas

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Query** - Server state management
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Fastify** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **WebSocket** - Real-time communication

### DevOps
- **Docker** - Containerization
- **GitHub** - Version control
- **VPS** - Hosting