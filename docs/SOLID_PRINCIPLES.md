# SOLID Principles for Frontend Development

Применение принципов SOLID в React/Next.js приложении.

---

## 🎯 Overview

SOLID - это пять принципов объектно-ориентированного программирования, которые помогают создавать поддерживаемый и масштабируемый код.

---

## 📋 S - Single Responsibility Principle (Принцип единственной ответственности)

**Каждый компонент/модуль должен иметь одну причину для изменения.**

### ✅ Good Example

```tsx
// components/services/ServiceCard.tsx
// Только отображение карточки сервиса
interface ServiceCardProps {
  service: AutoService;
  onSelect: (service: AutoService) => void;
}

export const ServiceCard = ({ service, onSelect }: ServiceCardProps) => {
  return (
    <div onClick={() => onSelect(service)}>
      <h3>{service.companyName}</h3>
      <p>{service.description}</p>
    </div>
  );
};

// hooks/useServices.ts
// Только логика получения данных
export const useServices = (filters: ServiceFilters) => {
  return useQuery({
    queryKey: ['services', filters],
    queryFn: () => apiClient.get('/service-providers', { params: filters }),
  });
};

// services/api.ts
// Только API вызовы
export const serviceApi = {
  getServices: (filters: ServiceFilters) =>
    apiClient.get('/service-providers', { params: filters }),
};
```

### ❌ Bad Example

```tsx
// Плохо: компонент делает слишком много
export const ServiceCard = ({ serviceId }: { serviceId: string }) => {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Логика получения данных
    fetch(`/api/services/${serviceId}`)
      .then((res) => res.json())
      .then((data) => {
        setService(data);
        setLoading(false);
      });
  }, [serviceId]);

  // Логика форматирования
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Логика валидации
  const validateService = () => {
    // ...
  };

  // Отображение
  return <div>...</div>;
};
```

---

## 🔓 O - Open/Closed Principle (Принцип открытости/закрытости)

**Компоненты должны быть открыты для расширения, но закрыты для модификации.**

### ✅ Good Example

```tsx
// components/ui/Button.tsx
// Базовый компонент, расширяемый через props
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button = ({ variant = 'primary', size = 'md', children, onClick }: ButtonProps) => {
  const baseStyles = 'rounded-lg font-medium transition-colors';
  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white',
    secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white',
    danger: 'bg-error-500 hover:bg-error-600 text-white',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]}`} onClick={onClick}>
      {children}
    </button>
  );
};

// Использование - расширяем функциональность через композицию
export const IconButton = ({ icon, ...props }: ButtonProps & { icon: React.ReactNode }) => {
  return (
    <Button {...props}>
      <span className="flex items-center gap-2">
        {icon}
        {props.children}
      </span>
    </Button>
  );
};
```

### ❌ Bad Example

```tsx
// Плохо: нужно модифицировать компонент для добавления нового варианта
export const Button = ({ type }: { type: string }) => {
  if (type === 'primary') {
    return <button className="bg-blue-500">...</button>;
  }
  if (type === 'secondary') {
    return <button className="bg-purple-500">...</button>;
  }
  // Придется добавлять новый if для каждого варианта
  if (type === 'new-variant') {
    return <button className="bg-green-500">...</button>;
  }
};
```

---

## 🔄 L - Liskov Substitution Principle (Принцип подстановки Барбары Лисков)

**Производные компоненты должны быть заменяемы на базовые без изменения поведения.**

### ✅ Good Example

```tsx
// Базовый компонент
interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const Input = ({ label, value, onChange, error }: InputProps) => {
  return (
    <div>
      <label>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? 'border-error-500' : ''}
      />
      {error && <span className="text-error-500">{error}</span>}
    </div>
  );
};

// Расширенный компонент - полностью заменяет базовый
export const EmailInput = (props: InputProps) => {
  const [error, setError] = useState<string | undefined>(props.error);

  const handleChange = (value: string) => {
    props.onChange(value);
    // Добавляем валидацию, но сохраняем тот же интерфейс
    if (value && !value.includes('@')) {
      setError('Invalid email');
    } else {
      setError(undefined);
    }
  };

  return <Input {...props} onChange={handleChange} error={error || props.error} />;
};
```

---

## 🎭 I - Interface Segregation Principle (Принцип разделения интерфейса)

**Клиенты не должны зависеть от интерфейсов, которые они не используют.**

### ✅ Good Example

```tsx
// Разделяем интерфейсы на маленькие, специфичные
interface Readable {
  read(): string;
}

interface Writable {
  write(data: string): void;
}

interface Deletable {
  delete(): void;
}

// Компоненты используют только нужные интерфейсы
export const ReadOnlyView = ({ data }: { data: Readable }) => {
  return <div>{data.read()}</div>;
};

export const EditableView = ({ data }: { data: Readable & Writable }) => {
  return (
    <div>
      <div>{data.read()}</div>
      <button onClick={() => data.write('new data')}>Edit</button>
    </div>
  );
};

export const FullControlView = ({ data }: { data: Readable & Writable & Deletable }) => {
  return (
    <div>
      <div>{data.read()}</div>
      <button onClick={() => data.write('new data')}>Edit</button>
      <button onClick={() => data.delete()}>Delete</button>
    </div>
  );
};
```

### ❌ Bad Example

```tsx
// Плохо: один большой интерфейс, который не все используют
interface DataManager {
  read(): string;
  write(data: string): void;
  delete(): void;
  update(): void;
  validate(): boolean;
  format(): string;
  export(): Blob;
  import(data: Blob): void;
}

// Компонент вынужден зависеть от всех методов, даже если не использует их
export const SimpleView = ({ data }: { data: DataManager }) => {
  // Использует только read(), но зависит от всех остальных методов
  return <div>{data.read()}</div>;
};
```

---

## 🔌 D - Dependency Inversion Principle (Принцип инверсии зависимостей)

**Зависимости должны быть на абстракциях, а не на конкретных реализациях.**

### ✅ Good Example

```tsx
// Абстракция (интерфейс)
interface AuthService {
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}

// Конкретная реализация
class ApiAuthService implements AuthService {
  async login(email: string, password: string): Promise<User> {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data.user;
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }

  async getCurrentUser(): Promise<User | null> {
    const response = await apiClient.get('/auth/me');
    return response.data.user;
  }
}

// Компонент зависит от абстракции, а не от конкретной реализации
export const useAuth = (authService: AuthService = new ApiAuthService()) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const user = await authService.login(email, password);
    setUser(user);
  };

  return { user, login };
};

// Легко заменить реализацию для тестирования
const mockAuthService: AuthService = {
  login: async () => ({ id: '1', email: 'test@test.com' }),
  logout: async () => {},
  getCurrentUser: async () => null,
};

// В тестах
const { user } = useAuth(mockAuthService);
```

### ❌ Bad Example

```tsx
// Плохо: компонент напрямую зависит от конкретной реализации
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Прямая зависимость от apiClient
    const response = await apiClient.post('/auth/login', { email, password });
    setUser(response.data.user);
  };

  // Сложно тестировать, нельзя заменить реализацию
  return { user, login };
};
```

---

## 🏗 Practical Patterns for SOLID in React

### 1. Custom Hooks for Business Logic

```tsx
// hooks/useServiceSearch.ts
// Single Responsibility: только логика поиска
export const useServiceSearch = () => {
  const [filters, setFilters] = useState<ServiceFilters>({});
  const { data, isLoading } = useQuery({
    queryKey: ['services', filters],
    queryFn: () => serviceApi.search(filters),
  });

  return {
    services: data,
    isLoading,
    filters,
    setFilters,
  };
};

// components/services/ServiceList.tsx
// Только отображение
export const ServiceList = () => {
  const { services, isLoading, filters, setFilters } = useServiceSearch();

  if (isLoading) return <Loading />;

  return (
    <div>
      <Filters filters={filters} onChange={setFilters} />
      {services?.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
};
```

### 2. Composition over Inheritance

```tsx
// Базовые компоненты
export const Card = ({ children, className }: CardProps) => (
  <div className={`rounded-lg shadow ${className}`}>{children}</div>
);

export const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="border-b p-4">{children}</div>
);

export const CardBody = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4">{children}</div>
);

// Композиция вместо наследования
export const ServiceCard = ({ service }: { service: AutoService }) => (
  <Card>
    <CardHeader>
      <h3>{service.companyName}</h3>
    </CardHeader>
    <CardBody>
      <p>{service.description}</p>
    </CardBody>
  </Card>
);
```

### 3. Dependency Injection

```tsx
// Создаем контекст для зависимостей
const ServicesContext = createContext<{
  serviceApi: ServiceApi;
  fileApi: FileApi;
} | null>(null);

// Провайдер
export const ServicesProvider = ({ children }: { children: React.ReactNode }) => {
  const services = {
    serviceApi: new ApiServiceService(),
    fileApi: new ApiFileService(),
  };

  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
};

// Хук для использования
export const useServices = () => {
  const context = useContext(ServicesContext);
  if (!context) throw new Error('useServices must be used within ServicesProvider');
  return context;
};

// Компонент зависит от абстракции через контекст
export const ServiceList = () => {
  const { serviceApi } = useServices();
  // Легко заменить реализацию через провайдер
};
```

---

## ✅ Checklist for SOLID Compliance

### Single Responsibility

- [ ] Каждый компонент делает одну вещь
- [ ] Бизнес-логика вынесена в хуки
- [ ] API вызовы в отдельных сервисах
- [ ] Утилиты в отдельных функциях

### Open/Closed

- [ ] Компоненты расширяются через props
- [ ] Используется композиция вместо модификации
- [ ] Конфигурация через параметры, а не условные операторы

### Liskov Substitution

- [ ] Расширенные компоненты сохраняют интерфейс базовых
- [ ] Можно заменить компонент на расширенный без изменений

### Interface Segregation

- [ ] Интерфейсы маленькие и специфичные
- [ ] Компоненты не зависят от неиспользуемых методов
- [ ] Props разделены на логические группы

### Dependency Inversion

- [ ] Зависимости через props/context
- [ ] Используются абстракции (интерфейсы)
- [ ] Легко заменить реализации для тестирования

---

## 📚 Resources

- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [React Design Patterns](https://reactpatterns.com/)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

---

**Помните: SOLID - это не правила, а принципы. Применяйте их разумно, не переусложняйте!** 🎯
