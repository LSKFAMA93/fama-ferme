import { useState } from 'react'
import { formatDateFr, getBatchLiveCount } from '../utils/helpers'

export default function DailyLogForm({ data, onAddLog, onDeleteLog, userRole }) {
  const { batches = [], dailyLogs = [], inventoryItems = [] } = data
  const todayStr = new Date().toISOString().split('T')[0]

  // Form state
  const [formData, setFormData] = useState({
    date: todayStr,
    batchId: batches[0]?.id || '',
    eggsIntact: '',
    eggsBroken: '',
    mortality: '0',
    mortalityReason: '',
    feedItemId: inventoryItems.find((i) => i.category === 'aliment')?.id || '',
    feedQuantityKg: '',
    waterQuantityL: '',
    healthCare: '',
    cleaning: '',
    notes: '',
    loggedBy: userRole === 'admin' ? 'Propriétaire (Admin)' : 'Agent de Saisie',
  })

  const [filterBatch, setFilterBatch] = useState('all')
  const [successMsg, setSuccessMsg] = useState('')

  const selectedBatch = batches.find((b) => b.id === formData.batchId)
  const isLayer = selectedBatch?.type === 'pondeuses'
  const currentLive = selectedBatch ? getBatchLiveCount(selectedBatch, dailyLogs) : 0

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.batchId) {
      alert('Veuillez sélectionner une bande de sujets.')
      return
    }

    const newLog = {
      id: 'log-' + Date.now(),
      date: formData.date,
      batchId: formData.batchId,
      eggsIntact: Number(formData.eggsIntact) || 0,
      eggsBroken: Number(formData.eggsBroken) || 0,
      mortality: Number(formData.mortality) || 0,
      mortalityReason: formData.mortalityReason.trim(),
      feedItemId: formData.feedItemId,
      feedQuantityKg: Number(formData.feedQuantityKg) || 0,
      waterQuantityL: Number(formData.waterQuantityL) || 0,
      healthCare: formData.healthCare.trim(),
      cleaning: formData.cleaning.trim(),
      notes: formData.notes.trim(),
      loggedBy: formData.loggedBy || 'Agent Terrain',
    }

    onAddLog(newLog)

    setSuccessMsg('✅ Saisie enregistrée avec succès pour le ' + formatDateFr(formData.date))
    setTimeout(() => setSuccessMsg(''), 4000)

    // Reset inputs but keep date and batch
    setFormData((prev) => ({
      ...prev,
      eggsIntact: '',
      eggsBroken: '',
      mortality: '0',
      mortalityReason: '',
      feedQuantityKg: '',
      waterQuantityL: '',
      healthCare: '',
      cleaning: '',
      notes: '',
    }))
  }

  // Filtrage de l'historique
  const filteredLogs = dailyLogs
    .filter((l) => (filterBatch === 'all' ? true : l.batchId === filterBatch))
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="daily-log-view">
      <div className="view-header">
        <div>
          <h2>📝 Saisie Quotidienne de Production (Terrain)</h2>
          <p>
            Renseignez les données quotidiennes : collecte d'œufs, mortalité, aliment distribué et soins vétérinaires.
          </p>
        </div>
      </div>

      {successMsg && <div className="alert-card success mb-4">{successMsg}</div>}

      <div className="log-layout-grid">
        {/* Formulaire de saisie terrain */}
        <div className="card-box">
          <div className="box-header">
            <h3>Nouveau Relevé Journalier</h3>
            <span className="badge badge-green">Mobile-First</span>
          </div>

          <form onSubmit={handleSubmit} className="form-stack">
            <div className="form-row">
              <div className="form-group">
                <label>Date du relevé</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Bande / Lot de sujets</label>
                <select
                  className="form-control"
                  value={formData.batchId}
                  onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                  required
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.breed})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedBatch && (
              <div className="info-banner mb-3">
                <span>📍 Effectif vivant actuel estimé : <strong>{currentLive} sujets</strong></span>
                {isLayer && <span> | Type : <strong>Pondeuses</strong></span>}
              </div>
            )}

            {/* Section 1 : Collecte des Œufs (si bande de pondeuses) */}
            {isLayer && (
              <fieldset className="fieldset-group">
                <legend>🥚 1. Collecte des Œufs du Jour</legend>
                <div className="form-row">
                  <div className="form-group">
                    <label>Œufs intacts (valides)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control form-control-lg"
                      placeholder="Ex: 850"
                      value={formData.eggsIntact}
                      onChange={(e) => setFormData({ ...formData, eggsIntact: e.target.value })}
                      required={isLayer}
                    />
                    <small className="help-text">
                      {formData.eggsIntact
                        ? `= ${Math.floor(formData.eggsIntact / 30)} plateaux et ${formData.eggsIntact % 30} œufs`
                        : '30 œufs = 1 plateau'}
                    </small>
                  </div>

                  <div className="form-group">
                    <label>Œufs cassés / fêlés</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control form-control-lg text-danger"
                      placeholder="Ex: 10"
                      value={formData.eggsBroken}
                      onChange={(e) => setFormData({ ...formData, eggsBroken: e.target.value })}
                    />
                    <small className="help-text">Perte ou déclassés</small>
                  </div>
                </div>
              </fieldset>
            )}

            {/* Section 2 : Suivi de la Mortalité */}
            <fieldset className="fieldset-group">
              <legend>📉 2. Mortalité (Pertes du jour)</legend>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre de sujets morts</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control form-control-lg"
                    placeholder="0 si aucune perte"
                    value={formData.mortality}
                    onChange={(e) => setFormData({ ...formData, mortality: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Cause / Symptôme constaté</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Chaleur, étouffement, maladie, blessure..."
                    value={formData.mortalityReason}
                    onChange={(e) => setFormData({ ...formData, mortalityReason: e.target.value })}
                  />
                </div>
              </div>
            </fieldset>

            {/* Section 3 : Alimentation & Consommation */}
            <fieldset className="fieldset-group">
              <legend>🌽 3. Alimentation Distribuée</legend>
              <div className="form-row">
                <div className="form-group">
                  <label>Type d'aliment (Stock Magasin)</label>
                  <select
                    className="form-control"
                    value={formData.feedItemId}
                    onChange={(e) => setFormData({ ...formData, feedItemId: e.target.value })}
                  >
                    <option value="">-- Sélectionner l'aliment --</option>
                    {inventoryItems
                      .filter((i) => i.category === 'aliment')
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.quantity} {item.unit} dispo)
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Quantité distribuée (en Kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="form-control"
                    placeholder="Ex: 120"
                    value={formData.feedQuantityKg}
                    onChange={(e) => setFormData({ ...formData, feedQuantityKg: e.target.value })}
                  />
                  <small className="help-text">
                    {formData.feedQuantityKg && currentLive > 0
                      ? `Soit ~${((formData.feedQuantityKg * 1000) / currentLive).toFixed(0)}g / sujet`
                      : 'Norme pondeuse : 115g à 125g / jour'}
                  </small>
                </div>

                <div className="form-group">
                  <label>Consommation d'eau (en litres)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="form-control"
                    placeholder="Ex: 180"
                    value={formData.waterQuantityL}
                    onChange={(e) => setFormData({ ...formData, waterQuantityL: e.target.value })}
                  />
                </div>
              </div>
            </fieldset>

            {/* Section 4 : Soins Vétérinaires, Vaccins & Hygiène */}
            <fieldset className="fieldset-group">
              <legend>💉 4. Soins, Vaccins & Hygiène</legend>
              <div className="form-row">
                <div className="form-group">
                  <label>Soins vétérinaires / Vaccin administré</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Vitamines, Vermifuge, Vaccin Newcastle..."
                    value={formData.healthCare}
                    onChange={(e) => setFormData({ ...formData, healthCare: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Nettoyage / Entretien effectué</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Litière changée, mangeoires désinfectées..."
                    value={formData.cleaning}
                    onChange={(e) => setFormData({ ...formData, cleaning: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group mt-2">
                <label>Observations / Notes complémentaires</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Remarques particulières de la journée..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                ></textarea>
              </div>
            </fieldset>

            <button type="submit" className="btn-primary-large w-100">
              💾 Valider & Enregistrer la Saisie
            </button>
          </form>
        </div>

        {/* Historique des relevés */}
        <div className="card-box">
          <div className="box-header">
            <h3>Historique des Relevés</h3>
            <div className="filter-group">
              <select
                className="form-control form-control-sm"
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
              >
                <option value="all">Toutes les bandes</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table className="app-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Bande</th>
                  <th>Œufs (Valides / Cassés)</th>
                  <th>Morts</th>
                  <th>Aliment (Kg)</th>
                  <th>Eau (L)</th>
                  <th>Soins</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      Aucun relevé enregistré pour le moment.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const b = batches.find((item) => item.id === log.batchId)
                    return (
                      <tr key={log.id}>
                        <td>
                          <strong>{formatDateFr(log.date)}</strong>
                        </td>
                        <td>{b ? b.name : 'Bande supprimée'}</td>
                        <td>
                          {log.eggsIntact > 0 || log.eggsBroken > 0 ? (
                            <span>
                              <strong style={{ color: '#16a34a' }}>{log.eggsIntact}</strong>
                              {log.eggsBroken > 0 && (
                                <span style={{ color: '#dc2626' }}> ({log.eggsBroken} cassés)</span>
                              )}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          {log.mortality > 0 ? (
                            <span className="badge badge-red" title={log.mortalityReason}>
                              {log.mortality} mort(s)
                            </span>
                          ) : (
                            <span style={{ color: '#16a34a' }}>0</span>
                          )}
                        </td>
                        <td>{log.feedQuantityKg ? `${log.feedQuantityKg} kg` : '-'}</td>
                        <td>{log.waterQuantityL ? `${log.waterQuantityL} L` : '-'}</td>
                        <td>
                          <small>{log.healthCare || log.cleaning || '-'}</small>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-danger-sm"
                            onClick={() => {
                              if (confirm('Confirmer la suppression de cette saisie ?')) {
                                onDeleteLog(log.id)
                              }
                            }}
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
