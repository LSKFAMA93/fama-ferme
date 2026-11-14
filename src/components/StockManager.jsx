import React, { useState } from 'react'
import { formatFCFA, formatDateFr } from '../utils/helpers'

export default function StockManager({ data, onAddStockItem, onUpdateStockQuantity, userRole }) {
  const { stores = [], inventoryItems = [] } = data
  const isAdmin = userRole === 'admin'

  const [filterCategory, setFilterCategory] = useState('all')
  const [showItemModal, setShowItemModal] = useState(false)
  const [showMovementModal, setShowMovementModal] = useState(false)
  const [selectedItemForMovement, setSelectedItemForMovement] = useState(null)

  // New item form
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'aliment',
    storeId: stores[0]?.id || '',
    unit: 'sac 50kg',
    quantity: '',
    minAlertThreshold: '10',
    unitPurchasePrice: '',
  })

  // Movement form (Entrée / Sortie)
  const [movementData, setMovementData] = useState({
    type: 'entree',
    quantity: '',
    reason: '',
  })

  const handleCreateItem = (e) => {
    e.preventDefault()
    if (!newItem.name) return

    onAddStockItem({
      ...newItem,
      id: 'stock-' + Date.now(),
      quantity: Number(newItem.quantity) || 0,
      minAlertThreshold: Number(newItem.minAlertThreshold) || 5,
      unitPurchasePrice: Number(newItem.unitPurchasePrice) || 0,
    })

    setShowItemModal(false)
    setNewItem({
      name: '',
      category: 'aliment',
      storeId: stores[0]?.id || '',
      unit: 'sac 50kg',
      quantity: '',
      minAlertThreshold: '10',
      unitPurchasePrice: '',
    })
  }

  const handleApplyMovement = (e) => {
    e.preventDefault()
    if (!selectedItemForMovement || !movementData.quantity) return

    const qty = Number(movementData.quantity) || 0
    const newQty =
      movementData.type === 'entree'
        ? selectedItemForMovement.quantity + qty
        : Math.max(0, selectedItemForMovement.quantity - qty)

    onUpdateStockQuantity(selectedItemForMovement.id, newQty)
    setShowMovementModal(false)
    setMovementData({ type: 'entree', quantity: '', reason: '' })
  }

  const filteredItems = inventoryItems.filter(
    (item) => filterCategory === 'all' || item.category === filterCategory
  )

  return (
    <div className="stock-view">
      <div className="view-header">
        <div>
          <h2>📦 Gestion des Stocks & Magasins</h2>
          <p>
            Suivi des aliments, intrants vétérinaires, plateaux d'alvéoles et stocks d'œufs prêts à la vente.
          </p>
        </div>
        <div className="action-buttons-wrap">
          {isAdmin && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowItemModal(true)}
            >
              ➕ Nouvel Article en Stock
            </button>
          )}
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="filter-chips-bar">
        <button
          type="button"
          className={`filter-chip ${filterCategory === 'all' ? 'active' : ''}`}
          onClick={() => setFilterCategory('all')}
        >
          Tous ({inventoryItems.length})
        </button>
        <button
          type="button"
          className={`filter-chip ${filterCategory === 'aliment' ? 'active' : ''}`}
          onClick={() => setFilterCategory('aliment')}
        >
          🌽 Aliments
        </button>
        <button
          type="button"
          className={`filter-chip ${filterCategory === 'oeufs' ? 'active' : ''}`}
          onClick={() => setFilterCategory('oeufs')}
        >
          🥚 Stock Œufs de Vente
        </button>
        <button
          type="button"
          className={`filter-chip ${filterCategory === 'veterinaire' ? 'active' : ''}`}
          onClick={() => setFilterCategory('veterinaire')}
        >
          💊 Vétérinaire & Vaccins
        </button>
        <button
          type="button"
          className={`filter-chip ${filterCategory === 'materiel' ? 'active' : ''}`}
          onClick={() => setFilterCategory('materiel')}
        >
          🛠️ Matériel & Emballages
        </button>
      </div>

      {/* Grille des articles de stock */}
      <div className="stock-cards-grid mt-4">
        {filteredItems.map((item) => {
          const isCritical = Number(item.quantity) <= Number(item.minAlertThreshold)
          const store = stores.find((s) => s.id === item.storeId)

          return (
            <div key={item.id} className={`stock-card ${isCritical ? 'critical' : ''}`}>
              <div className="stock-card-top">
                <div>
                  <h4 className="stock-title">{item.name}</h4>
                  <span className="stock-store">{store?.name || 'Magasin Central'}</span>
                </div>
                {isCritical && (
                  <span className="badge badge-red" title="Niveau critique atteint !">
                    ⚠️ Réapprovisionner
                  </span>
                )}
              </div>

              <div className="stock-quantity-display">
                <span className="stock-num">{item.quantity}</span>
                <span className="stock-unit">{item.unit}</span>
              </div>

              <div className="stock-meta-info">
                <span>Seuil d'alerte : {item.minAlertThreshold} {item.unit}</span>
                {isAdmin && item.unitPurchasePrice > 0 && (
                  <span>Coût unitaire : {formatFCFA(item.unitPurchasePrice)}</span>
                )}
              </div>

              <div className="stock-card-actions">
                <button
                  type="button"
                  className="btn-secondary-sm"
                  onClick={() => {
                    setSelectedItemForMovement(item)
                    setMovementData({ type: 'entree', quantity: '', reason: '' })
                    setShowMovementModal(true)
                  }}
                >
                  📥 Entrée / Achat
                </button>
                <button
                  type="button"
                  className="btn-secondary-sm"
                  onClick={() => {
                    setSelectedItemForMovement(item)
                    setMovementData({ type: 'sortie', quantity: '', reason: '' })
                    setShowMovementModal(true)
                  }}
                >
                  📤 Sortie / Consommation
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modale Nouvel Article */}
      {showItemModal && (
        <div className="modal-overlay">
          <div className="modal-window">
            <div className="modal-header">
              <h3>Ajouter un Article en Stock</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowItemModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateItem} className="form-stack">
              <div className="form-group">
                <label>Nom de l'article / Produit</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Aliment Ponte 50kg, Vitamines..."
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Catégorie</label>
                  <select
                    className="form-control"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  >
                    <option value="aliment">Aliment</option>
                    <option value="oeufs">Stock Œufs (Plateaux)</option>
                    <option value="veterinaire">Produit Vétérinaire</option>
                    <option value="materiel">Matériel & Emballage</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Unité de mesure</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: sac 50kg, flacon, plateau 30..."
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantité initiale en stock</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="Ex: 50"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Seuil d'alerte critique</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="Ex: 10"
                    value={newItem.minAlertThreshold}
                    onChange={(e) => setNewItem({ ...newItem, minAlertThreshold: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Prix d'achat unitaire estimé (FCFA)</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="Ex: 19500"
                  value={newItem.unitPurchasePrice}
                  onChange={(e) => setNewItem({ ...newItem, unitPurchasePrice: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowItemModal(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Créer l'Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale Mouvement de Stock (Entrée ou Sortie) */}
      {showMovementModal && selectedItemForMovement && (
        <div className="modal-overlay">
          <div className="modal-window">
            <div className="modal-header">
              <h3>
                {movementData.type === 'entree' ? '📥 Entrée de Stock' : '📤 Sortie de Stock'} :{' '}
                {selectedItemForMovement.name}
              </h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowMovementModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleApplyMovement} className="form-stack">
              <div className="info-banner mb-3">
                Stock actuel : <strong>{selectedItemForMovement.quantity} {selectedItemForMovement.unit}</strong>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Type de mouvement</label>
                  <select
                    className="form-control"
                    value={movementData.type}
                    onChange={(e) => setMovementData({ ...movementData, type: e.target.value })}
                  >
                    <option value="entree">Entrée (Achat / Réception / Récolte)</option>
                    <option value="sortie">Sortie (Consommation / Vente / Perte)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Quantité ({selectedItemForMovement.unit})</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    placeholder="Ex: 10"
                    value={movementData.quantity}
                    onChange={(e) => setMovementData({ ...movementData, quantity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Motif / Justification</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Livraison fournisseur, alimentation poulailler..."
                  value={movementData.reason}
                  onChange={(e) => setMovementData({ ...movementData, reason: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowMovementModal(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Valider le Mouvement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
