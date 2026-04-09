import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import lecturas

st.set_page_config(page_title="MotoGP · Observatorio", page_icon="🏍", layout="wide")

@st.cache_data
def load():
    df = pd.read_csv("dashboard/data_motogp.csv")
    df["fecha"] = pd.to_datetime(df["fecha"])
    return df

df_raw = load()

st.markdown("""
<h1 style='font-size:1.8rem;font-weight:900;color:#0F172A;margin-bottom:4px'>
🏍 MotoGP en Termas de Río Hondo
</h1>
<p style='color:#94A3B8;font-size:0.85rem;margin-top:0'>
Impacto causal del evento · Modelo diff-in-diff · 2018–2025
</p>
""", unsafe_allow_html=True)

# ── FILTRO ────────────────────────────────────────────────────────────────────
anio_min = int(df_raw["anio"].min())
anio_max = int(df_raw["anio"].max())
rango = st.slider("Período", anio_min, anio_max, (anio_min, anio_max))
df = df_raw[(df_raw["anio"] >= rango[0]) & (df_raw["anio"] <= rango[1])]

termas  = df[df["localidad"] == "Termas"].copy()
capital = df[df["localidad"] == "Santiago del Estero"].copy()

baseline  = termas["baseline_viajeros_termas"].iloc[0] if len(termas) > 0 else 0
con_gp    = termas[termas["tiene_motogp"] == 1]["viajeros_total"].mean() if len(termas) > 0 else 0
sin_gp    = termas[termas["tiene_motogp"] == 0]["viajeros_total"].mean() if len(termas) > 0 else 1
uplift    = round(con_gp - sin_gp)

# ── LECTURA ───────────────────────────────────────────────────────────────────
lecturas.motogp(uplift, sin_gp, 0.865)
st.divider()

# ── KPIs ─────────────────────────────────────────────────────────────────────
k1, k2, k3, k4 = st.columns(4)
with k1:
    st.metric("Viajeros con MotoGP", f"{int(con_gp):,}", "promedio mar/abr")
with k2:
    st.metric("Viajeros sin MotoGP", f"{int(sin_gp):,}", "contrafáctico")
with k3:
    st.metric("Uplift estimado", f"+{uplift:,}", f"+{round((con_gp/sin_gp-1)*100)}% vs. sin evento")
with k4:
    st.metric("Impacto económico est.", "~USD 8–12M", "por edición")

st.divider()

# ── G1: Viajeros por año ──────────────────────────────────────────────────────
st.markdown("### Viajeros en Termas — marzo y abril por año")
viajeros_anio = termas.groupby("anio")["viajeros_total"].sum().reset_index()
tiene_gp = termas.groupby("anio")["tiene_motogp"].first().reset_index()
viajeros_anio = viajeros_anio.merge(tiene_gp, on="anio")

fig1 = go.Figure()
fig1.add_trace(go.Bar(
    x=viajeros_anio["anio"], y=viajeros_anio["viajeros_total"],
    marker_color=["#0891B2" if g else "#CBD5E1" for g in viajeros_anio["tiene_motogp"]],
    text=[f"{v:,.0f}" for v in viajeros_anio["viajeros_total"]],
    textposition="outside"
))
fig1.add_hline(y=sin_gp*2, line_dash="dash", line_color="#94A3B8",
               annotation_text="Baseline sin MotoGP")
fig1.update_layout(height=350, margin=dict(l=0,r=0,t=30,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Viajeros (mar+abr)", gridcolor="#F1F5F9"),
    xaxis=dict(dtick=1), showlegend=False)
st.plotly_chart(fig1, use_container_width=True)
st.caption("🔵 Azul = año con MotoGP · Gris = año sin MotoGP")

# ── G2: Termas vs Capital ─────────────────────────────────────────────────────
st.markdown("### Termas vs. Capital — el efecto diferencial")
vt = termas.groupby("anio")["viajeros_total"].sum().reset_index().rename(columns={"viajeros_total":"termas"})
vc = capital.groupby("anio")["viajeros_total"].sum().reset_index().rename(columns={"viajeros_total":"capital"})
comp = vt.merge(vc, on="anio")

fig2 = go.Figure()
fig2.add_trace(go.Scatter(x=comp["anio"], y=comp["termas"],
    name="Termas", line=dict(color="#0891B2", width=2.5), mode="lines+markers"))
fig2.add_trace(go.Scatter(x=comp["anio"], y=comp["capital"],
    name="Capital", line=dict(color="#94A3B8", width=2), mode="lines+markers"))
fig2.update_layout(height=300, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Viajeros (mar+abr)", gridcolor="#F1F5F9"),
    xaxis=dict(dtick=1))
st.plotly_chart(fig2, use_container_width=True)

# ── G3: Uplift ────────────────────────────────────────────────────────────────
st.markdown("### Uplift atribuible al MotoGP por edición")
uplift_anio = termas.groupby(["anio","tiene_motogp"])["uplift_vs_baseline"].sum().reset_index()
uplift_gp = uplift_anio[uplift_anio["tiene_motogp"] == 1]

fig3 = go.Figure()
fig3.add_trace(go.Bar(
    x=uplift_gp["anio"], y=uplift_gp["uplift_vs_baseline"],
    marker_color="#0891B2",
    text=[f"+{int(v):,}" if v > 0 else f"{int(v):,}" for v in uplift_gp["uplift_vs_baseline"]],
    textposition="outside"
))
fig3.add_hline(y=0, line_color="#0F172A", line_width=1)
fig3.update_layout(height=280, margin=dict(l=0,r=0,t=30,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Viajeros adicionales", gridcolor="#F1F5F9"),
    xaxis=dict(dtick=1), showlegend=False)
st.plotly_chart(fig3, use_container_width=True)

st.divider()
st.info("**2025 fue el último MotoGP en Termas.** El evento se traslada a Buenos Aires en 2026. Este análisis cuantifica exactamente cuánto pierde SDE.")
st.caption("Fuentes: EOH (INDEC/SINTA) · ANAC · Modelo diff-in-diff.")
