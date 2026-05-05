import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import style

st.set_page_config(page_title="Infraestructura Aérea · Observatorio", page_icon="✈️", layout="wide")

@st.cache_data
def load():
    df = pd.read_csv("dashboard/data_aereo.csv")
    df["fecha"] = pd.to_datetime(df["fecha"])
    df["anio"] = df["fecha"].dt.year
    return df

df_raw = load()
style.aplicar_estilo()

# ── PORTADA HERO ──────────────────────────────────────────────────────────────
st.markdown("""
<style>
#hero-aerea * { color: #FFFFFF !important; }
#hero-aerea h1 { color: #FFFFFF !important; font-size: 4rem !important; font-weight: 900 !important; margin: 0 0 12px 0 !important; line-height: 1.1 !important; }
</style>
<div id='hero-aerea' style='
    background: linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)),
    url("https://images.pexels.com/photos/16561881/pexels-photo-16561881.jpeg?w=1400&q=80") center/cover no-repeat;
    padding: 80px 48px 64px 48px;
    margin: -1rem -1rem 2rem -1rem;
'>
    <p style='font-size:1.1rem;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 12px 0'>
        OBSERVATORIO DE TURISMO · INFRAESTRUCTURA
    </p>
    <h1>Conectividad Aérea</h1>
    <p style='font-size:1.2rem;margin:0;font-weight:400'>
        Pasajeros · Vuelos · Asientos · Load Factor · Aerolíneas · Rutas
    </p>
</div>
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

total_pax    = int(df["pasajeros"].sum())
total_vuelos = int(df["vuelos"].sum())
asientos     = int(df["asientos"].sum())
lf_prom      = round(df["pasajeros"].sum() / df["asientos"].sum() * 100, 1) if df["asientos"].sum() > 0 else 0
rutas_n      = df["ruta_provincia"].nunique()
aerolinea_top = df.groupby("aerolinea")["pasajeros"].sum().idxmax()
ruta_top      = df.groupby("ruta_provincia")["pasajeros"].sum().idxmax()

# ── LECTURA ───────────────────────────────────────────────────────────────────
style.lectura_destacada(
    f"Conectividad aérea de {provincia}",
    f"Entre {rango[0]} y {rango[1]}, <strong>{provincia}</strong> movilizó "
    f"<strong>{total_pax:,} pasajeros</strong> en <strong>{total_vuelos:,} vuelos</strong>. "
    f"El load factor promedio fue <strong>{lf_prom}%</strong>. "
    f"<strong>{aerolinea_top}</strong> es la aerolínea dominante y la ruta más transitada es "
    f"<strong>{ruta_top}</strong>."
)

# ── DONUT HELPER ──────────────────────────────────────────────────────────────
def donut_kpi(valor_texto, subtitulo, detalle, pct_fill=None):
    """Genera HTML de un donut KPI estilo PDF."""
    if pct_fill is None:
        pct_fill = 50
    pct_fill = max(0, min(100, pct_fill))
    dash = 2 * 3.14159 * 54
    filled = dash * pct_fill / 100
    gap = dash - filled
    return f"""
<div style='text-align:center;padding:16px 8px'>
<svg viewBox='0 0 120 120' width='160' height='160' style='display:block;margin:0 auto'>
  <circle cx='60' cy='60' r='54' fill='none' stroke='#E5E5E5' stroke-width='7'/>
  <circle cx='60' cy='60' r='54' fill='none' stroke='#0F0F0F' stroke-width='7'
    stroke-dasharray='{filled:.1f} {gap:.1f}'
    stroke-linecap='butt' transform='rotate(-90 60 60)'/>
  <text x='60' y='56' text-anchor='middle' font-size='22' font-weight='900'
    font-family='Inter' fill='#0F0F0F'>{valor_texto}</text>
  <text x='60' y='72' text-anchor='middle' font-size='9' font-weight='400'
    font-family='Inter' fill='#888888'>{subtitulo}</text>
</svg>
<p style='font-size:0.85rem;font-weight:700;color:#0F0F0F;margin:8px 0 2px 0'>{subtitulo}</p>
<p style='font-size:0.75rem;color:#888888;margin:0'>{detalle}</p>
</div>
"""

def progress_bar(label, value_text, detail, pct_fill):
    """Barra fina de progreso horizontal estilo PDF."""
    pct_fill = max(0, min(100, pct_fill))
    return f"""
<div style='padding:8px 0'>
<div style='display:flex;align-items:center;gap:8px;margin-bottom:4px'>
  <div style='flex:1;height:6px;background:#E5E5E5;border-radius:3px;overflow:hidden'>
    <div style='width:{pct_fill}%;height:100%;background:#0F0F0F;border-radius:3px'></div>
  </div>
  <span style='font-size:1.3rem;font-weight:800;color:#0F0F0F;white-space:nowrap'>{value_text}</span>
</div>
<p style='font-size:0.85rem;font-weight:700;color:#0F0F0F;margin:0'>{label}</p>
<p style='font-size:0.75rem;color:#888888;margin:2px 0 0 0'>{detail}</p>
</div>
"""

# ── Calculos para donuts ──────────────────────────────────────────────────────
def fmt_millones(n):
    if n >= 1_000_000:
        return f"{n/1_000_000:.1f}M"
    elif n >= 1_000:
        return f"{n/1_000:.0f}K"
    return f"{n:,}"

# Variacion vs primer año del rango
df_first = df[df["anio"] == rango[0]]
df_last  = df[df["anio"] == rango[1]]
pax_first = df_first["pasajeros"].sum()
pax_last  = df_last["pasajeros"].sum()
var_pct = round((pax_last - pax_first) / pax_first * 100, 0) if pax_first > 0 else 0
var_sign = "+" if var_pct >= 0 else ""

# ── DONUTS ROW ────────────────────────────────────────────────────────────────
st.markdown("<br>", unsafe_allow_html=True)
d1, d2, d3 = st.columns(3)
d1.markdown(donut_kpi(f"{var_sign}{var_pct:.0f}%", f"Variación {rango[1]} vs {rango[0]}", f"Pasajeros", pct_fill=min(abs(var_pct), 100)), unsafe_allow_html=True)
d2.markdown(donut_kpi(fmt_millones(int(pax_first)), f"Pasajeros {rango[0]}", f"Ene–Dic", pct_fill=70), unsafe_allow_html=True)
d3.markdown(donut_kpi(fmt_millones(int(pax_last)), f"Pasajeros {rango[1]}", f"Ene–Dic", pct_fill=80), unsafe_allow_html=True)

# ── PROGRESS BARS ─────────────────────────────────────────────────────────────
vuelos_first = df_first["vuelos"].sum()
vuelos_last  = df_last["vuelos"].sum()
var_vuelos = round((vuelos_last - vuelos_first) / vuelos_first * 100, 1) if vuelos_first > 0 else 0

asientos_first = df_first["asientos"].sum()
asientos_last  = df_last["asientos"].sum()
var_asientos = round((asientos_last - asientos_first) / asientos_first * 100, 1) if asientos_first > 0 else 0

lf_first = round(df_first["pasajeros"].sum() / df_first["asientos"].sum() * 100, 1) if df_first["asientos"].sum() > 0 else 0
lf_last  = round(df_last["pasajeros"].sum() / df_last["asientos"].sum() * 100, 1) if df_last["asientos"].sum() > 0 else 0
var_lf = round(lf_last - lf_first, 1)

b1, b2, b3 = st.columns(3)
b1.markdown(progress_bar("Vuelos", f"{var_vuelos:+.1f}%", f"De {vuelos_first:,.0f} ({rango[0]}) a {vuelos_last:,.0f} ({rango[1]})", min(abs(var_vuelos)*2, 100)), unsafe_allow_html=True)
b2.markdown(progress_bar("Asientos ofrecidos", f"{var_asientos:+.1f}%", f"De {asientos_first:,.0f} ({rango[0]}) a {asientos_last:,.0f} ({rango[1]})", min(abs(var_asientos)*2, 100)), unsafe_allow_html=True)
b3.markdown(progress_bar("Factor de ocupación", f"{var_lf:+.1f}pp", f"De {lf_first}% ({rango[0]}) a {lf_last}% ({rango[1]})", lf_last), unsafe_allow_html=True)

# ── SERIE MENSUAL — fondo negro ──────────────────────────────────────────────
st.markdown("<br>", unsafe_allow_html=True)
st.markdown("""
<div style='background:#F5F5F5;padding:32px 32px 4px 32px;border-radius:8px;margin:16px 0'>
<p style='color:#888888;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px 0'>SERIE MENSUAL</p>
<p style='color:#0F0F0F;font-size:1.5rem;font-weight:800;margin:0 0 8px 0'>Pasajeros y load factor</p>
</div>
""", unsafe_allow_html=True)

mensual = df.groupby("fecha").agg(
    pasajeros=("pasajeros","sum"),
    asientos=("asientos","sum"),
    vuelos=("vuelos","sum")
).reset_index()
mensual["load_factor"] = (mensual["pasajeros"] / mensual["asientos"] * 100).round(1)

fig1 = go.Figure()
fig1.add_trace(go.Bar(x=mensual["fecha"], y=mensual["pasajeros"],
    name="Pasajeros", marker_color="#0F0F0F"))
fig1.add_trace(go.Scatter(x=mensual["fecha"], y=mensual["load_factor"],
    name="Load factor %", line=dict(color="#AAAAAA", width=2, dash="dot"),
    yaxis="y2", mode="lines"))
style.apply_layout(fig1, height=320,
    legend=dict(orientation="h", y=1.12, font=dict(color="#333333", size=13)),
    yaxis=dict(title="Pasajeros", gridcolor="#F0F0F0", tickfont=dict(color="#555555", size=13)),
    yaxis2=dict(title="Load factor (%)", overlaying="y", side="right",
                showgrid=False, range=[0,100], tickfont=dict(color="#555555", size=13),
                title_font=dict(color="#555555")),
    xaxis=dict(gridcolor="#F0F0F0", tickfont=dict(color="#555555", size=13)),
    barmode="overlay")
st.plotly_chart(fig1, use_container_width=True)

st.markdown("<br>", unsafe_allow_html=True)

# ── AEROLÍNEAS — 2 columnas ──────────────────────────────────────────────────
col1, col2 = st.columns(2)

with col1:
    st.markdown("<p style='font-size:1.5rem;font-weight:800;color:#0F0F0F;margin:0 0 8px 0'>Pasajeros por aerolínea</p>", unsafe_allow_html=True)
    aer = df.groupby("aerolinea")["pasajeros"].sum().sort_values(ascending=True).reset_index()
    fig2 = go.Figure()
    fig2.add_trace(go.Bar(
        x=aer["pasajeros"], y=aer["aerolinea"], orientation="h",
        marker_color=[style.BAR_COLOR if a == aerolinea_top else style.BAR_COLOR_ALT for a in aer["aerolinea"]],
        text=[f"{int(v):,}" for v in aer["pasajeros"]], textposition="outside",
        textfont=dict(size=12, color="#0F0F0F")
    ))
    style.apply_layout(fig2, height=max(280, len(aer)*38),
        xaxis=dict(title="", gridcolor="#F0F0F0", showticklabels=False),
        yaxis=dict(tickfont=dict(size=13)),
        margin=dict(l=0, r=90, t=10, b=0), showlegend=False)
    st.plotly_chart(fig2, use_container_width=True)

with col2:
    st.markdown("<p style='font-size:1.5rem;font-weight:800;color:#0F0F0F;margin:0 0 8px 0'>Load factor por aerolínea</p>", unsafe_allow_html=True)
    lf_aer = df.groupby("aerolinea").apply(
        lambda x: round(x["pasajeros"].sum() / x["asientos"].sum() * 100, 1)
        if x["asientos"].sum() > 0 else 0
    ).sort_values(ascending=True).reset_index()
    lf_aer.columns = ["aerolinea","load_factor"]
    fig3 = go.Figure()
    fig3.add_trace(go.Bar(
        x=lf_aer["load_factor"], y=lf_aer["aerolinea"], orientation="h",
        marker_color=[style.BAR_COLOR if lf >= 85 else style.BAR_COLOR_2 if lf >= 75 else style.BAR_COLOR_ALT
                      for lf in lf_aer["load_factor"]],
        text=[f"{v}%" for v in lf_aer["load_factor"]], textposition="outside",
        textfont=dict(size=12, color="#0F0F0F")
    ))
    fig3.add_vline(x=80, line_dash="dash", line_color="#AAAAAA",
                   annotation_text="80%", annotation_font_color="#888888")
    style.apply_layout(fig3, height=max(280, len(lf_aer)*38),
        xaxis=dict(title="", gridcolor="#F0F0F0", range=[0,105], showticklabels=False),
        yaxis=dict(tickfont=dict(size=13)),
        margin=dict(l=0, r=60, t=10, b=0), showlegend=False)
    st.plotly_chart(fig3, use_container_width=True)

# ── RUTAS ─────────────────────────────────────────────────────────────────────
st.divider()
st.markdown("<p style='font-size:1.5rem;font-weight:800;color:#0F0F0F;margin:0 0 8px 0'>Rutas — pasajeros por par origen-destino</p>", unsafe_allow_html=True)

rutas_df = df.groupby("ruta_provincia").agg(
    pasajeros=("pasajeros","sum"),
    vuelos=("vuelos","sum"),
    load_factor=("load_factor_pct","mean")
).sort_values("pasajeros", ascending=True).tail(15).reset_index()

fig4 = go.Figure()
fig4.add_trace(go.Bar(
    x=rutas_df["pasajeros"], y=rutas_df["ruta_provincia"], orientation="h",
    marker_color=[style.BAR_COLOR if r == ruta_top else style.BAR_COLOR_ALT for r in rutas_df["ruta_provincia"]],
    text=[f"{int(v):,}" for v in rutas_df["pasajeros"]], textposition="outside",
    textfont=dict(size=12, color="#0F0F0F")
))
style.apply_layout(fig4, height=max(380, len(rutas_df)*32),
    xaxis=dict(title="", gridcolor="#F0F0F0", showticklabels=False),
    yaxis=dict(tickfont=dict(size=13)),
    margin=dict(l=0, r=90, t=10, b=0), showlegend=False)
st.plotly_chart(fig4, use_container_width=True)

# ── CABOTAJE VS INTERNACIONAL ────────────────────────────────────────────────
st.divider()
st.markdown("<p style='font-size:1.5rem;font-weight:800;color:#0F0F0F;margin:0 0 8px 0'>Cabotaje vs. Internacional</p>", unsafe_allow_html=True)

tipo_anual = df.groupby(["anio","clasificacion_vuelo"])["pasajeros"].sum().reset_index()
fig5 = go.Figure()
for tipo, color in [("Cabotaje", style.BAR_COLOR), ("Internacional", style.BAR_COLOR_2)]:
    d = tipo_anual[tipo_anual["clasificacion_vuelo"] == tipo]
    if len(d) > 0:
        fig5.add_trace(go.Bar(x=d["anio"], y=d["pasajeros"],
            name=tipo, marker_color=color,
            text=[f"{int(v):,}" for v in d["pasajeros"]], textposition="outside",
            textfont=dict(size=11, color="#0F0F0F")))
style.apply_layout(fig5, height=300,
    barmode="group",
    legend=dict(orientation="h", y=1.12),
    yaxis=dict(title="Pasajeros", gridcolor="#F0F0F0"),
    xaxis=dict(dtick=1))
st.plotly_chart(fig5, use_container_width=True)

# ── AEROPUERTOS ───────────────────────────────────────────────────────────────
st.divider()
st.markdown("<p style='font-size:1.5rem;font-weight:800;color:#0F0F0F;margin:0 0 8px 0'>Aeropuertos de la provincia</p>", unsafe_allow_html=True)

aer_df = pd.concat([
    df[df["origen_provincia"]==provincia][["origen_oaci","origen_aeropuerto","pasajeros"]].rename(
        columns={"origen_oaci":"oaci","origen_aeropuerto":"aeropuerto"}),
    df[df["destino_provincia"]==provincia][["destino_oaci","destino_aeropuerto","pasajeros"]].rename(
        columns={"destino_oaci":"oaci","destino_aeropuerto":"aeropuerto"})
])
aer_sum = aer_df.groupby(["oaci","aeropuerto"])["pasajeros"].sum().sort_values(ascending=False).reset_index()

fig6 = go.Figure()
fig6.add_trace(go.Bar(
    y=aer_sum["aeropuerto"], x=aer_sum["pasajeros"], orientation="h",
    marker_color=style.BAR_COLOR,
    text=[f"{int(v):,}" for v in aer_sum["pasajeros"]], textposition="outside",
    textfont=dict(size=12, color="#0F0F0F")
))
style.apply_layout(fig6, height=200,
    xaxis=dict(title="", gridcolor="#F0F0F0", showticklabels=False),
    yaxis=dict(tickfont=dict(size=13)),
    margin=dict(l=0, r=90, t=10, b=0), showlegend=False)
st.plotly_chart(fig6, use_container_width=True)

st.divider()
st.caption("Fuente: ANAC microdatos · Pasajeros embarcados y desembarcados · 2017–2026")
