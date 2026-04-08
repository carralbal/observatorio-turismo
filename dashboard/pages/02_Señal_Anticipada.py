import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from datetime import datetime

st.set_page_config(page_title="Señal Anticipada · Observatorio", page_icon="🔮", layout="wide")

@st.cache_data
def load():
    df = pd.read_csv("dashboard/data_pulso.csv")
    df["fecha"] = pd.to_datetime(df["fecha"])
    return df

df = load()
termas = df[df["localidad"] == "Termas"].sort_values("fecha").copy()

# Promedio estacional (mismo mes, años anteriores sin covid)
termas["mes"] = termas["fecha"].dt.month
estacional = termas[termas["flag_covid"] == 0].groupby("mes")["ibt_termas"].mean().reset_index()
estacional.columns = ["mes", "ibt_estacional"]
termas = termas.merge(estacional, on="mes", how="left")
termas["anomalia"] = ((termas["ibt_termas"] / termas["ibt_estacional"]) - 1) * 100

# Último dato
ultimo = termas.iloc[-1]
anomalia_actual = ultimo["anomalia"]

# ── HEADER ───────────────────────────────────────────────────────────────────
st.markdown("""
<h1 style='font-size:1.8rem;font-weight:900;color:#0F172A;margin-bottom:4px'>
🔮 Señal Anticipada de Demanda
</h1>
<p style='color:#94A3B8;font-size:0.85rem;margin-top:0'>
Google Trends predice la ocupación hotelera 4–8 semanas antes · Termas de Río Hondo
</p>
""", unsafe_allow_html=True)

st.divider()

# ── ALERTA ────────────────────────────────────────────────────────────────────
if anomalia_actual > 20:
    st.error(f"⚠️ **ALERTA ALTA** — La señal digital está {anomalia_actual:.0f}% sobre el promedio estacional. Se espera alta presión de ocupación en las próximas 4–8 semanas.")
elif anomalia_actual > 5:
    st.warning(f"📈 **Señal ELEVADA** — Las búsquedas están {anomalia_actual:.0f}% sobre el promedio. Demanda por encima de lo normal esperada.")
elif anomalia_actual < -10:
    st.info(f"📉 **Señal BAJA** — Las búsquedas están {abs(anomalia_actual):.0f}% por debajo del promedio. Semanas de baja ocupación esperadas.")
else:
    st.success(f"✅ **Señal NORMAL** — Las búsquedas están en línea con el promedio estacional ({anomalia_actual:+.0f}%).")

# ── KPIs ─────────────────────────────────────────────────────────────────────
k1, k2, k3, k4 = st.columns(4)
with k1:
    st.metric("IBT Termas actual",
              f"{int(ultimo['ibt_termas'])}/100",
              f"{anomalia_actual:+.0f}% vs. estacional")
with k2:
    st.metric("IBT MotoGP actual",
              f"{int(ultimo['ibt_motogp'])}/100",
              "interés en evento")
with k3:
    st.metric("IBT compuesto",
              f"{ultimo['ibt_compuesto']:.1f}/100",
              "índice combinado SDE")
with k4:
    st.metric("Último dato",
              ultimo["fecha"].strftime("%b %Y"),
              "Google Trends mensual")

st.divider()

# ── G1: IBT histórico con anomalías ──────────────────────────────────────────
st.markdown("### Índice de Búsqueda Turística (IBT) — histórico")

fig1 = go.Figure()
fig1.add_trace(go.Scatter(
    x=termas["fecha"], y=termas["ibt_estacional"],
    name="Promedio estacional", line=dict(color="#CBD5E1", width=1.5, dash="dash"),
    fill=None
))
fig1.add_trace(go.Scatter(
    x=termas["fecha"], y=termas["ibt_termas"],
    name="IBT Termas (real)", line=dict(color="#0891B2", width=2),
    fill="tonexty", fillcolor="rgba(8,145,178,0.08)"
))
fig1.add_trace(go.Scatter(
    x=termas["fecha"], y=termas["ibt_motogp"],
    name="IBT MotoGP", line=dict(color="#BE185D", width=1.5),
))
fig1.update_layout(
    height=320, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Índice (0-100)", gridcolor="#F1F5F9"),
    xaxis=dict(gridcolor="#F1F5F9")
)
st.plotly_chart(fig1, use_container_width=True)

# ── G2: Patrón estacional mensual ────────────────────────────────────────────
st.markdown("### Patrón estacional — IBT promedio por mes")
st.caption("Cuándo busca la gente 'Termas de Río Hondo' a lo largo del año.")

MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
estacional_sorted = estacional.sort_values("mes")

fig2 = go.Figure()
fig2.add_trace(go.Bar(
    x=[MESES[m-1] for m in estacional_sorted["mes"]],
    y=estacional_sorted["ibt_estacional"].round(1),
    marker_color=["#BE185D" if m in [3,4] else
                  "#0891B2" if m in [5,6,7,8,9] else
                  "#CBD5E1" for m in estacional_sorted["mes"]],
    text=estacional_sorted["ibt_estacional"].round(0).astype(int),
    textposition="outside"
))
fig2.update_layout(
    height=280, margin=dict(l=0,r=0,t=30,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="IBT promedio", gridcolor="#F1F5F9"),
    showlegend=False
)
st.plotly_chart(fig2, use_container_width=True)
st.caption("🔵 Azul = temporada termal (May–Sep) · Rosa = MotoGP (Mar–Abr) · Gris = temporada baja")

# ── G3: Anomalía estacional ───────────────────────────────────────────────────
st.markdown("### Anomalía estacional — últimos 24 meses")
st.caption("Cuánto está la demanda actual por encima o debajo del promedio histórico del mismo mes.")

ultimos24 = termas.sort_values("fecha").tail(24)
colors = ["#0891B2" if a >= 0 else "#94A3B8" for a in ultimos24["anomalia"]]

fig3 = go.Figure()
fig3.add_trace(go.Bar(
    x=ultimos24["fecha"],
    y=ultimos24["anomalia"].round(1),
    marker_color=colors,
    text=[f"{v:+.0f}%" for v in ultimos24["anomalia"]],
    textposition="outside"
))
fig3.add_hline(y=20, line_dash="dash", line_color="#DC2626",
               annotation_text="Umbral alerta (+20%)", annotation_position="top right")
fig3.add_hline(y=0, line_color="#0F172A", line_width=1)
fig3.update_layout(
    height=280, margin=dict(l=0,r=0,t=30,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Anomalía (%)", gridcolor="#F1F5F9"),
    xaxis=dict(gridcolor="#F1F5F9"),
    showlegend=False
)
st.plotly_chart(fig3, use_container_width=True)

st.divider()
st.markdown("""
**¿Cómo leer este indicador?**
- **IBT > promedio estacional +20%** → Alta presión de ocupación esperada en 4–8 semanas. Activar comunicación y verificar disponibilidad.
- **IBT en línea con estacional** → Temporada normal. Sin acción requerida.
- **IBT < promedio estacional −10%** → Temporada baja. Oportunidad para activar promociones de corto plazo.

El IBT (Índice de Búsqueda Turística) combina búsquedas de "Termas de Río Hondo" (50%), "Santiago del Estero turismo" (30%) y "MotoGP Argentina" (20%) en Google Trends.
""")
st.caption("Fuente: Google Trends via pytrends · Datos mensuales · 2014–2025")
