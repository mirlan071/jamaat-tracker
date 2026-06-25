# User Story: CI/CD Pipeline — Jamaat Tracker

## Архитектура деплоя

```
┌─────────────────────────────────────────────────────┐
│                    GitHub                            │
│                                                     │
│  develop ──► CI (lint+test+build) ──► Deploy DEV    │
│                                        │            │
│                                        ▼            │
│                              GitHub Pages (dev)     │
│                                                     │
│  main ─────► CI (lint+test+build) ──► Deploy PROD   │
│                                        │            │
│                                        ▼            │
│                              GitHub Pages (prod)    │
└─────────────────────────────────────────────────────┘
                    │
                    │ API requests (VITE_API_URL)
                    ▼
┌─────────────────────────────────────────────────────┐
│              Render.com (Free Tier)                  │
│              https://jamaat-tracker.onrender.com     │
│                                                     │
│  Express Server (Node.js 22)                        │
│         │                                           │
│         ▼                                           │
│  Neon PostgreSQL (Free Tier)                        │
│  (jamaat_tracker database)                          │
└─────────────────────────────────────────────────────┘
```

## Ветки и стенды

| Ветка | Стенд | URL | Назначение |
|-------|-------|-----|------------|
| `develop` | DEV | `https://mirlan071.github.io/jamaat-tracker/` | Тестирование, разработка |
| `main` | PROD | `https://mirlan071.github.io/jamaat-tracker/` | Продакшен |

## Как это работает

### При пуше в develop

1. **CI workflow** запускает:
   - Lint клиента (`npm run lint` в `client/`)
   - Lint сервера (`npm run lint` в `server/`)
   - Тесты клиента (`npm test` в `client/`)
   - Сборку клиента (`npm run build` в `client/`)

2. **Deploy DEV workflow** собирает фронтенд с `VITE_API_URL` из secrets и деплоит на GitHub Pages

### При пуше в main

1. **CI workflow** — то же самое что для develop

2. **Deploy PROD workflow** собирает фронтенд и деплоит на GitHub Pages

3. **Render.com** автоматически перезапускает бэкенд при обновлении ветки main (webhook из GitHub)

## Workflow файлы

```
.github/workflows/
├── ci.yml           # Lint + Test + Build (main, develop)
├── deploy-dev.yml   # Деплой фронта в DEV (develop)
└── deploy-prod.yml  # Деплой фронта в PROD (main)
```

## Как работать

### Новая фича

```bash
git checkout develop
git checkout -b feature/my-feature

# работаешь...

git add .
git commit -m "feat: описание"
git push origin feature/my-feature
```

1. Открой Pull Request → `feature/my-feature` → `develop`
2. CI автоматически проверит lint и тесты
3. После мержа в `develop` → автоматический деплой в DEV

### Релиз в продакшен

```bash
git checkout main
git merge develop
git push origin main
```

CI + Deploy PROD запустятся автоматически. Сайт обновится через ~40 секунд.

## Сервисы и ключи

| Сервис | URL | Что хранит |
|--------|-----|------------|
| GitHub Pages | `mirlan071.github.io/jamaat-tracker` | Фронтенд (React SPA) |
| Render.com | `jamaat-tracker.onrender.com` | Бэкенд (Express API) |
| Neon.tech | Подключается через DATABASE_URL | PostgreSQL база данных |

### GitHub Secrets

| Secret | Значение | Где используется |
|--------|----------|------------------|
| `PROD_API_URL` | `https://jamaat-tracker.onrender.com` | Build фронта (PROD) |
| `DEV_API_URL` | `https://jamaat-tracker.onrender.com` | Build фронта (DEV) |

### Render Environment Variables

| Variable | Значение |
|----------|----------|
| `JWT_SECRET` | Автогенерированный |
| `DATABASE_URL` | Строка подключения Neon PostgreSQL |
| `NODE_ENV` | `production` |

## Дефолтные данные

| Поле | Значение |
|------|----------|
| Телефон админа | `996700000000` |
| Пароль | `admin123` |
| Роль | `superadmin` |

## Ограничения

- **Render Free Tier**: сервис засыпает через 15 мин неактивности, просыпается за ~30 сек
- **GitHub Pages**: статический хостинг, только фронтенд
- **Neon Free Tier**: 0.5 GB хранилища, 24/7 работающий инстанс

## CI/CD чек-лист

- [ ] Код проходит `npm run lint` (ESLint) — клиент и сервер
- [ ] Тесты клиента проходят (`npm test`)
- [ ] Клиент собирается без ошибок (`npm run build`)
- [ ] `VITE_API_URL` корректно установлен в GitHub Secrets
- [ ] Render.com деплой работает (проверить через `/health` эндпоинт)
- [ ] Neon PostgreSQL доступен (проверить через `DATABASE_URL`)
