from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

pdfmetrics.registerFont(TTFont('Arial', 'C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('ArialBold', 'C:/Windows/Fonts/arialbd.ttf'))

TEAL = HexColor('#00897B')
DARK = HexColor('#212121')
GRAY = HexColor('#757575')

def make_styles():
    s = getSampleStyleSheet()
    s.add(ParagraphStyle(name='Title2', fontSize=22, textColor=TEAL, spaceAfter=12, fontName='ArialBold'))
    s.add(ParagraphStyle(name='H2', fontSize=14, textColor=TEAL, spaceBefore=16, spaceAfter=8, fontName='ArialBold'))
    s.add(ParagraphStyle(name='H3', fontSize=12, textColor=DARK, spaceBefore=10, spaceAfter=6, fontName='ArialBold'))
    s.add(ParagraphStyle(name='Body2', fontSize=11, textColor=DARK, spaceAfter=6, leading=16, fontName='Arial'))
    s.add(ParagraphStyle(name='BulletItem', fontSize=11, textColor=DARK, spaceAfter=4, leading=16, leftIndent=20, bulletIndent=8, fontName='Arial'))
    s.add(ParagraphStyle(name='Small', fontSize=9, textColor=GRAY, spaceAfter=4, fontName='Arial'))
    s.add(ParagraphStyle(name='CodeStyle', fontSize=10, textColor=HexColor('#D32F2F'), fontName='Courier', spaceAfter=4, leftIndent=10))
    return s

def styled_table(data, widths):
    t = Table(data, colWidths=widths)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TEAL),
        ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#FFFFFF')),
        ('FONTNAME', (0, 0), (-1, 0), 'ArialBold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Arial'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E0E0E0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#FFFFFF'), HexColor('#F5F5F5')]),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    return t

# ===== 1. BUSINESS IDEA =====
def gen_business():
    doc = SimpleDocTemplate("C:/Users/wwwmi/jamaat-tracker/Business_Idea.pdf", pagesize=A4,
                             leftMargin=2.5*cm, rightMargin=2.5*cm, topMargin=2.5*cm, bottomMargin=2.5*cm)
    st = make_styles()
    s = []
    s.append(Paragraph("Жамаат Трекер", st['Title2']))
    s.append(Paragraph("Бизнес-идея", st['H2']))
    s.append(Spacer(1, 0.5*cm))

    s.append(Paragraph("1. Проблема", st['H2']))
    s.append(Paragraph("В мечетях Кыргызстана регулярно формируются джамааты (группы верующих) для прохождения религиозных курсов длительностью 3 дня, 40 дней или 4 месяца. Ведение учёта джамаатов ведётся вручную — в тетрадях, мессенджерах или вообще не ведётся.", st['Body2']))
    s.append(Paragraph("Это приводит к:", st['Body2']))
    for x in ["Потере информации об участниках", "Дублированию записей", "Отсутствию статистики по регионам", "Сложности координации между мечетями"]:
        s.append(Paragraph(f"• {x}", st['BulletItem']))

    s.append(Paragraph("2. Решение", st['H2']))
    s.append(Paragraph("Мобильное веб-приложение «Жамаат Трекер» — единая платформа для учёта джамаатов во всех мечетях Кыргызстана.", st['Body2']))

    s.append(Paragraph("3. Целевая аудитория", st['H2']))
    for x in ["Имамы и администрация мечетей", "Руководители джамаатов", "Администрация «Таблиги Джамаат» Кыргызстан", "Обычные участники (просмотр расписания)"]:
        s.append(Paragraph(f"• {x}", st['BulletItem']))

    s.append(Paragraph("4. Модель монетизации", st['H2']))
    for x in ["Бесплатная базовая функциональность", "Премиум: расширенная аналитика, экспорт отчётов, API", "Спонсорство от мечетей и религиозных организаций"]:
        s.append(Paragraph(f"• {x}", st['BulletItem']))

    s.append(Paragraph("5. Конкурентные преимущества", st['H2']))
    for x in ["Единая база данных по всей стране", "Мобильный дизайн (80%+ пользователей — смартфоны)", "Многоуровневая система ролей (user → admin → superadmin)", "Бесплатный и открытый исходный код"]:
        s.append(Paragraph(f"• {x}", st['BulletItem']))

    s.append(Paragraph("6. Масштабирование", st['H2']))
    for x in ["Расширение на Узбекистан, Казахстан, Таджикистан", "Добавление функции пожертвований (садака)", "Интеграция с календарём намазов", "Push-уведомления о начале джамаата"]:
        s.append(Paragraph(f"• {x}", st['BulletItem']))

    s.append(Spacer(1, 1*cm))
    s.append(Paragraph("Документ подготовлен: 20 июня 2026", st['Small']))
    doc.build(s)
    print("Business_Idea.pdf готов")

# ===== 2. TECH STACK =====
def gen_tech():
    doc = SimpleDocTemplate("C:/Users/wwwmi/jamaat-tracker/Tech_Stack.pdf", pagesize=A4,
                             leftMargin=2.5*cm, rightMargin=2.5*cm, topMargin=2.5*cm, bottomMargin=2.5*cm)
    st = make_styles()
    s = []
    s.append(Paragraph("Жамаат Трекер", st['Title2']))
    s.append(Paragraph("Стек технологий", st['H2']))
    s.append(Spacer(1, 0.5*cm))

    data = [
        ["Компонент", "Технология", "Версия", "Назначение"],
        ["Frontend", "React", "18.2", "UI-библиотека"],
        ["", "React Router", "6.21", "Маршрутизация"],
        ["", "Vite", "5.x", "Сборщик"],
        ["", "CSS", "-", "Стилизация (teal-тема)"],
        ["Backend", "Node.js", "24.x", "Runtime"],
        ["", "Express", "4.18", "HTTP-сервер"],
        ["", "lowdb", "3.0", "JSON-база данных"],
        ["", "JWT", "9.0", "Авторизация"],
        ["", "bcryptjs", "2.4", "Хеширование паролей"],
        ["CI/CD", "GitHub Actions", "-", "Автоматизация"],
        ["", "ESLint", "-", "Линтинг"],
        ["", "Vitest", "4.1", "Тестирование"],
        ["Деплой", "GitHub Pages", "-", "Статический хостинг"],
    ]
    s.append(styled_table(data, [3*cm, 3.5*cm, 2*cm, 6*cm]))
    s.append(Spacer(1, 0.5*cm))

    s.append(Paragraph("Структура проекта", st['H2']))
    for x in ["jamaat-tracker/", "  ├── client/           # React frontend", "  │   ├── src/pages/    # Страницы (8 шт.)", "  │   ├── src/api/      # API-клиент", "  │   └── src/components/ # Компоненты", "  ├── server/           # Express backend", "  │   ├── routes/       # API-маршруты (4 шт.)", "  │   ├── middleware/    # Авторизация", "  │   └── db.js         # База данных", "  └── .github/workflows/ # CI/CD"]:
        s.append(Paragraph(x, st['BulletItem']))

    s.append(Paragraph("API-эндпоинты", st['H2']))
    api = [
        ["Метод", "Путь", "Описание"],
        ["POST", "/api/auth/register", "Регистрация"],
        ["POST", "/api/auth/login", "Вход"],
        ["GET", "/api/mosques", "Список мечетей"],
        ["POST", "/api/mosques", "Создать мечеть (admin)"],
        ["GET", "/api/jamaats", "Список джамаатов"],
        ["POST", "/api/jamaats", "Создать джамаат (admin)"],
        ["GET", "/api/jamaats/stats/overview", "Статистика"],
        ["GET", "/api/users", "Пользователи (admin)"],
    ]
    s.append(styled_table(api, [2*cm, 5.5*cm, 7*cm]))

    s.append(Spacer(1, 1*cm))
    s.append(Paragraph("Документ подготовлен: 20 июня 2026", st['Small']))
    doc.build(s)
    print("Tech_Stack.pdf готов")

# ===== 3. USER MANUAL =====
def gen_manual():
    doc = SimpleDocTemplate("C:/Users/wwwmi/jamaat-tracker/User_Manual.pdf", pagesize=A4,
                             leftMargin=2.5*cm, rightMargin=2.5*cm, topMargin=2.5*cm, bottomMargin=2.5*cm)
    st = make_styles()
    s = []
    s.append(Paragraph("Жамаат Трекер", st['Title2']))
    s.append(Paragraph("Инструкция по использованию", st['H2']))
    s.append(Spacer(1, 0.5*cm))

    s.append(Paragraph("1. Запуск приложения", st['H2']))
    s.append(Paragraph("Сервер (backend):", st['H3']))
    for x in ["Открыть терминал", "cd server", "npm install", "npm run dev", "Сервер запустится на http://localhost:3001"]:
        s.append(Paragraph(x, st['CodeStyle']))

    s.append(Paragraph("Клиент (frontend):", st['H3']))
    for x in ["Открыть второй терминал", "cd client", "npm install", "npm run dev", "Приложение откроется на http://localhost:5173"]:
        s.append(Paragraph(x, st['CodeStyle']))

    s.append(Paragraph("2. Вход в систему", st['H2']))
    for x in ["Откройте http://localhost:5173", "Введите телефон: 996700000000 (без +)", "Введите пароль: admin123", "Нажмите «Войти»"]:
        s.append(Paragraph(f"• {x}", st['BulletItem']))

    s.append(Paragraph("3. Роли и возможности", st['H2']))
    roles = [
        ["Роль", "Возможности"],
        ["user", "Просмотр мечетей, джамаатов, дашборда"],
        ["admin", "Всё что user + создание/редактирование мечетей и джамаатов"],
        ["superadmin", "Всё что admin + управление пользователями"],
    ]
    s.append(styled_table(roles, [3*cm, 12*cm]))

    s.append(Paragraph("4. Основные действия", st['H2']))
    s.append(Paragraph("Дашборд (главная):", st['H3']))
    for x in ["Общая статистика: количество мечетей, джамаатов, участников", "Графики по регионам и типам джамаатов"]:
        s.append(Paragraph(f"• {x}", st['BulletItem']))

    s.append(Paragraph("Мечети:", st['H3']))
    for x in ["Просмотр списка с фильтрацией по региону", "Поиск по названию", "Добавление/редактирование/удаление (admin+)"]:
        s.append(Paragraph(f"• {x}", st['BulletItem']))

    s.append(Paragraph("Джамааты:", st['H3']))
    for x in ["Создание нового джамаата (указание мечети, руководителя, количества участников)", "Типы: 3 дня, 40 дней, 4 месяца", "Управление участниками джамаата"]:
        s.append(Paragraph(f"• {x}", st['BulletItem']))

    s.append(PageBreak())

    s.append(Paragraph("Что сделано (v1.0)", st['H2']))
    done = [
        ["Компонент", "Статус", "Описание"],
        ["Backend API", "Готово", "Express + lowdb, 4 маршрута, JWT"],
        ["Авторизация", "Готово", "Регистрация, вход, роли"],
        ["Мечети", "Готово", "CRUD, фильтрация по региону"],
        ["Джамааты", "Готово", "CRUD, 3 типа длительности"],
        ["Участники", "Готово", "Добавление/удаление"],
        ["Дашборд", "Готово", "Статистика, графики"],
        ["Пользователи", "Готово", "Назначение ролей"],
        ["Мобильный UI", "Готово", "Адаптивный дизайн"],
        ["ESLint + Vitest", "Готово", "Линтинг и тесты"],
        ["CI/CD", "Готово", "GitHub Actions"],
    ]
    s.append(styled_table(done, [4*cm, 2*cm, 9*cm]))

    s.append(Spacer(1, 0.5*cm))
    s.append(Paragraph("Что нужно сделать дальше", st['H2']))
    todo = [
        ["Приоритет", "Задача", "Описание"],
        ["P0", "PostgreSQL", "Заменить lowdb на PostgreSQL"],
        ["P0", "Деплой", "VPS + Docker"],
        ["P1", "Push-уведомления", "Firebase Cloud Messaging"],
        ["P1", "Карта мечетей", "Яндекс/Google Maps"],
        ["P1", "Экспорт в PDF/Excel", "Отчёты по джамаатам"],
        ["P2", "Тёмная тема", "Дизайн-система"],
        ["P2", "Offline-режим", "Service Worker"],
        ["P2", "Мультиязычность", "Кыргызский, русский, арабский"],
        ["P3", "Пожертвования", "Платёжные системы"],
        ["P3", "Чат джамаата", "Общение участников"],
    ]
    s.append(styled_table(todo, [2*cm, 4*cm, 9*cm]))

    s.append(Spacer(1, 1*cm))
    s.append(Paragraph("Репозиторий: https://github.com/mirlan071/jamaat-tracker", st['Small']))
    s.append(Paragraph("Документ подготовлен: 20 июня 2026", st['Small']))
    doc.build(s)
    print("User_Manual.pdf готов")

gen_business()
gen_tech()
gen_manual()
