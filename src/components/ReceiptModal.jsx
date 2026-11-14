import React from 'react'
import { formatFCFA, formatDateFr } from '../utils/helpers'

export default function ReceiptModal({ sale, onClose }) {
  if (!sale) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="modal-overlay receipt-modal-overlay">
      <div className="modal-window receipt-modal-window">
        <div className="modal-header no-print">
          <h3>🧾 Reçu de Vente / Facture</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Zone Imprimable */}
        <div className="printable-receipt" id="printable-invoice">
          <div className="receipt-header">
            <div className="farm-brand">
              <h2>🌾 FAMA-FERME</h2>
              <p className="farm-tagline">Élevage Avicole & Produits de la Ferme</p>
              <p className="farm-contact">Mandé / Bamako - Tél: +223 76 00 00 00</p>
            </div>
            <div className="receipt-badge-info">
              <span className="receipt-number">{sale.invoiceNumber || 'REÇU'}</span>
              <span className="receipt-date">Date : {formatDateFr(sale.date)}</span>
            </div>
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-client-info">
            <strong>Client :</strong> {sale.clientName || 'Client Comptoir'}
            {sale.paymentMethod && (
              <span className="payment-tag">
                Mode de règlement : <strong>{sale.paymentMethod}</strong>
              </span>
            )}
          </div>

          <table className="receipt-table">
            <thead>
              <tr>
                <th>Désignation</th>
                <th className="text-center">Qté</th>
                <th className="text-right">P.U (FCFA)</th>
                <th className="text-right">Total (FCFA)</th>
              </tr>
            </thead>
            <tbody>
              {(sale.items || []).map((item, idx) => (
                <tr key={idx}>
                  <td>{item.description}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-right">{formatFCFA(item.unitPrice).replace(' FCFA', '')}</td>
                  <td className="text-right">{formatFCFA(item.total).replace(' FCFA', '')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="receipt-totals-area">
            <div className="totals-row grand-total">
              <span>TOTAL NET :</span>
              <span>{formatFCFA(sale.totalAmount)}</span>
            </div>
            <div className="totals-row">
              <span>Montant Réglé :</span>
              <span>{formatFCFA(sale.amountPaid || sale.totalAmount)}</span>
            </div>
            {Number(sale.totalAmount) - Number(sale.amountPaid) > 0 && (
              <div className="totals-row rest-to-pay">
                <span>Reste à Payer :</span>
                <span>{formatFCFA(sale.totalAmount - sale.amountPaid)}</span>
              </div>
            )}
          </div>

          <div className="receipt-footer">
            <p>🙏 Merci pour votre confiance !</p>
            <small>Les produits de la ferme sont garantis frais du jour.</small>
          </div>
        </div>

        {/* Boutons d'action (masqués à l'impression) */}
        <div className="modal-actions no-print mt-4">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Fermer
          </button>
          <button type="button" className="btn-primary" onClick={handlePrint}>
            🖨️ Imprimer / Sauvegarder PDF
          </button>
        </div>
      </div>
    </div>
  )
}
