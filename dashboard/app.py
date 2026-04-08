import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from pathlib import Path

st.set_page_config(
    page_title="Observatorio de Turismo · Argentina",
    page_icon="🌎",
    layout="wide"
)

@st.cache_data
def load_pulso():
    path = Path(__file__).parent / "data_pulso.csv"
    df = pd.read_csv(path)
    df["fecha"] = pd.to_datetime(df["fecha"])
    return df[df["flag_covid"] == 0]

df = load_pulso()
termas  = df[df["localidad"] == "Termas"]
capital = df[df["localidad"] == "Santiago del Estero"]

# ── HEADER ───────────────────────────────────────────────────────────────────
st.markdown("""
<h1 style='font-size:1.8rem;font-weight:900;color:#0F172A;margin-bottom:4px'>
Observatorio de Turismo · Santiago del Estero
</h1>
<p style='color:#94A3B8;font-size:0.85rem;margin-top:0'>
Termas de Río Hondo · Santiago del Estero capital · EOH + Google Trends + BCRA
</p>
""", unsafe_allow_html=True)

st.divider()

# ── FILTROS ──────────────────────────────────────────────────────────────────
anio_min, anio_max = int(df["anio"].min()), int(df["anio"].max())
rango = st.slider("Período", anio_min, anio_max, (2019, anio_max))

mask = (df["anio"] >= rango[0]) & (df["anio"] <= rango[1])
df_f      = df[mask]
termas_f  = df_f[df_f["localidad"] == "Termas"]
capital_f = df_f[df_f["localidad"] == "Santiago del Estero"]

ultimo_t = termas_f.sort_values("fecha").iloc[-1]
ultimo_c = capital_f.sort_values("fecha").iloc[-1]

# ── KPIs ─────────────────────────────────────────────────────────────────────
st.markdown("### Último mes disponible")
k1, k2, k3, k4 = st.columns(4)

with k1:
    st.metric("Viajeros · Termas",
              f"{int(ultimo_t.viajeros_total):,}",
              f"Estadía: {ultimo_t.estadia_promedio:.1f} n.")
with k2:
    st.metric("Viajeros · Capital",
              f"{int(ultimo_c.viajeros_total):,}",
              f"Estadía: {ultimo_c.estadia_promedio:.1f} n.")
with k3:
    st.metric("IBT Termas · Google Trends",
              f"{int(ultimo_t.ibt_termas)}/100",
              "señal anticipada")
with k4:
    st.metric("Tipo de cambio",
              f"${ultimo_t.tcn_usd:,.0f} ARS/USD",
              ultimo_t.fecha.strftime("%b %Y"))

st.divider()

# ── G1: Viajeros ─────────────────────────────────────────────────────────────
st.markdown("### Viajeros hospedados")
fig1 = go.Figure()
fig1.add_trace(go.Scatter(
    x=termas_f["fecha"], y=termas_f["viajeros_total"],
    name="Termas", line=dict(color="#0891B2", width=2),
    fill="tozeroy", fillcolor="rgba(8,145,178,0.08)"
))
fig1.add_trace(go.Scatter(
    x=capital_f["fecha"], y=capital_f["viajeros_total"],
    name="Capital", line=dict(color="#94A3B8", width=2)
))
fig1.update_layout(height=300, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Viajeros", gridcolor="#F1F5F9"),
    xaxis=dict(gridcolor="#F1F5F9"))
st.plotly_chart(fig1, use_container_width=True)

# ── G2: IBT vs Viajeros ───────────────────────────────────────────────────────
st.markdown("### Señal anticipada vs. ocupación real")
fig2 = go.Figure()
fig2.add_trace(go.Bar(
    x=termas_f["fecha"], y=termas_f["ibt_termas"],
    name="IBT Termas (Trends)", marker_color="rgba(8,145,178,0.2)", yaxis="y2"
))
fig2.add_trace(go.Scatter(
    x=termas_f["fecha"], y=termas_f["viajeros_total"],
    name="Viajeros Termas (EOH)", line=dict(color="#0891B2", width=2)
))
fig2.update_layout(height=300, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Viajeros", gridcolor="#F1F5F9"),
    yaxis2=dict(title="IBT (0-100)", overlaying="y", side="right", showgrid=False),
    xaxis=dict(gridcolor="#F1F5F9"))
st.plotly_chart(fig2, use_container_width=True)

# ── G3: Estadía ───────────────────────────────────────────────────────────────
st.markdown("### Estadía promedio — noches")
fig3 = go.Figure()
fig3.add_trace(go.Scatter(
    x=termas_f["fecha"], y=termas_f["estadia_promedio"],
    name="Termas", line=dict(color="#0891B2", width=2)
))
fig3.add_trace(go.Scatter(
    x=capital_f["fecha"], y=capital_f["estadia_promedio"],
    name="Capital", line=dict(color="#94A3B8", width=2)
))
fig3.update_layout(height=250, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Noches", gridcolor="#F1F5F9"),
    xaxis=dict(gridcolor="#F1F5F9"))
st.plotly_chart(fig3, use_container_width=True)

# ── FOOTER ────────────────────────────────────────────────────────────────────
st.divider()
st.caption(
    f"Fuentes: EOH (INDEC/SINTA) · Google Trends · BCRA · "
    f"Datos al {df['fecha'].max().strftime('%B %Y')} · "
    f"{len(df):,} registros"
)
