"""
Identidad visual del Observatorio
Estilo monocromático — negro/gris/blanco
Aplicar en todas las páginas con: from style import aplicar_estilo; aplicar_estilo()
"""
import streamlit as st

CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

html, body, [class*="css"] {
    font-family: 'Inter', sans-serif !important;
}

/* Fondo blanco puro */
.stApp { background-color: #FFFFFF; }

/* Títulos */
h1 { font-size: 2rem !important; font-weight: 900 !important; color: #0F0F0F !important; }
h2 { font-size: 1.5rem !important; font-weight: 800 !important; color: #0F0F0F !important; }
h3 { font-size: 1.15rem !important; font-weight: 700 !important; color: #0F0F0F !important; }

/* Texto cuerpo */
p, li { color: #333333 !important; line-height: 1.7 !important; font-size: 1rem !important; }

/* Métricas — números grandes */
[data-testid="metric-container"] {
    background: #F9F9F9;
    border: 1px solid #E5E5E5;
    border-radius: 6px;
    padding: 16px !important;
}
[data-testid="metric-container"] label {
    font-size: 0.8rem !important;
    font-weight: 600 !important;
    color: #555555 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em !important;
}
[data-testid="metric-container"] [data-testid="metric-value"] {
    font-size: 2.2rem !important;
    font-weight: 900 !important;
    color: #0F0F0F !important;
}
[data-testid="metric-container"] [data-testid="metric-delta"] {
    font-size: 0.85rem !important;
    color: #555555 !important;
}

/* Sidebar */
[data-testid="stSidebar"] {
    background-color: #0F0F0F !important;
}
[data-testid="stSidebar"] * {
    color: #FFFFFF !important;
}
[data-testid="stSidebar"] [aria-selected="true"] {
    background-color: #333333 !important;
    border-radius: 4px;
}

/* Divider */
hr { border-color: #E5E5E5 !important; margin: 24px 0 !important; }

/* Caption */
.stCaption { color: #888888 !important; font-size: 0.78rem !important; }

/* Info box */
.stAlert { border-radius: 4px !important; border-left: 3px solid #0F0F0F !important; }

/* Selectbox y slider */
.stSelectbox label, .stSlider label {
    font-weight: 600 !important;
    color: #0F0F0F !important;
    font-size: 0.85rem !important;
    text-transform: uppercase !important;
    letter-spacing: 0.04em !important;
}
</style>
"""

PLOTLY_LAYOUT = dict(
    font=dict(family="Inter", color="#0F0F0F"),
    plot_bgcolor="#FFFFFF",
    paper_bgcolor="#FFFFFF",
    colorway=["#0F0F0F","#555555","#888888","#BBBBBB","#E5E5E5"],
    xaxis=dict(gridcolor="#F0F0F0", linecolor="#E5E5E5", tickfont=dict(color="#555555")),
    yaxis=dict(gridcolor="#F0F0F0", linecolor="#E5E5E5", tickfont=dict(color="#555555")),
    legend=dict(font=dict(color="#333333")),
    margin=dict(l=0, r=0, t=20, b=0),
)

BAR_COLOR     = "#0F0F0F"
BAR_COLOR_2   = "#555555"
BAR_COLOR_ALT = "#BBBBBB"
LINE_COLOR    = "#0F0F0F"
LINE_COLOR_2  = "#555555"
FILL_COLOR    = "rgba(15,15,15,0.06)"

def aplicar_estilo():
    st.markdown(CSS, unsafe_allow_html=True)

def lectura_destacada(titulo: str, texto: str):
    st.markdown(f"""
<div style='border-left:3px solid #0F0F0F;padding:16px 20px;margin:16px 0;background:#F9F9F9'>
<p style='font-size:1.1rem;font-weight:800;color:#0F0F0F;margin:0 0 8px 0'>{titulo}</p>
<p style='color:#333333;margin:0;font-size:0.97rem;line-height:1.7'>{texto}</p>
</div>
""", unsafe_allow_html=True)


def apply_layout(fig, height=300, **kwargs):
    """Aplica el layout monocromático estándar a cualquier figura Plotly"""
    layout = {**PLOTLY_LAYOUT, "height": height, **kwargs}
    fig.update_layout(**layout)
    # Actualizar ejes también
    fig.update_xaxes(gridcolor="#F0F0F0", linecolor="#E5E5E5", 
                     tickfont=dict(color="#555555", family="Inter"))
    fig.update_yaxes(gridcolor="#F0F0F0", linecolor="#E5E5E5",
                     tickfont=dict(color="#555555", family="Inter"))
    return fig
