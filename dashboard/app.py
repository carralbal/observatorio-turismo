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

# ── HERO ──────────────────────────────────────────────────────────────────────
st.markdown("""
<div style='background: linear-gradient(to right, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.70) 40%, rgba(10,10,10,0.28) 80%, rgba(10,10,10,0.10) 100%), url("https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=80") center/cover no-repeat; padding:38px 28px 0 28px; margin:-1rem -1rem 0 -1rem;'>
    <div style='display:flex;align-items:center;gap:10px;margin-bottom:22px'>
        <span style='display:inline-block;width:18px;height:8px;background:#FFFF00;transform:skewX(-14deg)'></span>
        <span style='font-size:11px;font-weight:600;color:#FAFAF7;opacity:0.85;letter-spacing:0.18em;text-transform:uppercase'>Observatorio de Turismo · SDE</span>
    </div>
    <h1 style='font-size:2.2rem;font-weight:300;color:#FAFAF7;letter-spacing:-0.025em;margin:0 0 14px 0;line-height:1.05;max-width:520px'>
        Santiago del Estero.<br/>Termas y Capital.
    </h1>
    <p style='font-size:0.9rem;font-weight:300;color:#FAFAF7;opacity:0.9;margin:0 0 26px 0;max-width:460px;line-height:1.6'>
        Datos oficiales al mes. Viajeros, ocupación, búsquedas y empleo en un solo lugar.
    </p>
    <div style='border-top:0.5px solid rgba(250,250,247,0.15);padding:18px 0;display:flex;gap:28px;flex-wrap:wrap'>
        <div style='display:flex;align-items:center;gap:10px'><span style='display:inline-block;width:14px;height:6px;background:#FFFF00;transform:skewX(-14deg)'></span><span style='font-size:10px;font-weight:500;color:#FAFAF7;opacity:0.65;letter-spacing:0.16em;text-transform:uppercase'>Datos oficiales</span></div>
        <div style='display:flex;align-items:center;gap:10px'><span style='display:inline-block;width:14px;height:6px;background:#FFFF00;transform:skewX(-14deg)'></span><span style='font-size:10px;font-weight:500;color:#FAFAF7;opacity:0.65;letter-spacing:0.16em;text-transform:uppercase'>Actualización mensual</span></div>
        <div style='display:flex;align-items:center;gap:10px'><span style='display:inline-block;width:14px;height:6px;background:#FFFF00;transform:skewX(-14deg)'></span><span style='font-size:10px;font-weight:500;color:#FAFAF7;opacity:0.65;letter-spacing:0.16em;text-transform:uppercase'>14 indicadores</span></div>
    </div>
</div>
""", unsafe_allow_html=True)

# ── FILTRO ────────────────────────────────────────────────────────────────────
st.markdown("<div style='height:24px'></div>", unsafe_allow_html=True)
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

# ── LECTURA DESTACADA ─────────────────────────────────────────────────────────
style.lectura_destacada(
    "¿Cómo está el turismo en SDE hoy?",
    f"En <strong>{ut.fecha.strftime('%b %Y')}</strong>, Termas recibió "
    f"<strong>{int(ut.viajeros_total):,} viajeros</strong> "
    f"con estadía de <strong>{ut.estadia_promedio:.2f} noches</strong>. "
    f"La Capital sumó <strong>{int(uc.viajeros_total):,} viajeros</strong>. "
    f"La señal IBT está en <strong>{ibt}/100</strong> — señal {señal}."
)

# ── KPIs ──────────────────────────────────────────────────────────────────────
style.eyebrow_titulo("Indicadores", f"Último mes · {ut.fecha.strftime('%b %Y')}")
k1, k2, k3, k4 = st.columns(4)
with k1:
    style.kpi_card(f"{int(ut.viajeros_total):,}", "Viajeros Termas")
with k2:
    style.kpi_card(f"{int(uc.viajeros_total):,}", "Viajeros Capital")
with k3:
    style.kpi_card(f"{ibt}/100", "IBT · Búsquedas", f"señal {señal}")
with k4:
    style.kpi_card(f"${ut.tcn_usd:,.0f}", "ARS/USD")

st.markdown("<div style='height:24px'></div>", unsafe_allow_html=True)

# ── VIAJEROS DARK ─────────────────────────────────────────────────────────────
style.eyebrow_titulo("Viajeros hospedados", "Evolución mensual — Termas vs. Capital")


fig1 = go.Figure()
fig1.add_trace(go.Scatter(
    x=termas["fecha"], y=termas["viajeros_total"],
    name="Termas", line=dict(color="#FAFAF7", width=2.5),
    fill="tozeroy", fillcolor="rgba(250,250,247,0.06)"
))
fig1.add_trace(go.Scatter(
    x=capital["fecha"], y=capital["viajeros_total"],
    name="Capital", line=dict(color="#C8C8BF", width=1.5, dash="dot")
))
style.apply_layout_dark(fig1, height=300,
    legend=dict(orientation="h", y=1.12, font=dict(color="#FAFAF7", size=12)))
st.plotly_chart(fig1, use_container_width=True)

st.markdown("<div style='height:24px'></div>", unsafe_allow_html=True)

# ── SEÑAL + ESTADÍA ───────────────────────────────────────────────────────────
col1, col2 = st.columns(2)

with col1:
    style.eyebrow_titulo("Señal anticipada", "IBT vs. viajeros")
    fig2 = go.Figure()
    fig2.add_trace(go.Bar(
        x=termas["fecha"], y=termas["ibt_termas"],
        name="IBT", marker_color="#888880", yaxis="y2"
    ))
    fig2.add_trace(go.Scatter(
        x=termas["fecha"], y=termas["viajeros_total"],
        name="Viajeros", line=dict(color=style.INK, width=2.5)
    ))
    style.apply_layout(fig2, height=280,
        legend=dict(orientation="h", y=1.12),
        yaxis=dict(title="Viajeros", gridcolor="#E8E8E4", tickfont=dict(size=12)),
        yaxis2=dict(title="IBT", overlaying="y", side="right", showgrid=False))
    st.plotly_chart(fig2, use_container_width=True)

with col2:
    style.eyebrow_titulo("Estadía promedio", "Noches por viajero")
    fig3 = go.Figure()
    fig3.add_trace(go.Scatter(
        x=termas["fecha"], y=termas["estadia_promedio"],
        name="Termas", line=dict(color=style.INK, width=2.5),
        fill="tozeroy", fillcolor=style.FILL_COLOR
    ))
    fig3.add_trace(go.Scatter(
        x=capital["fecha"], y=capital["estadia_promedio"],
        name="Capital", line=dict(color=style.SLATE, width=1.5, dash="dot")
    ))
    style.apply_layout(fig3, height=280,
        legend=dict(orientation="h", y=1.12),
        yaxis=dict(title="Noches", gridcolor="#E8E8E4", tickfont=dict(size=12)))
    st.plotly_chart(fig3, use_container_width=True)

# ── DONUT IBT ─────────────────────────────────────────────────────────────────
st.divider()
style.eyebrow_titulo("Señal digital", "Estado del IBT — Índice de Búsqueda Turística")
col_donut, col_lectura = st.columns([1, 2])

with col_donut:
    fig4 = go.Figure(go.Pie(
        values=[ibt, 100-ibt], labels=["IBT actual", ""],
        hole=0.72, marker=dict(colors=[style.INK, style.STONE]),
        textinfo="none", showlegend=False
    ))
    fig4.add_annotation(
        text=f"<b>{ibt}</b><br><span style='font-size:12px'>/ 100</span>",
        x=0.5, y=0.5, showarrow=False,
        font=dict(size=36, color=style.INK, family="Plus Jakarta Sans")
    )
    style.apply_layout(fig4, height=220, margin=dict(l=0,r=0,t=0,b=0))
    st.plotly_chart(fig4, use_container_width=True)
    st.markdown(
        f"<p style='text-align:center;font-size:0.9rem;font-weight:300;"
        f"color:{style.INK};letter-spacing:0.04em'>Señal {señal.upper()}</p>",
        unsafe_allow_html=True
    )

# ── FUENTES ───────────────────────────────────────────────────────────────────
st.divider()
style.logos_strip(["INDEC", "SIPA-AFIP", "ANAC", "CNRT", "Google Trends", "BCRA"])
st.caption(f"Datos al {df['fecha'].max().strftime('%m/%Y')} · Observatorio de Turismo SDE")
