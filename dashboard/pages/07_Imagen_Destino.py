import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import lecturas

st.set_page_config(page_title="Imagen Destino · Observatorio", page_icon="📺", layout="wide")

@st.cache_data
def load():
    df = pd.read_csv("dashboard/data_youtube.csv")
    df["fecha"] = pd.to_datetime(df["fecha"])
    return df

df_raw = load()
df_raw["anio"] = df_raw["fecha"].dt.year

st.markdown("""
<h1 style='font-size:1.8rem;font-weight:900;color:#0F172A;margin-bottom:4px'>
📺 Imagen de Destino — Presencia Digital
</h1>
<p style='color:#94A3B8;font-size:0.85rem;margin-top:0'>
Alcance de SDE y Termas en YouTube · 2009–2026
</p>
""", unsafe_allow_html=True)

# ── FILTRO ────────────────────────────────────────────────────────────────────
anio_min = int(df_raw["anio"].min())
anio_max = int(df_raw["anio"].max())
rango = st.slider("Período", anio_min, anio_max, (2015, anio_max))
df = df_raw[(df_raw["anio"] >= rango[0]) & (df_raw["anio"] <= rango[1])]

total_vistas  = df["view_count"].sum()
total_videos  = df["video_id"].nunique() if "video_id" in df.columns else len(df)
cat_top = df.groupby("categoria")["view_count"].sum().idxmax() if "categoria" in df.columns else "MotoGP"

# ── LECTURA ───────────────────────────────────────────────────────────────────
lecturas.youtube(total_vistas, total_videos, cat_top)
st.divider()

# ── KPIs ─────────────────────────────────────────────────────────────────────
k1, k2, k3, k4 = st.columns(4)
with k1:
    st.metric("Vistas totales", f"{total_vistas/1e6:.1f}M", f"{rango[0]}–{rango[1]}")
with k2:
    st.metric("Videos únicos", f"{total_videos:,}", "sobre SDE/Termas")
with k3:
    st.metric("Categoría dominante", str(cat_top), "por vistas")
with k4:
    promedio = total_vistas / total_videos if total_videos > 0 else 0
    st.metric("Vistas promedio", f"{promedio:,.0f}", "por video")

st.divider()

# ── G1: Vistas por año ────────────────────────────────────────────────────────
st.markdown("### Vistas acumuladas por año")
anual = df.groupby("anio")["view_count"].sum().reset_index()
fig1 = go.Figure()
fig1.add_trace(go.Bar(x=anual["anio"], y=anual["view_count"],
    marker_color="#0891B2",
    text=[f"{v/1e6:.1f}M" if v > 1e6 else f"{v/1e3:.0f}K" for v in anual["view_count"]],
    textposition="outside"))
fig1.update_layout(height=300, margin=dict(l=0,r=0,t=10,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Vistas", gridcolor="#F1F5F9"),
    xaxis=dict(dtick=1), showlegend=False)
st.plotly_chart(fig1, use_container_width=True)

# ── G2: Por categoría ─────────────────────────────────────────────────────────
if "categoria" in df.columns:
    st.markdown("### Distribución por categoría de contenido")
    cat = df.groupby("categoria")["view_count"].sum().sort_values(ascending=True).reset_index()
    fig2 = go.Figure()
    fig2.add_trace(go.Bar(x=cat["view_count"], y=cat["categoria"], orientation="h",
        marker_color=["#0891B2" if c == cat_top else "#CBD5E1" for c in cat["categoria"]],
        text=[f"{v/1e6:.1f}M" if v > 1e6 else f"{v/1e3:.0f}K" for v in cat["view_count"]],
        textposition="outside"))
    fig2.update_layout(height=300, margin=dict(l=0,r=80,t=10,b=0),
        plot_bgcolor="white", paper_bgcolor="white",
        xaxis=dict(title="Vistas", gridcolor="#F1F5F9"), showlegend=False)
    st.plotly_chart(fig2, use_container_width=True)

st.divider()
st.caption("Fuente: YouTube Data API v3 · Búsquedas: 'Termas Río Hondo' + 'MotoGP Argentina' + 'Santiago del Estero turismo'")
