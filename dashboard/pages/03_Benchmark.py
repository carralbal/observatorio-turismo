import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import lecturas

st.set_page_config(page_title="Benchmark · Observatorio", page_icon="📊", layout="wide")

@st.cache_data
def load():
    df = pd.read_csv("dashboard/data_benchmark.csv")
    df["fecha"] = pd.to_datetime(df["fecha"])
    return df[df["flag_covid"] == 0]

df_raw = load()

COLORES = {"Termas":"#0891B2","Santiago del Estero":"#0E7490",
           "Tucumán":"#94A3B8","Jujuy":"#94A3B8","San Luis":"#94A3B8",
           "Catamarca":"#94A3B8","La Rioja":"#94A3B8"}

st.markdown("""
<h1 style='font-size:1.8rem;font-weight:900;color:#0F172A;margin-bottom:4px'>
📊 SDE vs. Provincias Pares
</h1>
<p style='color:#94A3B8;font-size:0.85rem;margin-top:0'>
Tucumán · La Rioja · Catamarca · San Luis · Jujuy · EOH + CNRT
</p>
""", unsafe_allow_html=True)

# ── FILTRO ────────────────────────────────────────────────────────────────────
anio_min = int(df_raw["anio"].min())
anio_max = int(df_raw["anio"].max())
rango = st.slider("Período", anio_min, anio_max, (2022, anio_max))
df = df_raw[(df_raw["anio"] >= rango[0]) & (df_raw["anio"] <= rango[1])]

resumen = df.groupby("localidad").agg(
    viajeros_avg=("viajeros_total","mean"),
    estadia_avg=("estadia_promedio","mean"),
).round(2).reset_index().sort_values("viajeros_avg", ascending=False)

sde_cap = resumen[resumen["localidad"]=="Santiago del Estero"].iloc[0]
termas  = resumen[resumen["localidad"]=="Termas"].iloc[0]
pos_ter = resumen[resumen["localidad"]=="Termas"].index[0] + 1
pos_cap = resumen[resumen["localidad"]=="Santiago del Estero"].index[0] + 1

# ── LECTURA ───────────────────────────────────────────────────────────────────
lecturas.benchmark(termas.viajeros_avg, sde_cap.viajeros_avg,
                   termas.estadia_avg, pos_ter, pos_cap)
st.divider()

# ── KPIs ─────────────────────────────────────────────────────────────────────
k1, k2, k3, k4 = st.columns(4)
with k1:
    st.metric("Termas — Posición", f"{pos_ter}° de 7", f"{int(termas.viajeros_avg):,} viajeros/mes")
with k2:
    st.metric("Capital — Posición", f"{pos_cap}° de 7", f"{int(sde_cap.viajeros_avg):,} viajeros/mes")
with k3:
    st.metric("Estadía Termas", f"{termas.estadia_avg:.2f} noches", "Mayor del grupo")
with k4:
    tucuman = resumen[resumen["localidad"]=="Tucumán"]
    if len(tucuman) > 0:
        brecha = round(tucuman.iloc[0].viajeros_avg - sde_cap.viajeros_avg)
        st.metric("Brecha vs. Tucumán", f"{brecha:,} viajeros/mes", "Capital SDE vs. Tucumán")

st.divider()

# ── G1: Ranking ───────────────────────────────────────────────────────────────
st.markdown("### Viajeros promedio mensual — ranking")
fig1 = go.Figure()
fig1.add_trace(go.Bar(
    x=resumen["viajeros_avg"], y=resumen["localidad"], orientation="h",
    marker_color=[COLORES.get(l,"#94A3B8") for l in resumen["localidad"]],
    text=[f"{int(v):,}" for v in resumen["viajeros_avg"]], textposition="outside"
))
fig1.update_layout(height=300, margin=dict(l=0,r=60,t=10,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    xaxis=dict(title="Viajeros/mes", gridcolor="#F1F5F9"),
    yaxis=dict(autorange="reversed"), showlegend=False)
st.plotly_chart(fig1, use_container_width=True)

# ── G2: Estadía ───────────────────────────────────────────────────────────────
st.markdown("### Estadía promedio — noches por viajero")
res_est = resumen.sort_values("estadia_avg", ascending=False)
fig2 = go.Figure()
fig2.add_trace(go.Bar(
    x=res_est["estadia_avg"], y=res_est["localidad"], orientation="h",
    marker_color=[COLORES.get(l,"#94A3B8") for l in res_est["localidad"]],
    text=[f"{v:.2f} n." for v in res_est["estadia_avg"]], textposition="outside"
))
fig2.update_layout(height=300, margin=dict(l=0,r=60,t=10,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    xaxis=dict(title="Noches promedio", gridcolor="#F1F5F9"),
    yaxis=dict(autorange="reversed"), showlegend=False)
st.plotly_chart(fig2, use_container_width=True)

# ── G3: Evolución ─────────────────────────────────────────────────────────────
st.markdown("### Evolución de viajeros — todas las localidades")
evol = df.groupby(["fecha","localidad"])["viajeros_total"].sum().reset_index()
fig3 = go.Figure()
for loc in evol["localidad"].unique():
    d = evol[evol["localidad"]==loc]
    w = 2.5 if loc in ["Termas","Santiago del Estero"] else 1
    fig3.add_trace(go.Scatter(x=d["fecha"], y=d["viajeros_total"],
        name=loc, line=dict(color=COLORES.get(loc,"#CBD5E1"), width=w)))
fig3.update_layout(height=350, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Viajeros", gridcolor="#F1F5F9"),
    xaxis=dict(gridcolor="#F1F5F9"))
st.plotly_chart(fig3, use_container_width=True)

st.divider()
st.caption("Fuentes: EOH (INDEC/SINTA) · CNRT · Post-pandemia 2022–2025")
