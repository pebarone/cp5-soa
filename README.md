# Sistema de Reserva de Hotel 🏨
<img width="1569" height="896" alt="image" src="https://github.com/user-attachments/assets/8bca2f10-2f1e-4a90-8c52-054a7c4b4dce" />

## Integrantes do Grupo
- Nome: Pedro Augusto Carneiro Barone Bomfim - RM: 99781 
- Nome: João Pedro de Albuquerque Oliveira - RM: 551579
- Nome: Matheus Augusto Santos Rego - RM:551466

## Como usar?
A aplicação tem um deploy no google cloud run, para uso sem necessidade de configuração local: https://cp5-soa-xmsmzoghiq-rj.a.run.app

Mas, mais abaixo, há também uma explicação de como configurar o ambiente para execução em servidor de desenvolvimento.

A documentação dos endpoints pode ser encontrada aqui: https://cp5-soa-xmsmzoghiq-rj.a.run.app/api-docs

## 📋 Descrição

Sistema completo de gerenciamento de reservas de hotel desenvolvido como Checkpoint 2 da disciplina de Arquitetura Orientada a Serviços da FIAP. O projeto implementa uma API REST seguindo padrões de arquitetura MVC em 3 camadas, com regras de negócio robustas para gestão do ciclo completo: **reserva → check-in → check-out**.

## 🎯 Funcionalidades Principais

### Gestão de Hóspedes
- Cadastro completo com validação de CPF
- Atualização de dados pessoais
- Consulta individual e listagem
- Exclusão com verificação de reservas ativas

### Gestão de Quartos
- Cadastro com tipos (STANDARD, DELUXE, SUITE)
- Definição de capacidade e preço por diária
- Ativação/desativação de quartos
- Validação de disponibilidade no período

### Gestão de Reservas
- **Criação**: Validação de disponibilidade, datas e capacidade
- **Atualização**: Permitida apenas no status CREATED
- **Check-in**: Com validação de janela (apenas no dia previsto)
- **Check-out**: Cálculo automático do valor final baseado em diárias efetivas
- **Cancelamento**: Permitido apenas antes do check-in
- **Filtros**: Por hóspede ou quarto

### Interface Web
- Dashboard responsivo e intuitivo
- Gerenciamento visual de reservas, hóspedes e quartos
- Filtros dinâmicos e ações contextuais
- Feedback visual com animações e toasts

## 🏗️ Arquitetura

O projeto segue arquitetura **MVC em 3 camadas** com separação clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────┐
│                   CAMADA DE APRESENTAÇÃO                │
│  Controllers (Express) + DTOs + Validação de Entrada    │
│  • guest.controller.js                                  │
│  • room.controller.js                                   │
│  • reservation.controller.js                            │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  CAMADA DE NEGÓCIO                      │
│     Services (Regras de Negócio + Lógica)               │
│  • guest.service.js                                     │
│  • room.service.js                                      │
│  • reservation.service.js                               │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                 CAMADA DE PERSISTÊNCIA                  │
│      Repositories (Acesso a Dados + Queries)            │
│  • guest.repository.js                                  │
│  • room.repository.js                                   │
│  • reservation.repository.js                            │
└─────────────────────────────────────────────────────────┘
```

### Padrões Implementados

- **DTOs**: Separação entre dados de entrada/saída e modelos internos
- **Repository Pattern**: Abstração de acesso a dados
- **Service Layer**: Encapsulamento de regras de negócio
- **Error Handling**: Middleware centralizado com erros customizados
- **Dependency Injection**: Módulos isolados e testáveis

## 📁 Estrutura do Projeto

```
cp5-soa/
├── app.js                      # Ponto de entrada da aplicação
├── package.json                # Dependências e scripts
├── jest.config.js              # Configuração de testes
├── .env                        # Variáveis de ambiente (não versionado)
│
├── db/
│   ├── knexfile.js            # Configuração do Knex para migrações
│   ├── safe-migrate.js        # Script de migração seguro
│   ├── migrations/
│   │   └── V1__init.sql       # Script de criação das tabelas Oracle
│   └── seeds/
│       └── seed.js            # Dados iniciais (10 hóspedes, 10 quartos, 10 reservas)
│
├── src/
│   ├── config/
│   │   ├── database.js        # Pool de conexões Oracle
│   │   └── swagger.yaml       # Documentação OpenAPI 3.0
│   │
│   ├── controllers/           # Camada de apresentação
│   │   ├── guest.controller.js
│   │   ├── room.controller.js
│   │   └── reservation.controller.js
│   │
│   ├── services/              # Camada de negócio
│   │   ├── guest.service.js
│   │   ├── room.service.js
│   │   └── reservation.service.js
│   │
│   ├── repositories/          # Camada de persistência
│   │   ├── guest.repository.js
│   │   ├── room.repository.js
│   │   └── reservation.repository.js
│   │
│   ├── dtos/                  # Data Transfer Objects
│   │   ├── guest.dto.js
│   │   ├── room.dto.js
│   │   └── reservation.dto.js
│   │
│   ├── models/                # Modelos de domínio
│   │   ├── guest.model.js
│   │   ├── room.model.js
│   │   └── reservation.model.js
│   │
│   ├── routes/                # Definição de rotas
│   │   ├── index.js           # Router principal
│   │   ├── guest.routes.js
│   │   ├── room.routes.js
│   │   └── reservation.routes.js
│   │
│   ├── middlewares/           # Middlewares customizados
│   │   ├── errorHandler.js    # Tratamento global de erros
│   │   └── validation.middleware.js
│   │
│   └── utils/
│       └── dateUtils.js       # Utilitários de manipulação de datas
│
├── static/                    # Interface web (SPA)
│   ├── index.html             # Página principal
│   ├── styles.css             # Estilos globais
│   ├── app.js                 # Core da aplicação frontend
│   ├── api.js                 # Camada de comunicação com API
│   ├── guests.js              # Módulo de hóspedes
│   ├── rooms.js               # Módulo de quartos
│   ├── reservations.js        # Módulo de reservas
│   └── animations.js          # Animações e transições
│
└── test/                      # Testes automatizados
    ├── controllers/
    │   └── guest.controller.test.js
    ├── services/
    │   └── reservation.service.test.js
    ├── repositories/
    │   └── room.repository.test.js
    └── utils/
        └── dateUtils.test.js
```

## 🚀 Instalação e Execução

### Pré-requisitos

- **Node.js** >= 18.x
- **npm** ou **pnpm**
- **Oracle Database** 19c ou superior (ou acesso a Oracle Cloud)
- **Docker** (opcional, para execução em container)

### Opção 1: Executar com Docker 🐳 (Recomendado)

A forma mais rápida de executar a aplicação é usando Docker:

#### 1.1. Pull da Imagem do Docker Hub

```bash
docker pull pbrnx/cp5-soa:latest
```

#### 1.2. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Configuração do Banco de Dados Oracle
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
# Configuração do Banco de Dados Oracle
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_URL=localhost:1521/ORCL

# Porta da aplicação (opcional, padrão: 3000)
PORT=3000

# Seed automático ao iniciar (opcional, padrão: false)
AUTO_SEED=true
```

#### 1.3. Execute com Docker Run

```bash
# Com seed automático (recomendado para primeira execução)
docker run -d \
  --name hotel-reservations-api \
  -p 3000:3000 \
  -e DB_USER=seu_usuario \
  -e DB_PASSWORD=sua_senha \
  -e DB_URL=localhost:1521/XEPDB1 \
  -e AUTO_SEED=true \
  pbrnx/cp5-soa:latest

# Ou usando arquivo .env
docker run -d --name hotel-reservations-api -p 3000:3000 --env-file .env pbrnx/cp5-soa:latest
```

> **💡 Dica**: O container automaticamente:
> - Aguarda o banco de dados estar pronto
> - Inicia a aplicação
> - Executa o seed se `AUTO_SEED=true` (popula com 10 hóspedes, 10 quartos, 10 reservas)

#### 1.4. Ou Use Docker Compose

```bash
# Inicia o container com seed automático
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f
```

A aplicação estará disponível em:
- **API**: http://localhost:3000/api
- **Interface Web**: http://localhost:3000
- **Documentação Swagger**: http://localhost:3000/api-docs

#### Comandos Docker Úteis

```bash
# Ver logs do container (útil para acompanhar o seed)
docker logs -f hotel-reservations-api

# Ver valor do AUTO_SEED e outras env vars
docker exec hotel-reservations-api env | grep AUTO_SEED

# Ver logs apenas do seed
docker logs hotel-reservations-api | grep "🌱"

# Parar o container
docker stop hotel-reservations-api

# Remover o container
docker rm hotel-reservations-api

# Reiniciar (importante: pare e remova para recarregar .env)
docker-compose down
docker-compose up -d

# Ver status e health check
docker ps
docker inspect hotel-reservations-api | grep -A 5 Health
```
docker ps
```

### Opção 2: Executar Localmente

#### 2.1. Clone o Repositório

```bash
git clone https://github.com/pebarone/cp5-soa.git
cd cp5-soa
```

#### 2.2. Instale as Dependências

```bash
npm install
# ou
pnpm install
```

#### 2.3. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Configuração do Banco de Dados Oracle
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_URL=localhost:1521/ORCL

# Porta da aplicação (opcional, padrão: 3000)
PORT=3000
```

#### 2.4. Execute as Migrações do Banco de Dados

As migrações são executadas automaticamente ao iniciar a aplicação com `npm start`, mas você também pode executá-las manualmente:

```bash
npm run migrate
```

Este comando usa o Knex para aplicar todas as migrações pendentes de forma segura.

#### 2.5. Inicie a Aplicação
```bash
npm start
```

A aplicação estará disponível em:
- **API**: http://localhost:3000/api
- **Interface Web**: http://localhost:3000
- **Documentação Swagger**: http://localhost:3000/api-docs

### 3. Popule o Banco com Dados Iniciais (Opcional)

Com a aplicação rodando, execute o script de seed:

```bash
node db/seeds/seed.js
```

Isso criará:
- 10 hóspedes com CPFs válidos
- 10 quartos de diferentes tipos
- 10 reservas de exemplo

## 🔄 Migrações Versionadas (Knex.js)

O projeto utiliza **Knex.js** para gerenciar migrações de banco de dados de forma versionada e rastreável. Todas as migrações são executadas automaticamente no startup da aplicação.

### Estrutura de Migrações

```
db/
├── migrations/
│   ├── 20250127000001_init.js      # Criação inicial das tabelas
│   ├── 20250127000002_example.js   # Exemplo de migração futura
│   └── 20250127000003_feature.js   # Exemplo de migração futura
├── knexfile.js                      # Configuração do Knex
└── seeds/                           # Seeds separados das migrações
    └── seed.js
```

### Convenção de Nomenclatura

As migrações seguem o padrão Knex (timestamp):
- **Prefixo**: Timestamp (YYYYMMDDHHmmss)
- **Separador**: `_` (underscore)
- **Descrição**: Nome descritivo em snake_case
- **Extensão**: `.js`

Exemplos:
- `20250127000001_init.js` - Criação inicial
- `20250127000002_add_guest_address.js` - Adiciona coluna de endereço
- `20250127000003_create_payments.js` - Cria tabela de pagamentos

### Comandos Disponíveis

```bash
# Executar migrações pendentes
npm run migrate

# Ver status de todas as migrações
npm run migrate:status

# Reverter última migração (rollback)
npm run migrate:rollback

# Criar nova migração
npm run migrate:make nome_da_migracao
```

### Execução Automática no Docker

O `docker-entrypoint.sh` executa automaticamente as migrações no startup:

```bash
1. Aguarda o banco de dados estar pronto
2. Executa migrações pendentes (npm run migrate)
3. Inicia a aplicação
4. Executa seed se AUTO_SEED=true
```

### Histórico de Migrações

O Knex mantém um registro de todas as migrações executadas na tabela `knex_migrations`:

| Id | Name | Batch | Migration Time |
|----|------|-------|----------------|
| 1 | 20250127000001_init.js | 1 | 2025-01-15 10:30:00 |

### Como Criar uma Nova Migração

1. Crie um arquivo em `db/migrations/` seguindo a convenção usando o comando:
   ```bash
   npm run migrate:make add_guest_address
   ```
   
   Isso criará um arquivo como: `20250127000002_add_guest_address.js`

2. Escreva a migração usando Knex:
   ```javascript
   exports.up = async function(knex) {
     await knex.schema.table('RESERVAS_GUESTS', (table) => {
       table.string('address', 200);
     });
   };

   exports.down = async function(knex) {
     await knex.schema.table('RESERVAS_GUESTS', (table) => {
       table.dropColumn('address');
     });
   };
   ```

3. A migração será executada automaticamente no próximo deploy ou via comando:
   ```bash
   npm run migrate
   ```

### Boas Práticas

✅ **FAÇA:**
- Sempre crie migrações incrementais
- Use nomes descritivos
- Teste migrações localmente antes de comitar
- Nunca modifique migrações já aplicadas em produção

❌ **NÃO FAÇA:**
- Alterar migrações já executadas
- Usar comandos destrutivos (DROP, TRUNCATE) sem backup
- Pular números de versão

### Rollback

O Knex suporta rollback através do comando `npm run migrate:rollback`, que reverterá o último batch de migrações. Para reverter mudanças específicas, você também pode criar uma nova migração com as alterações inversas:

```javascript
// Exemplo: 20250127000003_revert_add_guest_address.js
exports.up = async function(knex) {
  await knex.schema.table('RESERVAS_GUESTS', (table) => {
    table.dropColumn('address');
  });
};

exports.down = async function(knex) {
  await knex.schema.table('RESERVAS_GUESTS', (table) => {
    table.string('address', 200);
  });
};
```

## 🧪 Testes

O projeto inclui testes automatizados usando **Jest**:

```bash
# Executar todos os testes
npm test

# Executar testes específicos
npm test -- guest.controller.test.js
```

**Cobertura de testes:**
- Controllers (validação de fluxo HTTP)
- Services (regras de negócio)
- Repositories (queries SQL)
- Utils (manipulação de datas)

## 📡 API Endpoints

### Hóspedes (Guests)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/guests` | Cria novo hóspede |
| `GET` | `/api/guests` | Lista todos os hóspedes |
| `GET` | `/api/guests/:id` | Busca hóspede por ID |
| `PUT` | `/api/guests/:id` | Atualiza hóspede |
| `DELETE` | `/api/guests/:id` | Remove hóspede |

### Quartos (Rooms)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/rooms` | Cria novo quarto |
| `GET` | `/api/rooms` | Lista todos os quartos |
| `GET` | `/api/rooms/:id` | Busca quarto por ID |
| `PUT` | `/api/rooms/:id` | Atualiza quarto |
| `PATCH` | `/api/rooms/:id/activate` | Ativa quarto |
| `PATCH` | `/api/rooms/:id/deactivate` | Desativa quarto |

### Reservas (Reservations)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/reservations` | Cria nova reserva |
| `GET` | `/api/reservations` | Lista reservas (com filtros) |
| `GET` | `/api/reservations/:id` | Busca reserva por ID |
| `PUT` | `/api/reservations/:id` | Atualiza datas da reserva |
| `PATCH` | `/api/reservations/:id/check-in` | Realiza check-in |
| `PATCH` | `/api/reservations/:id/check-out` | Realiza check-out |
| `PATCH` | `/api/reservations/:id/cancel` | Cancela reserva |

### Exemplos de Requisições

#### Criar Hóspede
```bash
curl -X POST http://localhost:3000/api/guests \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "João Silva",
    "document": "12345678901",
    "email": "joao@example.com",
    "phone": "11999999999"
  }'
```

#### Criar Reserva
```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "guestId": "uuid-do-hospede",
    "roomId": "uuid-do-quarto",
    "checkinExpected": "2025-11-10",
    "checkoutExpected": "2025-11-15"
  }'
```

#### Realizar Check-in
```bash
curl -X PATCH http://localhost:3000/api/reservations/{id}/check-in
```

## 🔒 Regras de Negócio Implementadas

### Validações de Data
- ✅ `checkoutExpected` deve ser posterior a `checkinExpected`
- ✅ Violação retorna `400 Bad Request`

### Disponibilidade de Quarto
- ✅ Não permite sobreposição de reservas no mesmo quarto
- ✅ Reservas canceladas não bloqueiam disponibilidade
- ✅ Violação retorna `409 Conflict`

### Capacidade
- ✅ Número de hóspedes não pode exceder capacidade do quarto
- ✅ Violação retorna `400 Bad Request`

### Máquina de Estados (FSM)
```
CREATED → CHECKED_IN → CHECKED_OUT
   ↓
CANCELED
```
- ✅ Transições inválidas retornam `409 Conflict`
- ✅ Cancelamento permitido apenas no status CREATED

### Janela de Check-in
- ✅ Check-in permitido apenas no dia de `checkinExpected`
- ✅ Violação retorna `422 Unprocessable Entity`

### Cálculo de Valores
- ✅ Valor estimado calculado na criação da reserva
- ✅ Valor final calculado no check-out baseado em diárias efetivas
- ✅ Fórmula: `valorFinal = max(1, diasEfetivos) × preçoPorNoite`

### Preservação de Preço
- ✅ Preço da diária é fixado no momento da reserva (`pricePerNightAtBooking`)
- ✅ Alterações futuras no preço do quarto não afetam reservas existentes

## 📊 Modelo de Dados

### Diagrama ER Simplificado

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│     GUESTS      │         │  RESERVATIONS   │         │      ROOMS      │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄────────┤ guest_id (FK)   │         │ id (PK)         │
│ full_name       │         │ room_id (FK)    ├────────►│ number (UNIQUE) │
│ document (UQ)   │         │ checkin_expected│         │ type            │
│ email (UQ)      │         │ checkout_expected│        │ capacity        │
│ phone           │         │ status          │         │ price_per_night │
│ created_at      │         │ checkin_at      │         │ status          │
└─────────────────┘         │ checkout_at     │         └─────────────────┘
                            │ priceat_booking │
                            │ estimated_amount│
                            │ final_amount    │
                            │ created_at      │
                            │ updated_at      │
                            └─────────────────┘
```

### Enumerações

**Room.type**: `STANDARD` | `DELUXE` | `SUITE`  
**Room.status**: `ATIVO` | `INATIVO`  
**Reservation.status**: `CREATED` | `CHECKED_IN` | `CHECKED_OUT` | `CANCELED`

## 🛠️ Stack Tecnológica

### Backend
- **Node.js** 18+ (Runtime)
- **Express** 5.x (Framework web)
- **oracledb** 6.x (Driver Oracle Database)
- **express-validator** (Validação de dados)
- **helmet** (Segurança HTTP)
- **dotenv** (Variáveis de ambiente)
- **uuid** (Geração de IDs únicos)

### Frontend
- **Vanilla JavaScript** (ES6+)
- **HTML5** / **CSS3**
- **Fetch API** (Comunicação com backend)

### Documentação
- **Swagger UI** + **OpenAPI 3.0**
- **YAML** (Definição da API)

### Testes
- **Jest** 30.x (Framework de testes)
- **Supertest** (Testes de integração HTTP)

### Banco de Dados
- **Oracle Database** 19c+
- **Migrações versionadas** (SQL scripts)

## 🎨 Interface Web

A aplicação inclui uma interface web completa e responsiva:

### Dashboard
- Navegação entre módulos (Hóspedes, Quartos, Reservas)
- Estatísticas e cards informativos
- Design moderno com animações suaves

### Funcionalidades da Interface
- ✅ CRUD completo de hóspedes e quartos
- ✅ Gestão visual de reservas com filtros
- ✅ Ações contextuais (check-in, check-out, cancelamento)
- ✅ Modais para criação/edição/visualização
- ✅ Validação de formulários em tempo real
- ✅ Feedback visual com toasts e estados de loading
- ✅ Tratamento de erros amigável

## 📝 Decisões Arquiteturais (ADRs)

### ADR-001: Arquitetura em 3 Camadas (MVC)

**Contexto**: Necessidade de separação clara de responsabilidades e manutenibilidade.

**Decisão**: Implementar padrão MVC com 3 camadas distintas:
- **Controller**: Validação de entrada, transformação de DTOs
- **Service**: Regras de negócio, orquestração
- **Repository**: Acesso a dados, queries SQL

**Consequências**:
- ✅ Código mais testável e modular
- ✅ Facilita manutenção e evolução
- ⚠️ Maior complexidade inicial

### ADR-002: Oracle Database com Pool de Conexões

**Contexto**: Necessidade de persistência robusta e performática.

**Decisão**: Usar Oracle Database com pool de conexões gerenciado por `oracledb`.

**Configuração**:
- Pool mínimo: 2 conexões
- Pool máximo: 4 conexões
- Timeout: 60 segundos

**Consequências**:
- ✅ Alta performance e escalabilidade
- ✅ Reutilização eficiente de conexões
- ⚠️ Requer Oracle Instant Client instalado

### ADR-003: DTOs para Entrada/Saída

**Contexto**: Evitar exposição de modelos internos e melhorar validação.

**Decisão**: Implementar DTOs separados para requisições e respostas.

**Consequências**:
- ✅ Controle fino sobre dados expostos
- ✅ Validação centralizada
- ✅ Versionamento de API facilitado

### ADR-004: Containerização com Docker

**Contexto**: Facilitar deploy e garantir ambiente consistente.

**Decisão**: Criar imagem Docker otimizada com multi-stage build.

**Implementação**:
- Base image: `node:18-alpine` (lightweight)
- Multi-stage build para reduzir tamanho final
- Usuário não-root para segurança
- Health check integrado
- Disponível no Docker Hub: `pbrnx/cp5-soa`

**Consequências**:
- ✅ Deploy simplificado e portável
- ✅ Ambiente consistente (dev/prod)
- ✅ Imagem otimizada (~400MB)
- ✅ Fácil escalabilidade
- ✅ Seed automático configurável

## 🐳 Docker

### Informações da Imagem

- **Docker Hub**: [pbrnx/cp5-soa](https://hub.docker.com/r/pbrnx/cp5-soa)
- **Tags disponíveis**: 
  - `latest` - Versão mais recente
  - `v1.0` - Versão estável 1.0
- **Tamanho**: ~400MB
- **Base**: Node.js 18 Alpine Linux

### Características Principais

- ✅ **Seed Automático**: Popula o banco automaticamente na primeira execução
- ✅ **Health Check**: Verifica se a aplicação está respondendo
- ✅ **Wait for Database**: Aguarda o banco estar pronto antes de iniciar
- ✅ **Usuário não-root**: Executa com usuário nodejs (1001)
- ✅ **Multi-stage build**: Imagem otimizada
- ✅ **Logs estruturados**: Com emojis para fácil visualização

### Variáveis de Ambiente

| Variável | Obrigatória | Padrão | Descrição |
|----------|-------------|--------|-----------|
| `DB_USER` | ✅ | - | Usuário do Oracle Database |
| `DB_PASSWORD` | ✅ | - | Senha do Oracle Database |
| `DB_URL` | ✅ | - | String de conexão (host:port/service) |
| `PORT` | ❌ | 3000 | Porta da aplicação |
| `NODE_ENV` | ❌ | production | Ambiente Node.js |
| `AUTO_SEED` | ❌ | false | Executar seed ao iniciar |

### Build Local

Para fazer build da imagem localmente:

```bash
# Build com múltiplas tags
docker build -t pbrnx/cp5-soa:v1.0 -t pbrnx/cp5-soa:latest .

# Verificar imagem criada
docker images | grep cp5-soa
```

### Push para Docker Hub

```bash
# Login no Docker Hub
docker login

# Push das tags
docker push pbrnx/cp5-soa:v1.0
docker push pbrnx/cp5-soa:latest
```

### Características da Imagem

- ✅ Multi-stage build para otimização
- ✅ Apenas dependências de produção
- ✅ Usuário não-root (nodejs:1001)
- ✅ Health check configurado (30s interval)
- ✅ Baseada em Alpine Linux (mínima)
- ✅ Entrypoint inteligente com:
  - Verificação de conexão com banco
  - Inicialização da aplicação
  - Seed automático opcional
  - Logs estruturados

### Processo de Inicialização

Quando o container é iniciado, o seguinte processo ocorre:

1. 🚀 **Start**: Container inicia
2. ⏳ **Wait for DB**: Aguarda conexão com Oracle estar disponível
3. 🌟 **Start App**: Inicia o servidor Node.js em background
4. ⏳ **Wait Ready**: Aguarda aplicação estar pronta (~10s)
5. 🌱 **Run Seed** (se `AUTO_SEED=true`): Popula banco de dados
6. ✅ **Ready**: Aplicação pronta para receber requisições

Você pode acompanhar todo esse processo nos logs:
```bash
docker logs -f hotel-reservations-api
```

## 🐛 Tratamento de Erros

A aplicação implementa tratamento robusto de erros com:

### Erros Customizados
- `NotFoundError` (404): Recurso não encontrado
- `ValidationError` (400): Dados inválidos
- `ConflictError` (409): Violação de regra de negócio
- `ForbiddenError` (403): Ação não permitida
- `UnprocessableEntityError` (422): Fora da política

### Payload Padronizado
```json
{
  "status": "error",
  "message": "Descrição clara do erro",
  "errors": [
    {
      "field": "campo",
      "message": "mensagem específica"
    }
  ],
  "timestamp": "2025-10-23T12:00:00.000Z"
}
```

## 🔧 Status Codes HTTP Utilizados

| Código | Uso |
|--------|-----|
| `200 OK` | Sucesso em GET, PUT, PATCH |
| `201 Created` | Recurso criado com sucesso |
| `204 No Content` | Sucesso sem corpo de resposta |
| `400 Bad Request` | Validação de dados falhou |
| `404 Not Found` | Recurso não encontrado |
| `409 Conflict` | Conflito de negócio (ex: quarto indisponível) |
| `422 Unprocessable Entity` | Fora de política (ex: check-in antecipado) |
| `500 Internal Server Error` | Erro inesperado do servidor |

## 👥 Autores

**Grupo CP5-SOA**
- Pedro Barone (@pebarone)
- [Adicione os outros membros do grupo aqui]

**Disciplina**: Arquitetura Orientada a Serviços (3ESPY)  
**Instituição**: FIAP  
**Professora**: Damiana Costa  
**Ano**: 2025

## 📄 Licença

Este projeto é um trabalho acadêmico desenvolvido para fins educacionais.

---

⭐ **Checkpoint 2 - Sistema de Reserva de Hotel** | FIAP 3ESPY 2025
