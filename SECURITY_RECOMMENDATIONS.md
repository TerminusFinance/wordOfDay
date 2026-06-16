# 🔒 Рекомендации по безопасности - Word of Day

## 🚨 КРИТИЧЕСКИЕ УЯЗВИМОСТИ (требуют немедленного устранения)

### 1. Утечка конфиденциальных данных

**Проблема:** Конфиденциальные данные хранятся в открытом виде в коммитах Git

**Скомпрометированные данные:**
```
Telegram Bot Token: 7725833312:AAFaEJjDql5TfYS9GQlFArSY6x-WvPNFtZM
OpenAI API Key: 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
Database: user=root, password=unoDosPs, database=wordOfDay
```

**Немедленные действия:**
1. ⚠️ **Отключить скомпрометированный Telegram бот** в @BotFather
2. ⚠️ **Отозвать OpenAI API ключ** в панели OpenAI
3. ⚠️ **Сменить пароли базы данных**
4. ⚠️ **Очистить Git историю** или сделать репозиторий приватным

### 2. Хардкод секретов в коде

**Файлы с проблемами:**
- `backEnd/param.env` - все конфиденциальные данные
- `backEnd/src/service/PhraseService.ts:18` - OpenAI API ключ

**Решение:**
```typescript
// ❌ НЕПРАВИЛЬНО
const openai = new OpenAI({
    apiKey: "sk-svcacct-7nqMLi9FyfRyY5ytqdYIlM5PhyoYRa3l3fJzJNbEr2cqueSKHWb7YDPj9rFr9Dx4rshQerT3BlbkFJKzfiuBK17HuJNbmpgWT1zvuMtVu20Ev_AKi9tjhamSs-kfqhCODtZ6TNhmrmS5Zt3yA2QA"
});

// ✅ ПРАВИЛЬНО
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
```

## 🔧 План устранения уязвимостей

### Шаг 1: Немедленная защита

```bash
# 1. Переименовать файл с секретами
mv backEnd/param.env backEnd/.env

# 2. Добавить в .gitignore
echo "*.env" >> .gitignore
echo ".env*" >> .gitignore

# 3. Удалить из репозитория
git rm --cached backEnd/param.env
git commit -m "Remove exposed secrets"
```

### Шаг 2: Переменные окружения

Создать файл `backEnd/.env.example`:
```env
# Telegram Bot Configuration
MY_SECRET_TOKEN=your_telegram_bot_token_here

# Database Configuration
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_HOST=localhost

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Application Configuration
NODE_ENV=development
PORT=3000
```

### Шаг 3: Обновить код

**Файл:** `backEnd/confit.ts`
```typescript
import * as dotenv from 'dotenv';
import path from 'path';

// Загружаем переменные окружения
dotenv.config({ path: path.resolve(__dirname, './.env') });

// Валидация обязательных переменных
const requiredEnvVars = [
    'MY_SECRET_TOKEN',
    'DB_USER', 
    'DB_PASSWORD',
    'DB_NAME',
    'OPENAI_API_KEY'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Required environment variable ${envVar} is not set`);
    }
}

export const botToken = process.env.MY_SECRET_TOKEN!;
export const userForDB = process.env.DB_USER!;
export const passwordForDB = process.env.DB_PASSWORD!;
export const databaseName = process.env.DB_NAME!;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
```

## 🛡️ Дополнительные меры безопасности

### 1. Аутентификация Telegram

```typescript
import { validate } from '@telegram-apps/init-data-node';

export function validateTelegramAuth(initData: string): boolean {
    try {
        validate(initData, process.env.MY_SECRET_TOKEN!);
        return true;
    } catch (error) {
        console.error('Invalid Telegram auth:', error);
        return false;
    }
}
```

### 2. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // максимум 100 запросов на IP
    message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### 3. Валидация входных данных

```typescript
import { body, validationResult } from 'express-validator';

export const validateUser = [
    body('userId').isLength({ min: 1 }).escape(),
    body('userName').optional().isLength({ max: 255 }).escape(),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
```

### 4. Логирование безопасности

```typescript
import winston from 'winston';

const securityLogger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'security.log' })
    ]
});

// Логирование подозрительной активности
export function logSecurityEvent(event: string, details: any) {
    securityLogger.warn('Security Event', {
        event,
        details,
        timestamp: new Date().toISOString(),
        ip: details.ip
    });
}
```

### 5. Безопасность базы данных

```typescript
// Использование подготовленных запросов
async function getUserSafely(userId: string) {
    const [rows] = await db.execute(
        'SELECT * FROM users WHERE userId = ?',
        [userId]
    );
    return rows;
}

// Шифрование чувствительных данных
import crypto from 'crypto';

function encryptSensitiveData(data: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY!);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}
```

## 📋 Чек-лист безопасности

### Немедленные действия (24 часа)
- [ ] Отключить/сменить все скомпрометированные API ключи
- [ ] Переместить секреты в переменные окружения
- [ ] Удалить секреты из Git истории
- [ ] Сделать репозиторий приватным

### Краткосрочные (1 неделя)
- [ ] Внедрить валидацию Telegram auth
- [ ] Добавить rate limiting
- [ ] Настроить логирование безопасности
- [ ] Обновить уязвимые зависимости

### Среднесрочные (1 месяц)
- [ ] Провести penetration testing
- [ ] Настроить мониторинг безопасности
- [ ] Внедрить WAF (Web Application Firewall)
- [ ] Обучить команду по безопасности

### Долгосрочные (3 месяца)
- [ ] Получить сертификацию безопасности
- [ ] Внедрить zero-trust архитектуру
- [ ] Настроить автоматический security scanning
- [ ] Разработать incident response план

## 🚨 Контакты для экстренных ситуаций

**В случае подозрения на компрометацию:**
1. Немедленно отключить все API ключи
2. Заблокировать подозрительных пользователей
3. Сохранить логи для анализа
4. Уведомить пользователей о потенциальном инциденте

**Уведомления:**
- Telegram: @security_alerts_bot
- Email: security@terminusfinance.com
- Phone: +7 (XXX) XXX-XX-XX

---
*Документ подготовлен службой информационной безопасности*  
*Классификация: КОНФИДЕНЦИАЛЬНО*  
*Последнее обновление: $(date)*