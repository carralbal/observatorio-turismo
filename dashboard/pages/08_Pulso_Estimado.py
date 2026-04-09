import streamlit as st
import pandas as pd
import plotly.graph_objects as go

st.set_page_config(page_title="Pulso Estimado · Observatorio", page_icon="🔬", layout="wide")

@st.cache_data
def load_estimado():
    df = pd.read_csv("dashboard/data_pulso_estimado.csv")
    df["fecha"] = pd.to_datetime(df["fecha"])
    return df

@st.cache_data
def load_informal():
    df = pd.read_csv("dashboard/data_airdna_sde.csv")
    df["fecha"] = pd.to_datetime(df["fecha"])
    return df

df       = load_estimado()
df_inf   = load_informal()
termas   = df[df["localidad"] == "Termas"].sort_values("fecha")
capital  = df[df["localidad"] == "Santiago del Estero"].sort_values("fecha")
t_inf    = df_inf[df_inf["mercado"] == "Termas de Rio Hondo"].sort_values("fecha")
c_inf    = df_inf[df_inf["mercado"] == "Santiago del Estero"].sort_values("fecha")

st.markdown("""
<h1 style='font-size:1.8rem;font-weight:900;color:#0F172A;margin-bottom:4px'>
🔬 Pulso SDE — Serie Extendida con Estimación
</h1>
<p style='color:#94A3B8;font-size:0.85rem;margin-top:0'>
EOH real hasta nov 2025 · Estimación dic 2025 → presente · Intervalo de confianza 80%
</p>
""", unsafe_allow_html=True)

st.info("Los meses con **línea punteada y banda gris** son estimaciones basadas en el mercado de alquiler temporario y búsquedas digitales. No reemplazan la EOH — la extienden mientras INDEC no la reanude.")

st.divider()

# ── FILTRO DE FECHA ──────────────────────────────────────────────────────────
col_fecha, _ = st.columns([2,1])
with col_fecha:
    if "anio" not in df.columns: df["anio"] = df["fecha"].dt.year
    anio_min_f = int(df["anio"].min())
    anio_max_f = int(df["anio"].max()) if "anio" in df.columns else 2025
    rango_f = st.slider("Período", anio_min_f, anio_max_f, (anio_min_f, anio_max_f), key="rango_estimado")
df = df[(df["anio"] >= rango_f[0]) & (df["anio"] <= rango_f[1])]


# ── KPIs ─────────────────────────────────────────────────────────────────────
ultimo_t = termas.iloc[-1]
ultimo_c = capital.iloc[-1]
meses_est = df[df["flag_estimado"] == 1]["fecha"].nunique()

k1, k2, k3, k4 = st.columns(4)
with k1:
    icon = "🔬" if ultimo_t.flag_estimado else "✅"
    st.metric(f"Viajeros Termas {icon}",
              f"{int(ultimo_t.viajeros):,}",
              ultimo_t.fecha.strftime("%b %Y"))
with k2:
    icon = "🔬" if ultimo_c.flag_estimado else "✅"
    st.metric(f"Viajeros Capital {icon}",
              f"{int(ultimo_c.viajeros):,}",
              ultimo_c.fecha.strftime("%b %Y"))
with k3:
    st.metric("Meses estimados", f"{meses_est}", "sin EOH oficial")
with k4:
    st.metric("Intervalo de confianza", "±20%", "sobre estimación")

st.divider()

# ── G1: Termas ────────────────────────────────────────────────────────────────
st.markdown("### Termas de Río Hondo — viajeros hospedados")

t_real = termas[termas["flag_estimado"] == 0]
t_est  = termas[termas["flag_estimado"] == 1]

fig1 = go.Figure()
fig1.add_trace(go.Scatter(
    x=pd.concat([t_est["fecha"], t_est["fecha"][::-1]]),
    y=pd.concat([t_est["viajeros_ic_high"], t_est["viajeros_ic_low"][::-1]]),
    fill="toself", fillcolor="rgba(148,163,184,0.15)",
    line=dict(color="rgba(0,0,0,0)"),
    name="Rango estimado", showlegend=True
))
fig1.add_trace(go.Scatter(
    x=t_real["fecha"], y=t_real["viajeros"],
    name="Dato real (EOH)", line=dict(color="#0891B2", width=2.5)
))
fig1.add_trace(go.Scatter(
    x=t_est["fecha"], y=t_est["viajeros"],
    name="Estimación", line=dict(color="#0891B2", width=2.5, dash="dash"),
    mode="lines+markers", marker=dict(symbol="diamond", size=8)
))
fig1.update_layout(
    height=320, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Viajeros", gridcolor="#F1F5F9"),
    xaxis=dict(gridcolor="#F1F5F9")
)
st.plotly_chart(fig1, use_container_width=True)

# ── G2: Capital ───────────────────────────────────────────────────────────────
st.markdown("### Santiago del Estero Capital — viajeros hospedados")

c_real = capital[capital["flag_estimado"] == 0]
c_est  = capital[capital["flag_estimado"] == 1]

fig2 = go.Figure()
fig2.add_trace(go.Scatter(
    x=pd.concat([c_est["fecha"], c_est["fecha"][::-1]]),
    y=pd.concat([c_est["viajeros_ic_high"], c_est["viajeros_ic_low"][::-1]]),
    fill="toself", fillcolor="rgba(148,163,184,0.15)",
    line=dict(color="rgba(0,0,0,0)"),
    name="Rango estimado", showlegend=True
))
fig2.add_trace(go.Scatter(
    x=c_real["fecha"], y=c_real["viajeros"],
    name="Dato real (EOH)", line=dict(color="#0E7490", width=2.5)
))
fig2.add_trace(go.Scatter(
    x=c_est["fecha"], y=c_est["viajeros"],
    name="Estimación", line=dict(color="#0E7490", width=2.5, dash="dash"),
    mode="lines+markers", marker=dict(symbol="diamond", size=8)
))
fig2.update_layout(
    height=300, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Viajeros", gridcolor="#F1F5F9"),
    xaxis=dict(gridcolor="#F1F5F9")
)
st.plotly_chart(fig2, use_container_width=True)

# ── G3: Ocupación sector informal ─────────────────────────────────────────────
st.divider()
st.markdown("### Ocupación del sector de alquiler temporario")
st.caption("Plataformas digitales de alojamiento · Serie 2021–2026 · Termas vs. Capital")

fig3 = go.Figure()
fig3.add_trace(go.Scatter(
    x=t_inf["fecha"], y=t_inf["occ_informal_pct"],
    name="Termas", line=dict(color="#0891B2", width=2),
    mode="lines+markers", marker=dict(size=5)
))
fig3.add_trace(go.Scatter(
    x=c_inf["fecha"], y=c_inf["occ_informal_pct"],
    name="Capital", line=dict(color="#0E7490", width=2),
    mode="lines+markers", marker=dict(size=5)
))
fig3.update_layout(
    height=280, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Ocupación (%)", gridcolor="#F1F5F9", range=[0, 100]),
    xaxis=dict(gridcolor="#F1F5F9")
)
st.plotly_chart(fig3, use_container_width=True)

# ── G4: Estadía informal ──────────────────────────────────────────────────────
st.markdown("### Estadía promedio — sector de alquiler temporario")

fig4 = go.Figure()
fig4.add_trace(go.Scatter(
    x=t_inf["fecha"], y=t_inf["estadia_informal"],
    name="Termas", line=dict(color="#0891B2", width=2)
))
fig4.add_trace(go.Scatter(
    x=c_inf["fecha"], y=c_inf["estadia_informal"],
    name="Capital", line=dict(color="#0E7490", width=2)
))
fig4.update_layout(
    height=250, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Noches promedio", gridcolor="#F1F5F9"),
    xaxis=dict(gridcolor="#F1F5F9")
)
st.plotly_chart(fig4, use_container_width=True)

st.divider()
st.markdown("""
**Nota metodológica:**
- **Dato real (EOH):** Encuesta de Ocupación Hotelera INDEC/SINTA — establecimientos con más de 12 plazas.
  Disponible hasta noviembre 2025. Suspendida por decisión de la Secretaría de Turismo.
- **Estimación:** modelo basado en ocupación del mercado de alquiler temporario (plataformas digitales),
  índice de búsquedas turísticas (Google Trends), tipo de cambio (BCRA) e IPC hotelero (INDEC).
- **Sector de alquiler temporario:** datos de plataformas digitales de alojamiento, 2021-2026.
  Complementa la EOH — mide el sector no relevado por la encuesta formal.
""")
st.caption("Fuentes: EOH INDEC/SINTA · Plataformas de alquiler temporario · Google Trends · BCRA · IPC INDEC")
