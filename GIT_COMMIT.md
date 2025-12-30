# Git Commit & Push Guide

Инструкция по коммиту и push изменений фронтенда.

---

## ✅ Pre-Commit Checklist

Перед коммитом убедитесь, что:

- [x] Код проходит линтинг: `npm run lint`
- [x] Типы проверены: `npm run type-check`
- [x] Код отформатирован: `npm run format`
- [x] Нет ошибок компиляции

---

## 🚀 Commit Steps

### 1. Проверьте статус

```bash
cd "C:\projects\AUTO SERVICE CONNECT"
git status
```

### 2. Добавьте файлы

```bash
# Добавить все изменения
git add .

# Или выборочно
git add frontend/
```

### 3. Создайте коммит

```bash
git commit -m "feat(frontend): initial setup with Next.js, i18n, and code quality tools

- Setup Next.js 14 with TypeScript and Tailwind CSS
- Configure internationalization (i18n) with next-intl (en, ru, hy)
- Add ESLint, Prettier, and Husky for code quality
- Create design tokens and component structure
- Setup API client with axios and interceptors
- Add Zustand stores for state management
- Create SOLID principles documentation
- Configure pre-commit and pre-push hooks"
```

### 4. Push в репозиторий

```bash
# Если это первый push
git remote add origin <your-repository-url>
git branch -M main
git push -u origin main

# Для последующих push
git push
```

---

## 📝 Commit Message Format

Используйте conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types:

- `feat`: Новая функциональность
- `fix`: Исправление бага
- `docs`: Изменения в документации
- `style`: Форматирование кода
- `refactor`: Рефакторинг
- `test`: Тесты
- `chore`: Обновление зависимостей, конфигурации

### Examples:

```bash
# Feature
git commit -m "feat(frontend): add authentication pages"

# Fix
git commit -m "fix(frontend): resolve TypeScript errors in API client"

# Docs
git commit -m "docs(frontend): update setup instructions"

# Style
git commit -m "style(frontend): format code with Prettier"
```

---

## 🔍 Что будет проверено автоматически

### Pre-commit Hook:

- ✅ ESLint проверка измененных файлов
- ✅ Prettier форматирование
- ✅ Автоматическое исправление ошибок

### Pre-push Hook:

- ✅ TypeScript type checking
- ✅ Полная проверка ESLint

Если есть ошибки, коммит/push будет заблокирован.

---

## 🚫 Bypass Hooks (Не рекомендуется)

Только в экстренных случаях:

```bash
# Пропустить pre-commit
git commit --no-verify -m "message"

# Пропустить pre-push
git push --no-verify
```

---

## 📦 Что включено в коммит

### Структура проекта:

- ✅ Next.js 14 конфигурация
- ✅ TypeScript настройки
- ✅ Tailwind CSS с дизайн-токенами
- ✅ i18n конфигурация (3 языка)
- ✅ ESLint и Prettier конфигурация
- ✅ Husky hooks

### Код:

- ✅ API client с interceptors
- ✅ Zustand stores
- ✅ Базовые компоненты
- ✅ Design tokens
- ✅ TypeScript типы

### Документация:

- ✅ README.md
- ✅ SETUP.md
- ✅ SOLID_PRINCIPLES.md
- ✅ CODE_QUALITY.md
- ✅ i18n/README.md

---

## 🎯 Ready to Commit!

Все готово к коммиту. Выполните команды выше для создания первого коммита.
