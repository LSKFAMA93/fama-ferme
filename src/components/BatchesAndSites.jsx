import React, { useState } from 'react'
import { formatDateFr, formatFCFA, getBatchLiveCount } from '../utils/helpers'

export default function BatchesAndSites({ data, onAddBatch, onAddBuilding, onAddSite, onDeleteBatch, userRole }) {
  const { sites = [], buildings = [], batches = [], dailyLogs = [] } = data
  const isAdmin = userRole === 'admin'

  // Modal / Form state for new batch
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [showBuildingModal, setShowBuildingModal] = useState(false)
  const [showSiteModal, setShowSiteModal] = useState(false)

  // New batch form
  const [newBatch, setNewBatch] = useState({
    name: '',
    type: 'pondeuses',
    arrivalDate: new Date().toISOString().split('T')[0],
    initialCount: '',
    breed: '',
    buildingId: buildings[0]?.id || '',
    siteId: sites[0]?.id || '',
    unitCost: '',
    status: 'active',
    targetEggRate: 85,
    notes: '',
  })

  // New building form
  const [newBuilding, setNewBuilding] = useState({
    name: '',
    siteId: sites[0]?.id || '',
    type: 'poulailler',
    capacity: '',
    notes: '',
  })

  // New site form
  const [newSite, setNewSite] = useState({
    name: '',
    location: '',
    notes: '',
  })

  const handleCreateBatch = (e) => {
    e.preventDefault()
    if (!newBatch.name || !newBatch.initialCount) return

    onAddBatch({
      ...newBatch,
      id: 'batch-' + Date.now(),
      initialCount: Number(newBatch.initialCount) || 0,
      unitCost: Number(newBatch.unitCost) || 0,
      targetEggRate: Number(newBatch.targetEggRate) || 85,
    })

    setShowBatchModal(false)
    setNewBatch({
      name: '',
      type: 'pondeuses',
      arrivalDate: new Date().toISOString().split('T')[0],
      initialCount: '',
      breed: '',
      buildingId: buildings[0]?.id || '',
      siteId: sites[0]?.id || '',
      unitCost: '',
      status: 'active',
      targetEggRate: 85,
      notes: '',
    })
  }

  const handleCreateBuilding = (e) => {
    e.preventDefault()
    if (!newBuilding.name) return
    onAddBuilding({
      ...newBuilding,
      id: 'bld-' + Date.now(),
      capacity: Number(newBuilding.capacity) || 0,
    })
    setShowBuildingModal(false)
    setNewBuilding({ name: '', siteId: sites[0]?.id || '', type: 'poulailler', capacity: '', notes: '' })
  }

  const handleCreateSite = (e) => {
    e.preventDefault()
    if (!newSite.name) return
    onAddSite({
      ...newSite,
      id: 'site-' + Date.now(),
    })
    setShowSiteModal(false)
    setNewSite({ name: '', location: '', notes: '' })
  }

  return (
    <div className="batches-sites-view">
      <div className="view-header">
        <div>
          <h2>🐔 Bandes de Sujets & Infrastructures</h2>
          <p>
            Gestion des lots de volailles (pondeuses / chair), des poulaillers et des sites d'élevage.
          </p>
        </div>
        <div className="action-buttons-wrap">
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowBatchModal(true)}
          >
            ➕ Nouvelle Bande / Lot
          </button>
          {isAdmin && (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowBuildingModal(true)}
              >
                🏠 Ajouter Bâtiment
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowSiteModal(true)}
              >
                📍 Ajouter Site
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cartes des Bandes / Lots */}
      <div className="section-block">
        <h3 className="section-title">Lots & Bandes Actuelles</h3>
        <div className="batch-cards-grid">
          {batches.map((batch) => {
            const live = getBatchLiveCount(batch, dailyLogs)
            const dead = (Number(batch.initialCount) || 0) - live
            const deadRate = batch.initialCount > 0 ? ((dead / batch.initialCount) * 100).toFixed(1) : 0
            const bld = buildings.find((b) => b.id === batch.buildingId)
            const site = sites.find((s) => s.id === batch.siteId)

            return (
              <div key={batch.id} className="batch-card">
                <div className="batch-card-header">
                  <div>
                    <h4 className="batch-name">{batch.name}</h4>
                    <span className="batch-meta">
                      {bld?.name || 'Bâtiment non assigné'} ({site?.name || 'Site principal'})
                    </span>
                  </div>
                  <span className={`badge ${batch.type === 'pondeuses' ? 'badge-amber' : 'badge-blue'}`}>
                    {batch.type === 'pondeuses' ? '🥚 Pondeuses' : '🍗 Chair'}
                  </span>
                </div>

                <div className="batch-stats-grid">
                  <div className="b-stat">
                    <span className="b-stat-label">Effectif Initial</span>
                    <strong className="b-stat-val">{batch.initialCount}</strong>
                  </div>
                  <div className="b-stat highlight">
                    <span className="b-stat-label">Effectif Vivant</span>
                    <strong className="b-stat-val" style={{ color: '#16a34a' }}>
                      {live.toLocaleString('fr-FR')}
                    </strong>
                  </div>
                  <div className="b-stat">
                    <span className="b-stat-label">Mortalité Totale</span>
                    <strong className="b-stat-val" style={{ color: dead > 0 ? '#dc2626' : '#6b7280' }}>
                      {dead} ({deadRate}%)
                    </strong>
                  </div>
                  <div className="b-stat">
                    <span className="b-stat-label">Souche / Race</span>
                    <strong className="b-stat-val">{batch.breed || 'Non renseigné'}</strong>
                  </div>
                </div>

                <div className="batch-card-footer">
                  <small>Arrivée le {formatDateFr(batch.arrivalDate)}</small>
                  {isAdmin && (
                    <button
                      type="button"
                      className="btn-danger-sm"
                      onClick={() => {
                        if (confirm(`Confirmer la suppression du lot "${batch.name}" ?`)) {
                          onDeleteBatch(batch.id)
                        }
                      }}
                      title="Supprimer ce lot"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Infrastructures : Sites & Bâtiments */}
      <div className="infrastructure-grid mt-4">
        <div className="card-box">
          <div className="box-header">
            <h3>🏠 Bâtiments & Poulaillers ({buildings.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Site</th>
                  <th>Capacité</th>
                  <th>Affectation actuelle</th>
                </tr>
              </thead>
              <tbody>
                {buildings.map((bld) => {
                  const site = sites.find((s) => s.id === bld.siteId)
                  const assignedBatches = batches.filter((b) => b.buildingId === bld.id)
                  return (
                    <tr key={bld.id}>
                      <td>
                        <strong>{bld.name}</strong>
                      </td>
                      <td>{site?.name || '-'}</td>
                      <td>{bld.capacity ? `${bld.capacity} sujets` : 'N/C'}</td>
                      <td>
                        {assignedBatches.length > 0
                          ? assignedBatches.map((b) => b.name).join(', ')
                          : 'Libre'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-box">
          <div className="box-header">
            <h3>📍 Sites Physiques d'Exploitation ({sites.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Nom du Site</th>
                  <th>Localisation</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((site) => (
                  <tr key={site.id}>
                    <td>
                      <strong>{site.name}</strong>
                    </td>
                    <td>{site.location}</td>
                    <td>{site.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modale d'ajout de Bande */}
      {showBatchModal && (
        <div className="modal-overlay">
          <div className="modal-window">
            <div className="modal-header">
              <h3>Créer un Nouveau Lot / Bande de Sujets</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowBatchModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateBatch} className="form-stack">
              <div className="form-group">
                <label>Nom ou Désignation du lot</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Bande Pondeuses Nov 2026"
                  value={newBatch.name}
                  onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Type de production</label>
                  <select
                    className="form-control"
                    value={newBatch.type}
                    onChange={(e) => setNewBatch({ ...newBatch, type: e.target.value })}
                  >
                    <option value="pondeuses">Pondeuses (Œufs)</option>
                    <option value="chair">Poulets de Chair / Engraissement</option>
                    <option value="reproducteurs">Reproducteurs</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Race / Souche</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Lohmann Brown, Cobb 500, Goliath..."
                    value={newBatch.breed}
                    onChange={(e) => setNewBatch({ ...newBatch, breed: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date d'arrivée / mise en place</label>
                  <input
                    type="date"
                    className="form-control"
                    value={newBatch.arrivalDate}
                    onChange={(e) => setNewBatch({ ...newBatch, arrivalDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Effectif Initial (nombre de sujets)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    placeholder="Ex: 1000"
                    value={newBatch.initialCount}
                    onChange={(e) => setNewBatch({ ...newBatch, initialCount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Bâtiment d'affectation</label>
                  <select
                    className="form-control"
                    value={newBatch.buildingId}
                    onChange={(e) => setNewBatch({ ...newBatch, buildingId: e.target.value })}
                    required
                  >
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Coût unitaire d'achat (FCFA / sujet)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="Ex: 850"
                    value={newBatch.unitCost}
                    onChange={(e) => setNewBatch({ ...newBatch, unitCost: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowBatchModal(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Créer le Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale d'ajout de Bâtiment */}
      {showBuildingModal && (
        <div className="modal-overlay">
          <div className="modal-window">
            <div className="modal-header">
              <h3>Ajouter un Bâtiment / Poulailler</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowBuildingModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateBuilding} className="form-stack">
              <div className="form-group">
                <label>Nom du bâtiment</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Poulailler C1"
                  value={newBuilding.name}
                  onChange={(e) => setNewBuilding({ ...newBuilding, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Site de rattachement</label>
                  <select
                    className="form-control"
                    value={newBuilding.siteId}
                    onChange={(e) => setNewBuilding({ ...newBuilding, siteId: e.target.value })}
                  >
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Capacité maximale (sujets)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Ex: 1000"
                    value={newBuilding.capacity}
                    onChange={(e) => setNewBuilding({ ...newBuilding, capacity: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowBuildingModal(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale d'ajout de Site */}
      {showSiteModal && (
        <div className="modal-overlay">
          <div className="modal-window">
            <div className="modal-header">
              <h3>Ajouter un Nouveau Site</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowSiteModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSite} className="form-stack">
              <div className="form-group">
                <label>Nom du site</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Site 2 Mandé"
                  value={newSite.name}
                  onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Localisation géographique</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Route de Koulikoro, Km 15"
                  value={newSite.location}
                  onChange={(e) => setNewSite({ ...newSite, location: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowSiteModal(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
