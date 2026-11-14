import React, { useRef } from 'react'
import { initialData } from '../data/initialData'

export default function SettingsModal({ data, onRestoreData, onClose }) {
  const fileInputRef = useRef(null)

  // Exporter en JSON
  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `fama-ferme-sauvegarde-${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  // Importer un fichier JSON
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result)
        if (parsed.batches && parsed.dailyLogs) {
          onRestoreData(parsed)
          alert('✅ Sauvegarde restaurée avec succès !')
          onClose()
        } else {
          alert('⚠️ Le fichier JSON ne semble pas être un format Fama-Ferme valide.')
        }
      } catch (err) {
        alert('Erreur lors de la lecture du fichier : ' + err.message)
      }
    }
    reader.readAsText(file)
  }

  const handleResetToDemo = () => {
    if (confirm('Voulez-vous réinitialiser toutes les données aux valeurs de démonstration ?')) {
      onRestoreData(initialData)
      alert('Données réinitialisées avec succès.')
      onClose()
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-window">
        <div className="modal-header">
          <h3>⚙️ Sauvegarde & Gestion des Données</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="form-stack">
          <div className="info-banner mb-3">
            <span>
              🔒 Vos données sont stockées localement dans votre navigateur (`localStorage`).
              Aucun serveur externe n'a accès à vos chiffres.
            </span>
          </div>

          <div className="settings-section">
            <h4>1. Sauvegarder vos données</h4>
            <p className="text-muted">
              Téléchargez une copie complète de vos lots, relevés, stocks et factures sur votre téléphone ou PC.
            </p>
            <button type="button" className="btn-primary" onClick={handleExport}>
              📥 Exporter la sauvegarde (Fichier JSON)
            </button>
          </div>

          <div className="settings-section mt-4">
            <h4>2. Restaurer une sauvegarde</h4>
            <p className="text-muted">
              Importez un fichier `.json` préalablement sauvegardé pour retrouver toutes vos données.
            </p>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              📤 Importer une sauvegarde JSON
            </button>
          </div>

          <div className="settings-section mt-4 border-top pt-3">
            <h4>3. Réinitialiser la ferme</h4>
            <p className="text-muted">
              Remettre les données d'exemple initiales.
            </p>
            <button type="button" className="btn-danger-sm" onClick={handleResetToDemo}>
              🔄 Restaurer les données démo
            </button>
          </div>

          <div className="modal-actions mt-4">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
