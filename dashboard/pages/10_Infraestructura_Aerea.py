import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import lecturas

st.set_page_config(page_title="Infraestructura Aérea · Observatorio", page_icon="✈️", layout="wide")

@st.cache_data
def load():
    df = pd.read_csv("dashboard/data_aereo.csv")
    df["fecha"] = pd.to_datetime(df["fecha"])
    df["anio"] = df["fecha"].dt.year
    return df

df_raw = load()

# ── HEADER ────────────────────────────────────────────────────────────────────
st.markdown("""
<h1 style='font-size:1.8rem;font-weight:900;color:#0F172A;margin-bottom:4px'>
✈️ Infraestructura Aérea
</h1>
<p style='color:#94A3B8;font-size:0.85rem;margin-top:0'>
Pasajeros · Vuelos · Asientos · Load Factor · Aerolíneas · Rutas · 2017–2026
</p>
""", unsafe_allow_html=True)

# ── FILTROS ───────────────────────────────────────────────────────────────────
col1, col2, col3, col4 = st.columns(4)

with col1:
    provincias = sorted(df_raw["origen_provincia"].dropna().unique().tolist())
    provincia = st.selectbox("Provincia", provincias,
                             index=provincias.index("Santiago del Estero") if "Santiago del Estero" in provincias else 0)

with col2:
    tipos = ["Todos"] + sorted(df_raw["clasificacion_vuelo"].dropna().unique().tolist())
    tipo_vuelo = st.selectbox("Tipo de vuelo", tipos)

with col3:
    aerolineas = ["Todas"] + sorted(df_raw["aerolinea"].dropna().unique().tolist())
    aerolinea = st.selectbox("Aerolínea", aerolineas)

with col4:
    anio_min = int(df_raw["anio"].min())
    anio_max = int(df_raw["anio"].max())
    rango = st.slider("Período", anio_min, anio_max, (2019, anio_max))

# ── FILTRAR ───────────────────────────────────────────────────────────────────
mask = (
    ((df_raw["origen_provincia"] == provincia) | (df_raw["destino_provincia"] == provincia)) &
    (df_raw["anio"] >= rango[0]) & (df_raw["anio"] <= rango[1])
)
if tipo_vuelo != "Todos":
    mask &= df_raw["clasificacion_vuelo"] == tipo_vuelo
if aerolinea != "Todas":
    mask &= df_raw["aerolinea"] == aerolinea

df = df_raw[mask].copy()

if len(df) == 0:
    st.warning("Sin datos para los filtros seleccionados.")
    st.stop()

# ── LECTURA ───────────────────────────────────────────────────────────────────
total_pax    = int(df["pasajeros"].sum())
total_vuelos = int(df["vuelos"].sum())
lf_prom      = round(df["pasajeros"].sum() / df["asientos"].sum() * 100, 1) if df["asientos"].sum() > 0 else 0
aerolinea_top = df.groupby("aerolinea")["pasajeros"].sum().idxmax()
ruta_top = df.groupby("ruta_provincia")["pasajeros"].sum().idxmax()

st.markdown(f"""
<div style='background:#F0F9FF;border-left:4px solid #0891B2;padding:16px 20px;border-radius:6px;margin:12px 0'>
<p style='font-size:1.25rem;font-weight:800;color:#0F172A;margin:0 0 10px 0'>
✈️ Conectividad aérea de {provincia}
</p>
<p style='color:#1E293B;margin:0;font-size:1.05rem;line-height:1.6'>
Entre {rango[0]} y {rango[1]}, <strong>{provincia}</strong> movilizó
<strong>{total_pax:,} pasajeros</strong> en <strong>{total_vuelos:,} vuelos</strong>.
El load factor promedio fue <strong>{lf_prom}%</strong> — vuelos con alta ocupación indican
rutas con demanda no satisfecha o tarifas elevadas.
<strong>{aerolinea_top}</strong> es la aerolínea dominante y la ruta más transitada es
<strong>{ruta_top}</strong>.
</p>
</div>
""", unsafe_allow_html=True)

st.divider()

# ── KPIs ─────────────────────────────────────────────────────────────────────
k1, k2, k3, k4, k5 = st.columns(5)
with k1:
    st.metric("Pasajeros totales", f"{total_pax:,}", f"{rango[0]}–{rango[1]}")
with k2:
    st.metric("Vuelos", f"{total_vuelos:,}", "operados")
with k3:
    st.metric("Load factor prom.", f"{lf_prom}%", "ocupación promedio")
with k4:
    asientos = int(df["asientos"].sum())
    st.metric("Asientos ofrecidos", f"{asientos:,}", "capacidad total")
with k5:
    rutas = df["ruta_provincia"].nunique()
    st.metric("Rutas activas", f"{rutas}", "pares origen-destino")

st.divider()

# ── G1: Pasajeros mensuales ───────────────────────────────────────────────────
st.markdown("### Pasajeros por mes")
mensual = df.groupby("fecha").agg(
    pasajeros=("pasajeros","sum"),
    asientos=("asientos","sum"),
    vuelos=("vuelos","sum")
).reset_index()
mensual["load_factor"] = (mensual["pasajeros"] / mensual["asientos"] * 100).round(1)

fig1 = go.Figure()
fig1.add_trace(go.Bar(x=mensual["fecha"], y=mensual["pasajeros"],
    name="Pasajeros", marker_color="#0891B2"))
fig1.add_trace(go.Scatter(x=mensual["fecha"], y=mensual["load_factor"],
    name="Load factor %", line=dict(color="#D97706", width=2),
    yaxis="y2", mode="lines"))
fig1.update_layout(height=320, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Pasajeros", gridcolor="#F1F5F9"),
    yaxis2=dict(title="Load factor (%)", overlaying="y", side="right",
                showgrid=False, range=[0,100]),
    xaxis=dict(gridcolor="#F1F5F9"))
st.plotly_chart(fig1, use_container_width=True)

# ── G2: Aerolíneas ────────────────────────────────────────────────────────────
col1, col2 = st.columns(2)

with col1:
    st.markdown("### Pasajeros por aerolínea")
    aer = df.groupby("aerolinea")["pasajeros"].sum().sort_values(ascending=True).reset_index()
    fig2 = go.Figure()
    fig2.add_trace(go.Bar(
        x=aer["pasajeros"], y=aer["aerolinea"], orientation="h",
        marker_color=["#0891B2" if a == aerolinea_top else "#CBD5E1" for a in aer["aerolinea"]],
        text=[f"{int(v):,}" for v in aer["pasajeros"]], textposition="outside"
    ))
    fig2.update_layout(height=300, margin=dict(l=0,r=80,t=10,b=0),
        plot_bgcolor="white", paper_bgcolor="white",
        xaxis=dict(title="Pasajeros", gridcolor="#F1F5F9"), showlegend=False)
    st.plotly_chart(fig2, use_container_width=True)

with col2:
    st.markdown("### Load factor por aerolínea")
    lf_aer = df.groupby("aerolinea").apply(
        lambda x: round(x["pasajeros"].sum() / x["asientos"].sum() * 100, 1)
        if x["asientos"].sum() > 0 else 0
    ).sort_values(ascending=True).reset_index()
    lf_aer.columns = ["aerolinea","load_factor"]
    fig3 = go.Figure()
    fig3.add_trace(go.Bar(
        x=lf_aer["load_factor"], y=lf_aer["aerolinea"], orientation="h",
        marker_color=["#0891B2" if lf >= 85 else "#94A3B8" if lf >= 75 else "#CBD5E1"
                      for lf in lf_aer["load_factor"]],
        text=[f"{v}%" for v in lf_aer["load_factor"]], textposition="outside"
    ))
    fig3.add_vline(x=80, line_dash="dash", line_color="#94A3B8",
                   annotation_text="80% umbral")
    fig3.update_layout(height=300, margin=dict(l=0,r=60,t=10,b=0),
        plot_bgcolor="white", paper_bgcolor="white",
        xaxis=dict(title="Load factor (%)", gridcolor="#F1F5F9", range=[0,105]),
        showlegend=False)
    st.plotly_chart(fig3, use_container_width=True)

# ── G3: Rutas ─────────────────────────────────────────────────────────────────
st.markdown("### Rutas — pasajeros por par origen-destino")
rutas_df = df.groupby("ruta_provincia").agg(
    pasajeros=("pasajeros","sum"),
    vuelos=("vuelos","sum"),
    load_factor=("load_factor_pct","mean")
).sort_values("pasajeros", ascending=True).tail(15).reset_index()

fig4 = go.Figure()
fig4.add_trace(go.Bar(
    x=rutas_df["pasajeros"], y=rutas_df["ruta_provincia"], orientation="h",
    marker_color=["#0891B2" if r == ruta_top else "#CBD5E1" for r in rutas_df["ruta_provincia"]],
    text=[f"{int(v):,}" for v in rutas_df["pasajeros"]], textposition="outside"
))
fig4.update_layout(height=400, margin=dict(l=0,r=80,t=10,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    xaxis=dict(title="Pasajeros", gridcolor="#F1F5F9"), showlegend=False)
st.plotly_chart(fig4, use_container_width=True)

# ── G4: Cabotaje vs Internacional ─────────────────────────────────────────────
st.divider()
st.markdown("### Cabotaje vs. Internacional")
tipo_anual = df.groupby(["anio","clasificacion_vuelo"])["pasajeros"].sum().reset_index()
fig5 = go.Figure()
for tipo, color in [("Cabotaje","#0891B2"),("Internacional","#0E7490")]:
    d = tipo_anual[tipo_anual["clasificacion_vuelo"] == tipo]
    if len(d) > 0:
        fig5.add_trace(go.Bar(x=d["anio"], y=d["pasajeros"],
            name=tipo, marker_color=color))
fig5.update_layout(height=280, margin=dict(l=0,r=0,t=10,b=0), barmode="group",
    legend=dict(orientation="h", y=1.1),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Pasajeros", gridcolor="#F1F5F9"),
    xaxis=dict(dtick=1))
st.plotly_chart(fig5, use_container_width=True)

# ── G5: Aeropuertos ───────────────────────────────────────────────────────────
st.divider()
st.markdown("### Aeropuertos de la provincia")
aer_df = pd.concat([
    df[df["origen_provincia"]==provincia][["origen_oaci","origen_aeropuerto","pasajeros"]].rename(
        columns={"origen_oaci":"oaci","origen_aeropuerto":"aeropuerto"}),
    df[df["destino_provincia"]==provincia][["destino_oaci","destino_aeropuerto","pasajeros"]].rename(
        columns={"destino_oaci":"oaci","destino_aeropuerto":"aeropuerto"})
])
aer_sum = aer_df.groupby(["oaci","aeropuerto"])["pasajeros"].sum().sort_values(ascending=False).reset_index()

fig6 = go.Figure()
fig6.add_trace(go.Bar(
    x=aer_sum["aeropuerto"], y=aer_sum["pasajeros"],
    marker_color="#0891B2",
    text=[f"{int(v):,}" for v in aer_sum["pasajeros"]], textposition="outside"
))
fig6.update_layout(height=260, margin=dict(l=0,r=0,t=10,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Pasajeros", gridcolor="#F1F5F9"), showlegend=False)
st.plotly_chart(fig6, use_container_width=True)

st.divider()
st.caption("Fuente: ANAC microdatos · Pasajeros embarcados y desembarcados · 2017–2026 · Nota: tarifas no disponibles en microdatos ANAC")
