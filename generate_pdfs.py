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
styles.add(ParagraphStyle(name='Body2', fontSize=11, textColor=DARK, spaceAfter=6, leading=16))
styles.add(ParagraphStyle(name='BulletItem', fontSize=11, textColor=DARK, spaceAfter=4, leading=16, leftIndent=20, bulletIndent=8))
styles.add(ParagraphStyle(name='Small', fontSize=9, textColor=GRAY, spaceAfter=4))

doc = SimpleDocTemplate("C:/Users/wwwmi/jamaat-tracker/Business_Idea.pdf", pagesize=A4,
                         leftMargin=2.5*cm, rightMargin=2.5*cm, topMargin=2.5*cm, bottomMargin=2.5*cm)

story = []

story.append(Paragraph("Жамаат Трекер", styles['Title2']))
story.append(Paragraph("Бизнес-идея", styles['H2']))
story.append(Spacer(1, 0.5*cm))

story.append(Paragraph("1. Проблема", styles['H2']))
story.append(Paragraph("В мечетях Кыргызстана регулярно формируются джамааты (группы верующих) для прохождения религиозных курсов длительностью 3 дня, 40 дней или 4 месяца. Ведение учёта джамаатов ведётся вручную — в тетрадях, мессенджерах или вообще не ведётся.", styles['Body2']))
story.append(Paragraph("Это приводит к:", styles['Body2']))
for item in ["Потере информации об участниках", "Дублированию записей", "Отсутствию статистики по регионам", "Сложности координации между мечетями"]:
    story.append(Paragraph(f"• {item}", styles['BulletItem']))

story.append(Paragraph("2. Решение", styles['H2']))
story.append(Paragraph("Мобильное веб-приложение «Жамаат Трекер» — единая платформа для учёта джамаатов во всех мечетях Кыргызстана.", styles['Body2']))

story.append(Paragraph("3. Целевая аудитория", styles['H2']))
for item in ["Имамы и Administration мечетей", "Руководители джамаатов", "Администрация «Таблиги Джамаат» Кыргызстан", "Обычные участники (просмотр расписания)"]:
    story.append(Paragraph(f"• {item}", styles['BulletItem']))

story.append(Paragraph("4. Модель монетизации", styles['H2']))
for item in ["Бесплатная базовая функциональность", "Премиум: расширенная аналитика, экспорт отчётов, API для интеграции", "Спонсорство от мечетей и религиозных организаций"]:
    story.append(Paragraph(f"• {item}", styles['BulletItem']))

story.append(Paragraph("5. Конкурентные преимущества", styles['H2']))
for item in ["Единая база данных по всей стране", "Мобильный дизайн (80%+ пользователей — смартфоны)", "Многоуровневая система ролей (user → admin → superadmin)", "Бесплатный и открытый исходный код"]:
    story.append(Paragraph(f"• {item}", styles['BulletItem']))

story.append(Paragraph("6. Масштабирование", styles['H2']))
for item in ["Расширение на Узбекистан, Казахстан, Таджикистан", "Добавление функции пожертвований (садака)", "Интеграция с календарём намазов", "Push-уведомления о начале джамаата"]:
    story.append(Paragraph(f"• {item}", styles['BulletItem']))

story.append(Spacer(1, 1*cm))
story.append(Paragraph("Документ подготовлен: 20 июня 2026", styles['Small']))
story.append(Paragraph("Версия: 1.0", styles['Small']))

doc.build(story)
print("Business_Idea.pdf создан")
