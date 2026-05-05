import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import lecturas
import style

st.set_page_config(page_title="Infraestructura Terrestre · Observatorio", page_icon="🚌", layout="wide")

@st.cache_data
def load():
    df = pd.read_csv("dashboard/data_terrestre.csv")
    return df

df_raw = load()

style.aplicar_estilo()

st.markdown("""
<h1 style='font-size:1.8rem;font-weight:900;color:#0F172A;margin-bottom:4px'>
🚌 Infraestructura Terrestre
</h1>
<p style='color:#94A3B8;font-size:0.85rem;margin-top:0'>
Ómnibus de larga distancia · Pasajeros · Asientos · Viajes · Load Factor · 2019–2024
</p>
""", unsafe_allow_html=True)

# ── FILTROS ───────────────────────────────────────────────────────────────────
col1, col2, col3 = st.columns(3)

with col1:
    # Extraer provincias únicas de los pares
    todos_pares = df_raw["par_origen_destino"].unique().tolist()
    todas_ciudades = sorted(set(
        c.strip()
        for par in todos_pares
        for c in par.split("-")
        if c.strip()
    ))
    ciudad = st.selectbox("Ciudad / Provincia",
                          ["Todas"] + todas_ciudades,
                          index=todas_ciudades.index("Santiago Del Estero") + 1
                          if "Santiago Del Estero" in todas_ciudades else 0)

with col2:
    anios = sorted(df_raw["anio"].unique(), reverse=True)
    anio_sel = st.selectbox("Año", ["Todos"] + [str(a) for a in anios])

with col3:
    top_n = st.slider("Top N pares", 5, 30, 15)

# ── FILTRAR ───────────────────────────────────────────────────────────────────
df = df_raw.copy()
if ciudad != "Todas":
    df = df[df["par_origen_destino"].str.contains(ciudad, case=False, na=False)]
if anio_sel != "Todos":
    df = df[df["anio"] == int(anio_sel)]

if len(df) == 0:
    st.warning("Sin datos para los filtros seleccionados.")
    st.stop()

# ── LECTURA ───────────────────────────────────────────────────────────────────
total_pax    = int(df["pasajeros"].sum())
total_viajes = int(df["viajes"].sum())
lf_prom      = round(df["pasajeros"].sum() / df["asientos"].sum() * 100, 1) if df["asientos"].sum() > 0 else 0
par_top      = df.groupby("par_origen_destino")["pasajeros"].sum().idxmax()

st.markdown(f"""
<div style='background:#F0F9FF;border-left:4px solid #0891B2;padding:16px 20px;border-radius:6px;margin:12px 0'>
<p style='font-size:1.25rem;font-weight:800;color:#0F172A;margin:0 0 10px 0'>
🚌 Conectividad terrestre — {ciudad if ciudad != "Todas" else "Argentina"}
</p>
<p style='color:#1E293B;margin:0;font-size:1.05rem;line-height:1.6'>
<strong>{total_pax:,} pasajeros</strong> en <strong>{total_viajes:,} servicios</strong>
con load factor promedio de <strong>{lf_prom}%</strong>.
El corredor más transitado es <strong>{par_top}</strong>.
{"La caída en el corredor Tucumán-SDE de 278K (2022) a 113K (2024) es la señal más preocupante — el ómnibus pierde terreno frente al auto y el avión." if "Santiago" in ciudad else "El transporte terrestre de larga distancia aún no recupera los niveles de 2019 en la mayoría de los corredores."}
</p>
</div>
""", unsafe_allow_html=True)

st.divider()

# ── KPIs ─────────────────────────────────────────────────────────────────────
k1, k2, k3, k4 = st.columns(4)
with k1:
    st.metric("Pasajeros", f"{total_pax:,}", anio_sel)
with k2:
    st.metric("Servicios", f"{total_viajes:,}", "viajes operados")
with k3:
    st.metric("Load factor prom.", f"{lf_prom}%", "ocupación")
with k4:
    pares = df["par_origen_destino"].nunique()
    st.metric("Pares activos", f"{pares}", "corredores")

st.divider()

# ── G1: Top pares por pasajeros ───────────────────────────────────────────────
st.markdown(f"### Top {top_n} corredores por pasajeros")
top = df.groupby("par_origen_destino")["pasajeros"].sum().sort_values(ascending=True).tail(top_n).reset_index()
fig1 = go.Figure()
fig1.add_trace(go.Bar(
    x=top["pasajeros"], y=top["par_origen_destino"], orientation="h",
    marker_color=["#0891B2" if ciudad.lower() in p.lower() else "#CBD5E1"
                  for p in top["par_origen_destino"]],
    text=[f"{int(v):,}" for v in top["pasajeros"]], textposition="outside"
))
fig1.update_layout(height=max(300, top_n*28), margin=dict(l=0,r=80,t=10,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    xaxis=dict(title="Pasajeros", gridcolor="#F1F5F9"), showlegend=False)
st.plotly_chart(fig1, use_container_width=True)

# ── G2: Evolución temporal ────────────────────────────────────────────────────
st.markdown("### Evolución anual de pasajeros")
evol = df_raw.copy()
if ciudad != "Todas":
    evol = evol[evol["par_origen_destino"].str.contains(ciudad, case=False, na=False)]

evol_anual = evol.groupby("anio").agg(
    pasajeros=("pasajeros","sum"),
    asientos=("asientos","sum"),
    viajes=("viajes","sum")
).reset_index()
evol_anual["load_factor"] = (evol_anual["pasajeros"] / evol_anual["asientos"] * 100).round(1)

fig2 = go.Figure()
fig2.add_trace(go.Bar(
    x=evol_anual["anio"], y=evol_anual["pasajeros"],
    name="Pasajeros", marker_color=style.LINE_COLOR
))
fig2.add_trace(go.Scatter(
    x=evol_anual["anio"], y=evol_anual["load_factor"],
    name="Load factor %", line=dict(color=style.LINE_COLOR_2, width=2),
    yaxis="y2", mode="lines+markers"
))
fig2.update_layout(height=300, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Pasajeros", gridcolor="#F1F5F9"),
    yaxis2=dict(title="Load factor (%)", overlaying="y", side="right",
                showgrid=False, range=[0,100]),
    xaxis=dict(gridcolor="#F1F5F9", dtick=1))
st.plotly_chart(fig2, use_container_width=True)

# ── G3: Load factor por corredor ──────────────────────────────────────────────
st.markdown("### Load factor por corredor — último año disponible")
ultimo_anio = df_raw["anio"].max()
df_lf = df_raw[df_raw["anio"] == ultimo_anio].copy()
if ciudad != "Todas":
    df_lf = df_lf[df_lf["par_origen_destino"].str.contains(ciudad, case=False, na=False)]

df_lf = df_lf.sort_values("load_factor_pct", ascending=True).tail(top_n)

fig3 = go.Figure()
fig3.add_trace(go.Bar(
    x=df_lf["load_factor_pct"], y=df_lf["par_origen_destino"], orientation="h",
    marker_color=["#0891B2" if lf >= 80 else "#94A3B8" if lf >= 65 else "#CBD5E1"
                  for lf in df_lf["load_factor_pct"]],
    text=[f"{v}%" for v in df_lf["load_factor_pct"]], textposition="outside"
))
fig3.add_vline(x=80, line_dash="dash", line_color="#94A3B8",
               annotation_text="80% referencia")
fig3.update_layout(height=max(280, top_n*25), margin=dict(l=0,r=60,t=10,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    xaxis=dict(title="Load factor (%)", gridcolor="#F1F5F9", range=[0,110]),
    showlegend=False)
st.plotly_chart(fig3, use_container_width=True)

# ── G4: Variación 2019 vs último año ─────────────────────────────────────────
st.divider()
st.markdown("### Variación de pasajeros — 2019 vs 2024")
df_2019 = df_raw[df_raw["anio"] == 2019].groupby("par_origen_destino")["pasajeros"].sum()
df_ult  = df_raw[df_raw["anio"] == df_raw["anio"].max()].groupby("par_origen_destino")["pasajeros"].sum()
comp = pd.DataFrame({"pax_2019": df_2019, "pax_2024": df_ult}).dropna()
comp["var_pct"] = ((comp["pax_2024"] / comp["pax_2019"]) - 1) * 100
if ciudad != "Todas":
    comp = comp[comp.index.str.contains(ciudad, case=False)]
comp = comp.sort_values("var_pct").head(15)

fig4 = go.Figure()
fig4.add_trace(go.Bar(
    x=comp["var_pct"], y=comp.index, orientation="h",
    marker_color=[style.BAR_COLOR if v >= 0 else style.BAR_COLOR_2 for v in comp["var_pct"]],
    text=[f"{v:+.0f}%" for v in comp["var_pct"]], textposition="outside"
))
fig4.add_vline(x=0, line_color="#0F172A", line_width=1)
fig4.update_layout(height=400, margin=dict(l=0,r=60,t=10,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    xaxis=dict(title="Variación %", gridcolor="#F1F5F9"), showlegend=False)
st.plotly_chart(fig4, use_container_width=True)

st.divider()
st.caption("Fuente: CNRT · Ómnibus larga distancia · Pares origen-destino · 2019–2024")
