# DESIGN SYSTEM — Observatorio de Turismo SDE
# Basado en brandbook ADDFISH (Fishbowl × Keep Growing) — mayo 2026
# Fuente de verdad visual del proyecto. Actualizar ante cualquier cambio de sistema.

---

## 1. Paleta

| Token   | Hex      | Uso                                                      |
|---------|----------|----------------------------------------------------------|
| Ink     | #0A0A0A  | Texto principal, fondos hero, sidebar, barras chart      |
| Paper   | #FAFAF7  | Fondo de página                                          |
| Paper-2 | #F2F2EE  | Cards secundarias, lectura destacada, inputs             |
| Slate   | #3A3A36  | Cuerpo, labels, deltas, captions                         |
| Stone   | #C8C8BF  | Borders, dividers, track donut, track barras progreso    |
| Volt    | #FFFF00  | Acento puntual UNICO — máx 5-10% del área visual total   |

Reglas del volt:
- NO va como primaryColor en config.toml (tiñe todos los componentes Streamlit)
- En fondo de sección completo: solo en CTA de cierre (excepción deliberada, 1 vez por página)
- En eyebrows/paralelogramos: máximo 3 apariciones por página

---

## 2. Tipografía

Familia única: Plus Jakarta Sans
Import URL: https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;800&display=swap

| Peso | Nombre      | Uso exclusivo                                         |
|------|-------------|-------------------------------------------------------|
| 200  | Extralight  | Números grandes KPIs (claro y oscuro)                 |
| 300  | Light       | Títulos hero, headings sección, subtítulos, lectura   |
| 400  | Regular     | Body text, deltas, bios, captions                     |
| 500  | Medium      | Subtítulos de card, eyebrows en sección dark          |
| 600  | Semibold    | Labels uppercase, eyebrows uppercase, fuentes         |
| 800  | Extrabold   | SOLO CTA de cierre volt y wordmarks                   |

Tracking:
- Eyebrows uppercase: letter-spacing 0.16-0.18em
- Labels uppercase:   letter-spacing 0.12em
- Números grandes:    letter-spacing -0.025em
- Títulos h1/h2:      letter-spacing -0.02em

Regla crítica: h1/h2/h3 en CSS global usan !important solo para font-weight,
NUNCA para color — así el inline style='color:white' del hero siempre gana.

---

## 3. El paralelogramo volt

Grande (eyebrows):  display:inline-block; width:18px; height:8px; background:#FFFF00; transform:skewX(-14deg)
Chico (bullets):    width:14px; height:6px; background:#FFFF00; transform:skewX(-14deg)
Mini-line (KPIs):   display:block; width:32px; height:2px; background:#FFFF00; margin:10px 0

---

## 4. config.toml (.streamlit/config.toml)

[theme]
base = "light"
primaryColor = "#0A0A0A"
backgroundColor = "#FAFAF7"
secondaryBackgroundColor = "#F2F2EE"
textColor = "#0A0A0A"
font = "sans serif"

---

## 5. Constantes Python (style.py)

INK      = "#0A0A0A"
PAPER    = "#FAFAF7"
PAPER_2  = "#F2F2EE"
SLATE    = "#3A3A36"
STONE    = "#C8C8BF"
VOLT     = "#FFFF00"

# Legacy — no renombrar, las páginas ya rediseñadas los usan
BAR_COLOR     = "#0A0A0A"
BAR_COLOR_2   = "#3A3A36"
BAR_COLOR_ALT = "#C8C8BF"
LINE_COLOR    = "#0A0A0A"
LINE_COLOR_2  = "#3A3A36"
FILL_COLOR    = "rgba(10,10,10,0.06)"

PLOTLY_LAYOUT: font Plus Jakarta Sans, plot_bgcolor Paper, paper_bgcolor Paper
PLOTLY_LAYOUT_DARK: font Plus Jakarta Sans, plot_bgcolor Ink, paper_bgcolor Ink

---

## 6. API de style.py — helpers

### Existentes (no romper — usados en app.py y 10_Aerea)
- aplicar_estilo()                     inyecta CSS global
- apply_layout(fig, height)            Plotly fondo Paper
- apply_layout_dark(fig, height)       Plotly fondo Ink
- lectura_destacada(titulo, texto)     borde izq Ink + bg Paper-2

### Nuevos (a implementar en la reescritura de style.py)
- hero(titulo, subtitulo, eyebrow)              Ink sólido + CTAs + eyebrows duales + paralelogramos
- hero_video(titulo, subtitulo, imagen_url)     foto/video + overlay gradiente izq→der
- kpi_card(valor, label, delta)                 número 200 + mini-line volt + delta
- kpi_card_dark(valor, descripcion)             número volt 200 + mini-line volt + desc 300
- pill_dark_volt(texto)                         tag Ink con texto Volt
- eyebrow_titulo(eyebrow, titulo)               eyebrow uppercase 600 + título h3 peso 300
- cta_volt(titulo, subtitulo, boton_texto)      sección cierre full Volt + botón pill Ink
- logos_strip(fuentes_lista)                    logos muteados Stone sobre Paper + label
- timeline_section(banner_url, pasos)           foto banner ancho + numeración circular + etapas
- scorecard_card(titulo, score, dimensiones)    match% + barras progreso Volt
- team_profile(nombre, rol, badge, bio)         foto BW circular + pill Volt + bio centrada
- faq_section(titulo_a, titulo_b, preguntas)    título bicolor Ink/Stone + accordion

---

## 7. Cuándo usar cada helper por página

app.py (Pulso SDE):       hero_video, kpi_card x4, donut SVG, lectura_destacada, kpi_card_dark x4, cta_volt, team_profile, faq_section, logos_strip
10_Infraestructura_Aerea: hero_video, kpi_card, barras progreso, logos_strip
11_Terrestre:             hero, kpi_card, barras progreso, logos_strip
12_Informal:              hero, kpi_card, donut SVG, logos_strip
13_Empleo_HyG:            hero, kpi_card, kpi_card_dark, logos_strip
06_Madurez:               hero, timeline_section, scorecard_card, logos_strip
09_Perfil_Turista:        hero, scorecard_card, kpi_card_dark, logos_strip
04_Nacional:              hero, kpi_card, barras benchmark, logos_strip
01_MotoGP:                hero, kpi_card_dark, logos_strip

---

## 8. Reglas estrictas

- Sin gradientes decorativos de color (el overlay foto gradiente de opacidad es OK)
- Sin sombras (box-shadow: none en todos los componentes)
- Sin efectos (blur, glow, neon) sobre los isotipos
- NUNCA mencionar "FEHGRA" — citar INDEC / SIPA-AFIP / ANAC / CNRT / AirDNA / OEDE
- Volt como fondo completo: solo cta_volt(), max 1 vez por página
- Volt en paralelogramos: max 3 por página
- Peso 800: reservado para cta_volt() y wordmarks exclusivamente
