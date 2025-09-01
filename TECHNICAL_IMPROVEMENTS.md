# 🔧 План технических улучшений - Word of Day

## 📊 Анализ технического долга

### 🚨 Критические проблемы

#### 1. Frontend - Ошибка сборки
**Проблема:** `Cannot find module @rollup/rollup-linux-x64-gnu`
```bash
Error: Cannot find module @rollup/rollup-linux-x64-gnu. 
npm has a bug related to optional dependencies
```

**Решение:**
```bash
# Очистка и переустановка зависимостей
cd front/
rm -rf node_modules package-lock.json
npm install
# Или принудительная переустановка
npm install --force
```

#### 2. TypeScript игнорирование
**Проблема:** Множественные `// @ts-ignore` в backend коде

**Примеры:**
```typescript
// @ts-ignore
import express from 'express';
// @ts-ignore
import cors from 'cors';
```

**Решение:**
```typescript
// Правильные импорты с типами
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
```

### ⚠️ Проблемы качества кода

#### Frontend ESLint предупреждения (8 шт.)

1. **React Hook dependencies** (5 предупреждений)
```typescript
// ❌ Проблемный код
useEffect(() => {
    fetchData();
}, []); // Missing dependencies

// ✅ Исправленный код
useEffect(() => {
    fetchData();
}, [fetchData, userId, language]); // All dependencies included
```

2. **Fast Refresh violations** (2 предупреждения)
```typescript
// ❌ Проблемный код - экспорт констант из компонента
export const DataProvider = () => { ... }
export const defaultValue = {...}

// ✅ Исправленный код - разделение на файлы
// constants.ts
export const defaultValue = {...}

// DataProvider.tsx  
export const DataProvider = () => { ... }
```

## 🔄 План модернизации

### Phase 1: Исправление критических ошибок (1-2 дня)

#### Frontend
```bash
# 1. Исправление ошибки сборки
cd front/
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# 2. Обновление зависимостей
npm update
npm audit fix
```

#### Backend
```typescript
// 3. Удаление @ts-ignore
// Файл: src/index.ts
import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

// 4. Типизация функций
interface UserData {
    userId: string;
    userName?: string;
    coins: number;
}

async function createUser(userData: UserData): Promise<boolean> {
    // Реализация с типами
}
```

### Phase 2: Обновление зависимостей (3-5 дней)

#### Критические уязвимости

**Frontend:**
```json
{
  "dependencies": {
    "axios": "^1.7.7",    // Было: уязвимая версия
    "ton": "^14.0.0",     // Было: ^13.9.0
    "pbkdf2": "^3.1.3",   // Было: <=3.1.2
    "sha.js": "^2.4.12"   // Было: <=2.4.11
  }
}
```

**Backend:**
```json
{
  "dependencies": {
    "express": "^4.21.2",      // Было: ^4.19.2
    "axios": "^1.7.7",         // Было: ^1.7.2  
    "form-data": "^4.0.4",     // Было: <4.0.4
    "tar-fs": "^2.1.3",       // Было: 2.0.0-2.1.2
    "tough-cookie": "^4.1.3"   // Было: <4.1.3
  }
}
```

### Phase 3: Улучшение архитектуры (1-2 недели)

#### 1. Структура проекта

```
wordOfDay/
├── shared/                 # Общие типы и утилиты
│   ├── types/
│   └── constants/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Контроллеры API
│   │   ├── services/       # Бизнес-логика
│   │   ├── models/         # Модели данных
│   │   ├── middleware/     # Промежуточное ПО
│   │   ├── routes/         # Маршруты
│   │   └── utils/          # Утилиты
│   ├── tests/              # Тесты
│   └── docs/               # Документация API
├── frontend/
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── hooks/          # Пользовательские хуки
│   │   ├── services/       # API сервисы
│   │   ├── store/          # Состояние приложения
│   │   ├── types/          # TypeScript типы
│   │   └── utils/          # Утилиты
│   └── tests/              # Тесты
└── docs/                   # Общая документация
```

#### 2. Error Handling

```typescript
// Централизованная обработка ошибок
class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

// Middleware для обработки ошибок
export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { statusCode = 500, message } = err;
    
    logger.error({
        statusCode,
        message,
        stack: err.stack,
        url: req.url,
        method: req.method,
    });

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal Server Error' 
            : message,
    });
};
```

#### 3. Database Optimization

```typescript
// Connection pooling
import { createPool, Pool } from 'mysql2/promise';

export class DatabaseService {
    private pool: Pool;

    constructor() {
        this.pool = createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            acquireTimeout: 60000,
            timeout: 60000,
        });
    }

    async execute(query: string, params?: any[]) {
        try {
            const [results] = await this.pool.execute(query, params);
            return results;
        } catch (error) {
            logger.error('Database query error:', { query, params, error });
            throw new AppError('Database operation failed', 500);
        }
    }
}
```

### Phase 4: Тестирование и CI/CD (2-3 недели)

#### 1. Unit Tests

```typescript
// Frontend тесты (Jest + React Testing Library)
import { render, screen, fireEvent } from '@testing-library/react';
import { PredictionsScreen } from './PredictionsScreen';

describe('PredictionsScreen', () => {
    test('renders daily phrase', async () => {
        render(<PredictionsScreen />);
        
        const phrase = await screen.findByTestId('daily-phrase');
        expect(phrase).toBeInTheDocument();
    });
});

// Backend тесты (Jest + Supertest)
import request from 'supertest';
import app from '../app';

describe('User API', () => {
    test('GET /api/users/:id returns user data', async () => {
        const response = await request(app)
            .get('/api/users/123')
            .expect(200);
            
        expect(response.body).toHaveProperty('userId', '123');
    });
});
```

#### 2. GitHub Actions CI/CD

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        cd frontend && npm ci
        cd ../backend && npm ci
    
    - name: Run tests
      run: |
        cd frontend && npm test
        cd ../backend && npm test
    
    - name: Run security audit
      run: |
        cd frontend && npm audit
        cd ../backend && npm audit
    
    - name: Build projects
      run: |
        cd frontend && npm run build
        cd ../backend && npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to production
      run: echo "Deploy to production server"
```

### Phase 5: Мониторинг и оптимизация (постоянно)

#### 1. Performance Monitoring

```typescript
// APM интеграция
import { init as initSentry } from '@sentry/node';

initSentry({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app }),
    ],
    tracesSampleRate: 1.0,
});
```

#### 2. Health Checks

```typescript
app.get('/health', async (req, res) => {
    const healthcheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now(),
        checks: {
            database: await checkDatabase(),
            redis: await checkRedis(),
            external_apis: await checkExternalAPIs()
        }
    };
    
    const hasErrors = Object.values(healthcheck.checks)
        .some(check => check.status !== 'OK');
    
    res.status(hasErrors ? 503 : 200).json(healthcheck);
});
```

## 📅 Временная шкала

| Фаза | Продолжительность | Приоритет | Описание |
|------|-------------------|-----------|----------|
| Phase 1 | 1-2 дня | 🔴 Критический | Исправление блокирующих ошибок |
| Phase 2 | 3-5 дней | 🟠 Высокий | Обновление зависимостей |
| Phase 3 | 1-2 недели | 🟡 Средний | Рефакторинг архитектуры |
| Phase 4 | 2-3 недели | 🟡 Средний | Тестирование и CI/CD |
| Phase 5 | Постоянно | 🟢 Низкий | Мониторинг и оптимизация |

## 📋 Чек-лист задач

### Немедленные (сегодня)
- [ ] Исправить ошибку сборки Rollup
- [ ] Удалить все `// @ts-ignore`
- [ ] Исправить ESLint предупреждения

### На этой неделе
- [ ] Обновить все критические зависимости
- [ ] Добавить типы для всех API endpoints
- [ ] Настроить error handling
- [ ] Добавить input validation

### В этом месяце
- [ ] Написать unit тесты (coverage > 80%)
- [ ] Настроить CI/CD pipeline
- [ ] Добавить performance monitoring
- [ ] Провести code review

### В следующем квартале
- [ ] Микросервисная архитектура
- [ ] Kubernetes deployment
- [ ] Advanced monitoring & alerting
- [ ] Load testing & optimization

---
*Документ подготовлен техническим архитектором*  
*Версия: 1.0*  
*Дата последнего обновления: $(date)*