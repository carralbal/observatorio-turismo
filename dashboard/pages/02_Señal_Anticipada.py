import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import lecturas
import style

st.set_page_config(page_title="Señal Anticipada · Observatorio", page_icon="🔮", layout="wide")

@st.cache_data
def load():
    df = pd.read_csv("dashboard/data_pulso.csv")
    df["fecha"] = pd.to_datetime(df["fecha"])
    return df[df["flag_covid"] == 0]

df_raw = load()
termas_raw = df_raw[df_raw["localidad"] == "Termas"].sort_values("fecha").copy()
termas_raw["mes"] = termas_raw["fecha"].dt.month
estacional = termas_raw.groupby("mes")["ibt_termas"].mean().reset_index()
estacional.columns = ["mes", "ibt_estacional"]
termas_raw = termas_raw.merge(estacional, on="mes", how="left")
termas_raw["anomalia"] = ((termas_raw["ibt_termas"] / termas_raw["ibt_estacional"]) - 1) * 100

style.aplicar_estilo()

st.markdown("""
<h1 style='font-size:1.8rem;font-weight:900;color:#0F172A;margin-bottom:4px'>
🔮 Señal Anticipada de Demanda
</h1>
<p style='color:#94A3B8;font-size:0.85rem;margin-top:0'>
Google Trends predice la ocupación hotelera 4–8 semanas antes · Termas de Río Hondo
</p>
""", unsafe_allow_html=True)

# ── FILTRO ────────────────────────────────────────────────────────────────────
anio_min = int(termas_raw["anio"].min())
anio_max = int(termas_raw["anio"].max())
rango = st.slider("Período", anio_min, anio_max, (2019, anio_max))
termas = termas_raw[(termas_raw["anio"] >= rango[0]) & (termas_raw["anio"] <= rango[1])]

ultimo = termas.iloc[-1]
anomalia_actual = ultimo["anomalia"]

# ── LECTURA ───────────────────────────────────────────────────────────────────
lecturas.senal_anticipada(int(ultimo["ibt_termas"]), anomalia_actual, ultimo["fecha"].strftime("%b %Y"))
st.divider()

# ── ALERTA ────────────────────────────────────────────────────────────────────
if anomalia_actual > 20:
    st.error(f"⚠️ **ALERTA ALTA** — La señal está {anomalia_actual:.0f}% sobre el promedio estacional.")
elif anomalia_actual > 5:
    st.warning(f"📈 **Señal ELEVADA** — {anomalia_actual:.0f}% sobre el promedio.")
elif anomalia_actual < -10:
    st.info(f"📉 **Señal BAJA** — {abs(anomalia_actual):.0f}% por debajo del promedio.")
else:
    st.success(f"✅ **Señal NORMAL** — En línea con el promedio ({anomalia_actual:+.0f}%).")

# ── KPIs ─────────────────────────────────────────────────────────────────────
k1, k2, k3, k4 = st.columns(4)
with k1:
    st.metric("IBT Termas", f"{int(ultimo['ibt_termas'])}/100", f"{anomalia_actual:+.0f}% vs. estacional")
with k2:
    st.metric("IBT MotoGP", f"{int(ultimo['ibt_motogp'])}/100", "interés en evento")
with k3:
    st.metric("IBT compuesto", f"{ultimo['ibt_compuesto']:.1f}/100", "índice combinado")
with k4:
    st.metric("Último dato", ultimo["fecha"].strftime("%b %Y"), "mensual")

st.divider()

# ── G1: IBT histórico ─────────────────────────────────────────────────────────
st.markdown("### Índice de Búsqueda Turística — histórico")
fig1 = go.Figure()
fig1.add_trace(go.Scatter(x=termas["fecha"], y=termas["ibt_estacional"],
    name="Promedio estacional", line=dict(color="#CBD5E1", width=1.5, dash="dash")))
fig1.add_trace(go.Scatter(x=termas["fecha"], y=termas["ibt_termas"],
    name="IBT Termas (real)", line=dict(color=style.LINE_COLOR, width=2),
    fill="tonexty", fillcolor=style.FILL_COLOR))
fig1.add_trace(go.Scatter(x=termas["fecha"], y=termas["ibt_motogp"],
    name="IBT MotoGP", line=dict(color=style.LINE_COLOR, width=1.5)))
fig1.update_layout(height=320, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Índice (0-100)", gridcolor="#F1F5F9"),
    xaxis=dict(gridcolor="#F1F5F9"))
st.plotly_chart(fig1, use_container_width=True)

# ── G2: Patrón estacional ─────────────────────────────────────────────────────
st.markdown("### Patrón estacional — IBT promedio por mes")
MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
est = estacional.sort_values("mes")
fig2 = go.Figure()
fig2.add_trace(go.Bar(
    x=[MESES[m-1] for m in est["mes"]], y=est["ibt_estacional"].round(1),
    marker_color=[style.LINE_COLOR if m in [3,4] else "#0891B2" if m in [5,6,7,8,9] else "#CBD5E1" for m in est["mes"]],
    text=est["ibt_estacional"].round(0).astype(int), textposition="outside"
))
fig2.update_layout(height=280, margin=dict(l=0,r=0,t=30,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="IBT promedio", gridcolor="#F1F5F9"), showlegend=False)
st.plotly_chart(fig2, use_container_width=True)

# ── G3: Anomalía ──────────────────────────────────────────────────────────────
st.markdown("### Anomalía estacional — últimos 24 meses")
ult24 = termas.tail(24)
fig3 = go.Figure()
fig3.add_trace(go.Bar(
    x=ult24["fecha"], y=ult24["anomalia"].round(1),
    marker_color=["#0891B2" if a >= 0 else "#94A3B8" for a in ult24["anomalia"]],
    text=[f"{v:+.0f}%" for v in ult24["anomalia"]], textposition="outside"
))
fig3.add_hline(y=20, line_dash="dash", line_color=style.BAR_COLOR_2, annotation_text="Umbral alerta (+20%)")
fig3.add_hline(y=0, line_color="#0F172A", line_width=1)
fig3.update_layout(height=280, margin=dict(l=0,r=0,t=30,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Anomalía (%)", gridcolor="#F1F5F9"),
    xaxis=dict(gridcolor="#F1F5F9"), showlegend=False)
st.plotly_chart(fig3, use_container_width=True)

st.divider()
st.caption("Fuente: Google Trends via pytrends · Datos mensuales · 2014–2025")
