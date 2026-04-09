import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import lecturas

st.set_page_config(page_title="Macro · Observatorio", page_icon="🌎", layout="wide")

@st.cache_data
def load():
    df = pd.read_csv("dashboard/data_macro.csv")
    df["fecha"] = pd.to_datetime(df["fecha"])
    return df

df_raw = load()

st.markdown("""
<h1 style='font-size:1.8rem;font-weight:900;color:#0F172A;margin-bottom:4px'>
🌎 Turismo en la Macro Argentina
</h1>
<p style='color:#94A3B8;font-size:0.85rem;margin-top:0'>
Receptivo · Emisivo · Balanza turística · Tipo de cambio · ETI + BCRA
</p>
""", unsafe_allow_html=True)

# ── FILTRO ────────────────────────────────────────────────────────────────────
df_raw["anio"] = df_raw["fecha"].dt.year
anio_min = int(df_raw["anio"].min())
anio_max = int(df_raw["anio"].max())
rango = st.slider("Período", anio_min, anio_max, (2019, anio_max))
df = df_raw[(df_raw["anio"] >= rango[0]) & (df_raw["anio"] <= rango[1])]
df_limpio = df[df["flag_covid"] == 0]

ultimo = df_limpio.sort_values("fecha").iloc[-1]

# ── LECTURA ───────────────────────────────────────────────────────────────────
lecturas.nacional(int(ultimo.saldo_balanza), ultimo.fecha.strftime("%b %Y"),
                  int(ultimo.receptivo_total), int(ultimo.emisivo_total))
st.divider()

# ── KPIs ─────────────────────────────────────────────────────────────────────
k1, k2, k3, k4 = st.columns(4)
with k1:
    st.metric("Receptivo último mes", f"{int(ultimo.receptivo_total):,}", ultimo.fecha.strftime("%b %Y"))
with k2:
    st.metric("Emisivo último mes", f"{int(ultimo.emisivo_total):,}", "argentinos al exterior")
with k3:
    st.metric("Saldo", f"{int(ultimo.saldo_balanza):,}", "déficit turístico")
with k4:
    st.metric("Tipo de cambio", f"${ultimo.tcn_usd:,.0f}", "ARS/USD oficial")

st.divider()

# ── G1: Receptivo vs Emisivo ──────────────────────────────────────────────────
st.markdown("### Receptivo vs. Emisivo — turistas por mes")
fig1 = go.Figure()
fig1.add_trace(go.Scatter(x=df_limpio["fecha"], y=df_limpio["receptivo_total"],
    name="Receptivo", line=dict(color="#059669", width=2),
    fill="tozeroy", fillcolor="rgba(5,150,105,0.07)"))
fig1.add_trace(go.Scatter(x=df_limpio["fecha"], y=df_limpio["emisivo_total"],
    name="Emisivo", line=dict(color="#DC2626", width=2),
    fill="tozeroy", fillcolor="rgba(220,38,38,0.07)"))
fig1.update_layout(height=320, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Turistas", gridcolor="#F1F5F9"),
    xaxis=dict(gridcolor="#F1F5F9"))
st.plotly_chart(fig1, use_container_width=True)

# ── G2: Saldo ─────────────────────────────────────────────────────────────────
st.markdown("### Saldo de la balanza turística")
fig2 = go.Figure()
fig2.add_trace(go.Bar(x=df_limpio["fecha"], y=df_limpio["saldo_balanza"],
    marker_color=["#059669" if v >= 0 else "#DC2626" for v in df_limpio["saldo_balanza"]]))
fig2.add_hline(y=0, line_color="#0F172A", line_width=1)
fig2.update_layout(height=280, margin=dict(l=0,r=0,t=10,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Saldo", gridcolor="#F1F5F9"),
    xaxis=dict(gridcolor="#F1F5F9"), showlegend=False)
st.plotly_chart(fig2, use_container_width=True)

# ── G3: TCN vs Receptivo ──────────────────────────────────────────────────────
st.markdown("### Tipo de cambio → Receptivo")
fig3 = go.Figure()
fig3.add_trace(go.Scatter(x=df_limpio["fecha"], y=df_limpio["receptivo_total"],
    name="Receptivo", line=dict(color="#0891B2", width=2)))
fig3.add_trace(go.Scatter(x=df_limpio["fecha"], y=df_limpio["tcn_usd"],
    name="TCN ARS/USD", line=dict(color="#D97706", width=2), yaxis="y2"))
fig3.update_layout(height=300, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Turistas receptivos", gridcolor="#F1F5F9"),
    yaxis2=dict(title="ARS/USD", overlaying="y", side="right", showgrid=False),
    xaxis=dict(gridcolor="#F1F5F9"))
st.plotly_chart(fig3, use_container_width=True)

st.divider()
st.caption("Fuentes: ETI (INDEC/SINTA) · BCRA · 2015–2026")
