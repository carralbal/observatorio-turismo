import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import lecturas

st.set_page_config(page_title="Captura de Valor · Observatorio", page_icon="💰", layout="wide")

@st.cache_data
def load():
    df = pd.read_csv("dashboard/data_captura.csv")
    df["fecha"] = pd.to_datetime(df["fecha"])
    return df

df_raw = load()

st.markdown("""
<h1 style='font-size:1.8rem;font-weight:900;color:#0F172A;margin-bottom:4px'>
💰 Captura de Valor Turístico
</h1>
<p style='color:#94A3B8;font-size:0.85rem;margin-top:0'>
¿Cuánto del gasto turístico queda en la economía local de SDE?
</p>
""", unsafe_allow_html=True)

# ── FILTRO ────────────────────────────────────────────────────────────────────
df_raw["anio"] = df_raw["fecha"].dt.year
anio_min = int(df_raw["anio"].min())
anio_max = int(df_raw["anio"].max())
rango = st.slider("Período", anio_min, anio_max, (anio_min, anio_max))
df = df_raw[(df_raw["anio"] >= rango[0]) & (df_raw["anio"] <= rango[1])]

pot_anual  = df["ingreso_potencial_usd"].sum()
cap_anual  = df["ingreso_capturado_usd"].sum()
fuga_anual = pot_anual - cap_anual
icv        = round(cap_anual / pot_anual * 100, 1) if pot_anual > 0 else 38.0

# ── LECTURA ───────────────────────────────────────────────────────────────────
lecturas.captura(icv, pot_anual, cap_anual, fuga_anual)
st.divider()

# ── KPIs ─────────────────────────────────────────────────────────────────────
k1, k2, k3, k4 = st.columns(4)
with k1:
    st.metric("Índice de Captura de Valor", f"{icv:.0f}%", "de cada USD 100 gastados")
with k2:
    st.metric("Ingreso potencial", f"USD {pot_anual/1e6:.1f}M", "período seleccionado")
with k3:
    st.metric("Ingreso capturado", f"USD {cap_anual/1e6:.1f}M", "sector formal registrado")
with k4:
    st.metric("Fuga estimada", f"USD {fuga_anual/1e6:.1f}M", "OTAs + informal + externo")

st.divider()

# ── G1: Potencial vs Capturado ────────────────────────────────────────────────
st.markdown("### Ingreso potencial vs. capturado — mensual")
fig1 = go.Figure()
fig1.add_trace(go.Bar(x=df["fecha"], y=df["ingreso_potencial_usd"],
    name="Potencial", marker_color="#CBD5E1"))
fig1.add_trace(go.Bar(x=df["fecha"], y=df["ingreso_capturado_usd"],
    name="Capturado", marker_color="#0891B2"))
fig1.update_layout(height=320, margin=dict(l=0,r=0,t=10,b=0), barmode="overlay",
    legend=dict(orientation="h", y=1.1),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="USD", gridcolor="#F1F5F9"),
    xaxis=dict(gridcolor="#F1F5F9"))
st.plotly_chart(fig1, use_container_width=True)

# ── G2: ICV mensual ───────────────────────────────────────────────────────────
st.markdown("### Índice de Captura de Valor — evolución mensual")
fig2 = go.Figure()
fig2.add_trace(go.Scatter(x=df["fecha"], y=df["icv_pct"],
    line=dict(color="#0891B2", width=2.5),
    fill="tozeroy", fillcolor="rgba(8,145,178,0.08)"))
fig2.add_hline(y=52, line_dash="dash", line_color="#94A3B8",
    annotation_text="Tucumán (52%)")
fig2.add_hline(y=38, line_dash="dot", line_color="#0891B2",
    annotation_text="SDE (38%)")
fig2.update_layout(height=280, margin=dict(l=0,r=0,t=10,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="ICV (%)", gridcolor="#F1F5F9", range=[0,100]),
    xaxis=dict(gridcolor="#F1F5F9"), showlegend=False)
st.plotly_chart(fig2, use_container_width=True)

st.divider()
st.caption("Fuentes: EOH · EVyTH · BCRA · Estimación propia ICV")
