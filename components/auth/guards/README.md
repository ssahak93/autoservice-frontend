# Authentication Guards

Система guards для защиты контента, следующая принципам SOLID.

## Принципы дизайна

- **Single Responsibility Principle (SRP)**: Каждый guard отвечает за одну проверку
- **Open/Closed Principle**: Легко расширять без изменения существующего кода
- **Dependency Inversion Principle**: Guards зависят от хуков (абстракций), а не от конкретных реализаций
- **Don't Repeat Yourself (DRY)**: Логика проверок централизована в хуках

## Компоненты

### `AuthGuard`

Защищает контент, требующий аутентификации.

```tsx
import { AuthGuard } from '@/components/auth/guards';

<AuthGuard>
  <ProtectedContent />
</AuthGuard>

// Без редиректа (скрывает контент)
<AuthGuard redirect={false}>
  <Button />
</AuthGuard>

// С кастомным fallback
<AuthGuard fallback={<LoginPrompt />}>
  <ProtectedContent />
</AuthGuard>
```

### `EmailVerifiedGuard`

Защищает контент, требующий подтвержденного email.

```tsx
import { EmailVerifiedGuard } from '@/components/auth/guards';

<EmailVerifiedGuard>
  <EmailVerifiedContent />
</EmailVerifiedGuard>;
```

### `ProtectedRoute` (Composite Guard)

Композитный guard, объединяющий `AuthGuard` и `EmailVerifiedGuard`.

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// С проверкой email (по умолчанию)
<ProtectedRoute>
  <ProtectedContent />
</ProtectedRoute>

// Без проверки email
<ProtectedRoute requireEmailVerification={false}>
  <Content />
</ProtectedRoute>

// Без редиректа (для UI элементов)
<ProtectedRoute redirect={false}>
  <Button />
</ProtectedRoute>
```

## Хуки

### `useEmailVerification`

Хук для проверки верификации email и управления редиректами.

```tsx
import { useEmailVerification } from '@/hooks/useEmailVerification';

function MyComponent() {
  const {
    isEmailVerificationRequired,
    isVerificationPage,
    canAccess,
    redirectToVerification,
    isLoading,
    user,
    isAuthenticated,
  } = useEmailVerification();

  if (isEmailVerificationRequired) {
    return <EmailVerificationPrompt onVerify={redirectToVerification} />;
  }

  return <ProtectedContent />;
}
```

## Примеры использования

### Защита страницы

```tsx
// app/[locale]/dashboard/page.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
```

### Защита UI элемента

```tsx
// components/BookVisitButton.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export function BookVisitButton() {
  return (
    <ProtectedRoute redirect={false} requireEmailVerification={true}>
      <Button>Book Visit</Button>
    </ProtectedRoute>
  );
}
```

### Кастомная логика с хуком

```tsx
// components/CustomComponent.tsx
import { useEmailVerification } from '@/hooks/useEmailVerification';

export function CustomComponent() {
  const { isEmailVerificationRequired, redirectToVerification } = useEmailVerification();

  const handleAction = () => {
    if (isEmailVerificationRequired) {
      redirectToVerification();
      return;
    }
    // Perform action
  };

  return <Button onClick={handleAction}>Action</Button>;
}
```

## Композиция guards

Guards можно комбинировать для создания более сложных проверок:

```tsx
<AuthGuard>
  <EmailVerifiedGuard>
    <RoleGuard role="admin">
      <AdminContent />
    </RoleGuard>
  </EmailVerifiedGuard>
</AuthGuard>
```

## Расширение

Для добавления нового guard:

1. Создайте новый guard компонент в `components/auth/guards/`
2. Следуйте паттерну существующих guards
3. Экспортируйте из `components/auth/guards/index.ts`
4. Добавьте документацию

Пример:

```tsx
// components/auth/guards/RoleGuard.tsx
export function RoleGuard({ children, role }: RoleGuardProps) {
  const { user } = useAuth();

  if (user?.role !== role) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
```
