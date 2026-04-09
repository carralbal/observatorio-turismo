import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import lecturas

st.set_page_config(page_title="Alquiler Temporario · Observatorio", page_icon="🏠", layout="wide")

@st.cache_data
def load():
    df = pd.read_csv("dashboard/data_informal.csv")
    df["fecha"] = pd.to_datetime(df["date"].astype(str) + "-01")
    df["anio"]  = df["fecha"].dt.year
    df["mes"]   = df["fecha"].dt.month
    return df

df_raw = load()

@st.cache_data
def load_termas():
    df = pd.read_csv("dashboard/data_informal_termas.csv")
    df["fecha"] = pd.to_datetime(df["fecha"])
    df["anio"]  = df["fecha"].dt.year
    return df

df_termas = load_termas()


st.markdown("""
<h1 style='font-size:1.8rem;font-weight:900;color:#0F172A;margin-bottom:4px'>
🏠 Sector de Alquiler Temporario
</h1>
<p style='color:#94A3B8;font-size:0.85rem;margin-top:0'>
Plataformas digitales de alojamiento · 80 mercados Argentina · 2021–2026
</p>
""", unsafe_allow_html=True)

# ── FILTROS ───────────────────────────────────────────────────────────────────
col1, col2, col3 = st.columns(3)

with col1:
    mercados = sorted(df_raw["name"].unique().tolist())
    mercado = st.selectbox("Mercado", mercados,
                           index=mercados.index("Termas de Rio Hondo")
                           if "Termas de Rio Hondo" in mercados else 0)

with col2:
    anio_min = int(df_raw["anio"].min())
    anio_max = int(df_raw["anio"].max())
    rango = st.slider("Período", anio_min, anio_max, (2022, anio_max))

with col3:
    top_n = st.slider("Top N mercados ranking", 5, 20, 10)

# ── FILTRAR ───────────────────────────────────────────────────────────────────
# Usar mart combinado para Termas (serie completa con AirROI)
if mercado == "Termas de Rio Hondo":
    df = df_termas[
        (df_termas["anio"] >= rango[0]) &
        (df_termas["anio"] <= rango[1])
    ].rename(columns={
        "occ_pct": "occupancy_rate",
        "adr_usd": "adr",
        "revenue_usd": "revenue",
        "los_dias": "days_avg",
        "listings": "listing_count",
        "listings": "listing_count",
    }).sort_values("fecha")
else:
    df = df_raw[
    (df_raw["name"] == mercado) &
    (df_raw["anio"] >= rango[0]) &
    (df_raw["anio"] <= rango[1])
    ].sort_values("fecha")

df_todos = df_raw[
    (df_raw["anio"] >= rango[0]) &
    (df_raw["anio"] <= rango[1])
]

if len(df) == 0:
    st.warning("Sin datos para el mercado seleccionado.")
    st.stop()

ultimo = df.iloc[-1]
occ_prom  = df["occupancy_rate"].mean().round(1)
adr_prom  = df["adr"].mean().round(0)
rev_prom  = df["revenue"].mean().round(0)
listings  = int(df["listing_count"].mean()) if df["listing_count"].notna().any() else 0

# ── LECTURA ───────────────────────────────────────────────────────────────────
st.markdown(f"""
<div style='background:#F0F9FF;border-left:4px solid #0891B2;padding:16px 20px;border-radius:6px;margin:12px 0'>
<p style='font-size:1.25rem;font-weight:800;color:#0F172A;margin:0 0 10px 0'>
🏠 ¿Qué pasa en el mercado informal de {mercado}?
</p>
<p style='color:#1E293B;margin:0;font-size:1.05rem;line-height:1.6'>
En el período seleccionado, <strong>{mercado}</strong> tiene una ocupación promedio de
<strong>{occ_prom}%</strong> con una tarifa diaria de <strong>USD {int(adr_prom)}</strong>.
El revenue promedio mensual por propiedad es <strong>USD {int(rev_prom)}</strong> y hay
aproximadamente <strong>{listings} propiedades activas</strong>.
Este sector no está relevado por la EOH — es la demanda que el sector formal no captura.
</p>
</div>
""", unsafe_allow_html=True)

st.divider()

# ── KPIs ─────────────────────────────────────────────────────────────────────
k1, k2, k3, k4, k5 = st.columns(5)
with k1:
    st.metric("Ocupación prom.", f"{occ_prom}%", f"{mercado}")
with k2:
    st.metric("ADR promedio", f"USD {int(adr_prom)}", "tarifa diaria")
with k3:
    st.metric("RevPAR prom.", f"USD {int(df['revpar'].mean()) if 'revpar' in df.columns and df['revpar'].notna().any() else 'N/D'}", "revenue/plaza")
with k4:
    st.metric("Revenue mensual", f"USD {int(rev_prom)}", "por propiedad")
with k5:
    st.metric("Listings activos", f"{listings}", "promedio")

st.divider()

# ── G1: Ocupación mensual ─────────────────────────────────────────────────────
st.markdown("### Ocupación mensual")
fig1 = go.Figure()
fig1.add_trace(go.Scatter(
    x=df["fecha"], y=df["occupancy_rate"],
    line=dict(color="#0891B2", width=2.5),
    fill="tozeroy", fillcolor="rgba(8,145,178,0.08)",
    mode="lines+markers", marker=dict(size=5)
))
fig1.add_hline(y=df["occupancy_rate"].mean(),
               line_dash="dash", line_color="#94A3B8",
               annotation_text=f"Promedio {occ_prom}%")
fig1.update_layout(height=280, margin=dict(l=0,r=0,t=10,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Ocupación (%)", gridcolor="#F1F5F9", range=[0,100]),
    xaxis=dict(gridcolor="#F1F5F9"), showlegend=False)
st.plotly_chart(fig1, use_container_width=True)

# ── G2: ADR y Revenue ────────────────────────────────────────────────────────
col1, col2 = st.columns(2)
with col1:
    st.markdown("### Tarifa diaria promedio (USD)")
    fig2 = go.Figure()
    fig2.add_trace(go.Scatter(
        x=df["fecha"], y=df["adr"],
        line=dict(color="#0E7490", width=2),
        fill="tozeroy", fillcolor="rgba(14,116,144,0.08)"
    ))
    fig2.update_layout(height=240, margin=dict(l=0,r=0,t=10,b=0),
        plot_bgcolor="white", paper_bgcolor="white",
        yaxis=dict(title="USD", gridcolor="#F1F5F9"),
        xaxis=dict(gridcolor="#F1F5F9"), showlegend=False)
    st.plotly_chart(fig2, use_container_width=True)

with col2:
    st.markdown("### Revenue mensual promedio (USD)")
    fig3 = go.Figure()
    fig3.add_trace(go.Bar(
        x=df["fecha"], y=df["revenue"],
        marker_color="#0891B2"
    ))
    fig3.update_layout(height=240, margin=dict(l=0,r=0,t=10,b=0),
        plot_bgcolor="white", paper_bgcolor="white",
        yaxis=dict(title="USD", gridcolor="#F1F5F9"),
        xaxis=dict(gridcolor="#F1F5F9"), showlegend=False)
    st.plotly_chart(fig3, use_container_width=True)

# ── G3: Estadía promedio ──────────────────────────────────────────────────────
if df["days_avg"].notna().any():
    st.markdown("### Estadía promedio (noches)")
    fig4 = go.Figure()
    fig4.add_trace(go.Scatter(
        x=df["fecha"], y=df["days_avg"],
        line=dict(color="#0891B2", width=2),
        mode="lines+markers", marker=dict(size=5)
    ))
    fig4.update_layout(height=240, margin=dict(l=0,r=0,t=10,b=0),
        plot_bgcolor="white", paper_bgcolor="white",
        yaxis=dict(title="Noches", gridcolor="#F1F5F9"),
        xaxis=dict(gridcolor="#F1F5F9"), showlegend=False)
    st.plotly_chart(fig4, use_container_width=True)

st.divider()

# ── G4: Ranking de mercados ───────────────────────────────────────────────────
st.markdown(f"### Ranking de mercados — ocupación promedio {rango[0]}-{rango[1]}")
ranking = df_todos.groupby("name").agg(
    occ=("occupancy_rate","mean"),
    adr=("adr","mean"),
    revenue=("revenue","mean"),
    listings=("listing_count","mean")
).round(1).sort_values("occ", ascending=True).tail(top_n).reset_index()

fig5 = go.Figure()
fig5.add_trace(go.Bar(
    x=ranking["occ"], y=ranking["name"], orientation="h",
    marker_color=["#0891B2" if n == mercado else "#CBD5E1" for n in ranking["name"]],
    text=[f"{v}%" for v in ranking["occ"]], textposition="outside"
))
fig5.update_layout(height=max(300, top_n*30), margin=dict(l=0,r=60,t=10,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    xaxis=dict(title="Ocupación promedio (%)", gridcolor="#F1F5F9", range=[0,110]),
    showlegend=False)
st.plotly_chart(fig5, use_container_width=True)

# ── G5: Lead time de reservas ─────────────────────────────────────────────────
st.divider()
st.markdown("### Anticipación de reservas — último mes disponible")
st.caption("¿Con cuánta anticipación reservan los huéspedes?")
if "lead_time_0_6" in df.columns and df["lead_time_0_6"].notna().any():
    ult = df.dropna(subset=["lead_time_0_6"]).iloc[-1]
    lt_labels = ["0-6 días","7-14 días","15-30 días","31-60 días","61-90 días","91+ días"]
    lt_values = [ult.get(c,0) or 0 for c in
                 ["lead_time_0_6","lead_time_7_14","lead_time_15_30",
                  "lead_time_31_60","lead_time_61_90","lead_time_91_None"]]
    fig6 = go.Figure(go.Bar(
        x=lt_labels, y=lt_values,
        marker_color=["#0891B2","#0E7490","#94A3B8","#CBD5E1","#E2E8F0","#F1F5F9"]
    ))
    fig6.update_layout(height=260, margin=dict(l=0,r=0,t=10,b=0),
        plot_bgcolor="white", paper_bgcolor="white",
        yaxis=dict(title="Reservas", gridcolor="#F1F5F9"),
        showlegend=False)
    st.plotly_chart(fig6, use_container_width=True)

st.divider()
st.info("⚠️ **Nota sobre disponibilidad de datos:** La ocupación está disponible desde abril 2021. ADR, revenue, estadía y listings solo están disponibles desde mediados de 2024 — limitación del dataset de origen.")

st.caption("Fuente: Plataformas digitales de alojamiento · 80 mercados Argentina · 2021–2026 · No incluye alojamiento hotelero formal")
