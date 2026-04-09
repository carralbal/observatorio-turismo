import streamlit as st
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import lecturas
import pandas as pd
import plotly.graph_objects as go

st.set_page_config(page_title="Imagen de Destino · Observatorio", page_icon="📺", layout="wide")

@st.cache_data
def load():
    df = pd.read_csv("dashboard/data_youtube.csv")
    df["fecha"] = pd.to_datetime(df["fecha"])
    return df

df = load()

COLORES = {
    "MotoGP":      "#BE185D",
    "Termas":      "#0891B2",
    "SDE Capital": "#0E7490",
    "Otro":        "#CBD5E1",
}

st.markdown("""
<h1 style='font-size:1.8rem;font-weight:900;color:#0F172A;margin-bottom:4px'>
📺 Imagen de Destino — SDE en YouTube
</h1>
<p style='color:#94A3B8;font-size:0.85rem;margin-top:0'>
517 videos · 2009–2026 · Volumen de contenido · Vistas · Engagement
</p>
""", unsafe_allow_html=True)

st.divider()

# ── KPIs ─────────────────────────────────────────────────────────────────────
total_vistas  = df["vistas_totales"].sum()
total_videos  = df["videos_publicados"].sum()
motogp_vistas = df[df["categoria"] == "MotoGP"]["vistas_totales"].sum()
termas_vistas = df[df["categoria"] == "Termas"]["vistas_totales"].sum()

k1, k2, k3, k4 = st.columns(4)
with k1:
    st.metric("Vistas totales", f"{total_vistas/1e6:.1f}M", "todos los videos SDE")
with k2:
    st.metric("Videos únicos", f"{int(total_videos):,}", "2009–2026")
with k3:
    st.metric("Vistas MotoGP", f"{motogp_vistas/1e6:.1f}M", "efecto evento en digital")
with k4:
    st.metric("Vistas Termas", f"{termas_vistas/1e6:.1f}M", "contenido termal")


# ── LECTURA DESTACADA ─────────────────────────────────────────────────────────
lecturas.youtube(total_vistas, total_videos, "MotoGP")

st.divider()

# ── G1: Vistas por categoría por año ─────────────────────────────────────────
st.markdown("### Vistas anuales por categoría")

anual = df.groupby(["anio", "categoria"])["vistas_totales"].sum().reset_index()

fig1 = go.Figure()
for cat in ["MotoGP", "Termas", "SDE Capital", "Otro"]:
    d = anual[anual["categoria"] == cat]
    fig1.add_trace(go.Bar(
        x=d["anio"], y=d["vistas_totales"],
        name=cat, marker_color=COLORES.get(cat, "#CBD5E1")
    ))
fig1.update_layout(
    barmode="stack", height=320,
    margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Vistas", gridcolor="#F1F5F9"),
    xaxis=dict(dtick=1)
)
st.plotly_chart(fig1, use_container_width=True)

# ── G2: Volumen de videos por mes ─────────────────────────────────────────────
st.markdown("### Producción de contenido — videos publicados por mes")

mensual = df.groupby(["fecha","categoria"])["videos_publicados"].sum().reset_index()
fig2 = go.Figure()
for cat in ["MotoGP", "Termas", "SDE Capital"]:
    d = mensual[mensual["categoria"] == cat]
    fig2.add_trace(go.Scatter(
        x=d["fecha"], y=d["videos_publicados"],
        name=cat, line=dict(color=COLORES.get(cat), width=2),
        stackgroup="one"
    ))
fig2.update_layout(
    height=280, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Videos publicados", gridcolor="#F1F5F9"),
    xaxis=dict(gridcolor="#F1F5F9")
)
st.plotly_chart(fig2, use_container_width=True)

# ── G3: Engagement por categoría ─────────────────────────────────────────────
st.markdown("### Engagement promedio por categoría")
st.caption("(likes + comentarios) / vistas × 100 — qué tan activa es la audiencia.")

eng = df.groupby("categoria")["engagement_promedio"].mean().reset_index().sort_values("engagement_promedio", ascending=True)
fig3 = go.Figure()
fig3.add_trace(go.Bar(
    x=eng["engagement_promedio"],
    y=eng["categoria"],
    orientation="h",
    marker_color=[COLORES.get(c, "#CBD5E1") for c in eng["categoria"]],
    text=[f"{v:.2f}%" for v in eng["engagement_promedio"]],
    textposition="outside"
))
fig3.update_layout(
    height=250, margin=dict(l=0,r=60,t=10,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    xaxis=dict(title="Engagement (%)", gridcolor="#F1F5F9"),
    showlegend=False
)
st.plotly_chart(fig3, use_container_width=True)

# ── Top videos ────────────────────────────────────────────────────────────────
st.divider()
st.markdown("### Top videos por vistas")

cat_sel = st.radio("Categoría", ["Todos", "MotoGP", "Termas", "SDE Capital"], horizontal=True)

all_videos = pd.read_csv("dashboard/data_youtube.csv")
all_videos["fecha"] = pd.to_datetime(all_videos["fecha"])

top = pd.read_csv("dashboard/data_youtube.csv")

import duckdb
con = duckdb.connect()
top_df = con.execute("""
    SELECT titulo_mas_visto AS titulo, categoria, 
           vistas_totales AS vistas, fecha, engagement_promedio
    FROM top
    ORDER BY vistas DESC
    LIMIT 20
""").df()

if cat_sel != "Todos":
    top_df = top_df[top_df["categoria"] == cat_sel]

st.dataframe(
    top_df[["titulo","categoria","vistas","fecha","engagement_promedio"]].head(15),
    use_container_width=True,
    hide_index=True
)

st.divider()
st.caption("Fuente: YouTube Data API v3 · 517 videos únicos · Búsquedas recientes (order=date) + históricas (order=viewCount)")
