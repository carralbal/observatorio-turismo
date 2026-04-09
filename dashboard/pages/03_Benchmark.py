import streamlit as st
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import lecturas
import pandas as pd
import plotly.graph_objects as go

st.set_page_config(page_title="Benchmark · Observatorio", page_icon="📊", layout="wide")

@st.cache_data
def load():
    df = pd.read_csv("dashboard/data_benchmark.csv")
    df["fecha"] = pd.to_datetime(df["fecha"])
    return df[df["flag_covid"] == 0]

df = load()

COLORES = {
    "Termas":               "#0891B2",
    "Santiago del Estero":  "#0E7490",
    "Tucumán":              "#94A3B8",
    "Jujuy":                "#94A3B8",
    "San Luis":             "#94A3B8",
    "Catamarca":            "#94A3B8",
    "La Rioja":             "#94A3B8",
}

# ── HEADER ───────────────────────────────────────────────────────────────────
st.markdown("""
<h1 style='font-size:1.8rem;font-weight:900;color:#0F172A;margin-bottom:4px'>
📊 SDE vs. Provincias Pares
</h1>
<p style='color:#94A3B8;font-size:0.85rem;margin-top:0'>
Tucumán · La Rioja · Catamarca · San Luis · Jujuy · Datos EOH + CNRT · 2022–2025
</p>
""", unsafe_allow_html=True)

st.divider()

# ── SELECTOR PERÍODO ─────────────────────────────────────────────────────────
anio_min = int(df["anio"].min())
anio_max = int(df["anio"].max())
rango = st.slider("Período", anio_min, anio_max, (2022, anio_max))
df_f = df[(df["anio"] >= rango[0]) & (df["anio"] <= rango[1])]

# ── RESUMEN POR LOCALIDAD ─────────────────────────────────────────────────────
resumen = df_f.groupby("localidad").agg(
    viajeros_avg=("viajeros_total", "mean"),
    estadia_avg=("estadia_promedio", "mean"),
    pernoctes_avg=("pernoctes_total", "mean")
).round(2).reset_index().sort_values("viajeros_avg", ascending=False)

# ── KPIs SDE ─────────────────────────────────────────────────────────────────
sde_cap = resumen[resumen["localidad"] == "Santiago del Estero"].iloc[0]
termas  = resumen[resumen["localidad"] == "Termas"].iloc[0]
tucuman = resumen[resumen["localidad"] == "Tucumán"].iloc[0]

st.markdown("### SDE en el ranking")
k1, k2, k3, k4 = st.columns(4)
pos_cap = resumen[resumen["localidad"] == "Santiago del Estero"].index[0] + 1
pos_ter = resumen[resumen["localidad"] == "Termas"].index[0] + 1

with k1:
    st.metric("Termas — Posición", f"{pos_ter}° de 7",
              f"{int(termas.viajeros_avg):,} viajeros/mes")
with k2:
    st.metric("Capital — Posición", f"{pos_cap}° de 7",
              f"{int(sde_cap.viajeros_avg):,} viajeros/mes")
with k3:
    st.metric("Estadía Termas", f"{termas.estadia_avg:.2f} noches",
              f"Mayor estadía del grupo")
with k4:
    brecha = round(tucuman.viajeros_avg - sde_cap.viajeros_avg)
    st.metric("Brecha vs. Tucumán", f"{brecha:,} viajeros/mes",
              "Capital SDE vs. Tucumán capital")


# ── LECTURA DESTACADA ─────────────────────────────────────────────────────────
lecturas.benchmark(
    int(termas.viajeros_avg), int(sde_cap.viajeros_avg),
    termas.estadia_avg, pos_ter, pos_cap
)

st.divider()

# ── G1: Ranking viajeros ──────────────────────────────────────────────────────
st.markdown("### Viajeros promedio mensual — ranking")

fig1 = go.Figure()
fig1.add_trace(go.Bar(
    x=resumen["viajeros_avg"],
    y=resumen["localidad"],
    orientation="h",
    marker_color=[COLORES.get(l, "#94A3B8") for l in resumen["localidad"]],
    text=[f"{int(v):,}" for v in resumen["viajeros_avg"]],
    textposition="outside"
))
fig1.update_layout(
    height=300, margin=dict(l=0,r=60,t=10,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    xaxis=dict(title="Viajeros promedio/mes", gridcolor="#F1F5F9"),
    yaxis=dict(autorange="reversed"),
    showlegend=False
)
st.plotly_chart(fig1, use_container_width=True)
st.caption("🔵 Azul = Santiago del Estero · Gris = provincias pares")

# ── G2: Estadía promedio ─────────────────────────────────────────────────────
st.markdown("### Estadía promedio — noches por viajero")
st.caption("Más noches = más gasto en destino = mayor captura de valor.")

resumen_est = resumen.sort_values("estadia_avg", ascending=False)
fig2 = go.Figure()
fig2.add_trace(go.Bar(
    x=resumen_est["estadia_avg"],
    y=resumen_est["localidad"],
    orientation="h",
    marker_color=[COLORES.get(l, "#94A3B8") for l in resumen_est["localidad"]],
    text=[f"{v:.2f} n." for v in resumen_est["estadia_avg"]],
    textposition="outside"
))
fig2.update_layout(
    height=300, margin=dict(l=0,r=60,t=10,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    xaxis=dict(title="Noches promedio", gridcolor="#F1F5F9"),
    yaxis=dict(autorange="reversed"),
    showlegend=False
)
st.plotly_chart(fig2, use_container_width=True)

# ── G3: Evolución temporal ────────────────────────────────────────────────────
st.markdown("### Evolución de viajeros — todas las localidades")

evol = df_f.groupby(["fecha","localidad"])["viajeros_total"].sum().reset_index()
fig3 = go.Figure()
for loc in evol["localidad"].unique():
    d = evol[evol["localidad"] == loc]
    color = COLORES.get(loc, "#CBD5E1")
    width = 2.5 if loc in ["Termas","Santiago del Estero"] else 1
    fig3.add_trace(go.Scatter(
        x=d["fecha"], y=d["viajeros_total"],
        name=loc, line=dict(color=color, width=width)
    ))
fig3.update_layout(
    height=350, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Viajeros", gridcolor="#F1F5F9"),
    xaxis=dict(gridcolor="#F1F5F9")
)
st.plotly_chart(fig3, use_container_width=True)

st.divider()
st.markdown("""
**Lectura del benchmark:**
- **Termas** tiene la mayor estadía del grupo (2.84 noches) — cada turista deja más dinero.
- **Capital SDE** está en el medio del ranking. La brecha con Tucumán es de conectividad, no de demanda.
- **La Rioja y Catamarca** tienen menos viajeros pero estadías similares — perfiles distintos.
""")
st.caption("Fuentes: EOH (INDEC/SINTA) · CNRT · Período post-pandemia 2022–2025")
