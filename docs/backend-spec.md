
# Especificação de Backend - Arena D65 Management Hub

Este documento define os requisitos técnicos e a arquitetura da API para suportar as operações da Arena D65.

## 1. Stack Tecnológica Recomendada
- **Runtime**: Node.js (v18+) com Fastify.
- **ORM**: Prisma (PostgreSQL).
- **Cache/Real-time**: Redis e WebSockets (Socket.io).

## 2. Módulo de PDV e Mesas (POS Module)
[... mantido conforme anterior ...]

## 3. Módulo de Gestão de Ativos e Manutenção (Asset Health)

Este módulo foca na integridade física das quadras e equipamentos.

### 3.1 Modelo de Dados (Prisma Schema)
```prisma
model Installation {
  id                String            @id @default(uuid())
  name              String
  type              String
  monthlyFixedCost  Decimal
  healthScore       Int               @default(100)
  status            InstallationStatus @default(EXCELLENT)
  tasks             MaintenanceTask[]
  equipments        AssetEquipment[]
}

model MaintenanceTask {
  id              String      @id @default(uuid())
  installationId  String
  installation    Installation @relation(fields: [installationId], references: [id])
  description     String
  priority        Priority    @default(MEDIUM)
  status          TaskStatus  @default(PENDING)
  reportedBy      String
  estimatedCost   Decimal?
  createdAt       DateTime    @default(now())
}

enum InstallationStatus {
  EXCELLENT
  ATTENTION
  MAINTENANCE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}
```

### 3.2 Sincronização em Tempo Real (Zeladoria)
O backend deve emitir eventos via WebSocket quando um problema for relatado:
- `EVENT_ISSUE_REPORTED`: Disparado ao criar uma `MaintenanceTask`. Altera o `InstallationStatus` para `ATTENTION` automaticamente se a prioridade for `HIGH`.
- `EVENT_INSTALLATION_HEALTH_UPDATE`: Disparado quando o `healthScore` é recalculado.

### 3.3 Endpoints
- `POST /api/v1/assets/:id/report`: Cria uma nova tarefa de manutenção.
- `GET /api/v1/assets/health`: Retorna o dashboard consolidado de saúde de todas as instalações.
- `PATCH /api/v1/assets/tasks/:id/complete`: Finaliza uma tarefa e registra o custo real no financeiro (`expenses`).

## 4. Módulo de Fidelidade (CRM Integration)
[... mantido conforme anterior ...]

## 5. Auditoria e Segurança (E12)
[... mantido conforme anterior ...]

---
*Documentação atualizada em: 10/01/2026*
