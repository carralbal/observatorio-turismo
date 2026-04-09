import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
import lecturas
import style

@st.cache_data
def load_pulso():
    df = pd.read_csv("dashboard/data_pulso.csv")
    df["fecha"] = pd.to_datetime(df["fecha"])
    return df[df["flag_covid"] == 0]

df_raw = load_pulso()
style.aplicar_estilo()

# ── PORTADA HERO ──────────────────────────────────────────────────────────────
st.markdown("""
<div style='
    background: linear-gradient(rgba(0,0,0,0.72), rgba(0,0,0,0.72)),
    url("https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=80") center/cover no-repeat;
    padding: 80px 48px 64px 48px;
    margin: -1rem -1rem 2rem -1rem;
    border-radius: 0;
'>
    <p style='color:#AAAAAA;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 12px 0'>
        OBSERVATORIO DE TURISMO
    </p>
    <h1 style='color:#FFFFFF;font-size:3.2rem;font-weight:900;margin:0 0 12px 0;line-height:1.1'>
        Santiago del Estero
    </h1>
    <p style='color:#CCCCCC;font-size:1.1rem;margin:0;font-weight:400'>
        Termas de Río Hondo · Capital · Datos al mes
    </p>
</div>
""", unsafe_allow_html=True)

# ── FILTRO ────────────────────────────────────────────────────────────────────
anio_min = int(df_raw["anio"].min())
anio_max = int(df_raw["anio"].max())
rango = st.slider("Período", anio_min, anio_max, (2019, anio_max))

df = df_raw[(df_raw["anio"] >= rango[0]) & (df_raw["anio"] <= rango[1])]
termas  = df[df["localidad"] == "Termas"].sort_values("fecha")
capital = df[df["localidad"] == "Santiago del Estero"].sort_values("fecha")

if len(termas) == 0:
    st.warning("Sin datos para el período.")
    st.stop()

ut = termas.iloc[-1]
uc = capital.iloc[-1]
ibt = int(ut.ibt_compuesto) if ut.ibt_compuesto == ut.ibt_compuesto else 0
señal = ("baja" if ibt < 25 else "alta" if ibt > 40 else "normal")

# ── LECTURA ───────────────────────────────────────────────────────────────────
style.lectura_destacada("¿Cómo está el turismo en SDE hoy?",
    f"En <strong>{ut.fecha.strftime('%b %Y')}</strong>, Termas recibió "
    f"<strong>{int(ut.viajeros_total):,} viajeros</strong> "
    f"con estadía de <strong>{ut.estadia_promedio:.2f} noches</strong>. "
    f"La Capital sumó <strong>{int(uc.viajeros_total):,} viajeros</strong>. "
    f"La señal de búsquedas (IBT) está en <strong>{ibt}/100</strong> — señal {señal}.")

# ── KPIs DONUTS ───────────────────────────────────────────────────────────────
st.markdown("<p style='font-size:0.8rem;text-transform:uppercase;letter-spacing:0.1em;color:#888;margin:24px 0 8px 0'>ÚLTIMO MES DISPONIBLE</p>", unsafe_allow_html=True)

k1, k2, k3, k4 = st.columns(4)

def kpi_box(col, valor, label, sub=""):
    col.markdown(f"""
<div style='background:#F5F5F5;padding:28px 20px;border-radius:8px;text-align:center'>
<p style='font-size:2.6rem;font-weight:900;color:#0F0F0F;margin:0;line-height:1'>{valor}</p>
<p style='font-size:0.9rem;font-weight:700;color:#0F0F0F;margin:8px 0 4px 0;text-transform:uppercase;letter-spacing:0.06em'>{label}</p>
<p style='font-size:0.8rem;color:#888888;margin:0'>{sub}</p>
</div>
""", unsafe_allow_html=True)

kpi_box(k1, f"{int(ut.viajeros_total):,}", "Viajeros Termas", ut.fecha.strftime("%b %Y"))
kpi_box(k2, f"{int(uc.viajeros_total):,}", "Viajeros Capital", ut.fecha.strftime("%b %Y"))
kpi_box(k3, f"{ibt}/100", "IBT · Búsquedas", f"señal {señal}")
kpi_box(k4, f"${ut.tcn_usd:,.0f}", "ARS/USD", ut.fecha.strftime("%b %Y"))

st.markdown("<br>", unsafe_allow_html=True)

# ── SECCIÓN CON FONDO GRIS ────────────────────────────────────────────────────
st.markdown("""
<div style='background:#0F0F0F;padding:32px 32px 8px 32px;border-radius:8px;margin:16px 0'>
<p style='color:#AAAAAA;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px 0'>VIAJEROS HOSPEDADOS</p>
<p style='color:#FFFFFF;font-size:1.4rem;font-weight:800;margin:0 0 16px 0'>Evolución mensual — Termas vs. Capital</p>
""", unsafe_allow_html=True)

fig1 = go.Figure()
fig1.add_trace(go.Scatter(
    x=termas["fecha"], y=termas["viajeros_total"],
    name="Termas", line=dict(color="#FFFFFF", width=2.5),
    fill="tozeroy", fillcolor="rgba(255,255,255,0.08)"
))
fig1.add_trace(go.Scatter(
    x=capital["fecha"], y=capital["viajeros_total"],
    name="Capital", line=dict(color="#888888", width=1.5, dash="dot")
))
fig1.update_layout(
    height=300, margin=dict(l=0,r=0,t=10,b=0),
    plot_bgcolor="#0F0F0F", paper_bgcolor="#0F0F0F",
    legend=dict(orientation="h", y=1.12, font=dict(color="#FFFFFF", size=13)),
    yaxis=dict(title="Viajeros", gridcolor="#333333", tickfont=dict(color="#888888", size=13)),
    xaxis=dict(gridcolor="#333333", tickfont=dict(color="#888888", size=13)),
    font=dict(family="Inter", color="#FFFFFF")
)
st.plotly_chart(fig1, use_container_width=True)
st.markdown("</div>", unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# ── G2 + G3 en columnas ───────────────────────────────────────────────────────
col1, col2 = st.columns(2)

with col1:
    st.markdown("### ✈️ Señal anticipada vs. ocupación")
    fig2 = go.Figure()
    fig2.add_trace(go.Bar(
        x=termas["fecha"], y=termas["ibt_termas"],
        name="IBT", marker_color="#E5E5E5", yaxis="y2"
    ))
    fig2.add_trace(go.Scatter(
        x=termas["fecha"], y=termas["viajeros_total"],
        name="Viajeros", line=dict(color="#0F0F0F", width=2.5)
    ))
    style.apply_layout(fig2, height=280,
        legend=dict(orientation="h", y=1.12),
        yaxis=dict(title="Viajeros", gridcolor="#F0F0F0", tickfont=dict(size=13)),
        yaxis2=dict(title="IBT", overlaying="y", side="right", showgrid=False))
    st.plotly_chart(fig2, use_container_width=True)

with col2:
    st.markdown("### 🛏️ Estadía promedio — noches")
    fig3 = go.Figure()
    fig3.add_trace(go.Scatter(
        x=termas["fecha"], y=termas["estadia_promedio"],
        name="Termas", line=dict(color="#0F0F0F", width=2.5),
        fill="tozeroy", fillcolor="rgba(15,15,15,0.06)"
    ))
    fig3.add_trace(go.Scatter(
        x=capital["fecha"], y=capital["estadia_promedio"],
        name="Capital", line=dict(color="#888888", width=1.5, dash="dot")
    ))
    style.apply_layout(fig3, height=280,
        legend=dict(orientation="h", y=1.12),
        yaxis=dict(title="Noches", gridcolor="#F0F0F0", tickfont=dict(size=13)))
    st.plotly_chart(fig3, use_container_width=True)

# ── DONUT IBT ─────────────────────────────────────────────────────────────────
st.divider()
st.markdown("### 📊 Estado de la señal digital — IBT")
col1, col2, col3 = st.columns([1,1,1])

with col2:
    fig4 = go.Figure(go.Pie(
        values=[ibt, 100-ibt],
        labels=["IBT actual", ""],
        hole=0.72,
        marker=dict(colors=["#0F0F0F","#F0F0F0"]),
        textinfo="none",
        showlegend=False
    ))
    fig4.add_annotation(
        text=f"<b>{ibt}</b><br><span style='font-size:12px'>/ 100</span>",
        x=0.5, y=0.5, showarrow=False,
        font=dict(size=36, color="#0F0F0F", family="Inter")
    )
    fig4.update_layout(
        height=220, margin=dict(l=0,r=0,t=0,b=0),
        plot_bgcolor="#FFFFFF", paper_bgcolor="#FFFFFF"
    )
    st.plotly_chart(fig4, use_container_width=True)
    st.markdown(f"<p style='text-align:center;font-size:1rem;font-weight:700;color:#0F0F0F'>Señal {señal.upper()}</p>", unsafe_allow_html=True)

st.divider()
st.caption(f"Fuentes: EOH (INDEC/SINTA) · Google Trends · BCRA · {df['fecha'].max().strftime('%B %Y')}")
