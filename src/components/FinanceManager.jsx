import { useState } from 'react'
import { formatFCFA, formatDateFr } from '../utils/helpers'

export default function FinanceManager({ data, onAddExpense, onDeleteExpense }) {
  const { sales = [], expenses = [] } = data

  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [filterCategory, setFilterCategory] = useState('all')

  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Aliment',
    amount: '',
    beneficiary: '',
    description: '',
  })

  const handleCreateExpense = (e) => {
    e.preventDefault()
    if (!expenseForm.amount) return

    onAddExpense({
      ...expenseForm,
      id: 'exp-' + Date.now(),
      amount: Number(expenseForm.amount) || 0,
    })

    setShowExpenseModal(false)
    setExpenseForm({
      date: new Date().toISOString().split('T')[0],
      category: 'Aliment',
      amount: '',
      beneficiary: '',
      description: '',
    })
  }

  // Calculs Bilan
  const totalRevenues = sales.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  const netProfit = totalRevenues - totalExpenses

  // Dépenses par catégorie
  const categoriesList = [
    'Aliment',
    'Vétérinaire',
    'Salaires',
    'Eau & Électricité',
    'Transport',
    'Entretien / Matériel',
    'Amortissement',
    'Autre',
  ]

  const categoryTotals = {}
  categoriesList.forEach((cat) => (categoryTotals[cat] = 0))
  expenses.forEach((e) => {
    if (categoryTotals[e.category] !== undefined) {
      categoryTotals[e.category] += Number(e.amount) || 0
    } else {
      categoryTotals['Autre'] = (categoryTotals['Autre'] || 0) + (Number(e.amount) || 0)
    }
  })

  const filteredExpenses = expenses
    .filter((e) => filterCategory === 'all' || e.category === filterCategory)
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="finance-view">
      <div className="view-header">
        <div>
          <h2>📈 Suivi Financier & Bilan d'Exploitation</h2>
          <p>
            Suivi rigoureux des charges d'exploitation, salaires, achats d'aliments et calcul de la marge nette.
          </p>
        </div>
        <div className="action-buttons-wrap">
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowExpenseModal(true)}
          >
            ➕ Enregistrer une Dépense
          </button>
        </div>
      </div>

      {/* Cartes Synthèse Financière */}
      <div className="kpi-grid mb-4">
        <div className="kpi-card highlight-green">
          <div className="kpi-header">
            <span className="kpi-title">Recettes Totales (Ventes)</span>
            <span className="kpi-icon">💰</span>
          </div>
          <div className="kpi-value">{formatFCFA(totalRevenues)}</div>
          <div className="kpi-sub">Total des ventes d'œufs, poulets et fientes</div>
        </div>

        <div className="kpi-card highlight-amber">
          <div className="kpi-header">
            <span className="kpi-title">Charges Totales (Dépenses)</span>
            <span className="kpi-icon">💸</span>
          </div>
          <div className="kpi-value" style={{ color: '#dc2626' }}>
            {formatFCFA(totalExpenses)}
          </div>
          <div className="kpi-sub">Aliments, salaires, véto et logistique</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Résultat Net d'Exploitation</span>
            <span className="kpi-icon">📊</span>
          </div>
          <div
            className="kpi-value"
            style={{ color: netProfit >= 0 ? '#16a34a' : '#dc2626' }}
          >
            {formatFCFA(netProfit)}
          </div>
          <div className="kpi-sub">
            {netProfit >= 0 ? 'Bénéfice net positif' : 'Déficit provisoire d’investissement'}
          </div>
        </div>
      </div>

      {/* Ventilation des Dépenses par Catégorie */}
      <div className="card-box mb-4">
        <div className="box-header">
          <h3>Répartition des Charges d'Exploitation</h3>
        </div>
        <div className="category-breakdown-grid">
          {categoriesList.map((cat) => {
            const amount = categoryTotals[cat] || 0
            const percent = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0
            return (
              <div key={cat} className="cat-progress-card">
                <div className="cat-header">
                  <span>{cat}</span>
                  <strong>{formatFCFA(amount)}</strong>
                </div>
                <div className="progress-bar-wrap">
                  <div
                    className="progress-fill"
                    style={{ width: `${percent}%`, backgroundColor: '#e76f51' }}
                  ></div>
                </div>
                <small className="cat-percent">{percent}% du total des dépenses</small>
              </div>
            )
          })}
        </div>
      </div>

      {/* Historique des Dépenses */}
      <div className="card-box">
        <div className="box-header">
          <h3>Journal des Dépenses</h3>
          <div className="filter-group">
            <select
              className="form-control form-control-sm"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Toutes les catégories</option>
              {categoriesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="app-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Catégorie</th>
                <th>Montant</th>
                <th>Bénéficiaire / Fournisseur</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((exp) => (
                <tr key={exp.id}>
                  <td>
                    <strong>{formatDateFr(exp.date)}</strong>
                  </td>
                  <td>
                    <span className="badge badge-amber">{exp.category}</span>
                  </td>
                  <td>
                    <strong style={{ color: '#dc2626' }}>{formatFCFA(exp.amount)}</strong>
                  </td>
                  <td>{exp.beneficiary || '-'}</td>
                  <td>{exp.description}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-danger-sm"
                      onClick={() => {
                        if (confirm('Confirmer la suppression de cette dépense ?')) {
                          onDeleteExpense(exp.id)
                        }
                      }}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale Nouvelle Dépense */}
      {showExpenseModal && (
        <div className="modal-overlay">
          <div className="modal-window">
            <div className="modal-header">
              <h3>Enregistrer une Dépense / Charge</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowExpenseModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateExpense} className="form-stack">
              <div className="form-row">
                <div className="form-group">
                  <label>Date de règlement</label>
                  <input
                    type="date"
                    className="form-control"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Catégorie de charge</label>
                  <select
                    className="form-control"
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  >
                    {categoriesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Montant réglé (FCFA)</label>
                  <input
                    type="number"
                    min="1"
                    step="100"
                    className="form-control form-control-lg text-danger"
                    placeholder="Ex: 50000"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Bénéficiaire / Fournisseur</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Ex: Moulins du Sahel, Vétérinaire..."
                    value={expenseForm.beneficiary}
                    onChange={(e) => setExpenseForm({ ...expenseForm, beneficiary: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description / Détail de l'achat</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Détail de la dépense ou numéro de facture..."
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  required
                ></textarea>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowExpenseModal(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Valider la Dépense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
