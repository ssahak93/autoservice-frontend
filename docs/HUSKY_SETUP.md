# Husky Setup Guide

Инструкция по настройке Husky для git hooks.

---

## ⚠️ Important Note

Если git репозиторий находится в **корне проекта** (не в `frontend/`), нужно настроить Husky по-другому.

---

## 🔧 Setup Options

### Option 1: Git Repository in Root (Recommended)

Если `.git` находится в `AUTO SERVICE CONNECT/`, а не в `frontend/`:

1. **Инициализируйте Husky в корне проекта:**

```bash
cd "C:\projects\AUTO SERVICE CONNECT"
npx husky init
```

2. **Создайте pre-commit hook:**

```bash
# В корне проекта
echo "cd frontend && npx lint-staged" > .husky/pre-commit
```

3. **Создайте pre-push hook:**

```bash
echo "cd frontend && npm run type-check && npm run lint" > .husky/pre-push
```

### Option 2: Git Repository in Frontend

Если `.git` находится в `frontend/`:

```bash
cd frontend
npm run prepare
```

Это автоматически создаст `.husky` директорию.

---

## ✅ Verification

Проверьте, что hooks работают:

```bash
# Сделайте небольшое изменение
echo "test" >> test.txt

# Попробуйте закоммитить
git add test.txt
git commit -m "test"

# Должен запуститься pre-commit hook
```

---

## 🛠 Manual Hook Creation

Если автоматическая настройка не работает, создайте hooks вручную:

### Pre-commit Hook

Создайте файл `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

cd frontend
npx lint-staged
```

### Pre-push Hook

Создайте файл `.husky/pre-push`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

cd frontend
npm run type-check
npm run lint
```

### Make Executable (Linux/Mac)

```bash
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

---

## 🔍 Troubleshooting

### Hook не запускается

1. Проверьте, что файлы существуют:

   ```bash
   ls -la .husky/
   ```

2. Проверьте права на выполнение (Linux/Mac):

   ```bash
   chmod +x .husky/*
   ```

3. Проверьте, что Husky установлен:
   ```bash
   npm list husky
   ```

### "cd frontend" не работает

Если hooks находятся в корне проекта, но нужно запускать команды в `frontend/`:

Используйте полный путь или относительный путь:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

cd "$(dirname -- "$0")/../frontend" || exit
npx lint-staged
```

---

## 📚 Additional Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)

---

**После настройки, все коммиты и push будут автоматически проверяться!** ✅
