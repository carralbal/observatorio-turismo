import streamlit as st
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import lecturas
import pandas as pd
import plotly.graph_objects as go

st.set_page_config(page_title="Madurez · Observatorio", page_icon="📈", layout="wide")

@st.cache_data
def load():
    return pd.read_csv("dashboard/data_madurez.csv")

df = load()
sde = df[df["es_sde"] == 1].iloc[0]
pos = int(sde["ranking"])

st.markdown("""
<h1 style='font-size:1.8rem;font-weight:900;color:#0F172A;margin-bottom:4px'>
📈 Índice de Madurez Turística
</h1>
<p style='color:#94A3B8;font-size:0.85rem;margin-top:0'>
¿Dónde está SDE institucionalmente? · Comparación con todas las provincias argentinas
</p>
""", unsafe_allow_html=True)

st.warning("🔒 Módulo interno — diagnóstico institucional y roadmap.")
st.divider()

# ── KPIs ─────────────────────────────────────────────────────────────────────
k1, k2, k3, k4 = st.columns(4)
with k1:
    st.metric("Score SDE", f"{sde['score_madurez']}/5", sde['nivel_label'])
with k2:
    st.metric("Posición nacional", f"{pos}° de 24", "provincias + CABA")
with k3:
    mejor_que = len(df[df["score_madurez"] < sde["score_madurez"]])
    st.metric("Por encima de", f"{mejor_que} provincias",
              "con el observatorio activo")
with k4:
    st.metric("Nivel NOA", "1° del NOA",
              "sobre Salta, Jujuy, Tucumán, La Rioja, Catamarca")


# ── LECTURA DESTACADA ─────────────────────────────────────────────────────────
lecturas.madurez(sde["score_madurez"], pos, sde["nivel_label"])

st.divider()

# ── G1: Ranking barras horizontales ──────────────────────────────────────────
st.markdown("### Ranking de madurez turística — todas las provincias")

df_sorted = df.sort_values("score_madurez", ascending=True)
colors = ["#0891B2" if s else "#CBD5E1" for s in df_sorted["es_sde"]]

fig1 = go.Figure()
fig1.add_trace(go.Bar(
    x=df_sorted["score_madurez"],
    y=df_sorted["provincia"],
    orientation="h",
    marker_color=colors,
    text=[f"{v:.1f}" for v in df_sorted["score_madurez"]],
    textposition="outside"
))
# Líneas de nivel
for nivel, valor, label in [(1.8,"#94A3B8","Nivel 2"),(2.6,"#94A3B8","Nivel 3"),
                              (3.4,"#0891B2","Nivel 4"),(4.2,"#94A3B8","Nivel 5")]:
    fig1.add_vline(x=nivel, line_dash="dot", line_color=valor, line_width=1)

fig1.update_layout(
    height=600, margin=dict(l=0,r=60,t=10,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    xaxis=dict(title="Score (1-5)", gridcolor="#F1F5F9", range=[0,5.5]),
    showlegend=False
)
st.plotly_chart(fig1, use_container_width=True)
st.caption("🔵 Santiago del Estero · Líneas punteadas = umbrales de nivel")

st.divider()

# ── Escala ────────────────────────────────────────────────────────────────────
st.markdown("### La escala de madurez")
niveles = [
    (1, "No mide", "Sin EOH, sin tablero, sin datos propios.", "#DC2626"),
    (2, "Mide básico", "Tiene EOH. Publica llegadas. No analiza.", "#D97706"),
    (3, "Mide e interpreta", "Tablero activo. Produce análisis de coyuntura.", "#0891B2"),
    (4, "Decide con datos", "Ciclo mensual dato → decisión institucionalizado.", "#059669"),
    (5, "Anticipa y optimiza", "Modelos predictivos. Mide impacto de políticas.", "#7C3AED"),
]
for n, label, desc, color in niveles:
    is_sde = (n == 4 and sde["score_madurez"] >= 3.4)
    with st.container():
        col1, col2 = st.columns([1, 5])
        with col1:
            st.markdown(f"<div style='background:{color};color:white;border-radius:8px;"
                       f"padding:10px;text-align:center;font-weight:900;font-size:1.2rem'>"
                       f"{n}</div>", unsafe_allow_html=True)
        with col2:
            suffix = " ← **SDE ahora**" if is_sde else ""
            st.markdown(f"**{label}**{suffix}")
            st.caption(desc)

st.divider()

# ── Diagnóstico SDE ───────────────────────────────────────────────────────────
st.markdown("### Diagnóstico SDE — qué tiene y qué falta")

col1, col2 = st.columns(2)
with col1:
    st.markdown("**✅ Dimensiones activas**")
    items_ok = [
        ("EOH activo", sde["tiene_eoh"]),
        ("ANAC conectividad", sde["tiene_anac"]),
        ("Tablero público", sde["tiene_tablero"]),
        ("Actualización mensual", sde["actualiza_mensual"]),
        ("Medición de eventos", sde["mide_eventos"]),
        ("Señal anticipada (IBT)", sde["tiene_anticipacion"]),
    ]
    for label, val in items_ok:
        icon = "✅" if val else "⬜"
        st.write(f"{icon} {label}")

with col2:
    st.markdown("**⬜ Para subir a nivel 5**")
    items_falta = [
        "OEDE empleo provincial desagregado",
        "Datos N2 — IIBB por rubro (DGR SDE)",
        "Ciclo mensual institucionalizado",
        "Modelo predictivo calibrado",
    ]
    for item in items_falta:
        st.write(f"⬜ {item}")

st.divider()
st.caption("Índice basado en variables observables. Actualización semestral. Metodología disponible en docs/06_metodologia.md")
