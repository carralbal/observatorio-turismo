"""
Identidad visual ADDFISH — Observatorio de Turismo SDE
Sistema: Ink/Paper/Slate/Stone/Volt · Plus Jakarta Sans 200-800
Referencia completa: docs/DESIGN_SYSTEM.md
"""
import streamlit as st

# ─── PALETA ──────────────────────────────────────────────────────────────────
INK      = "#0A0A0A"
PAPER    = "#FAFAF7"
PAPER_2  = "#F2F2EE"
SLATE    = "#3A3A36"
STONE    = "#C8C8BF"
VOLT     = "#FFFF00"

# Compatibilidad legacy — no renombrar (app.py y 10_Aerea.py los usan)
BAR_COLOR     = INK
BAR_COLOR_2   = SLATE
BAR_COLOR_ALT = STONE
LINE_COLOR    = INK
LINE_COLOR_2  = SLATE
FILL_COLOR    = "rgba(10,10,10,0.06)"

# ─── PLOTLY LAYOUTS ──────────────────────────────────────────────────────────
PLOTLY_LAYOUT = dict(
    font=dict(family="Plus Jakarta Sans", color=INK, size=12),
    plot_bgcolor=PAPER,
    paper_bgcolor=PAPER,
    colorway=[INK, SLATE, STONE, "#888880"],
    xaxis=dict(gridcolor="#E8E8E4", linecolor=STONE,
               tickfont=dict(color=SLATE, size=11)),
    yaxis=dict(gridcolor="#E8E8E4", linecolor=STONE,
               tickfont=dict(color=SLATE, size=11)),
    legend=dict(font=dict(color=SLATE, size=11)),
    margin=dict(l=0, r=0, t=20, b=0),
)

PLOTLY_LAYOUT_DARK = dict(
    font=dict(family="Plus Jakarta Sans", color=PAPER, size=12),
    plot_bgcolor=INK,
    paper_bgcolor=INK,
    colorway=[PAPER, STONE, "#555550"],
    xaxis=dict(gridcolor="#1F1F1F", linecolor="#1F1F1F",
               tickfont=dict(color=STONE, size=11)),
    yaxis=dict(gridcolor="#1F1F1F", linecolor="#1F1F1F",
               tickfont=dict(color=STONE, size=11)),
    legend=dict(font=dict(color=PAPER, size=11)),
    margin=dict(l=0, r=0, t=20, b=0),
)

# ─── CSS GLOBAL ──────────────────────────────────────────────────────────────
# REGLA: !important solo en font-family y font-weight, NUNCA en color.
# Así los inline style="color:white" de los heroes siempre ganan al cascade.
CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;800&display=swap');

html, body, [class*="css"] {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
}

.stApp { background-color: #FAFAF7; }

h1 { font-size: 2.1rem !important; font-weight: 300 !important; letter-spacing: -0.02em; line-height: 1.05; }
h2 { font-size: 1.55rem !important; font-weight: 300 !important; letter-spacing: -0.02em; line-height: 1.15; }
h3 { font-size: 1.2rem !important; font-weight: 300 !important; letter-spacing: -0.015em; }

p, li { color: #3A3A36 !important; line-height: 1.7 !important; font-weight: 400 !important; }

[data-testid="metric-container"] {
    background: #F2F2EE;
    border: 0.5px solid #C8C8BF;
    border-radius: 6px;
    padding: 16px !important;
}
[data-testid="metric-container"] label {
    font-size: 0.75rem !important; font-weight: 600 !important;
    color: #3A3A36 !important; text-transform: uppercase !important;
    letter-spacing: 0.12em !important;
}
[data-testid="metric-container"] [data-testid="metric-value"] {
    font-size: 2.4rem !important; font-weight: 200 !important;
    color: #0A0A0A !important; letter-spacing: -0.025em !important;
}
[data-testid="metric-container"] [data-testid="metric-delta"] {
    font-size: 0.8rem !important; font-weight: 400 !important;
    color: #3A3A36 !important;
}

[data-testid="stSidebar"] { background-color: #0A0A0A !important; }
[data-testid="stSidebar"] * { color: #FAFAF7 !important; }
[data-testid="stSidebar"] [aria-selected="true"] {
    background-color: #1F1F1F !important; border-radius: 4px;
}

hr { border-color: #C8C8BF !important; margin: 24px 0 !important; }

.stCaption { color: #3A3A36 !important; font-size: 0.75rem !important; font-weight: 400 !important; }

.stAlert { border-radius: 4px !important; border-left: 3px solid #0A0A0A !important; }

.stSelectbox label, .stSlider label {
    font-weight: 600 !important; color: #0A0A0A !important;
    font-size: 0.78rem !important; text-transform: uppercase !important;
    letter-spacing: 0.12em !important;
}
</style>
"""


# ─── FUNCIONES CORE ──────────────────────────────────────────────────────────

def aplicar_estilo():
    """Inyectar CSS global ADDFISH. Llamar al inicio de cada página."""
    st.markdown(CSS, unsafe_allow_html=True)


def apply_layout(fig, height=300, **kwargs):
    """Layout Plotly estándar — fondo Paper, fuente Plus Jakarta Sans."""
    layout = {**PLOTLY_LAYOUT, "height": height, **kwargs}
    fig.update_layout(**layout)
    fig.update_xaxes(gridcolor="#E8E8E4", linecolor=STONE,
                     tickfont=dict(color=SLATE, family="Plus Jakarta Sans", size=11))
    fig.update_yaxes(gridcolor="#E8E8E4", linecolor=STONE,
                     tickfont=dict(color=SLATE, family="Plus Jakarta Sans", size=11))
    return fig


def apply_layout_dark(fig, height=300, **kwargs):
    """Layout Plotly oscuro — fondo Ink, ejes Stone."""
    layout = {**PLOTLY_LAYOUT_DARK, "height": height, **kwargs}
    fig.update_layout(**layout)
    fig.update_xaxes(gridcolor="#1F1F1F", linecolor="#1F1F1F",
                     tickfont=dict(color=STONE, family="Plus Jakarta Sans", size=11))
    fig.update_yaxes(gridcolor="#1F1F1F", linecolor="#1F1F1F",
                     tickfont=dict(color=STONE, family="Plus Jakarta Sans", size=11))
    return fig


def lectura_destacada(titulo: str, texto: str, pill: str = None):
    """Bloque de lectura con borde izquierdo Ink y fondo Paper-2.

    Args:
        titulo: Encabezado (peso 300, ~18px)
        texto:  Cuerpo del análisis (peso 400, ~15px)
        pill:   Opcional — etiqueta dark/volt encima del título (ej: 'Cierre Q1')
    """
    pill_html = ""
    if pill:
        pill_html = (
            "<span style='display:inline-block;background:#0A0A0A;color:#FFFF00;"
            "font-size:10px;font-weight:700;letter-spacing:0.14em;"
            "text-transform:uppercase;padding:5px 11px;border-radius:3px;"
            "margin-bottom:14px'>" + pill + "</span><br>"
        )
    st.markdown(
        "<div style='border-left:2px solid #0A0A0A;padding:18px 22px;"
        "margin:16px 0;background:#F2F2EE'>"
        + pill_html
        + "<p style='font-size:1.1rem;font-weight:300;color:#0A0A0A;"
        "margin:0 0 10px 0;letter-spacing:-0.015em;line-height:1.25'>" + titulo + "</p>"
        "<p style='color:#3A3A36;margin:0;font-size:0.95rem;"
        "line-height:1.7;font-weight:400'>" + texto + "</p>"
        "</div>",
        unsafe_allow_html=True
    )

# ─── HELPERS ATÓMICOS ────────────────────────────────────────────────────────

def pill_dark_volt(texto: str):
    """Etiqueta Ink con texto Volt. Usar antes de lectura_destacada o como callout."""
    st.markdown(
        "<span style='display:inline-block;background:#0A0A0A;color:#FFFF00;"
        "font-size:10px;font-weight:700;letter-spacing:0.14em;"
        "text-transform:uppercase;padding:5px 11px;border-radius:3px'>"
        + texto + "</span>",
        unsafe_allow_html=True
    )


def eyebrow_titulo(eyebrow: str, titulo: str):
    """Eyebrow uppercase 600 + título grande peso 300."""
    st.markdown(
        "<p style='font-size:0.75rem;font-weight:600;color:#3A3A36;"
        "letter-spacing:0.12em;text-transform:uppercase;margin:0 0 6px 0'>"
        + eyebrow + "</p>"
        "<h3 style='font-size:1.35rem;font-weight:300;color:#0A0A0A;"
        "margin:0 0 20px 0;letter-spacing:-0.02em;line-height:1.2'>"
        + titulo + "</h3>",
        unsafe_allow_html=True
    )


def kpi_card(valor: str, label: str, delta: str = ""):
    """KPI claro: número 200 + mini-line volt + label + delta.
    Usar dentro de st.columns para grilla de 4.
    """
    delta_html = (
        f"<p style='font-size:0.75rem;font-weight:300;color:#3A3A36;"
        f"opacity:0.8;margin:3px 0 0 0'>{delta}</p>"
    ) if delta else ""
    st.markdown(
        f"<div style='padding-right:12px'>"
        f"<div style='font-size:2.4rem;font-weight:200;color:#0A0A0A;"
        f"line-height:1;letter-spacing:-0.025em'>{valor}</div>"
        f"<div style='width:32px;height:2px;background:#FFFF00;margin:10px 0'></div>"
        f"<p style='font-size:0.8rem;font-weight:400;color:#0A0A0A;"
        f"margin:0;line-height:1.4'>{label}</p>"
        f"{delta_html}"
        f"</div>",
        unsafe_allow_html=True
    )


def kpi_card_dark(valor: str, descripcion: str):
    """KPI dark: número volt 200 + mini-line volt + descripción 300.
    Usar dentro de sección con fondo Ink.
    """
    st.markdown(
        f"<div style='background:#0F0F0F;border:0.5px solid #1F1F1F;"
        f"border-radius:10px;padding:22px 18px'>"
        f"<div style='font-size:2.2rem;font-weight:200;color:#FFFF00;"
        f"line-height:1;letter-spacing:-0.025em'>{valor}</div>"
        f"<div style='width:24px;height:2px;background:#FFFF00;margin:12px 0'></div>"
        f"<p style='font-size:0.78rem;font-weight:300;color:#FAFAF7;"
        f"opacity:0.85;margin:0;line-height:1.55'>{descripcion}</p>"
        f"</div>",
        unsafe_allow_html=True
    )


# ─── HELPERS DE SECCIÓN ──────────────────────────────────────────────────────

def hero(titulo, subtitulo, eyebrow="", btn1_texto="", btn1_href="#",
         btn2_texto="", btn2_href="#", bullets=None):
    """Hero Ink sólido con título peso 300, CTAs opcionales y eyebrows duales.

    Args:
        titulo:     Título principal (acepta <br> para saltos de línea)
        subtitulo:  Párrafo descriptivo (peso 300, opacidad 0.7)
        eyebrow:    Label con paralelogramo volt ("Pulso SDE · mayo 2026")
        btn1_texto: CTA volt sólido (opcional)
        btn2_texto: CTA outline (opcional)
        bullets:    Lista de strings para eyebrows duales al pie
    """
    eyebrow_html = ""
    if eyebrow:
        eyebrow_html = (
            "<div style='display:flex;align-items:center;gap:10px;margin-bottom:22px'>"
            "<span style='display:inline-block;width:18px;height:8px;"
            "background:#FFFF00;transform:skewX(-14deg)'></span>"
            "<span style='font-size:11px;font-weight:600;color:#FAFAF7;opacity:0.85;"
            "letter-spacing:0.18em;text-transform:uppercase'>" + eyebrow + "</span></div>"
        )
    b1 = (
        f"<a href='{btn1_href}' style='display:inline-block;background:#FFFF00;"
        f"color:#0A0A0A;font-size:13px;font-weight:600;padding:12px 24px;"
        f"border-radius:999px;text-decoration:none'>{btn1_texto}</a>"
    ) if btn1_texto else ""
    b2 = (
        f"<a href='{btn2_href}' style='display:inline-block;background:transparent;"
        f"color:#FAFAF7;font-size:13px;font-weight:400;padding:11px 23px;"
        f"border-radius:999px;text-decoration:none;"
        f"border:1px solid rgba(250,250,247,0.4)'>{btn2_texto}</a>"
    ) if btn2_texto else ""
    btns_html = f"<div style='display:flex;gap:12px;margin-bottom:28px'>{b1}{b2}</div>" if (b1 or b2) else ""
    bullets_html = ""
    if bullets:
        items = "".join(
            "<div style='display:flex;align-items:center;gap:10px'>"
            "<span style='display:inline-block;width:14px;height:6px;"
            "background:#FFFF00;transform:skewX(-14deg)'></span>"
            "<span style='font-size:10px;font-weight:500;color:#FAFAF7;opacity:0.65;"
            "letter-spacing:0.16em;text-transform:uppercase'>" + b + "</span></div>"
            for b in bullets
        )
        bullets_html = (
            "<div style='border-top:0.5px solid rgba(250,250,247,0.15);"
            "padding:18px 0;display:flex;gap:28px;flex-wrap:wrap'>" + items + "</div>"
        )
    st.markdown(
        "<section style='background:#0A0A0A;padding:38px 28px 0 28px;"
        "margin:-1rem -1rem 0 -1rem'>"
        + eyebrow_html
        + f"<h1 style='font-size:2.2rem;font-weight:300;color:#FAFAF7;"
        f"letter-spacing:-0.025em;margin:0 0 14px 0;line-height:1.05'>{titulo}</h1>"
        f"<p style='font-size:0.9rem;font-weight:300;color:#FAFAF7;opacity:0.7;"
        f"margin:0 0 26px 0;max-width:480px;line-height:1.6'>{subtitulo}</p>"
        + btns_html + bullets_html + "</section>",
        unsafe_allow_html=True
    )


def cta_volt(titulo: str, subtitulo: str, boton_texto: str, boton_href: str = "#"):
    """Sección de cierre full Volt. Usar una vez por página, al final."""
    st.markdown(
        f"<section style='background:#FFFF00;padding:52px 28px;text-align:center;"
        f"margin:0 -1rem'>"
        f"<h2 style='font-size:2.2rem;font-weight:800;color:#0A0A0A;margin:0 0 14px 0;"
        f"line-height:1.05;letter-spacing:-0.025em;text-transform:uppercase'>{titulo}</h2>"
        f"<p style='font-size:0.9rem;font-weight:400;color:#0A0A0A;opacity:0.78;"
        f"margin:0 auto 30px;line-height:1.55;max-width:420px'>{subtitulo}</p>"
        f"<a href='{boton_href}' style='display:inline-block;background:#0A0A0A;"
        f"color:#FAFAF7;font-size:12px;font-weight:600;letter-spacing:0.18em;"
        f"text-transform:uppercase;padding:15px 30px;border-radius:999px;"
        f"text-decoration:none'>{boton_texto}</a></section>",
        unsafe_allow_html=True
    )


def logos_strip(fuentes: list, label: str = "FUENTES OFICIALES"):
    """Strip de fuentes muteadas en Stone sobre Paper."""
    items = "".join(
        f"<span style='font-size:0.7rem;font-weight:600;color:#C8C8BF;"
        f"letter-spacing:0.12em;text-transform:uppercase'>{f}</span>"
        for f in fuentes
    )
    st.markdown(
        "<div style='padding:20px 0;border-top:0.5px solid #E8E8E4;margin-top:16px'>"
        f"<p style='font-size:0.7rem;font-weight:600;color:#C8C8BF;letter-spacing:0.14em;"
        f"text-transform:uppercase;text-align:center;margin:0 0 14px 0'>{label}</p>"
        "<div style='display:flex;gap:24px;flex-wrap:wrap;justify-content:center;"
        "align-items:center'>" + items + "</div></div>",
        unsafe_allow_html=True
    )
