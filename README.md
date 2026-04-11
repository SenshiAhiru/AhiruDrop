# AhiruDrop

Plataforma de rifas online premium com experiencia moderna, confiavel e escalavel.

## Stack

- **Frontend/Backend**: Next.js 15 (App Router) + TypeScript
- **UI**: TailwindCSS v4 + shadcn/ui
- **ORM**: Prisma
- **Banco**: Supabase (PostgreSQL)
- **Auth**: NextAuth v5 (Auth.js)
- **Pagamentos**: Adapter pattern (Mercado Pago, Stripe, PushinPay)

## Setup

### Pre-requisitos

- Node.js 18+
- npm
- Conta no [Supabase](https://supabase.com) (ou PostgreSQL local)

### Instalacao

```bash
# Instalar dependencias
npm install

# Copiar variaveis de ambiente
cp .env.example .env

# Editar .env com suas credenciais
```

### Configurar .env

```env
# Supabase
DATABASE_URL="postgresql://postgres:[SENHA]@db.[PROJETO].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[SENHA]@db.[PROJETO].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="" # Gere com: openssl rand -base64 32

# Encriptacao de credenciais de gateway
GATEWAY_ENCRYPTION_KEY="" # Gere com: openssl rand -hex 32

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="AhiruDrop"
```

### Banco de dados

```bash
# Gerar client Prisma
npx prisma generate

# Rodar migrations
npx prisma migrate dev --name init

# Popular banco com dados iniciais
npx prisma db seed
```

### Executar

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Producao
npm start
```

## Credenciais iniciais (seed)

| Role | Email | Senha |
|------|-------|-------|
| Super Admin | admin@ahirudrop.com | admin123 |
| Usuario | usuario@teste.com | user123 |

## Estrutura do projeto

```
src/
├── app/              # Pages e API routes (App Router)
│   ├── (public)/     # Paginas publicas
│   ├── (auth)/       # Login, registro
│   ├── (dashboard)/  # Painel do usuario
│   ├── (admin)/      # Painel administrativo
│   └── api/          # API routes
├── components/       # Componentes React
│   ├── ui/           # Primitivos (button, card, input...)
│   ├── layout/       # Header, footer, sidebars
│   ├── raffle/       # Componentes de rifa
│   ├── checkout/     # Checkout e pagamento
│   ├── order/        # Pedidos
│   ├── admin/        # Componentes admin
│   ├── shared/       # Logo, spinner, empty state
│   └── providers/    # Context providers
├── services/         # Logica de negocio
├── repositories/     # Acesso a dados (Prisma)
├── gateways/         # Adapters de pagamento
├── validators/       # Schemas Zod
├── types/            # TypeScript types
├── hooks/            # React hooks customizados
├── constants/        # Constantes e enums
├── config/           # Configuracoes do site
└── lib/              # Utilitarios (prisma, auth, crypto)
```

## Sistema de pagamento

O sistema usa **Adapter Pattern** para gateways de pagamento:

1. Cada gateway implementa a interface `PaymentGatewayAdapter`
2. Credenciais sao armazenadas encriptadas no banco
3. Admin pode ativar/desativar gateways pelo painel
4. Trocar gateway nao requer mudanca de codigo

### Adicionar novo gateway

1. Criar adapter em `src/gateways/novo-gateway.adapter.ts`
2. Implementar a interface `PaymentGatewayAdapter`
3. Registrar no `PaymentGatewayFactory`
4. Configurar credenciais pelo painel admin

## Deploy

### Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Configurar variaveis de ambiente no dashboard da Vercel.

### Variaveis obrigatorias

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GATEWAY_ENCRYPTION_KEY`

## Licenca

Proprietario - AhiruDrop
