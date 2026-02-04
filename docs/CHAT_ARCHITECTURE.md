# Chat Architecture Documentation

## Обзор

Документация описывает архитектуру системы чата, включая подключение WebSocket, установку слушателей событий и обработку realtime-событий. Этот документ поможет избежать проблем с установкой слушателей после hard reload страницы.

## Архитектура

### Компоненты системы

```
┌─────────────────────────────────────────────────────────────┐
│                    Chat System Architecture                  │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  SocketService   │  ← Управляет подключением Socket.IO
│  (singleton)     │     - Создает socket экземпляр
└────────┬─────────┘     - Обрабатывает переподключение
         │
         ▼
┌──────────────────┐
│    useSocket     │  ← React hook для доступа к socket
│   (hook)         │     - Предоставляет socket и isConnected
└────────┬─────────┘     - Управляет жизненным циклом socket
         │
         ▼
┌──────────────────┐
│ useChatRealtime  │  ← Основной hook для realtime событий
│   (hook)         │     - Устанавливает слушатели
└────────┬─────────┘     - Обрабатывает typing indicators
         │               - Обновляет кэш сообщений
         ▼
┌──────────────────┐
│  MessageList     │  ← Компонент отображения сообщений
│  (component)     │     - Использует useChatRealtime
└──────────────────┘     - Отображает typing indicators
```

## Ключевые файлы

### 1. `socket.service.ts`

**Назначение:** Singleton сервис для управления Socket.IO подключением.

**Основные методы:**

- `connect(token: string): Promise<Socket>` - Подключает socket с токеном
- `disconnect(): void` - Отключает socket
- `getSocket(): Socket | null` - Возвращает текущий socket экземпляр

**Важно:**

- Socket создается один раз и переиспользуется
- Автоматически обновляет токен при необходимости
- Обрабатывает переподключение

### 2. `useSocket.ts`

**Назначение:** React hook для доступа к socket и состояния подключения.

**Возвращает:**

```typescript
{
  socket: Socket | null;
  isConnected: boolean;
}
```

**Механизм callbacks:**

- Использует глобальный `Set` для хранения callbacks
- При подключении socket вызывает все зарегистрированные callbacks
- Callbacks получают socket экземпляр напрямую

**Критически важно:**

```typescript
// ✅ ПРАВИЛЬНО: Socket передается напрямую в callback
connectCallbacks.forEach((callback) => {
  callback(socket); // socket передается как параметр
});

// ❌ НЕПРАВИЛЬНО: Использование socket из замыкания
// socket может быть устаревшим при вызове callback
```

### 3. `useChatRealtime.ts`

**Назначение:** Управляет realtime событиями чата (typing, messages, reactions).

**Параметры:**

- `visitId: string | null` - ID визита (для visit chats)
- `conversationId: string | null` - ID разговора (для admin chats)
- `currentUserId?: string | null` - ID текущего пользователя

**Возвращает:**

```typescript
{
  typingUsers: Map<string, TypingUserInfo>;
  isConnected: boolean;
  socket: Socket | null;
}
```

## Критические паттерны

### 1. Использование `socketRef` вместо `socket` из замыкания

**Проблема:**

```typescript
// ❌ НЕПРАВИЛЬНО: socket из замыкания может быть устаревшим
const setupListeners = useCallback(() => {
  if (!socket.connected) return; // socket может быть старым!
  socket.on('event', handler);
}, [socket]); // socket в зависимостях создает проблему
```

**Решение:**

```typescript
// ✅ ПРАВИЛЬНО: Использование socketRef.current
const socketRef = useRef(socket);

useEffect(() => {
  socketRef.current = socket; // Всегда актуальный socket
}, [socket]);

const setupListeners = useCallback(() => {
  const currentSocket = socketRef.current || socket; // Используем ref
  if (!currentSocket.connected) return;
  currentSocket.on('event', handler);
}, [chatId]); // НЕ включаем socket в зависимости!
```

### 2. Установка слушателей через callback механизм

**Проблема:**

```typescript
// ❌ НЕПРАВИЛЬНО: React эффекты могут не сработать вовремя
useEffect(() => {
  if (isConnected && socket.connected) {
    setupListeners(); // Может не сработать после hard reload
  }
}, [isConnected, socket]); // Зависимости могут не обновиться
```

**Решение:**

```typescript
// ✅ ПРАВИЛЬНО: Использование useOnSocketConnect
const handleSocketConnect = useCallback(
  (connectedSocket: Socket) => {
    // Socket передается напрямую, всегда актуален
    socketRef.current = connectedSocket;
    setupListeners(); // Вызывается сразу при подключении
  },
  [chatId, setupListeners]
);

useOnSocketConnect(handleSocketConnect);
```

### 3. Очистка слушателей перед установкой новых

**Важно:**

```typescript
// ✅ ВСЕГДА очищайте старые слушатели перед установкой новых
const handlers = handlersRef.current;
if (handlers.handleTyping) {
  socket.off('user-typing', handlers.handleTyping);
}
// Затем устанавливаем новые
socket.on('user-typing', newHandler);
```

## Жизненный цикл подключения

### Последовательность событий после hard reload:

1. **Инициализация компонента**

   ```
   MessageList → useChatRealtime → useSocket
   ```

2. **Создание socket**

   ```
   useSocket → socketService.connect() → Socket.IO создает соединение
   ```

3. **Регистрация callback**

   ```
   useChatRealtime → useOnSocketConnect → callback добавляется в Set
   ```

4. **Подключение socket**

   ```
   Socket.IO → 'connect' event → useSocket.handleConnect()
   ```

5. **Вызов callbacks**

   ```
   useSocket → connectCallbacks.forEach(callback) → handleSocketConnect(socket)
   ```

6. **Установка слушателей**
   ```
   handleSocketConnect → socketRef.current = socket → setupListeners()
   ```

## Важные моменты

### ✅ DO (Делайте так)

1. **Используйте `socketRef.current` в `setupListeners`**

   ```typescript
   const currentSocket = socketRef.current || socket;
   ```

2. **Не включайте `socket` в зависимости `useCallback` для `setupListeners`**

   ```typescript
   const setupListeners = useCallback(() => {
     // ...
   }, [chatId, visitId, conversationId]); // НЕ [socket, ...]
   ```

3. **Используйте `useOnSocketConnect` для установки слушателей**

   ```typescript
   useOnSocketConnect((connectedSocket) => {
     socketRef.current = connectedSocket;
     setupListeners();
   });
   ```

4. **Всегда очищайте слушатели перед установкой новых**

   ```typescript
   socket.off('event', oldHandler);
   socket.on('event', newHandler);
   ```

5. **Используйте `listenersSetupRef` для предотвращения дублирования**
   ```typescript
   if (listenersSetupRef.current === chatId) {
     return; // Уже установлено
   }
   ```

### ❌ DON'T (Не делайте так)

1. **Не используйте `socket` из замыкания в `setupListeners`**

   ```typescript
   // ❌ socket может быть устаревшим
   const setupListeners = useCallback(() => {
     socket.on('event', handler); // socket из замыкания
   }, [socket]);
   ```

2. **Не полагайтесь только на React эффекты для установки слушателей**

   ```typescript
   // ❌ Может не сработать после hard reload
   useEffect(() => {
     if (isConnected) setupListeners();
   }, [isConnected]);
   ```

3. **Не используйте polling для проверки подключения**

   ```typescript
   // ❌ Неэффективно и ненадежно
   setInterval(() => {
     if (socket.connected) setupListeners();
   }, 100);
   ```

4. **Не устанавливайте слушатели без очистки старых**
   ```typescript
   // ❌ Создает дубликаты слушателей
   socket.on('event', handler); // Без socket.off() перед этим
   ```

## Структура событий

### События, отправляемые на сервер:

- `join-visit` - Присоединиться к чату визита
- `join-conversation` - Присоединиться к админ-чату
- `leave-visit` - Покинуть чат визита
- `leave-conversation` - Покинуть админ-чат
- `chat:typing:start` - Начало печати
- `chat:typing:stop` - Окончание печати

### События, получаемые от сервера:

- `new-message` - Новое сообщение
- `user-typing` - Пользователь печатает
- `reaction-updated` - Обновление реакций
- `messages-read` - Сообщения прочитаны
- `unread-count-updated` - Обновление счетчика непрочитанных

## Отладка

### Логи для проверки:

1. **Подключение socket:**

   ```
   [Socket] Connecting to: ...
   [Socket] Connected successfully: {id: '...', connected: true}
   [useSocket] Socket connected: ...
   ```

2. **Регистрация callback:**

   ```
   [useOnSocketConnect] Socket already connected, calling callback immediately
   ```

3. **Установка слушателей:**
   ```
   [useChatRealtime] Socket connect callback triggered
   [useChatRealtime] Socket connected callback, setting up listeners
   [useChatRealtime] Setting up listeners
   [useChatRealtime] Listeners set up successfully
   ```

### Типичные проблемы:

1. **Слушатели не устанавливаются после hard reload**
   - **Причина:** `socket` из замыкания устарел
   - **Решение:** Использовать `socketRef.current` и `useOnSocketConnect`

2. **Дублирование слушателей**
   - **Причина:** Не очищаются старые слушатели
   - **Решение:** Всегда вызывать `socket.off()` перед `socket.on()`

3. **Callback не вызывается**
   - **Причина:** Socket уже подключен до регистрации callback
   - **Решение:** Проверка в `useOnSocketConnect` для уже подключенного socket

## Примеры использования

### Базовое использование:

```typescript
function MessageList({ visitId }: { visitId: string }) {
  const { typingUsers, isConnected } = useChatRealtime(
    visitId,
    null, // conversationId
    currentUserId
  );

  // typingUsers автоматически обновляется при событиях typing
  // isConnected показывает статус подключения
}
```

### Кастомная обработка событий:

```typescript
function CustomChatComponent({ visitId }: { visitId: string }) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleCustomEvent = (data: any) => {
      // Обработка события
    };

    socket.on('custom-event', handleCustomEvent);

    return () => {
      socket.off('custom-event', handleCustomEvent);
    };
  }, [socket]);
}
```

## Best Practices

1. **Всегда используйте `useOnSocketConnect` для установки слушателей при подключении**
2. **Используйте `socketRef` для хранения актуального socket экземпляра**
3. **Очищайте слушатели в cleanup функциях `useEffect`**
4. **Не включайте `socket` в зависимости `useCallback`, если используете `socketRef`**
5. **Используйте `listenersSetupRef` для предотвращения дублирования установки**
6. **Проверяйте `socket.connected` и `socket.id` перед установкой слушателей**

## Ссылки на код

- `frontend/modules/chat/services/socket.service.ts` - Socket сервис
- `frontend/modules/chat/hooks/useSocket.ts` - Socket hook
- `frontend/modules/chat/hooks/useChatRealtime.ts` - Realtime hook
- `frontend/modules/chat/components/MessageList.tsx` - Компонент списка сообщений
- `frontend/components/chat/UnifiedChatWindow.tsx` - Унифицированное окно чата

## История изменений

### 2026-02-01

- Реализован механизм callbacks для установки слушателей при подключении socket
- Исправлена проблема с устаревшим socket в замыкании
- Добавлена поддержка hard reload через `useOnSocketConnect`
