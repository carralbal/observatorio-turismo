import streamlit as st
import duckdb
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from pathlib import Path

st.set_page_config(
    page_title="Observatorio de Turismo · Argentina",
    page_icon="🌎",
    layout="wide"
)

WAREHOUSE = Path(__file__).parent.parent / "warehouse" / "observatorio.duckdb"

@st.cache_data(ttl=3600)
def load_pulso():
    con = duckdb.connect(str(WAREHOUSE), read_only=True)
    df = con.execute("""
        SELECT * FROM mart_sde_pulso
        WHERE flag_covid = 0
        ORDER BY fecha, localidad
    """).df()
    con.close()
    df["fecha"] = pd.to_datetime(df["fecha"])
    return df

df = load_pulso()
termas = df[df["localidad"] == "Termas"]
capital = df[df["localidad"] == "Santiago del Estero"]

# ── HEADER ────────────────────────────────────────────────────────────────────
st.markdown("""
<h1 style='font-size:1.8rem;font-weight:900;color:#0F172A;margin-bottom:4px'>
Observatorio de Turismo · Santiago del Estero
</h1>
<p style='color:#94A3B8;font-size:0.85rem;margin-top:0'>
Termas de Río Hondo · Santiago del Estero capital · Datos reales EOH + Google Trends + BCRA
</p>
""", unsafe_allow_html=True)

st.divider()

# ── SELECTOR ─────────────────────────────────────────────────────────────────
col_sel1, col_sel2 = st.columns([2, 1])
with col_sel1:
    destino = st.radio(
        "Destino",
        ["Ambos", "Termas de Río Hondo", "Santiago del Estero capital"],
        horizontal=True
    )
with col_sel2:
    anio_min, anio_max = int(df["anio"].min()), int(df["anio"].max())
    rango = st.slider("Período", anio_min, anio_max, (2019, anio_max))

# Filtrar
mask_anio = (df["anio"] >= rango[0]) & (df["anio"] <= rango[1])
df_f = df[mask_anio]
termas_f  = df_f[df_f["localidad"] == "Termas"]
capital_f = df_f[df_f["localidad"] == "Santiago del Estero"]

ultimo_termas  = termas_f.sort_values("fecha").iloc[-1]
ultimo_capital = capital_f.sort_values("fecha").iloc[-1]

# ── KPIs ──────────────────────────────────────────────────────────────────────
st.markdown("### Último mes disponible")
k1, k2, k3, k4 = st.columns(4)

with k1:
    st.metric(
        "Viajeros · Termas",
        f"{int(ultimo_termas.viajeros_total):,}",
        f"Estadía: {ultimo_termas.estadia_promedio:.1f} noches"
    )
with k2:
    st.metric(
        "Viajeros · Capital",
        f"{int(ultimo_capital.viajeros_total):,}",
        f"Estadía: {ultimo_capital.estadia_promedio:.1f} noches"
    )
with k3:
    ibt = ultimo_termas.ibt_termas
    st.metric(
        "IBT Termas (Google Trends)",
        f"{int(ibt)}/100",
        "señal anticipada de demanda"
    )
with k4:
    st.metric(
        "Tipo de cambio",
        f"${ultimo_termas.tcn_usd:,.0f} ARS/USD",
        f"{ultimo_termas.fecha.strftime('%b %Y')}"
    )

st.divider()

# ── GRÁFICO 1 — Viajeros por destino ─────────────────────────────────────────
st.markdown("### Viajeros hospedados por destino")

fig1 = go.Figure()
fig1.add_trace(go.Scatter(
    x=termas_f["fecha"], y=termas_f["viajeros_total"],
    name="Termas de Río Hondo", line=dict(color="#0891B2", width=2),
    fill="tozeroy", fillcolor="rgba(8,145,178,0.08)"
))
fig1.add_trace(go.Scatter(
    x=capital_f["fecha"], y=capital_f["viajeros_total"],
    name="Santiago del Estero capital", line=dict(color="#94A3B8", width=2),
))
fig1.update_layout(
    height=300, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1),
    yaxis_title="Viajeros", xaxis_title=None,
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(gridcolor="#F1F5F9"),
    xaxis=dict(gridcolor="#F1F5F9"),
)
st.plotly_chart(fig1, use_container_width=True)

# ── GRÁFICO 2 — IBT vs Viajeros ──────────────────────────────────────────────
st.markdown("### Señal anticipada (Google Trends) vs. ocupación real")

fig2 = go.Figure()
fig2.add_trace(go.Bar(
    x=termas_f["fecha"], y=termas_f["ibt_termas"],
    name="IBT Termas (Trends)", marker_color="rgba(8,145,178,0.2)",
    yaxis="y2"
))
fig2.add_trace(go.Scatter(
    x=termas_f["fecha"], y=termas_f["viajeros_total"],
    name="Viajeros Termas (EOH)", line=dict(color="#0891B2", width=2),
))
fig2.update_layout(
    height=300, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Viajeros", gridcolor="#F1F5F9"),
    yaxis2=dict(title="IBT (0-100)", overlaying="y", side="right", showgrid=False),
    xaxis=dict(gridcolor="#F1F5F9"),
)
st.plotly_chart(fig2, use_container_width=True)

# ── GRÁFICO 3 — Estadía comparada ────────────────────────────────────────────
st.markdown("### Estadía promedio — Termas vs. Capital")

fig3 = go.Figure()
fig3.add_trace(go.Scatter(
    x=termas_f["fecha"], y=termas_f["estadia_promedio"],
    name="Termas", line=dict(color="#0891B2", width=2)
))
fig3.add_trace(go.Scatter(
    x=capital_f["fecha"], y=capital_f["estadia_promedio"],
    name="Capital", line=dict(color="#94A3B8", width=2)
))
fig3.update_layout(
    height=250, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1),
    yaxis_title="Noches promedio", xaxis_title=None,
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(gridcolor="#F1F5F9"),
    xaxis=dict(gridcolor="#F1F5F9"),
)
st.plotly_chart(fig3, use_container_width=True)

# ── FOOTER ────────────────────────────────────────────────────────────────────
st.divider()
st.caption(
    f"Fuentes: EOH (INDEC/SINTA) · Google Trends · BCRA · "
    f"Datos actualizados al {df['fecha'].max().strftime('%B %Y')} · "
    f"{len(df):,} registros en warehouse"
)
