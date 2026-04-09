import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
import lecturas

@st.cache_data
def load_pulso():
    df = pd.read_csv("dashboard/data_pulso.csv")
    df["fecha"] = pd.to_datetime(df["fecha"])
    return df[df["flag_covid"] == 0]

df_raw = load_pulso()

# ── HEADER ───────────────────────────────────────────────────────────────────
st.markdown("""
<h1 style='font-size:1.8rem;font-weight:900;color:#0F172A;margin-bottom:4px'>
Observatorio de Turismo · Santiago del Estero
</h1>
<p style='color:#94A3B8;font-size:0.85rem;margin-top:0'>
Termas de Río Hondo · Santiago del Estero capital · EOH + Google Trends + BCRA
</p>
""", unsafe_allow_html=True)

# ── FILTRO DE FECHA — controla toda la página ─────────────────────────────────
anio_min = int(df_raw["anio"].min())
anio_max = int(df_raw["anio"].max())
rango = st.slider("Período", anio_min, anio_max, (2019, anio_max))

df = df_raw[(df_raw["anio"] >= rango[0]) & (df_raw["anio"] <= rango[1])]
termas  = df[df["localidad"] == "Termas"].sort_values("fecha")
capital = df[df["localidad"] == "Santiago del Estero"].sort_values("fecha")

# ── LECTURA DESTACADA ─────────────────────────────────────────────────────────
if len(termas) > 0 and len(capital) > 0:
    ultimo_t = termas.iloc[-1]
    ultimo_c = capital.iloc[-1]
    lecturas.pulso(ultimo_t, ultimo_c)

st.divider()

# ── KPIs ──────────────────────────────────────────────────────────────────────
if len(termas) == 0:
    st.warning("Sin datos para el período seleccionado.")
    st.stop()

ultimo_t = termas.iloc[-1]
ultimo_c = capital.iloc[-1]

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
    x=termas["fecha"], y=termas["viajeros_total"],
    name="Termas", line=dict(color="#0891B2", width=2),
    fill="tozeroy", fillcolor="rgba(8,145,178,0.08)"
))
fig1.add_trace(go.Scatter(
    x=capital["fecha"], y=capital["viajeros_total"],
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
    x=termas["fecha"], y=termas["ibt_termas"],
    name="IBT Termas (Trends)", marker_color="rgba(8,145,178,0.2)", yaxis="y2"
))
fig2.add_trace(go.Scatter(
    x=termas["fecha"], y=termas["viajeros_total"],
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
    x=termas["fecha"], y=termas["estadia_promedio"],
    name="Termas", line=dict(color="#0891B2", width=2)
))
fig3.add_trace(go.Scatter(
    x=capital["fecha"], y=capital["estadia_promedio"],
    name="Capital", line=dict(color="#94A3B8", width=2)
))
fig3.update_layout(height=250, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Noches", gridcolor="#F1F5F9"),
    xaxis=dict(gridcolor="#F1F5F9"))
st.plotly_chart(fig3, use_container_width=True)

st.divider()
st.caption(
    f"Fuentes: EOH (INDEC/SINTA) · Google Trends · BCRA · "
    f"Datos al {df['fecha'].max().strftime('%B %Y')} · "
    f"{len(df):,} registros"
)
