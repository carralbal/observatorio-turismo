import { createContext, useContext, useState } from 'react'

const PeriodoCtx = createContext()

export const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
export const AÑOS  = [2019, 2020, 2021, 2022, 2023, 2024, 2025]

export function PeriodoProvider({ children }) {
  const [anio, setAnio] = useState(null)
  const [mes,  setMes]  = useState(null)
  return (
    <PeriodoCtx.Provider value={{ anio, mes, setAnio, setMes, MESES, AÑOS }}>
      {children}
    </PeriodoCtx.Provider>
  )
}

export const usePeriodo = () => useContext(PeriodoCtx)

export function filterByPeriodo(rows, anio, mes) {
  if (!rows?.length) return rows
  return rows.filter(r => {
    const d = new Date(r.fecha)
    const matchAnio = anio ? d.getFullYear() === anio : true
    const matchMes  = mes  ? d.getMonth() + 1 === mes : true
    return matchAnio && matchMes
  })
}

export function periodoLabel(anio, mes, MESES) {
  if (!anio && !mes) return 'Todo el periodo'
  if (anio && mes)   return MESES[mes - 1] + ' ' + anio
  if (anio)          return String(anio)
  return MESES[mes - 1]
}
