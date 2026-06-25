from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

TEAL = HexColor('#00897B')
DARK = HexColor('#212121')
GRAY = HexColor('#757575')

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='Title2', fontSize=22, textColor=TEAL, spaceAfter=12, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle(name='H2', fontSize=14, textColor=TEAL, spaceBefore=16, spaceAfter=8, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle(name='H3', fontSize=12, textColor=DARK, spaceBefore=10, spaceAfter=6, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle(name='Body2', fontSize=11, textColor=DARK, spaceAfter=6, leading=16))
styles.add(ParagraphStyle(name='BulletItem', fontSize=11, textColor=DARK, spaceAfter=4, leading=16, leftIndent=20, bulletIndent=8))
styles.add(ParagraphStyle(name='Small', fontSize=9, textColor=GRAY, spaceAfter=4))
styles.add(ParagraphStyle(name='CodeStyle', fontSize=10, textColor=HexColor('#D32F2F'), fontName='Courier', spaceAfter=4, leftIndent=10))

doc = SimpleDocTemplate("C:/Users/wwwmi/jamaat-tracker/User_Manual.pdf", pagesize=A4,
                         leftMargin=2.5*cm, rightMargin=2.5*cm, topMargin=2.5*cm, bottomMargin=2.5*cm)

story = []

# ===================== ЧАСТЬ 1: ИНСТРУКЦИЯ =====================
story.append(Paragraph("Жамаат Трекер", styles['Title2']))
story.append(Paragraph("Инструкция по использованию", styles['H2']))
story.append(Spacer(1, 0.5*cm))

story.append(Paragraph("1. Запуск приложения", styles['H2']))
story.append(Paragraph("Сервер (backend):", styles['H3']))
for item in ["Открыть терминал", "cd server", "npm install", "npm run dev", "Сервер запустится на http://localhost:3001"]:
    story.append(Paragraph(item, styles['CodeStyle']))

story.append(Paragraph("Клиент (frontend):", styles['H3']))
for item in ["Открыть второй терминал", "cd client", "npm install", "npm run dev", "Приложение откроется на http://localhost:5173"]:
    story.append(Paragraph(item, styles['CodeStyle']))

story.append(Paragraph("2. Вход в систему", styles['H2']))
for item in ["Откройте http://localhost:5173", "Введите телефон: 996700000000 (без +)", "Введите пароль: admin123", "Нажмите «Войти»"]:
    story.append(Paragraph(f"• {item}", styles['BulletItem']))

story.append(Paragraph("3. Роли и возможности", styles['H2']))
roles_data = [
    ["Роль", "Возможности"],
    ["user", "Просмотр мечетей, джамаатов, дашборда"],
    ["admin", "Всё что user + создание/редактирование мечетей и джамаатов"],
    ["superadmin", "Всё что admin + управление пользователями"],
]
roles_table = Table(roles_data, colWidths=[3*cm, 12*cm])
roles_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TEAL),
    ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#FFFFFF')),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 10),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E0E0E0')),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#FFFFFF'), HexColor('#F5F5F5')]),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
]))
story.append(roles_table)

story.append(Paragraph("4. Основные действия", styles['H2']))
story.append(Paragraph("Дашборд (главная):", styles['H3']))
for item in ["Общая статистика: количество мечетей, джамаатов, участников", "Графики по регионам и типам джамаатов"]:
    story.append(Paragraph(f"• {item}", styles['BulletItem']))

story.append(Paragraph("Мечети:", styles['H3']))
for item in ["Просмотр списка с фильтрацией по региону", "Поиск по названию", "Добавление/редактирование/удаление (admin+)"]:
    story.append(Paragraph(f"• {item}", styles['BulletItem']))

story.append(Paragraph("Джамааты:", styles['H3']))
for item in ["Создание нового джамаата (указание мечети, руководителя, количества участников)", "Типы: 3 дня, 40 дней, 4 месяца", "Управление участниками джамаата"]:
    story.append(Paragraph(f"• {item}", styles['BulletItem']))

story.append(PageBreak())

# ===================== ЧАСТЬ 2: ЧТО СДЕЛАНО =====================
story.append(Paragraph("Что сделано (v1.0)", styles['H2']))
story.append(Spacer(1, 0.3*cm))

done_data = [
    ["Компонент", "Статус", "Описание"],
    ["Backend API", "Готово", "Express + lowdb, 4 маршрута, JWT"],
    ["Авторизация", "Готово", "Регистрация, вход, роли (user/admin/superadmin)"],
    ["Управление мечетями", "Готово", "CRUD, фильтрация по региону"],
    ["Управление джамаатами", "Готово", "CRUD, 3 типа длительности"],
    ["Участники джамаата", "Готово", "Добавление/удаление"],
    ["Дашборд", "Готово", "Статистика, графики"],
    ["Управление пользователями", "Готово", "Назначение ролей (superadmin)"],
    ["Мобильный UI", "Готово", "Адаптивный дизайн, teal-тема"],
    ["Линтер (ESLint)", "Готово", "Клиент + сервер"],
    ["Тесты (Vitest)", "Готово", "Базовый тест LoginPage"],
    ["CI/CD", "Готово", "GitHub Actions: lint → test → deploy"],
    ["GitHub Pages", "Готово", "Автодеплой (develop → DEV, main → PROD)"],
]

done_table = Table(done_data, colWidths=[4.5*cm, 2*cm, 8.5*cm])
done_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TEAL),
    ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#FFFFFF')),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 10),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E0E0E0')),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#FFFFFF'), HexColor('#F5F5F5')]),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
]))
story.append(done_table)

story.append(Spacer(1, 0.5*cm))
story.append(Paragraph("Что нужно сделать дальше", styles['H2']))

todo_data = [
    ["Приоритет", "Задача", "Описание"],
    ["P0", "PostgreSQL", "Заменить lowdb на PostgreSQL"],
    ["P0", "Нормальный деплой", "Настроить VPS + Docker"],
    ["P1", "Push-уведомления", "Firebase Cloud Messaging"],
    ["P1", "Карта мечетей", "Яндекс/Google Maps интеграция"],
    ["P1", "Экспорт в PDF/Excel", "Отчёты по джамаатам"],
    ["P2", "Тёмная тема", "Дизайн-система"],
    ["P2", "Offline-режим", "Service Worker + кэширование"],
    ["P2", "Мультиязычность", "Кыргызский, русский, арабский"],
    ["P3", "Пожертвования", "Интеграция с платёжными системами"],
    ["P3", "Чат джамаата", "Внутреннее общение участников"],
]

todo_table = Table(todo_data, colWidths=[2*cm, 4*cm, 9*cm])
todo_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TEAL),
    ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#FFFFFF')),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 10),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E0E0E0')),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#FFFFFF'), HexColor('#F5F5F5')]),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
]))
story.append(todo_table)

story.append(Spacer(1, 1*cm))
story.append(Paragraph("Репозиторий: https://github.com/mirlan071/jamaat-tracker", styles['Small']))
story.append(Paragraph("Документ подготовлен: 20 июня 2026", styles['Small']))
story.append(Paragraph("Версия: 1.0", styles['Small']))

doc.build(story)
print("User_Manual.pdf создан")
