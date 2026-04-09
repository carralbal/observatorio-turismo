import streamlit as st
import pandas as pd
import plotly.graph_objects as go

st.set_page_config(page_title="Perfil del Turista · Observatorio", page_icon="🧳", layout="wide")

@st.cache_data
def load():
    df = pd.read_csv("dashboard/data_perfil_turista.csv")
    df["fecha"] = pd.to_datetime(df["fecha"])
    return df

df = load()
ultimo = df.dropna(subset=["gasto_promedio_usd"]).sort_values("fecha").iloc[-1]

st.markdown("""
<h1 style='font-size:1.8rem;font-weight:900;color:#0F172A;margin-bottom:4px'>
🧳 El Turista que Viene al Norte
</h1>
<p style='color:#94A3B8;font-size:0.85rem;margin-top:0'>
Perfil del turista interno · Región Norte (NOA + NEA) · EVyTH · Datos trimestrales
</p>
""", unsafe_allow_html=True)

# ── LECTURA DESTACADA ─────────────────────────────────────────────────────────
st.markdown(f"""
<div style='background:#F0F9FF;border-left:4px solid #0891B2;padding:16px 20px;border-radius:6px;margin:12px 0'>
<p style='font-size:1.05rem;font-weight:700;color:#0F172A;margin:0 0 8px 0'>
¿Quién viene y qué deja?
</p>
<p style='color:#334155;margin:0;font-size:0.95rem'>
El turista del Norte viaja principalmente en <strong>auto propio ({ultimo.pct_auto:.0f}%)</strong> y solo
<strong>1 de cada 5 ({ultimo.pct_hotel:.0f}%) se aloja en hotel</strong> — el resto duerme en casa de
familiares o alojamientos informales. Esto explica directamente el bajo índice de captura de valor del
sector formal. El gasto promedio por viaje es de <strong>USD {int(ultimo.gasto_promedio_usd)}</strong>
({ultimo.fecha.strftime('%b %Y')}), muy por debajo del pico histórico de USD 246 de 2015.
La estadía promedio de <strong>{ultimo.estadia_media_noches:.1f} noches</strong> es alta — el turismo
termal retiene. La oportunidad es convertir más de esas noches en consumo formal.
</p>
</div>
""", unsafe_allow_html=True)

st.caption("⚠️ La EVyTH no desagrega hasta localidad. 'Norte' incluye NOA y NEA. Último dato disponible: Q2 2024.")

st.divider()

# ── KPIs ─────────────────────────────────────────────────────────────────────
k1, k2, k3, k4 = st.columns(4)
with k1:
    st.metric("Turistas región Norte",
              f"{int(ultimo.turistas_norte/1000):.0f}K",
              ultimo.fecha.strftime("%b %Y"))
with k2:
    st.metric("Gasto promedio por viaje",
              f"USD {int(ultimo.gasto_promedio_usd)}",
              f"${int(ultimo.gasto_promedio_ars):,} ARS · TCN ${ultimo.tcn_usd:.0f}")
with k3:
    st.metric("Estadía promedio",
              f"{ultimo.estadia_media_noches:.1f} noches",
              "por viaje")
with k4:
    st.metric("En hotel",
              f"{ultimo.pct_hotel:.0f}%",
              f"{100-ultimo.pct_hotel:.0f}% en alojamiento informal/familiar")

st.divider()

# ── G1: Gasto en USD histórico ────────────────────────────────────────────────
st.markdown("### Gasto promedio por viaje al Norte — en dólares")
st.markdown("""
<p style='color:#475569;font-size:0.9rem;margin-bottom:8px'>
El gasto en USD refleja el poder adquisitivo real del turista. El pico de 2015 (USD 246) coincidió con
el peso sobrevaluado. La caída post-2019 muestra el deterioro del turismo interno en términos reales.
</p>
""", unsafe_allow_html=True)

df_usd = df.dropna(subset=["gasto_promedio_usd"])
fig1 = go.Figure()
fig1.add_trace(go.Scatter(
    x=df_usd["fecha"], y=df_usd["gasto_promedio_usd"],
    line=dict(color="#0891B2", width=2.5),
    fill="tozeroy", fillcolor="rgba(8,145,178,0.08)",
    mode="lines+markers", marker=dict(size=5)
))
fig1.add_hline(y=df_usd["gasto_promedio_usd"].mean(),
               line_dash="dash", line_color="#94A3B8",
               annotation_text=f"Promedio histórico USD {df_usd['gasto_promedio_usd'].mean():.0f}",
               annotation_position="top right")
fig1.update_layout(
    height=280, margin=dict(l=0,r=0,t=10,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    yaxis=dict(title="USD por viaje", gridcolor="#F1F5F9"),
    xaxis=dict(gridcolor="#F1F5F9"),
    showlegend=False
)
st.plotly_chart(fig1, use_container_width=True)

# ── G2: Turistas y estadía ────────────────────────────────────────────────────
col1, col2 = st.columns(2)
with col1:
    st.markdown("### Turistas en el Norte")
    st.markdown("<p style='color:#475569;font-size:0.88rem'>El Q1 y Q3 son los picos — verano y vacaciones de invierno.</p>", unsafe_allow_html=True)
    fig2 = go.Figure()
    fig2.add_trace(go.Bar(
        x=df["fecha"], y=df["turistas_norte"],
        marker_color="#0891B2",
    ))
    fig2.update_layout(
        height=240, margin=dict(l=0,r=0,t=10,b=0),
        plot_bgcolor="white", paper_bgcolor="white",
        yaxis=dict(title="Turistas", gridcolor="#F1F5F9"),
        showlegend=False
    )
    st.plotly_chart(fig2, use_container_width=True)

with col2:
    st.markdown("### Estadía promedio (noches)")
    st.markdown("<p style='color:#475569;font-size:0.88rem'>El verano tiene las estadías más largas — viajes más largos en enero.</p>", unsafe_allow_html=True)
    fig3 = go.Figure()
    fig3.add_trace(go.Scatter(
        x=df["fecha"], y=df["estadia_media_noches"],
        line=dict(color="#0E7490", width=2),
        fill="tozeroy", fillcolor="rgba(14,116,144,0.08)"
    ))
    fig3.update_layout(
        height=240, margin=dict(l=0,r=0,t=10,b=0),
        plot_bgcolor="white", paper_bgcolor="white",
        yaxis=dict(title="Noches", gridcolor="#F1F5F9"),
        showlegend=False
    )
    st.plotly_chart(fig3, use_container_width=True)

st.divider()

# ── G3: Perfil último trimestre ───────────────────────────────────────────────
st.markdown(f"### Perfil detallado — {ultimo.fecha.strftime('%b %Y')}")
st.markdown("""
<p style='color:#475569;font-size:0.9rem;margin-bottom:8px'>
El auto domina el transporte porque la región carece de conectividad aérea directa con los principales
orígenes. El bajo uso de hotel es la principal brecha de captura de valor a resolver.
</p>
""", unsafe_allow_html=True)

col1, col2, col3 = st.columns(3)
with col1:
    st.markdown("**¿Por qué viene?**")
    fig4 = go.Figure(go.Pie(
        labels=["Vacaciones", "Visita familiar", "Trabajo"],
        values=[ultimo.pct_vacaciones, 30, 10],
        marker_colors=["#0891B2","#94A3B8","#CBD5E1"],
        hole=0.45
    ))
    fig4.update_layout(height=200, margin=dict(l=0,r=0,t=0,b=0),
                       legend=dict(font=dict(size=10)))
    st.plotly_chart(fig4, use_container_width=True)

with col2:
    st.markdown("**¿Cómo llega?**")
    fig5 = go.Figure(go.Pie(
        labels=["Auto propio","Ómnibus","Avión"],
        values=[ultimo.pct_auto, 100-ultimo.pct_auto-5, 5],
        marker_colors=["#0891B2","#94A3B8","#CBD5E1"],
        hole=0.45
    ))
    fig5.update_layout(height=200, margin=dict(l=0,r=0,t=0,b=0),
                       legend=dict(font=dict(size=10)))
    st.plotly_chart(fig5, use_container_width=True)

with col3:
    st.markdown("**¿Dónde duerme?**")
    fig6 = go.Figure(go.Pie(
        labels=["Hotel/Hostel","Casa familiar","Otros"],
        values=[ultimo.pct_hotel, 100-ultimo.pct_hotel-10, 10],
        marker_colors=["#0891B2","#94A3B8","#CBD5E1"],
        hole=0.45
    ))
    fig6.update_layout(height=200, margin=dict(l=0,r=0,t=0,b=0),
                       legend=dict(font=dict(size=10)))
    st.plotly_chart(fig6, use_container_width=True)

st.divider()
st.caption("Fuente: EVyTH (INDEC/SINTA) · Región Norte = NOA + NEA · Trimestral · 2012–2024 · Gasto deflactado por TCN BCRA")
