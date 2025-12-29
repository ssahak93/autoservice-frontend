# Code Quality & Development Workflow

Руководство по поддержанию качества кода и процессу разработки.

---

## 🛠 Tools Setup

### ESLint

Статический анализ кода для выявления ошибок и проблем.

### Prettier

Автоматическое форматирование кода для единообразия.

### Husky

Git hooks для автоматизации проверок перед коммитами.

### lint-staged

Запускает линтеры только для измененных файлов.

---

## 📋 Pre-commit Hook

Перед каждым коммитом автоматически:

1. ✅ Запускается ESLint для измененных `.ts`, `.tsx`, `.js`, `.jsx` файлов
2. ✅ Запускается Prettier для форматирования всех измененных файлов
3. ✅ Исправляются автоматически исправимые проблемы

**Если есть ошибки, коммит будет заблокирован.**

### Что проверяется:

- Синтаксические ошибки
- Неиспользуемые переменные
- Проблемы с типами TypeScript
- Нарушения правил React Hooks
- Порядок импортов
- Форматирование кода

---

## 🚀 Pre-push Hook

Перед каждым push автоматически:

1. ✅ Проверка типов TypeScript (`npm run type-check`)
2. ✅ Полная проверка ESLint (`npm run lint`)

**Если есть ошибки, push будет заблокирован.**

---

## 💻 Available Commands

### Linting

```bash
# Проверить код на ошибки
npm run lint

# Исправить автоматически исправимые ошибки
npm run lint:fix
```

### Formatting

```bash
# Форматировать весь код
npm run format

# Проверить форматирование (без изменений)
npm run format:check
```

### Type Checking

```bash
# Проверить типы TypeScript
npm run type-check
```

---

## 📝 ESLint Rules

### TypeScript Rules

- `@typescript-eslint/no-unused-vars` - Предупреждает о неиспользуемых переменных
- `@typescript-eslint/no-explicit-any` - Предупреждает об использовании `any`
- `@typescript-eslint/no-non-null-assertion` - Предупреждает об использовании `!`

### React Rules

- `react/react-in-jsx-scope` - Отключен (не нужен в Next.js)
- `react-hooks/rules-of-hooks` - Строгое соблюдение правил хуков
- `react-hooks/exhaustive-deps` - Проверка зависимостей useEffect

### Import Rules

- `import/order` - Автоматическая сортировка импортов
- Импорты группируются: builtin → external → internal → parent → sibling → index

### General Rules

- `no-console` - Предупреждает об использовании console (кроме warn/error)
- `prefer-const` - Предпочитает const вместо let
- `no-var` - Запрещает использование var

---

## 🎨 Prettier Configuration

### Settings

- **Semi**: `true` - Точка с запятой обязательна
- **Single Quote**: `true` - Одинарные кавычки
- **Print Width**: `100` - Максимальная длина строки
- **Tab Width**: `2` - Размер отступа
- **Trailing Comma**: `es5` - Запятая в конце (где возможно)
- **Arrow Parens**: `always` - Скобки вокруг параметров стрелочных функций

### Tailwind Plugin

Prettier автоматически сортирует классы Tailwind CSS в правильном порядке.

---

## 🔧 Manual Setup (if needed)

### Initialize Husky

**Важно:** Если git репозиторий находится в корне проекта (не в `frontend/`), см. [HUSKY_SETUP.md](./HUSKY_SETUP.md) для правильной настройки.

Если git репозиторий в `frontend/`:

```bash
npm run prepare
```

Это создаст `.husky` директорию и настроит git hooks.

### Make hooks executable (Linux/Mac)

```bash
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

---

## 📚 Best Practices

### 1. Commit Often, Push Carefully

- Делайте маленькие, логичные коммиты
- Pre-commit hook проверит код автоматически
- Pre-push hook проверит все перед отправкой

### 2. Fix Issues Immediately

Если pre-commit hook нашел ошибки:

```bash
# Автоматически исправить
npm run lint:fix
npm run format

# Затем повторите коммит
git add .
git commit -m "your message"
```

### 3. Type Safety

Всегда используйте TypeScript типы:

```tsx
// ✅ Good
interface Props {
  title: string;
  count: number;
}

// ❌ Bad
const Component = (props: any) => { ... }
```

### 4. Import Organization

Импорты автоматически сортируются:

```tsx
// Builtin
import { useState, useEffect } from 'react';

// External
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Internal
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

// Relative
import { ServiceCard } from './ServiceCard';
```

### 5. Component Structure

```tsx
// 1. Imports (sorted automatically)
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

// 2. Types
interface ComponentProps {
  title: string;
}

// 3. Component
export const Component = ({ title }: ComponentProps) => {
  // 4. Hooks
  const [state, setState] = useState();

  // 5. Handlers
  const handleClick = () => {
    // ...
  };

  // 6. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Click</Button>
    </div>
  );
};
```

---

## 🚫 Bypassing Hooks (Not Recommended)

Если **действительно необходимо** пропустить проверки:

```bash
# Пропустить pre-commit hook
git commit --no-verify -m "message"

# Пропустить pre-push hook
git push --no-verify
```

**⚠️ Используйте только в экстренных случаях!**

---

## 🔍 Troubleshooting

### Hook не запускается

```bash
# Переустановить Husky
npm run prepare

# Проверить права на файлы (Linux/Mac)
chmod +x .husky/*
```

### ESLint ошибки не исправляются

```bash
# Запустить вручную
npm run lint:fix
```

### Prettier конфликтует с ESLint

Убедитесь, что `eslint-config-prettier` установлен и добавлен в `.eslintrc.json`:

```json
{
  "extends": [..., "prettier"]
}
```

---

## 📖 Related Documentation

- [SOLID Principles](./SOLID_PRINCIPLES.md) - Принципы проектирования
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Husky Documentation](https://typicode.github.io/husky/)

---

**Помните: Качество кода - это инвестиция в будущее проекта!** 🎯
