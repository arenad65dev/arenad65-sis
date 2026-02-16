# Plano de Implementação - Arena D65

## Status Atual
- ✅ Banco de dados PostgreSQL configurado (remoto)
- 🚧 Senhas em texto plano (sem hashing)
- 🚧 Autenticação JWT implementada mas sem validação robusta
- ✅ Dashboard conectado ao backend
- ✅ Gestão de manutenção funcional
- 🚧 POS sem controle de estoque real
- 🚧 Módulo financeiro parcialmente conectado

## Próximos Passos

### 1. Implementar Hashing de Senhas com bcrypt

#### 1.1. Instalar dependências
```bash
cd backend
npm install bcryptjs @types/bcryptjs
```

#### 1.2. Criar utilitário de senhas
Criar arquivo `backend/src/utils/password.ts`:
```typescript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export class PasswordUtils {
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
```

#### 1.3. Atualizar AuthController
- Modificar `register` para fazer hash da senha antes de salvar
- Modificar `login` para comparar hash em vez de texto plano
- Adicionar validação de senha atual no `updateProfile`

### 2. Implementar Middleware de Autenticação

#### 2.1. Criar middleware de autenticação
Criar arquivo `backend/src/middlewares/auth.ts`:
```typescript
import { FastifyRequest, FastifyReply } from 'fastify';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
}
```

#### 2.2. Proteger rotas
Adicionar middleware nas rotas que precisam de autenticação:
- `/api/dashboard/*`
- `/api/pos/*`
- `/api/maintenance/*`

### 3. Implementar Controle de Estoque Real no POS

#### 3.1. Atualizar POSService
No método `payOrder`, adicionar lógica para decrementar estoque:
```typescript
// 3. Decrement Inventory
for (const item of orderItemsData) {
  await tx.product.update({
    where: { id: item.productId },
    data: {
      stock: {
        decrement: item.quantity
      }
    }
  });
}
```

#### 3.2. Adicionar validação de estoque
Antes de criar pedido, verificar se há estoque suficiente

### 4. Conectar Módulo Financeiro

#### 4.1. Criar FinanceController
Implementar endpoints para:
- Listar transações com filtros
- Criar transações de receita/despesa
- Gerar relatórios financeiros

#### 4.2. Criar FinanceService
Implementar lógica de negócio para:
- Cálculo de métricas financeiras
- Geração de relatórios
- Análise de margens

### 5. Implementar Gestão de Clientes (CRM)

#### 5.1. Criar CustomerController
Implementar endpoints para:
- Listar clientes
- Buscar histórico de compras
- Gerenciar pontos de fidelidade

#### 5.2. Atualizar modelo de dados
Adicionar relação entre Order e Customer

### 6. Implementar Notificações em Tempo Real

#### 6.1. Configurar WebSockets
Criar handlers para eventos:
- Novo pedido criado
- Estoque baixo
- Manutenção agendada

#### 6.2. Conectar frontend
Implementar listeners para eventos WebSocket

### 7. Criar Script de Seed

#### 7.1. Implementar seed completo
Criar dados iniciais para:
- Usuários (admin, manager, staff)
- Categorias de produtos
- Produtos com estoque inicial
- Clientes de exemplo

### 8. Implementar Exportação de Relatórios

#### 8.1. Adicionar dependências
```bash
npm install jspdf html2canvas xlsx
```

#### 8.2. Implementar exportadores
- PDF para relatórios financeiros
- CSV para dados de transações
- Excel para análises

## Ordem de Implementação Sugerida

1. **Segurança** (bcrypt + middleware)
2. **Controle de Estoque** (funcionalidade crítica)
3. **Módulo Financeiro** (coração do negócio)
4. **CRM** (melhoria de UX)
5. **Notificações** (tempo real)
6. **Seed** (dados para testes)
7. **Relatórios** (funcionalidade de negócio)

## Comandos Úteis

### Para rodar o backend:
```bash
cd backend
npm run dev
```

### Para rodar o frontend:
```bash
npm run dev
```

### Para rodar migrações do Prisma:
```bash
cd backend
npx prisma migrate dev
```

### Para gerar cliente Prisma:
```bash
cd backend
npx prisma generate
```

### Para popular banco com seed:
```bash
cd backend
npm run seed
```

## Próximos Passos Imediatos

1. Instalar bcryptjs
2. Criar utilitário de senhas
3. Atualizar AuthController
4. Testar autenticação com senhas hasheadas
5. Implementar middleware de autenticação
6. Proteger rotas críticas

## Considerações de Produção

- Usar variáveis de ambiente para configurações sensíveis
- Implementar rate limiting
- Adicionar logging estruturado
- Configurar CORS para domínio específico
- Implementar validação de entrada rigorosa
- Adicionar tratamento de erros global