import { useState } from 'react'
import { formatFCFA, formatDateFr } from '../utils/helpers'
import ReceiptModal from './ReceiptModal'

export default function SalesManager({ data, onAddSale, onAddClient }) {
  const { clients = [], sales = [] } = data

  const [showSaleModal, setShowSaleModal] = useState(false)
  const [showClientModal, setShowClientModal] = useState(false)
  const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState(null)
  const [filterClient, setFilterClient] = useState('all')

  // Sale form
  const [saleForm, setSaleForm] = useState({
    date: new Date().toISOString().split('T')[0],
    clientId: clients[0]?.id || '',
    productType: 'oeufs', // 'oeufs' | 'poulet' | 'fumier' | 'autre'
    description: 'Plateaux d’œufs frais (30 œufs)',
    quantity: '10',
    unitPrice: '2400',
    paymentMethod: 'Espèces',
    notes: '',
  })

  // New Client form
  const [clientForm, setClientForm] = useState({
    name: '',
    phone: '',
    type: 'boutique',
    address: '',
    notes: '',
  })

  const handleProductTypeChange = (type) => {
    let desc = 'Plateaux d’œufs frais (30 œufs)'
    let price = '2400'
    if (type === 'poulet') {
      desc = 'Poulets de réforme / chair vifs'
      price = '3500'
    } else if (type === 'fumier') {
      desc = 'Sacs de fientes séchées (Engrais bio)'
      price = '1500'
    } else if (type === 'autre') {
      desc = 'Autre produit ferme'
      price = '1000'
    }
    setSaleForm({ ...saleForm, productType: type, description: desc, unitPrice: price })
  }

  const handleCreateSale = (e) => {
    e.preventDefault()
    const qty = Number(saleForm.quantity) || 0
    const pu = Number(saleForm.unitPrice) || 0
    const total = qty * pu

    const client = clients.find((c) => c.id === saleForm.clientId)
    const newInvoiceNum = `FACT-${new Date().getFullYear()}-${String(sales.length + 1).padStart(3, '0')}`

    const newSale = {
      id: 'sale-' + Date.now(),
      invoiceNumber: newInvoiceNum,
      date: saleForm.date,
      clientId: saleForm.clientId,
      clientName: client?.name || 'Client Comptoir',
      items: [
        {
          description: saleForm.description,
          quantity: qty,
          unitPrice: pu,
          total: total,
        },
      ],
      totalAmount: total,
      amountPaid: total,
      paymentMethod: saleForm.paymentMethod,
      status: 'payé',
      notes: saleForm.notes,
    }

    onAddSale(newSale)
    setShowSaleModal(false)

    // Ouvre automatiquement le reçu
    setSelectedSaleForReceipt(newSale)
  }

  const handleCreateClient = (e) => {
    e.preventDefault()
    if (!clientForm.name) return

    onAddClient({
      ...clientForm,
      id: 'cli-' + Date.now(),
    })

    setShowClientModal(false)
    setClientForm({ name: '', phone: '', type: 'boutique', address: '', notes: '' })
  }

  const filteredSales = sales
    .filter((s) => (filterClient === 'all' ? true : s.clientId === filterClient))
    .sort((a, b) => b.date.localeCompare(a.date))

  const totalSalesRevenue = filteredSales.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0)

  return (
    <div className="sales-view">
      <div className="view-header">
        <div>
          <h2>💰 Ventes Directes & Commerces de Proximité</h2>
          <p>
            Enregistrement des ventes d'œufs, poulets et fientes, carnet de clients et facturation immédiate.
          </p>
        </div>
        <div className="action-buttons-wrap">
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowSaleModal(true)}
          >
            🛒 Nouvelle Vente
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowClientModal(true)}
          >
            👤 Nouveau Client
          </button>
        </div>
      </div>

      {/* Résumé des ventes */}
      <div className="kpi-mini-bar mb-4">
        <div className="kpi-mini-card">
          <span>Total Ventes Réalisées :</span>
          <strong>{formatFCFA(totalSalesRevenue)}</strong>
        </div>
        <div className="kpi-mini-card">
          <span>Nombre de Transactions :</span>
          <strong>{filteredSales.length}</strong>
        </div>
        <div className="kpi-mini-card">
          <span>Clients Enregistrés :</span>
          <strong>{clients.length}</strong>
        </div>
      </div>

      {/* Grille principale : Historique des Ventes + Fiches Clients */}
      <div className="sales-layout-grid">
        <div className="card-box">
          <div className="box-header">
            <h3>Historique des Ventes</h3>
            <div className="filter-group">
              <select
                className="form-control form-control-sm"
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
              >
                <option value="all">Tous les clients</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="app-table">
              <thead>
                <tr>
                  <th>N° Facture</th>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Produit & Qté</th>
                  <th>Montant</th>
                  <th>Règlement</th>
                  <th>Reçu</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <code>{sale.invoiceNumber}</code>
                    </td>
                    <td>{formatDateFr(sale.date)}</td>
                    <td>
                      <strong>{sale.clientName}</strong>
                    </td>
                    <td>
                      {(sale.items || []).map((it, i) => (
                        <div key={i}>
                          {it.description} <strong>(x{it.quantity})</strong>
                        </div>
                      ))}
                    </td>
                    <td>
                      <strong>{formatFCFA(sale.totalAmount)}</strong>
                    </td>
                    <td>
                      <span className="badge badge-green">{sale.paymentMethod || 'Espèces'}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-secondary-sm"
                        onClick={() => setSelectedSaleForReceipt(sale)}
                        title="Voir ou imprimer le reçu"
                      >
                        🧾 Reçu
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fiches Clients */}
        <div className="card-box">
          <div className="box-header">
            <h3>👤 Fiches Clients ({clients.length})</h3>
          </div>
          <div className="clients-list-stack">
            {clients.map((client) => {
              const clientSales = sales.filter((s) => s.clientId === client.id)
              const totalSpent = clientSales.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0)

              return (
                <div key={client.id} className="client-item-card">
                  <div className="client-info-main">
                    <h4>{client.name}</h4>
                    <span className="client-phone">📞 {client.phone || 'Non renseigné'}</span>
                    <span className="client-address">📍 {client.address || 'Bamako / Proximité'}</span>
                  </div>
                  <div className="client-info-side">
                    <span className="badge badge-amber">{client.type}</span>
                    <small>Total achats : <strong>{formatFCFA(totalSpent)}</strong></small>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Modale Reçu / Facture Imprimable */}
      {selectedSaleForReceipt && (
        <ReceiptModal
          sale={selectedSaleForReceipt}
          onClose={() => setSelectedSaleForReceipt(null)}
        />
      )}

      {/* Modale Nouvelle Vente */}
      {showSaleModal && (
        <div className="modal-overlay">
          <div className="modal-window">
            <div className="modal-header">
              <h3>Enregistrer une Vente Directe</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowSaleModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSale} className="form-stack">
              <div className="form-row">
                <div className="form-group">
                  <label>Date de la vente</label>
                  <input
                    type="date"
                    className="form-control"
                    value={saleForm.date}
                    onChange={(e) => setSaleForm({ ...saleForm, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Client</label>
                  <select
                    className="form-control"
                    value={saleForm.clientId}
                    onChange={(e) => setSaleForm({ ...saleForm, clientId: e.target.value })}
                    required
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Choix rapide du produit */}
              <div className="form-group">
                <label>Type de produit vendu</label>
                <div className="quick-product-btns">
                  <button
                    type="button"
                    className={`btn-chip ${saleForm.productType === 'oeufs' ? 'active' : ''}`}
                    onClick={() => handleProductTypeChange('oeufs')}
                  >
                    🥚 Plateaux d'œufs
                  </button>
                  <button
                    type="button"
                    className={`btn-chip ${saleForm.productType === 'poulet' ? 'active' : ''}`}
                    onClick={() => handleProductTypeChange('poulet')}
                  >
                    🍗 Poulets réforme/chair
                  </button>
                  <button
                    type="button"
                    className={`btn-chip ${saleForm.productType === 'fumier' ? 'active' : ''}`}
                    onClick={() => handleProductTypeChange('fumier')}
                  >
                    🌱 Fientes / Fumier
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Description sur la facture</label>
                <input
                  type="text"
                  className="form-control"
                  value={saleForm.description}
                  onChange={(e) => setSaleForm({ ...saleForm, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantité</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control form-control-lg"
                    value={saleForm.quantity}
                    onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Prix Unitaire (FCFA)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    className="form-control form-control-lg"
                    value={saleForm.unitPrice}
                    onChange={(e) => setSaleForm({ ...saleForm, unitPrice: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="info-banner mb-3">
                Montant total calculé :{' '}
                <strong style={{ fontSize: '1.2rem', color: '#16a34a' }}>
                  {formatFCFA((Number(saleForm.quantity) || 0) * (Number(saleForm.unitPrice) || 0))}
                </strong>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mode de paiement</label>
                  <select
                    className="form-control"
                    value={saleForm.paymentMethod}
                    onChange={(e) => setSaleForm({ ...saleForm, paymentMethod: e.target.value })}
                  >
                    <option value="Espèces">Espèces (Cash)</option>
                    <option value="Orange Money">Orange Money</option>
                    <option value="Wave">Wave</option>
                    <option value="Virement">Virement bancaire</option>
                    <option value="Crédit">À crédit (Impayé)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Notes / Référence transaction</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Réf reçu OM, livraison quartier..."
                    value={saleForm.notes}
                    onChange={(e) => setSaleForm({ ...saleForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowSaleModal(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Valider la Vente & Éditer le Reçu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale Nouveau Client */}
      {showClientModal && (
        <div className="modal-overlay">
          <div className="modal-window">
            <div className="modal-header">
              <h3>Ajouter un Nouveau Client</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowClientModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateClient} className="form-stack">
              <div className="form-group">
                <label>Nom ou Enseigne du Client</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Boutique Alpha, Superette..."
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Numéro de téléphone</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+223 70 00 00 00"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Catégorie</label>
                  <select
                    className="form-control"
                    value={clientForm.type}
                    onChange={(e) => setClientForm({ ...clientForm, type: e.target.value })}
                  >
                    <option value="boutique">Boutique de quartier</option>
                    <option value="grossiste">Grossiste / Marché</option>
                    <option value="particulier">Particulier / Voisinage</option>
                    <option value="restaurant">Restaurant / Hôtel</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Adresse / Zone géographique</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Médina Coura, Hamdallaye..."
                  value={clientForm.address}
                  onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowClientModal(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Enregistrer Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
