import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import lecturas
import style

st.set_page_config(page_title="Madurez · Observatorio", page_icon="🏆", layout="wide")

@st.cache_data
def load():
    df = pd.read_csv("dashboard/data_madurez.csv")
    return df

df = load()
sde = df[df["provincia"] == "Santiago del Estero"].iloc[0]
pos = df.sort_values("score_madurez", ascending=False).reset_index(drop=True)
pos_sde = pos[pos["provincia"] == "Santiago del Estero"].index[0] + 1

style.aplicar_estilo()

st.markdown("""
<h1 style='font-size:1.8rem;font-weight:900;color:#0F172A;margin-bottom:4px'>
🏆 Madurez Turística Provincial
</h1>
<p style='color:#94A3B8;font-size:0.85rem;margin-top:0'>
Ranking de las 24 provincias argentinas según capacidad de gestión con datos
</p>
""", unsafe_allow_html=True)

# ── LECTURA ───────────────────────────────────────────────────────────────────
lecturas.madurez(sde["score_madurez"], pos_sde, sde["nivel_label"])
st.divider()

# ── KPIs ─────────────────────────────────────────────────────────────────────
k1, k2, k3, k4 = st.columns(4)
with k1:
    st.metric("Score SDE", f"{sde['score_madurez']:.1f}/5", "índice de madurez")
with k2:
    st.metric("Posición nacional", f"{pos_sde}° de 24", "entre todas las provincias")
with k3:
    st.metric("Nivel", sde["nivel_label"], "1=básico · 5=avanzado")
with k4:
    st.metric("Región NOA", "1° del NOA", "única en nivel 4")

st.divider()

# ── G1: Ranking ───────────────────────────────────────────────────────────────
st.markdown("### Ranking de madurez — 24 provincias")
ranking = df.sort_values("score_madurez", ascending=True)
fig1 = go.Figure()
fig1.add_trace(go.Bar(
    x=ranking["score_madurez"], y=ranking["provincia"], orientation="h",
    marker_color=["#0891B2" if p == "Santiago del Estero" else "#CBD5E1" for p in ranking["provincia"]],
    text=[f"{v:.1f}" for v in ranking["score_madurez"]], textposition="outside"
))
fig1.update_layout(height=600, margin=dict(l=0,r=60,t=10,b=0),
    plot_bgcolor="white", paper_bgcolor="white",
    xaxis=dict(title="Score (0-5)", gridcolor="#F1F5F9", range=[0,5.5]),
    showlegend=False)
st.plotly_chart(fig1, use_container_width=True)

st.divider()
st.caption("Metodología: 5 dimensiones · datos, conectividad, demanda, formalización, impacto")
