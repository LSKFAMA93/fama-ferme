import { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { formatFCFA, getBatchLiveCount, formatDateFr } from '../utils/helpers'

// Enregistrement des composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
)

export default function Dashboard({ data, onNavigate, userRole }) {
  const [periodDays, setPeriodDays] = useState(7) // 7 ou 30 jours
  const isAdmin = userRole === 'admin'

  const { batches = [], dailyLogs = [], sales = [], expenses = [], inventoryItems = [] } = data

  // 1. Calculs des KPIs
  const activeBatches = batches.filter((b) => b.status === 'active')
  const totalLiveBirds = activeBatches.reduce((sum, b) => sum + getBatchLiveCount(b, dailyLogs), 0)

  // Saisies du jour ou la plus récente
  const todayStr = new Date().toISOString().split('T')[0]
  const todayLogs = dailyLogs.filter((l) => l.date === todayStr)
  const displayLogs = todayLogs.length > 0 ? todayLogs : dailyLogs.slice(-1) // Repli sur la dernière saisie

  const todayEggsIntact = displayLogs.reduce((sum, l) => sum + (Number(l.eggsIntact) || 0), 0)
  const todayEggsBroken = displayLogs.reduce((sum, l) => sum + (Number(l.eggsBroken) || 0), 0)
  const todayTotalEggs = todayEggsIntact + todayEggsBroken
  const todayMortality = todayLogs.reduce((sum, l) => sum + (Number(l.mortality) || 0), 0)
  const todayFeedKg = todayLogs.reduce((sum, l) => sum + (Number(l.feedQuantityKg) || 0), 0)
  const todayWaterLiters = todayLogs.reduce((sum, l) => sum + (Number(l.waterQuantityL) || 0), 0)
  const todayBrokenPercent = todayTotalEggs > 0 ? ((todayEggsBroken / todayTotalEggs) * 100).toFixed(1) : '0.0'

  // Pondeuses actives
  const layerBatches = activeBatches.filter((b) => b.type === 'pondeuses')
  const layerBirds = layerBatches.reduce((sum, b) => sum + getBatchLiveCount(b, dailyLogs), 0)
  const layRate = layerBirds > 0 ? ((todayTotalEggs / layerBirds) * 100).toFixed(1) : '0.0'

  // Chiffre d'Affaires du mois en cours
  const currentMonth = todayStr.substring(0, 7) // 'YYYY-MM'
  const monthSales = sales.filter((s) => s.date && s.date.startsWith(currentMonth))
  const monthRevenue = monthSales.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0)

  // Dépenses du mois
  const monthExpenses = expenses.filter((e) => e.date && e.date.startsWith(currentMonth))
  const monthExpenseTotal = monthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  const monthNet = monthRevenue - monthExpenseTotal

  // Alertes stocks bas
  const lowStockItems = inventoryItems.filter(
    (item) => Number(item.quantity) <= Number(item.minAlertThreshold)
  )

  // 2. Préparation des données pour les graphiques (7 ou 30 jours), regroupées par jour.
  const periodDates = Array.from({ length: periodDays }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (periodDays - index - 1))
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${date.getFullYear()}-${month}-${day}`
  })
  const logsByDate = new Map()
  dailyLogs.forEach((log) => {
    const totals = logsByDate.get(log.date) || { eggsIntact: 0, eggsBroken: 0, mortality: 0 }
    totals.eggsIntact += Number(log.eggsIntact) || 0
    totals.eggsBroken += Number(log.eggsBroken) || 0
    totals.mortality += Number(log.mortality) || 0
    logsByDate.set(log.date, totals)
  })

  const dateLabels = periodDates.map(formatDateFr)
  const eggProductionData = periodDates.map((date) => logsByDate.get(date)?.eggsIntact || 0)
  const eggBrokenData = periodDates.map((date) => logsByDate.get(date)?.eggsBroken || 0)
  const mortalityData = periodDates.map((date) => logsByDate.get(date)?.mortality || 0)

  // Données Chart.js : Production d'œufs
  const eggsChartData = {
    labels: dateLabels,
    datasets: [
      {
        label: 'Œufs intacts (valides)',
        data: eggProductionData,
        borderColor: '#2d6a4f',
        backgroundColor: 'rgba(45, 106, 79, 0.15)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#1b4332',
      },
      {
        label: 'Œufs cassés / fêlés',
        data: eggBrokenData,
        borderColor: '#d90429',
        backgroundColor: 'rgba(217, 4, 41, 0.15)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#d90429',
      },
    ],
  }

  // Données Chart.js : Mortalité
  const mortalityChartData = {
    labels: dateLabels,
    datasets: [
      {
        label: 'Mortalité journalière (sujets)',
        data: mortalityData,
        backgroundColor: '#e63946',
        borderColor: '#b7094c',
        borderWidth: 1.5,
        borderRadius: 4,
      },
    ],
  }

  // Données Chart.js : Bilan Financier (6 derniers mois)
  const monthsMap = {}
  sales.forEach((s) => {
    const m = (s.date || '').substring(0, 7)
    if (!m) return
    if (!monthsMap[m]) monthsMap[m] = { sales: 0, expenses: 0 }
    monthsMap[m].sales += Number(s.totalAmount) || 0
  })
  expenses.forEach((e) => {
    const m = (e.date || '').substring(0, 7)
    if (!m) return
    if (!monthsMap[m]) monthsMap[m] = { sales: 0, expenses: 0 }
    monthsMap[m].expenses += Number(e.amount) || 0
  })

  const sortedMonths = Object.keys(monthsMap).sort().slice(-6)
  const financialChartData = {
    labels: sortedMonths.map((m) => {
      const [y, mm] = m.split('-')
      const names = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
      return `${names[Number(mm) - 1]} ${y}`
    }),
    datasets: [
      {
        label: 'Ventes (Entrées FCFA)',
        data: sortedMonths.map((m) => monthsMap[m].sales),
        backgroundColor: '#2d6a4f',
      },
      {
        label: 'Dépenses (Sorties FCFA)',
        data: sortedMonths.map((m) => monthsMap[m].expenses),
        backgroundColor: '#e76f51',
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { boxWidth: 12, font: { size: 12 } },
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } },
    },
  }

  return (
    <div className="dashboard-view">
      {/* Alerte stock critique */}
      {lowStockItems.length > 0 && (
        <div className="alert-card warning">
          <span className="alert-icon">⚠️</span>
          <div className="alert-content">
            <strong>Alerte Stock Critique ({lowStockItems.length}) :</strong>
            <span>
              {' '}
              {lowStockItems.map((i) => `${i.name} (${i.quantity} ${i.unit})`).join(', ')}.
            </span>
          </div>
          <button
            type="button"
            className="alert-action-btn"
            onClick={() => onNavigate('stocks')}
          >
            Gérer les stocks
          </button>
        </div>
      )}

      {/* Cartes KPI Principales */}
      <div className="kpi-grid">
        <div className="kpi-card highlight-green">
          <div className="kpi-header">
            <span className="kpi-title">Effectif Vivant Actuel</span>
            <span className="kpi-icon">🐥</span>
          </div>
          <div className="kpi-value">{totalLiveBirds.toLocaleString('fr-FR')}</div>
          <div className="kpi-sub">
            Sujets sur site (déduction auto des pertes)
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Pertes du Jour</span>
            <span className="kpi-icon">📉</span>
          </div>
          <div className="kpi-value">{todayMortality.toLocaleString('fr-FR')}</div>
          <div className="kpi-sub">Sujets déclarés morts aujourd'hui</div>
        </div>

        <div className="kpi-card highlight-amber">
          <div className="kpi-header">
            <span className="kpi-title">Ponte du Jour</span>
            <span className="kpi-icon">🥚</span>
          </div>
          <div className="kpi-value">
            {todayEggsIntact}{' '}
            <small style={{ fontSize: '0.6em', color: '#6b7280' }}>
              ({Math.floor(todayEggsIntact / 30)} plat.)
            </small>
          </div>
          <div className="kpi-sub">
            Taux de ponte : <strong>{layRate}%</strong> | Casse : <strong>{todayBrokenPercent}%</strong> ({todayEggsBroken} œufs)
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Consommation du Jour</span>
            <span className="kpi-icon">🌽</span>
          </div>
          <div className="kpi-value">{todayFeedKg.toLocaleString('fr-FR')} kg</div>
          <div className="kpi-sub">
            Eau : <strong>{todayWaterLiters.toLocaleString('fr-FR')} L</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">{isAdmin ? 'Trésorerie du Mois' : 'Chiffre d’Affaires Mois'}</span>
            <span className="kpi-icon">💰</span>
          </div>
          <div className="kpi-value">{formatFCFA(isAdmin ? monthNet : monthRevenue)}</div>
          <div className="kpi-sub">
            {isAdmin ? (
              <span>
                Recettes : {formatFCFA(monthRevenue)} | Dépenses : {formatFCFA(monthExpenseTotal)}
                {' '}| Solde net :{' '}
                <strong style={{ color: monthNet >= 0 ? '#10b981' : '#ef4444' }}>
                  {formatFCFA(monthNet)}
                </strong>
              </span>
            ) : (
              <span>Ventes d’œufs, poulets et fientes enregistrées</span>
            )}
          </div>
        </div>
      </div>

      {/* Raccourci d'action rapide */}
      <div className="quick-actions-bar">
        <button
          type="button"
          className="btn-primary-large"
          onClick={() => onNavigate('daily-log')}
        >
          ✍️ Nouvelle Saisie Quotidienne Terrain
        </button>
        <button
          type="button"
          className="btn-secondary-large"
          onClick={() => onNavigate('sales')}
        >
          🛒 Enregistrer une Vente Directe
        </button>
      </div>

      {/* Filtre de période pour les graphiques */}
      <div className="chart-header-row">
        <h2 className="section-title">Courbes d'évolution & Performance</h2>
        <div className="period-pills">
          <button
            type="button"
            className={`pill-btn ${periodDays === 7 ? 'active' : ''}`}
            onClick={() => setPeriodDays(7)}
          >
            7 derniers jours
          </button>
          <button
            type="button"
            className={`pill-btn ${periodDays === 30 ? 'active' : ''}`}
            onClick={() => setPeriodDays(30)}
          >
            30 derniers jours
          </button>
        </div>
      </div>

      {/* Grille des graphiques */}
      <div className="charts-grid">
        {/* Graphique 1 : Production d'œufs */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>📈 Production d'Œufs ({periodDays} jours)</h3>
            <span className="chart-tag">Ponte journalière</span>
          </div>
          <div className="chart-wrapper">
            <Line data={eggsChartData} options={chartOptions} />
          </div>
        </div>

        {/* Graphique 2 : Mortalité journalière */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>📉 Mortalité Journalière ({periodDays} jours)</h3>
            <span className="chart-tag red">Suivi sanitaire</span>
          </div>
          <div className="chart-wrapper">
            <Bar data={mortalityChartData} options={chartOptions} />
          </div>
        </div>

        {/* Graphique 3 : Bilan Financier Mensuel (Visible pour Admin) */}
        {isAdmin && (
          <div className="chart-card full-width">
            <div className="chart-card-header">
              <h3>💳 Bilan Mensuel : Ventes vs Dépenses (FCFA)</h3>
              <span className="chart-tag green">Flux de trésorerie</span>
            </div>
            <div className="chart-wrapper">
              <Bar data={financialChartData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>

      {/* Liste des bandes actives avec statut rapide */}
      <div className="card-box mt-4">
        <div className="box-header">
          <h3>🐔 État des Bandes sur Site</h3>
          <button
            type="button"
            className="link-btn"
            onClick={() => onNavigate('batches')}
          >
            Voir tout &rarr;
          </button>
        </div>
        <div className="batches-summary-table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th>Bande</th>
                <th>Type</th>
                <th>Souche</th>
                <th>Effectif Vivant</th>
                <th>Mortalité Cumulée</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => {
                const live = getBatchLiveCount(batch, dailyLogs)
                const dead = (Number(batch.initialCount) || 0) - live
                const deadRate = batch.initialCount > 0 ? ((dead / batch.initialCount) * 100).toFixed(1) : 0
                return (
                  <tr key={batch.id}>
                    <td>
                      <strong>{batch.name}</strong>
                    </td>
                    <td>
                      <span className={`badge ${batch.type === 'pondeuses' ? 'badge-amber' : 'badge-blue'}`}>
                        {batch.type === 'pondeuses' ? 'Pondeuses' : 'Poulets Chair'}
                      </span>
                    </td>
                    <td>{batch.breed}</td>
                    <td>
                      <strong>{live.toLocaleString('fr-FR')}</strong> / {batch.initialCount}
                    </td>
                    <td>
                      <span style={{ color: dead > 0 ? '#dc2626' : '#16a34a' }}>
                        {dead} morts ({deadRate}%)
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-green">En cours</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
