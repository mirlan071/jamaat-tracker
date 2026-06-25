# Jamaat Tracker

Приложение для учёта джамаатов в мечетях Кыргызстана.

> Деплой: frontend (GitHub Pages) + backend (Render.com) + PostgreSQL (Neon)

## Стек

- **Клиент:** React 18, React Router 6, Vite 5
- **Сервер:** Express 4, JSON-файл (lowdb), JWT-авторизация
- **UI:** Мобильный дизайн, CSS (teal-тема)

## Быстрый старт

### Сервер

```bash
cd server
npm install
cp .env.example .env   # настройте JWT_SECRET
npm run dev             # http://localhost:3001
```

### Клиент

```bash
cd client
npm install
npm run dev             # http://localhost:5173 (проксирует /api на :3001)
```

## Роли

| Роль | Возможности |
|------|-------------|
| `user` | Просмотр мечетей, джамаатов, дашборда |
| `admin` | Создание/редактирование мечетей и джамаатов, управление участниками |
| `superadmin` | Всё что admin + управление пользователями (назначение ролей, удаление) |

## API

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход |
| GET | `/api/auth/me` | Текущий пользователь |
| GET | `/api/mosques` | Список мечетей (search, region) |
| POST | `/api/mosques` | Создать мечеть (admin) |
| PUT | `/api/mosques/:id` | Обновить мечеть (admin) |
| DELETE | `/api/mosques/:id` | Удалить мечеть (admin) |
| GET | `/api/jamaats` | Список джамаатов (mosque_id, status, region) |
| GET | `/api/jamaats/stats/overview` | Статистика |
| GET | `/api/jamaats/:id` | Джамаат + участники |
| POST | `/api/jamaats` | Создать джамаат (admin) |
| PUT | `/api/jamaats/:id` | Обновить джамаат (admin) |
| DELETE | `/api/jamaats/:id` | Удалить джамаат (admin) |
| POST | `/api/jamaats/:id/members` | Добавить участника (admin) |
| DELETE | `/api/jamaats/:id/members/:memberId` | Удалить участника (admin) |
| GET | `/api/users` | Список пользователей (admin) |
| POST | `/api/users` | Создать пользователя (superadmin) |
| PUT | `/api/users/:id/role` | Изменить роль (superadmin) |
| DELETE | `/api/users/:id` | Удалить пользователя (superadmin) |

## Дефолтный админ

- Телефон: `996700000000`
- Пароль: `admin123`
- Роль: `superadmin`
