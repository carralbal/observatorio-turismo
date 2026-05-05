import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import lecturas
import style

st.set_page_config(page_title="Pulso Estimado · Observatorio", page_icon="🔬", layout="wide")

@st.cache_data
def load_est():
    df = pd.read_csv("dashboard/data_pulso_estimado.csv")
    df["fecha"] = pd.to_datetime(df["fecha"])
    return df

@st.cache_data
def load_inf():
    df = pd.read_csv("dashboard/data_airdna_sde.csv")
    df["fecha"] = pd.to_datetime(df["fecha"])
    return df

df_raw    = load_est()
df_inf_raw = load_inf()
df_raw["anio"] = df_raw["fecha"].dt.year
df_inf_raw["anio"] = df_inf_raw["fecha"].dt.year

style.aplicar_estilo()

st.markdown("""
<h1 style='font-size:1.8rem;font-weight:900;color:#0F172A;margin-bottom:4px'>
🔬 Pulso SDE — Serie Extendida con Estimación
</h1>
<p style='color:#94A3B8;font-size:0.85rem;margin-top:0'>
EOH real hasta nov 2025 · Estimación OLS dic 2025 → presente · IC 80%
</p>
""", unsafe_allow_html=True)

# ── FILTRO ────────────────────────────────────────────────────────────────────
anio_min = int(df_raw["anio"].min())
anio_max = int(df_raw["anio"].max())
rango = st.slider("Período", anio_min, anio_max, (2022, anio_max))
df      = df_raw[(df_raw["anio"] >= rango[0]) & (df_raw["anio"] <= rango[1])]
df_inf  = df_inf_raw[(df_inf_raw["anio"] >= rango[0]) & (df_inf_raw["anio"] <= rango[1])]

termas   = df[df["localidad"] == "Termas"].sort_values("fecha")
capital  = df[df["localidad"] == "Santiago del Estero"].sort_values("fecha")
t_inf    = df_inf[df_inf["mercado"] == "Termas de Rio Hondo"].sort_values("fecha")
c_inf    = df_inf[df_inf["mercado"] == "Santiago del Estero"].sort_values("fecha")

ultimo_t = termas.iloc[-1]
ultimo_c = capital.iloc[-1]
meses_est = df[df["flag_estimado"] == 1]["fecha"].nunique()

st.info("Los meses con **línea punteada y banda gris** son estimaciones OLS (R²=0.865 Termas · R²=0.804 Capital). No reemplazan la EOH — la extienden mientras INDEC no la reanude.")

# ── LECTURA ───────────────────────────────────────────────────────────────────
icon = "🔬" if ultimo_t.flag_estimado else "✅"
tipo = "estimado" if ultimo_t.flag_estimado else "EOH real"
st.markdown(f"""
<div style='background:#F0F9FF;border-left:4px solid #0891B2;padding:16px 20px;border-radius:6px;margin:12px 0'>
<p style='font-size:1.25rem;font-weight:800;color:#0F172A;margin:0 0 10px 0'>
{icon} ¿Cuántos turistas recibió SDE mientras la EOH estuvo suspendida?
</p>
<p style='color:#1E293B;margin:0;font-size:1.05rem;line-height:1.6'>
En <strong>{ultimo_t.fecha.strftime('%b %Y')}</strong>, el modelo estima que Termas recibió
<strong>{int(ultimo_t.viajeros):,} viajeros</strong> [{int(ultimo_t.viajeros_ic_low):,}–{int(ultimo_t.viajeros_ic_high):,}] —
dato <strong>{tipo}</strong>.
La Capital suma <strong>{int(ultimo_c.viajeros):,} viajeros</strong>.
Son <strong>{meses_est} meses</strong> sin EOH oficial. El modelo usa ocupación del alquiler temporario,
búsquedas digitales, tipo de cambio e IPC hotelero como predictores.
</p>
</div>
""", unsafe_allow_html=True)

st.divider()

# ── KPIs ─────────────────────────────────────────────────────────────────────
k1, k2, k3, k4 = st.columns(4)
with k1:
    st.metric(f"Viajeros Termas {icon}", f"{int(ultimo_t.viajeros):,}", ultimo_t.fecha.strftime("%b %Y"))
with k2:
    st.metric(f"Viajeros Capital {icon}", f"{int(ultimo_c.viajeros):,}", ultimo_c.fecha.strftime("%b %Y"))
with k3:
    st.metric("Meses estimados", f"{meses_est}", "sin EOH oficial")
with k4:
    r2 = ultimo_t.get("modelo_r2", 0.865)
    st.metric("R² del modelo", f"{r2:.3f}" if r2 else "0.865", "Termas")

st.divider()

# ── G1: Termas ────────────────────────────────────────────────────────────────
st.markdown("### Termas de Río Hondo — viajeros hospedados")
t_real = termas[termas["flag_estimado"] == 0]
t_est  = termas[termas["flag_estimado"] == 1]
fig1 = go.Figure()
if len(t_est) > 0:
    fig1.add_trace(go.Scatter(
        x=pd.concat([t_est["fecha"], t_est["fecha"][::-1]]),
        y=pd.concat([t_est["viajeros_ic_high"], t_est["viajeros_ic_low"][::-1]]),
        fill="toself", fillcolor="rgba(148,163,184,0.15)",
        line=dict(color="rgba(0,0,0,0)"), name="Rango estimado"))
fig1.add_trace(go.Scatter(x=t_real["fecha"], y=t_real["viajeros"],
    name="Dato real (EOH)", line=dict(color=style.LINE_COLOR, width=2.5)))
if len(t_est) > 0:
    fig1.add_trace(go.Scatter(x=t_est["fecha"], y=t_est["viajeros"],
        name="Estimación OLS", line=dict(color=style.LINE_COLOR, width=2.5, dash="dash"),
        mode="lines+markers", marker=dict(symbol="diamond", size=8)))
fig1.update_layout(height=320, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1), plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Viajeros", gridcolor="#F1F5F9"), xaxis=dict(gridcolor="#F1F5F9"))
st.plotly_chart(fig1, use_container_width=True)

# ── G2: Capital ───────────────────────────────────────────────────────────────
st.markdown("### Santiago del Estero Capital — viajeros hospedados")
c_real = capital[capital["flag_estimado"] == 0]
c_est  = capital[capital["flag_estimado"] == 1]
fig2 = go.Figure()
if len(c_est) > 0:
    fig2.add_trace(go.Scatter(
        x=pd.concat([c_est["fecha"], c_est["fecha"][::-1]]),
        y=pd.concat([c_est["viajeros_ic_high"], c_est["viajeros_ic_low"][::-1]]),
        fill="toself", fillcolor="rgba(148,163,184,0.15)",
        line=dict(color="rgba(0,0,0,0)"), name="Rango estimado"))
fig2.add_trace(go.Scatter(x=c_real["fecha"], y=c_real["viajeros"],
    name="Dato real (EOH)", line=dict(color=style.LINE_COLOR_2, width=2.5)))
if len(c_est) > 0:
    fig2.add_trace(go.Scatter(x=c_est["fecha"], y=c_est["viajeros"],
        name="Estimación OLS", line=dict(color=style.LINE_COLOR_2, width=2.5, dash="dash"),
        mode="lines+markers", marker=dict(symbol="diamond", size=8)))
fig2.update_layout(height=300, margin=dict(l=0,r=0,t=10,b=0),
    legend=dict(orientation="h", y=1.1), plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="Viajeros", gridcolor="#F1F5F9"), xaxis=dict(gridcolor="#F1F5F9"))
st.plotly_chart(fig2, use_container_width=True)

# ── G3: Ocupación informal ────────────────────────────────────────────────────
if len(t_inf) > 0:
    st.divider()
    st.markdown("### Ocupación del sector de alquiler temporario")
    fig3 = go.Figure()
    fig3.add_trace(go.Scatter(x=t_inf["fecha"], y=t_inf["occ_informal_pct"],
        name="Termas", line=dict(color=style.LINE_COLOR, width=2), mode="lines+markers", marker=dict(size=5)))
    fig3.add_trace(go.Scatter(x=c_inf["fecha"], y=c_inf["occ_informal_pct"],
        name="Capital", line=dict(color=style.LINE_COLOR_2, width=2), mode="lines+markers", marker=dict(size=5)))
    fig3.update_layout(height=260, margin=dict(l=0,r=0,t=10,b=0),
        legend=dict(orientation="h", y=1.1), plot_bgcolor="white", paper_bgcolor="white",
        yaxis=dict(title="Ocupación (%)", gridcolor="#F1F5F9", range=[0,100]),
        xaxis=dict(gridcolor="#F1F5F9"))
    st.plotly_chart(fig3, use_container_width=True)

st.divider()
st.caption("Fuentes: EOH INDEC/SINTA · Modelo OLS · Plataformas alquiler temporario · Google Trends · BCRA · IPC INDEC")
