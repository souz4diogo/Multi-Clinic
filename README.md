# MultiClinic

Sistema de gestão clínica full stack com autenticação JWT, controle de acesso por papéis (RBAC) e dashboard analítico em tempo real. Desenvolvido com ASP.NET Core (.NET 10) no back-end e React no front-end, containerizado com Docker Compose.

---

## Stack

**Back-end**
- ASP.NET Core 10 — REST API com 9 controllers
- Entity Framework Core 10 + SQL Server 2022
- JWT Bearer Authentication + RBAC (3 perfis)
- Swagger / OpenAPI

**Front-end**
- React 18 + Vite
- React Router v6 com rotas protegidas por perfil
- Tailwind CSS + shadcn/ui
- Lucide React

**Infra**
- Docker Compose — 3 containers (SQL Server, API, Nginx)
- Migrations automáticas na inicialização
- Healthcheck no banco antes de subir a API

---

## Funcionalidades

| Módulo | O que faz |
|---|---|
| **Auth** | Registro, login com JWT, hash de senha com `IPasswordHasher` |
| **Agendamentos** | CRUD com validação de data futura e status (Agendado / Concluído / Cancelado) |
| **Prontuários** | Evolução clínica e prescrição vinculadas ao agendamento |
| **Avaliações** | Paciente avalia consulta concluída com nota e comentário |
| **Relatório** | KPIs em tempo real: taxa de cancelamento, assiduidade, médico destaque, especialidade mais procurada |
| **Dashboard** | Indicadores visuais com barras de progresso e destaques por perfil |

---

## Controle de Acesso (RBAC)

Três perfis com permissões distintas aplicadas tanto na API quanto na UI:

| Perfil | Permissões |
|---|---|
| `MedicoAdmin` | Acesso total — gerencia médicos, pacientes, especialidades e vê relatórios |
| `Medico` | Vê e atualiza apenas seus próprios agendamentos e prontuários |
| `Paciente` | Agenda consultas, acessa seus prontuários e avalia atendimentos |

Cada endpoint valida o `ClaimTypes.Role` do JWT e retorna `403 Forbidden` quando o acesso não é autorizado. O front-end filtra os módulos do dashboard conforme o perfil logado.

---

## Arquitetura

```
┌─────────────────────────────────────────────────┐
│                  Docker Compose                  │
│                                                  │
│  ┌──────────┐    ┌──────────────┐    ┌────────┐  │
│  │  Nginx   │───▶│ ASP.NET Core │───▶│  SQL   │  │
│  │ :80      │    │ API :8080    │    │ Server │  │
│  │ (React)  │    │              │    │ :1433  │  │
│  └──────────┘    └──────────────┘    └────────┘  │
│                                                  │
│  healthcheck garante que a API só sobe           │
│  após o SQL Server estar pronto                  │
└─────────────────────────────────────────────────┘
```

---

## Como rodar

**Pré-requisito:** Docker Desktop instalado.

```bash
git clone https://github.com/souz4diogo/Multi-Clinic.git
cd Multi-Clinic
docker compose up --build
```

| Serviço | URL |
|---|---|
| Front-end | http://localhost |
| API | http://localhost:5081 |
| Swagger | http://localhost:5081/swagger |

Credenciais padrão criadas automaticamente no seed:

```
Email: admin@admin.com
Senha: admin1234
Perfil: MedicoAdmin
```

---

## Endpoints da API

```
POST   /api/auth/login
POST   /api/auth/register

GET    /api/agendamento
POST   /api/agendamento
GET    /api/agendamento/{id}
PUT    /api/agendamento/{id}/status

GET    /api/prontuario
POST   /api/prontuario
PUT    /api/prontuario/{id}

GET    /api/paciente
POST   /api/paciente
PUT    /api/paciente/{id}

GET    /api/medico
POST   /api/medico

GET    /api/especialidade
POST   /api/especialidade

POST   /api/avaliacao

GET    /api/relatorio          [MedicoAdmin only]
```

---

## Estrutura do projeto

```
Multi-Clinic/
├── multiclinic-api/           # ASP.NET Core
│   ├── Controllers/           # 9 controllers REST
│   ├── Models/                # Entidades EF Core
│   ├── DTOs/                  # Request/Response separados dos modelos
│   ├── Services/              # TokenService (JWT)
│   ├── Data/                  # AppDbContext + Migrations
│   └── Dockerfile
│
├── multiclinic-web/           # React + Vite
│   └── src/
│       ├── pages/             # Dashboard, Agendamentos, Pacientes...
│       ├── components/        # Navbar, PrivateRoute
│       ├── context/           # AuthContext (JWT decode + proteção de rotas)
│       └── services/          # Axios com interceptor de token
│
└── docker-compose.yml
```

---

## Decisões técnicas

- **DTOs separados dos modelos** — evita over-posting e expõe apenas o contrato da API
- **Migrations na inicialização** — `db.Database.Migrate()` no startup garante ambiente limpo em qualquer máquina
- **Seed no startup** — admin padrão criado apenas se não existir, sem necessidade de scripts manuais
- **Healthcheck no compose** — a API depende de `service_healthy` do banco, evitando falha na connection string ao subir
- **PrivateRoute no React** — redireciona para login se o token JWT expirou ou não existe, sem acesso direto por URL
