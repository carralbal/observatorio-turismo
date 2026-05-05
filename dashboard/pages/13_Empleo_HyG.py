import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

st.set_page_config(page_title="Empleo HyG · Observatorio", page_icon="👷", layout="wide")

@st.cache_data
def load():
    df = pd.read_csv("dashboard/data_empleo_hyg.csv")
    df["fecha"] = pd.to_datetime(df["fecha"])
    df["anio"]  = df["fecha"].dt.year
    return df

df_raw = load()

style.aplicar_estilo()

st.markdown("""
<h1 style='font-size:1.8rem;font-weight:900;color:#0F172A;margin-bottom:4px'>
👷 Empleo en Hotelería y Gastronomía
</h1>
<p style='color:#94A3B8;font-size:0.85rem;margin-top:0'>
Empleo registrado · Sector privado · Por provincia · SIPA-AFIP · 1996–2025
</p>
""", unsafe_allow_html=True)

# ── FILTROS ───────────────────────────────────────────────────────────────────
col1, col2 = st.columns(2)
with col1:
    provincias = sorted(df_raw["provincia"].unique().tolist())
    provincia = st.selectbox("Provincia", provincias,
                             index=provincias.index("Santiago del Estero")
                             if "Santiago del Estero" in provincias else 0)
with col2:
    anio_min = int(df_raw["anio"].min())
    anio_max = int(df_raw["anio"].max())
    rango = st.slider("Período", anio_min, anio_max, (2019, anio_max))

df = df_raw[
    (df_raw["provincia"] == provincia) &
    (df_raw["anio"] >= rango[0]) &
    (df_raw["anio"] <= rango[1])
].sort_values("fecha")

df_todas = df_raw[(df_raw["anio"] >= rango[0]) & (df_raw["anio"] <= rango[1])]

if len(df) == 0:
    st.warning("Sin datos.")
    st.stop()

ultimo     = df.iloc[-1]
primero    = df.iloc[0]
var_pct    = round((ultimo.empleo_registrado / primero.empleo_registrado - 1) * 100, 1)

# ── LECTURA ───────────────────────────────────────────────────────────────────
st.markdown(f"""
<div style='background:#F0F9FF;border-left:4px solid #0891B2;padding:16px 20px;border-radius:6px;margin:12px 0'>
<p style='font-size:1.25rem;font-weight:800;color:#0F172A;margin:0 0 10px 0'>
👷 ¿Cuánto empleo formal genera el turismo en {provincia}?
</p>
<p style='color:#1E293B;margin:0;font-size:1.05rem;line-height:1.6'>
En <strong>{ultimo.fecha.strftime('%b %Y')}</strong>, el sector de hotelería y gastronomía de
<strong>{provincia}</strong> tiene <strong>{int(ultimo.empleo_registrado):,} puestos registrados</strong>
en el sector privado — una {"suba" if var_pct > 0 else "baja"} de <strong>{var_pct:+.1f}%</strong>
respecto a {primero.fecha.strftime('%b %Y')}.
Este indicador mide solo el empleo formal — el sector informal del turismo no queda registrado en el SIPA.
</p>
</div>
""", unsafe_allow_html=True)

st.divider()

# ── KPIs ─────────────────────────────────────────────────────────────────────
k1, k2, k3, k4 = st.columns(4)
with k1:
    st.metric("Empleo registrado", f"{int(ultimo.empleo_registrado):,}", ultimo.fecha.strftime("%b %Y"))
with k2:
    st.metric("Variación período", f"{var_pct:+.1f}%", f"{rango[0]}–{rango[1]}")
with k3:
    pico = df["empleo_registrado"].max()
    st.metric("Pico del período", f"{int(pico):,}", "máximo histórico")
with k4:
    ranking = df_todas.groupby("provincia")["empleo_registrado"].mean().sort_values(ascending=False)
    pos = list(ranking.index).index(provincia) + 1 if provincia in ranking.index else "N/D"
    st.metric("Ranking nacional", f"{pos}° de 24", "por empleo promedio")

st.divider()

# ── G1: Evolución mensual ─────────────────────────────────────────────────────
st.markdown("### Evolución mensual del empleo registrado")
fig1 = go.Figure()
fig1.add_trace(go.Scatter(
    x=df["fecha"], y=df["empleo_registrado"],
    line=dict(color=style.LINE_COLOR, width=2.5),
    fill="tozeroy", fillcolor=style.FILL_COLOR,
    mode="lines"
))
fig1.update_layout(height=300, margin=dict(l=0,r=0,t=10,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Puestos registrados", gridcolor="#F1F5F9"),
    xaxis=dict(gridcolor="#F1F5F9"), showlegend=False)
st.plotly_chart(fig1, use_container_width=True)

# ── G2: Ranking nacional ──────────────────────────────────────────────────────
st.markdown("### Ranking nacional — empleo promedio HyG")
ranking_df = df_todas.groupby("provincia")["empleo_registrado"].mean().sort_values(ascending=True).reset_index()
fig2 = go.Figure()
fig2.add_trace(go.Bar(
    x=ranking_df["empleo_registrado"], y=ranking_df["provincia"], orientation="h",
    marker_color=["#0891B2" if p == provincia else "#CBD5E1" for p in ranking_df["provincia"]],
    text=[f"{int(v):,}" for v in ranking_df["empleo_registrado"]], textposition="outside"
))
fig2.update_layout(height=600, margin=dict(l=0,r=80,t=10,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    xaxis=dict(title="Puestos promedio", gridcolor="#F1F5F9"), showlegend=False)
st.plotly_chart(fig2, use_container_width=True)

# ── G3: Variación 2019 vs último ─────────────────────────────────────────────
st.divider()
st.markdown("### Variación del empleo HyG por provincia — 2019 vs último dato")
df_2019 = df_raw[df_raw["anio"] == 2019].groupby("provincia")["empleo_registrado"].mean()
df_ult  = df_raw[df_raw["anio"] == df_raw["anio"].max()].groupby("provincia")["empleo_registrado"].mean()
comp = pd.DataFrame({"emp_2019": df_2019, "emp_ult": df_ult}).dropna()
comp["var_pct"] = ((comp["emp_ult"] / comp["emp_2019"]) - 1) * 100
comp = comp.sort_values("var_pct", ascending=True)

fig3 = go.Figure()
fig3.add_trace(go.Bar(
    x=comp["var_pct"], y=comp.index, orientation="h",
    marker_color=["#0891B2" if p == provincia else
                  style.BAR_COLOR if v >= 0 else style.BAR_COLOR_2
                  for p, v in zip(comp.index, comp["var_pct"])],
    text=[f"{v:+.0f}%" for v in comp["var_pct"]], textposition="outside"
))
fig3.add_vline(x=0, line_color="#0F172A", line_width=1)
fig3.update_layout(height=600, margin=dict(l=0,r=60,t=10,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    xaxis=dict(title="Variación %", gridcolor="#F1F5F9"), showlegend=False)
st.plotly_chart(fig3, use_container_width=True)

st.divider()
st.caption("Fuente: SIPA-AFIP / INDEC · Empleo asalariado registrado sector privado · Hotelería y Gastronomía · 1996–2025")
