# Contributing to MixMyAI

Спасибо за ваш интерес к MixMyAI! 🚀

## Как внести вклад

### Нашли баг?

1. Проверьте, не был ли уже создан [issue](https://github.com/luckyit-test/mixmyai/issues)
2. Если нет, создайте новый issue с:
   - Понятным названием
   - Подробным описанием
   - Шагами для воспроизведения
   - Ожидаемым и фактическим поведением
   - Версией MixMyAI
   - Логами (если применимо)

### Предлагаете новую функцию?

1. Создайте issue с тегом "enhancement"
2. Опишите:
   - Проблему, которую решает функция
   - Предлагаемое решение
   - Альтернативы, которые вы рассматривали

### Хотите написать код?

1. Fork репозиторий
2. Создайте ветку (`git checkout -b feature/amazing-feature`)
3. Внесите изменения
4. Напишите/обновите тесты
5. Убедитесь, что все тесты проходят
6. Commit изменения (`git commit -m 'Add amazing feature'`)
7. Push в ветку (`git push origin feature/amazing-feature`)
8. Создайте Pull Request

## Стандарты кода

### TypeScript/JavaScript

- Используйте TypeScript где возможно
- Следуйте ESLint конфигурации
- Именуйте переменные и функции понятно
- Комментируйте сложную логику

### Python

- Следуйте PEP 8
- Используйте type hints
- Docstrings для всех функций
- Максимальная длина строки: 100 символов

### Commit Messages

Используйте conventional commits:

```
feat: добавлена новая функция
fix: исправлен баг в координаторе
docs: обновлена документация API
style: форматирование кода
refactor: рефакторинг агентов
test: добавлены тесты
chore: обновлены зависимости
```

### Pull Request Process

1. Обновите README.md с деталями изменений
2. Обновите документацию API при необходимости
3. Убедитесь что CI/CD проходит
4. Запросите review у maintainers
5. После одобрения PR будет смержен

## Структура проекта

```
mixmyai/
├── frontend/          # Next.js приложение
├── backend/
│   ├── api/          # NestJS API
│   └── orchestration/# Python FastAPI
├── database/         # Схемы БД
└── docs/            # Документация
```

## Локальная разработка

### Требования

- Node.js 18+
- Python 3.11+
- Docker и Docker Compose
- PostgreSQL 15+
- Redis 7+

### Быстрый старт

```bash
# Клонировать
git clone https://github.com/luckyit-test/mixmyai.git
cd mixmyai

# Установить зависимости
cd frontend && npm install
cd ../backend/api && npm install
cd ../orchestration && pip install -r requirements.txt

# Запустить через Docker
docker-compose up
```

## Тестирование

```bash
# Frontend
cd frontend
npm test

# Backend API
cd backend/api
npm test

# Orchestration
cd backend/orchestration
pytest
```

## Вопросы?

- 📧 Email: dev@mixmyai.com
- 💬 Discord: https://discord.gg/mixmyai
- 📚 Docs: https://docs.mixmyai.com

## Лицензия

Внося вклад, вы соглашаетесь что ваш код будет лицензирован под MIT License.
