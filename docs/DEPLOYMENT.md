# MixMyAI Deployment Guide

## Методы развертывания

MixMyAI поддерживает несколько способов развертывания:

1. **Docker Compose** (рекомендуется для development и testing)
2. **Kubernetes** (рекомендуется для production)
3. **Локальная разработка** (без Docker)

---

## 1. Docker Compose (Быстрый старт)

### Предварительные требования

- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 10GB свободного места на диске

### Шаги развертывания

1. **Клонируйте репозиторий:**

```bash
git clone https://github.com/luckyit-test/mixmyai.git
cd mixmyai
```

2. **Создайте .env файл:**

```bash
cp .env.example .env
```

3. **Отредактируйте .env файл с вашими API ключами:**

```bash
nano .env
```

Обязательно укажите:
```env
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
JWT_SECRET=your-secure-secret-key
```

4. **Запустите все сервисы:**

```bash
docker-compose up -d
```

5. **Проверьте статус сервисов:**

```bash
docker-compose ps
```

6. **Откройте приложение:**

```
Frontend: http://localhost:3000
API Docs: http://localhost:4000/api/docs
Orchestration: http://localhost:8000/docs
```

### Управление сервисами

```bash
# Остановить все сервисы
docker-compose down

# Просмотр логов
docker-compose logs -f

# Просмотр логов конкретного сервиса
docker-compose logs -f frontend

# Перезапуск сервиса
docker-compose restart api

# Пересборка после изменений
docker-compose up -d --build
```

---

## 2. Kubernetes (Production)

### Предварительные требования

- Kubernetes cluster 1.25+
- kubectl configured
- Helm 3+ (опционально)
- Persistent Volume provisioner
- LoadBalancer или Ingress controller

### Подготовка

1. **Создайте namespace:**

```bash
kubectl create namespace mixmyai
```

2. **Создайте Secrets:**

```bash
kubectl create secret generic mixmyai-secrets \
  --from-literal=openai-api-key='sk-your-key' \
  --from-literal=anthropic-api-key='sk-ant-your-key' \
  --from-literal=jwt-secret='your-secret' \
  --from-literal=database-url='postgresql://user:pass@postgres:5432/mixmyai' \
  -n mixmyai
```

3. **Создайте ConfigMap:**

```bash
kubectl create configmap mixmyai-config \
  --from-literal=api-port='4000' \
  --from-literal=orchestration-port='8000' \
  -n mixmyai
```

### Развертывание

1. **PostgreSQL:**

```yaml
# k8s/postgres.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: mixmyai
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: mixmyai
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: mixmyai-secrets
              key: db-user
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mixmyai-secrets
              key: db-password
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 10Gi
```

2. **Redis:**

```yaml
# k8s/redis.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: mixmyai
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
```

3. **Backend API:**

```yaml
# k8s/api.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: mixmyai
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: mixmyai/api:latest
        ports:
        - containerPort: 4000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: mixmyai-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: mixmyai-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

4. **Orchestration Service:**

```yaml
# k8s/orchestration.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orchestration
  namespace: mixmyai
spec:
  replicas: 2
  selector:
    matchLabels:
      app: orchestration
  template:
    metadata:
      labels:
        app: orchestration
    spec:
      containers:
      - name: orchestration
        image: mixmyai/orchestration:latest
        ports:
        - containerPort: 8000
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: mixmyai-secrets
              key: openai-api-key
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: mixmyai-secrets
              key: anthropic-api-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

5. **Frontend:**

```yaml
# k8s/frontend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: mixmyai
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: mixmyai/frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "https://api.mixmyai.com"
        - name: NEXT_PUBLIC_WS_URL
          value: "wss://api.mixmyai.com"
```

6. **Services:**

```yaml
# k8s/services.yaml
apiVersion: v1
kind: Service
metadata:
  name: api
  namespace: mixmyai
spec:
  selector:
    app: api
  ports:
  - port: 4000
    targetPort: 4000
  type: LoadBalancer
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: mixmyai
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

7. **Ingress (NGINX):**

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mixmyai-ingress
  namespace: mixmyai
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - mixmyai.com
    - api.mixmyai.com
    secretName: mixmyai-tls
  rules:
  - host: mixmyai.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
  - host: api.mixmyai.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 4000
```

### Применение конфигураций

```bash
kubectl apply -f k8s/
```

### Мониторинг

```bash
# Проверка статуса pods
kubectl get pods -n mixmyai

# Логи
kubectl logs -f deployment/api -n mixmyai

# Автоскейлинг
kubectl autoscale deployment api --cpu-percent=70 --min=2 --max=10 -n mixmyai
```

---

## 3. Локальная разработка

### Предварительные требования

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+

### Frontend

```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

### Backend API

```bash
cd backend/api
npm install
npm run start:dev
# http://localhost:4000
```

### Orchestration Service

```bash
cd backend/orchestration
pip install -r requirements.txt
uvicorn app.main:app --reload
# http://localhost:8000
```

---

## Переменные окружения

### Обязательные

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
JWT_SECRET=...
DATABASE_URL=postgresql://...
```

### Опциональные

```env
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:3000
NODE_ENV=production
PYTHON_ENV=production
```

---

## Производительность и масштабирование

### Рекомендации для Production

1. **API Service**: 3-5 реплик минимум
2. **Orchestration**: 2-3 реплики
3. **Frontend**: 2+ реплики
4. **PostgreSQL**: Master-Replica setup
5. **Redis**: Redis Cluster для высокой доступности

### Ресурсы

| Сервис | CPU (min) | CPU (max) | RAM (min) | RAM (max) |
|--------|-----------|-----------|-----------|-----------|
| Frontend | 250m | 500m | 256Mi | 512Mi |
| API | 250m | 1000m | 256Mi | 1Gi |
| Orchestration | 500m | 2000m | 512Mi | 2Gi |
| PostgreSQL | 500m | 2000m | 1Gi | 4Gi |
| Redis | 250m | 500m | 256Mi | 512Mi |

---

## Troubleshooting

### Проблема: API не может подключиться к Orchestration

**Решение:**
```bash
# Проверьте сеть
docker-compose exec api ping orchestration

# Проверьте переменные окружения
docker-compose exec api env | grep ORCHESTRATION
```

### Проблема: Frontend не загружается

**Решение:**
```bash
# Проверьте логи
docker-compose logs frontend

# Пересоберите
docker-compose up -d --build frontend
```

### Проблема: AI запросы падают с ошибкой

**Решение:**
- Проверьте API ключи в .env
- Убедитесь что есть кредиты на OpenAI/Anthropic
- Проверьте rate limits

---

## Безопасность

### Production Checklist

- [ ] Смените JWT_SECRET на случайный ключ
- [ ] Используйте HTTPS/TLS везде
- [ ] Настройте CORS правильно
- [ ] Включите rate limiting
- [ ] Используйте secrets management (Vault, AWS Secrets Manager)
- [ ] Регулярно обновляйте зависимости
- [ ] Настройте мониторинг и алерты
- [ ] Backup базы данных ежедневно

---

## Мониторинг

### Prometheus + Grafana

```yaml
# k8s/monitoring/prometheus.yaml
# k8s/monitoring/grafana.yaml
```

### Метрики

- Количество активных задач
- Время выполнения задач
- API request rate
- AI API usage
- Error rate
- WebSocket connections

---

## CI/CD

### GitHub Actions пример

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker images
        run: |
          docker build -t mixmyai/frontend:latest ./frontend
          docker build -t mixmyai/api:latest ./backend/api
          docker build -t mixmyai/orchestration:latest ./backend/orchestration

      - name: Push to registry
        run: |
          docker push mixmyai/frontend:latest
          docker push mixmyai/api:latest
          docker push mixmyai/orchestration:latest

      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/frontend frontend=mixmyai/frontend:latest -n mixmyai
          kubectl set image deployment/api api=mixmyai/api:latest -n mixmyai
          kubectl set image deployment/orchestration orchestration=mixmyai/orchestration:latest -n mixmyai
```

---

## Support

Вопросы? Проблемы?
- 📧 Email: support@mixmyai.com
- 💬 Discord: https://discord.gg/mixmyai
- 🐛 Issues: https://github.com/luckyit-test/mixmyai/issues
