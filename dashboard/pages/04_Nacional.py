import streamlit as st
import pandas as pd
import plotly.graph_objects as go

st.set_page_config(page_title="Macro · Observatorio", page_icon="🌎", layout="wide")

@st.cache_data
def load():
    df = pd.read_csv("dashboard/data_macro.csv")
    df["fecha"] = pd.to_datetime(df["fecha"])
    return df

df = load()
df_limpio = df[df["flag_covid"] == 0]

st.markdown("""
<h1 style='font-size:1.8rem;font-weight:900;color:#0F172A;margin-bottom:4px'>
🌎 Turismo en la Macro Argentina
</h1>
<p style='color:#94A3B8;font-size:0.85rem;margin-top:0'>
Receptivo · Emisivo · Balanza turística · Tipo de cambio · ETI + BCRA
</p>
""", unsafe_allow_html=True)

st.divider()

# ── KPIs ─────────────────────────────────────────────────────────────────────
ultimo = df_limpio.sort_values("fecha").iloc[-1]
anio_actual = df_limpio[df_limpio["anio"] == int(ultimo.anio)]
deficit_anual = anio_actual["saldo_balanza"].sum()

k1, k2, k3, k4 = st.columns(4)
with k1:
    st.metric("Receptivo último mes",
              f"{int(ultimo.receptivo_total):,}",
              f"turistas no residentes · {ultimo.fecha.strftime('%b %Y')}")
with k2:
    st.metric("Emisivo último mes",
              f"{int(ultimo.emisivo_total):,}",
              f"argentinos al exterior")
with k3:
    st.metric("Saldo último mes",
              f"{int(ultimo.saldo_balanza):,}",
              "déficit turístico")
with k4:
    st.metric("Tipo de cambio",
              f"${ultimo.tcn_usd:,.0f}",
              "ARS/USD oficial")

st.divider()

# ── G1: Receptivo vs Emisivo ──────────────────────────────────────────────────
st.markdown("### Receptivo vs. Emisivo — turistas por mes")

fig1 = go.Figure()
fig1.add_trace(go.Scatter(
    x=df_limpio["fecha"], y=df_limpio["receptivo_total"],
    name="Receptivo (extranjeros en AR)", line=dict(color="#059669", width=2),
    fill="tozeroy", fillcolor="rgba(5,150,105,0.07)"
))
fig1.add_trace(go.Scatter(
    x=df_limpio["fecha"], y=df_limpio["emisivo_total"],
    name="Emisivo (argentinos al exterior)", line=dict(color="#DC2626", width=2),
    fill="tozeroy", fillcolor="rgba(220,38,38,0.07)"
))
fig1.update_layout(
    height=320, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Turistas", gridcolor="#F1F5F9"),
    xaxis=dict(gridcolor="#F1F5F9")
)
st.plotly_chart(fig1, use_container_width=True)

# ── G2: Saldo balanza ─────────────────────────────────────────────────────────
st.markdown("### Saldo de la balanza turística")
st.caption("Negativo = Argentina importa más turismo del que exporta.")

colors = ["#059669" if v >= 0 else "#DC2626" for v in df_limpio["saldo_balanza"]]
fig2 = go.Figure()
fig2.add_trace(go.Bar(
    x=df_limpio["fecha"],
    y=df_limpio["saldo_balanza"],
    marker_color=colors,
    name="Saldo"
))
fig2.add_hline(y=0, line_color="#0F172A", line_width=1)
fig2.update_layout(
    height=280, margin=dict(l=0,r=0,t=10,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Saldo (turistas)", gridcolor="#F1F5F9"),
    xaxis=dict(gridcolor="#F1F5F9"),
    showlegend=False
)
st.plotly_chart(fig2, use_container_width=True)

# ── G3: Tipo de cambio vs Receptivo ───────────────────────────────────────────
st.markdown("### Tipo de cambio → Receptivo")
st.caption("Cuando el dólar sube, venir a Argentina es más barato para los extranjeros.")

fig3 = go.Figure()
fig3.add_trace(go.Scatter(
    x=df_limpio["fecha"], y=df_limpio["receptivo_total"],
    name="Receptivo", line=dict(color="#0891B2", width=2)
))
fig3.add_trace(go.Scatter(
    x=df_limpio["fecha"], y=df_limpio["tcn_usd"],
    name="TCN ARS/USD", line=dict(color="#D97706", width=2),
    yaxis="y2"
))
fig3.update_layout(
    height=300, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Turistas receptivos", gridcolor="#F1F5F9"),
    yaxis2=dict(title="ARS/USD", overlaying="y", side="right", showgrid=False),
    xaxis=dict(gridcolor="#F1F5F9")
)
st.plotly_chart(fig3, use_container_width=True)

st.divider()
st.markdown("""
**Lectura macro:**
- Argentina es **estructuralmente deficitaria** en turismo — el emisivo supera al receptivo en casi todos los meses.
- El tipo de cambio es la variable que más explica el ciclo turístico. Cuando el peso se aprecia en términos reales, el déficit crece.
- El turismo receptivo es una **exportación de servicios**. Cada turista extranjero que viene trae dólares.
""")
st.caption("Fuentes: ETI (INDEC/SINTA) · BCRA · Datos 2015–2026")
