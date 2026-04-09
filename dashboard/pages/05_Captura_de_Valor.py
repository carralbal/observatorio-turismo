import streamlit as st
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import lecturas
import pandas as pd
import plotly.graph_objects as go

st.set_page_config(page_title="Captura de Valor · Observatorio", page_icon="💸", layout="wide")

@st.cache_data
def load():
    df = pd.read_csv("dashboard/data_captura.csv")
    df["fecha"] = pd.to_datetime(df["fecha"])
    return df[df["flag_covid"] == 0]

df = load()
ultimo = df.sort_values("fecha").iloc[-1]

st.markdown("""
<h1 style='font-size:1.8rem;font-weight:900;color:#0F172A;margin-bottom:4px'>
💸 Captura de Valor · Santiago del Estero
</h1>
<p style='color:#94A3B8;font-size:0.85rem;margin-top:0'>
¿Cuánto del gasto potencial del turista se queda en la economía local? · Módulo de gestores
</p>
""", unsafe_allow_html=True)

st.warning("🔒 Módulo interno — datos de elaboración propia. Estimación N1. Con IIBB SDE (acuerdo N2) se convierte en dato exacto.")

st.divider()

# ── FILTRO DE FECHA ──────────────────────────────────────────────────────────
col_fecha, _ = st.columns([2,1])
with col_fecha:
    anio_min_f = int(df["anio"].min()) if "anio" in df.columns else 2019
    anio_max_f = int(df["anio"].max()) if "anio" in df.columns else 2025
    rango_f = st.slider("Período", anio_min_f, anio_max_f, (anio_min_f, anio_max_f), key="rango_captura")
df = df[(df["anio"] >= rango_f[0]) & (df["anio"] <= rango_f[1])]


# ── KPIs ─────────────────────────────────────────────────────────────────────
anual = df[df["anio"] == int(df["anio"].max())]
pot_anual  = anual["ingreso_potencial_usd"].sum()
cap_anual  = anual["ingreso_capturado_ars"].sum() / anual["tcn_usd"].mean()
fuga_anual = pot_anual - cap_anual

k1, k2, k3, k4 = st.columns(4)
with k1:
    st.metric("ICV estimado", "38%",
              "del gasto potencial queda en SDE")
with k2:
    st.metric("Ingreso potencial anual",
              f"USD {pot_anual/1e6:.1f}M",
              f"año {int(df['anio'].max())}")
with k3:
    st.metric("Ingreso capturado est.",
              f"USD {cap_anual/1e6:.1f}M",
              "proxy N1")
with k4:
    st.metric("Fuga estimada",
              f"USD {fuga_anual/1e6:.1f}M",
              "OTAs + cadenas externas")


# ── LECTURA DESTACADA ─────────────────────────────────────────────────────────
lecturas.captura(38.0, pot_anual, cap_anual, fuga_anual)

st.divider()

# ── G1: Potencial vs Capturado ────────────────────────────────────────────────
st.markdown("### Ingreso potencial vs. capturado — mensual (USD)")

df_sorted = df.sort_values("fecha")
fig1 = go.Figure()
fig1.add_trace(go.Bar(
    x=df_sorted["fecha"],
    y=df_sorted["ingreso_potencial_usd"],
    name="Ingreso potencial",
    marker_color="rgba(8,145,178,0.2)"
))
fig1.add_trace(go.Bar(
    x=df_sorted["fecha"],
    y=df_sorted["ingreso_potencial_usd"] * 0.38,
    name="Ingreso capturado (38%)",
    marker_color="#0891B2"
))
fig1.update_layout(
    barmode="overlay",
    height=300, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="USD", gridcolor="#F1F5F9"),
    xaxis=dict(gridcolor="#F1F5F9")
)
st.plotly_chart(fig1, use_container_width=True)

# ── G2: Estacionalidad ───────────────────────────────────────────────────────
st.markdown("### Estacionalidad del ingreso potencial — promedio por mes")

df["mes"] = df["fecha"].dt.month
mensual = df.groupby("mes")["ingreso_potencial_usd"].mean().reset_index()
MESES = {1:"Ene",2:"Feb",3:"Mar",4:"Abr",5:"May",6:"Jun",
         7:"Jul",8:"Ago",9:"Sep",10:"Oct",11:"Nov",12:"Dic"}
mensual["mes_label"] = mensual["mes"].map(MESES)

fig2 = go.Figure()
fig2.add_trace(go.Bar(
    x=mensual["mes_label"],
    y=mensual["ingreso_potencial_usd"],
    marker_color=["#0891B2" if m in [5,6,7,8,9] else
                  "#BE185D" if m in [3,4] else
                  "#CBD5E1" for m in mensual["mes"]],
    text=[f"USD {v/1000:.0f}K" for v in mensual["ingreso_potencial_usd"]],
    textposition="outside"
))
fig2.update_layout(
    height=280, margin=dict(l=0,r=0,t=30,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="USD promedio", gridcolor="#F1F5F9"),
    showlegend=False
)
st.plotly_chart(fig2, use_container_width=True)
st.caption("🔵 Temporada termal · 🌸 MotoGP · Gris = temporada baja")

# ── Cómo mejorar el ICV ───────────────────────────────────────────────────────
st.divider()
st.markdown("### Cómo mejorar el índice de captura")

col1, col2 = st.columns(2)
with col1:
    st.markdown("""
**Acciones de corto plazo:**
- Desarrollar oferta gastronómica local
- Promover comercio y artesanías locales
- Reducir dependencia de OTAs internacionales
- Fomentar alojamiento local vs. cadenas externas
""")
with col2:
    st.markdown("""
**Para medir con precisión:**
- Acuerdo N2 con DGR SDE → IIBB por rubro
- Con esos datos el ICV pasa de estimación a dato real
- Es el argumento para formalizar el acuerdo provincial
""")

st.divider()
st.caption("Estimación N1 basada en EOH (viajeros + estadía) × gasto proxy ($15.000 ARS/día). ICV 38% basado en literatura sectorial. Fuente exacta requiere IIBB provincial (N2).")
