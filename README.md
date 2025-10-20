# MixMyAI - Multi-Agent AI Platform

🤖 Современная B2C платформа для совместной работы AI-агентов над решением сложных задач

## 📋 Описание

MixMyAI - это инновационная платформа, где специализированные AI-агенты работают вместе для решения поставленных пользователем задач. Система использует интеллектуальную оркестрацию агентов для декомпозиции задач, параллельного выполнения и синтеза решений.

## 🏗️ Архитектура

### Роли агентов:

- **👔 Менеджер** - анализирует задачу, подбирает специалистов, создает подзадачи, проверяет результаты
- **👨‍💻 Специалисты** - решают назначенные подзадачи (разработчики, аналитики, исследователи)
- **🔗 Координатор** - собирает все принятые решения от агентов
- **📊 Аналитик** - синтезирует итоговый ответ на основе собранных данных

### Workflow:

1. **Пользователь** ставит задачу
2. **Менеджер** анализирует задачу и подбирает специалистов
3. **Менеджер** создает подзадачи для каждого специалиста
4. **Специалисты** работают параллельно над подзадачами
5. **Менеджер** принимает решения специалистов
6. **Координатор** собирает все принятые решения
7. **Аналитик** формирует итоговый ответ
8. **Менеджер** проверяет итоговый ответ
9. **Пользователь** получает результат и может запросить доработку

## 🛠️ Технологический стек

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+
- **UI Library**: Shadcn/ui (Radix UI + Tailwind CSS)
- **State Management**: Zustand + React Query (TanStack Query)
- **Real-time**: Socket.io Client
- **Animations**: Framer Motion
- **Charts**: Recharts

### Backend

#### API Service (Node.js)
- **Framework**: NestJS
- **Language**: TypeScript
- **WebSocket**: Socket.io
- **Validation**: class-validator

#### Orchestration Service (Python)
- **Framework**: FastAPI
- **Async**: asyncio
- **AI Integration**: OpenAI SDK, Anthropic SDK
- **Task Queue**: Celery + Redis

### Database & Cache
- **Primary Database**: PostgreSQL 15+
- **Cache & Queue**: Redis 7+
- **ORM**: Prisma (Node.js), SQLAlchemy (Python)

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (production)
- **API Gateway**: NGINX
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack / CloudWatch

## 📁 Структура проекта

```
mixmyai/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities and helpers
│   ├── hooks/               # Custom React hooks
│   └── styles/              # Global styles
│
├── backend/
│   ├── api/                 # NestJS API service
│   │   ├── src/
│   │   │   ├── tasks/       # Task management
│   │   │   ├── websocket/   # Real-time updates
│   │   │   └── auth/        # Authentication
│   │   └── package.json
│   │
│   ├── orchestration/       # Python FastAPI orchestration
│   │   ├── app/
│   │   │   ├── agents/      # Agent implementations
│   │   │   ├── workflows/   # Workflow logic
│   │   │   └── ai/          # AI integrations
│   │   └── requirements.txt
│   │
│   └── shared/              # Shared types and utilities
│
├── database/                # Database schemas and migrations
│   ├── migrations/
│   └── seeds/
│
├── docs/                    # Documentation
│   ├── DESIGN_DOCUMENT.md
│   ├── ARCHITECTURE.md
│   └── API.md
│
├── scripts/                 # Utility scripts
│   └── setup.sh
│
├── docker-compose.yml       # Development environment
└── README.md

```

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- Python 3.11+
- Docker и Docker Compose
- PostgreSQL 15+ (или через Docker)
- Redis 7+ (или через Docker)

### Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/luckyit-test/mixmyai.git
cd mixmyai
```

2. Установите зависимости:
```bash
# Frontend
cd frontend
npm install

# Backend API
cd ../backend/api
npm install

# Backend Orchestration
cd ../orchestration
pip install -r requirements.txt
```

3. Настройте переменные окружения:
```bash
cp .env.example .env
# Отредактируйте .env с вашими API ключами
```

4. Запустите через Docker Compose:
```bash
docker-compose up -d
```

5. Откройте браузер:
```
http://localhost:3000
```

## 🔑 Переменные окружения

```env
# AI API Keys
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mixmyai
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

## 📊 Основные возможности

✅ **Интеллектуальная декомпозиция задач** - AI-менеджер анализирует задачу и подбирает нужных специалистов

✅ **Параллельное выполнение** - Специалисты работают одновременно для ускорения решения

✅ **Real-time обновления** - WebSocket соединение для мгновенных обновлений прогресса

✅ **Визуализация процесса** - Красивый интерфейс для отслеживания работы агентов

✅ **Итеративная доработка** - Возможность отправить результат на доработку с новым контекстом

✅ **Качественный синтез** - Аналитик формирует комплексный ответ из всех решений

## 🎨 Дизайн

Платформа использует современный B2C дизайн с:
- Чистым и интуитивным интерфейсом
- Плавными анимациями и переходами
- Адаптивной версткой для всех устройств
- Темной и светлой темами
- Визуализацией работы агентов
- Прогресс-индикаторами в реальном времени

## 📚 Документация

- [Дизайн документ](./docs/DESIGN_DOCUMENT.md) - UX/UI спецификация
- [Архитектура](./docs/ARCHITECTURE.md) - Техническая архитектура
- [API документация](./docs/API.md) - API endpoints и WebSocket протокол

## 🧪 Тестирование

```bash
# Frontend tests
cd frontend
npm run test

# Backend API tests
cd backend/api
npm run test

# Backend Orchestration tests
cd backend/orchestration
pytest
```

## 🚢 Деплой

Детальные инструкции по деплою доступны в [DEPLOYMENT.md](./docs/DEPLOYMENT.md)

### Production с Kubernetes:
```bash
kubectl apply -f k8s/
```

## 🤝 Вклад в проект

Мы приветствуем вклад в развитие проекта! См. [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 Лицензия

MIT License - см. [LICENSE](./LICENSE)

## 👥 Команда

Разработано с ❤️ командой MixMyAI

## 🔗 Ссылки

- 🌐 [Website](https://mixmyai.com)
- 📧 [Email](mailto:support@mixmyai.com)
- 💬 [Discord](https://discord.gg/mixmyai)
- 🐦 [Twitter](https://twitter.com/mixmyai)

---

**Статус**: 🚀 В разработке | **Версия**: 1.0.0-alpha
