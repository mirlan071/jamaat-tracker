from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

TEAL = HexColor('#00897B')
DARK = HexColor('#212121')
GRAY = HexColor('#757575')

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='Title2', fontSize=22, textColor=TEAL, spaceAfter=12, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle(name='H2', fontSize=14, textColor=TEAL, spaceBefore=16, spaceAfter=8, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle(name='Body2', fontSize=11, textColor=DARK, spaceAfter=6, leading=16))
styles.add(ParagraphStyle(name='BulletItem', fontSize=11, textColor=DARK, spaceAfter=4, leading=16, leftIndent=20, bulletIndent=8))
styles.add(ParagraphStyle(name='Small', fontSize=9, textColor=GRAY, spaceAfter=4))

doc = SimpleDocTemplate("C:/Users/wwwmi/jamaat-tracker/Tech_Stack.pdf", pagesize=A4,
                         leftMargin=2.5*cm, rightMargin=2.5*cm, topMargin=2.5*cm, bottomMargin=2.5*cm)

story = []

story.append(Paragraph("Жамаат Трекер", styles['Title2']))
story.append(Paragraph("Стек технологий", styles['H2']))
story.append(Spacer(1, 0.5*cm))

# Таблица стека
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

table = Table(data, colWidths=[3*cm, 3.5*cm, 2*cm, 6*cm])
table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TEAL),
    ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#FFFFFF')),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 10),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E0E0E0')),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#FFFFFF'), HexColor('#F5F5F5')]),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
]))
story.append(table)

story.append(Spacer(1, 0.5*cm))
story.append(Paragraph("Структура проекта", styles['H2']))
for item in ["jamaat-tracker/", "  ├── client/           # React frontend", "  │   ├── src/pages/    # Страницы (8 шт.)", "  │   ├── src/api/      # API-клиент", "  │   └── src/components/ # Компоненты", "  ├── server/           # Express backend", "  │   ├── routes/       # API-маршруты (4 шт.)", "  │   ├── middleware/    # Авторизация", "  │   └── db.js         # База данных", "  └── .github/workflows/ # CI/CD"]:
    story.append(Paragraph(item, styles['BulletItem']))

story.append(Paragraph("API-эндпоинты", styles['H2']))
api_data = [
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

api_table = Table(api_data, colWidths=[2*cm, 5.5*cm, 7*cm])
api_table.setStyle(TableStyle([
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
story.append(api_table)

story.append(Spacer(1, 1*cm))
story.append(Paragraph("Документ подготовлен: 20 июня 2026", styles['Small']))
story.append(Paragraph("Версия: 1.0", styles['Small']))

doc.build(story)
print("Tech_Stack.pdf создан")
