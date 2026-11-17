import { useEffect, useState } from 'react'

export default function Header({ currentTab, setCurrentTab, userRole, setUserRole, onOpenSettings }) {
  const isAdmin = userRole === 'admin'
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const updateConnectionStatus = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', updateConnectionStatus)
    window.addEventListener('offline', updateConnectionStatus)
    return () => {
      window.removeEventListener('online', updateConnectionStatus)
      window.removeEventListener('offline', updateConnectionStatus)
    }
  }, [])

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: '📊', adminOnly: false },
    { id: 'daily-log', label: 'Saisie Terrain', icon: '📝', adminOnly: false, highlight: true },
    { id: 'batches', label: 'Bandes & Bâtiments', icon: '🐔', adminOnly: false },
    { id: 'stocks', label: 'Stocks & Magasins', icon: '📦', adminOnly: false },
    { id: 'sales', label: 'Ventes & Reçus', icon: '💰', adminOnly: false },
    { id: 'finances', label: 'Finances & Bilan', icon: '📈', adminOnly: true },
  ]

  const visibleNav = navItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand-group">
          <span className="brand-logo" aria-hidden="true">🌾</span>
          <div>
            <div className="brand-title-wrap">
              <h1 className="brand-title">Fama-Ferme</h1>
              <span className="brand-tag">Usage Personnel</span>
            </div>
            <p className="brand-subtitle">Gestion avicole, technique, stocks & finances</p>
          </div>
        </div>

        <div className="header-actions">
          <span className={`connection-status ${isOnline ? 'online' : 'offline'}`} role="status">
            <span className="connection-status-dot" aria-hidden="true" />
            {isOnline ? 'En ligne' : 'Hors ligne · données locales'}
          </span>

          {/* Sélecteur de Rôle (Admin vs Agent de Saisie) */}
          <div className="role-switcher">
            <span className="role-label">Mode d'accès :</span>
            <div className="role-buttons">
              <button
                type="button"
                className={`role-btn ${isAdmin ? 'active' : ''}`}
                onClick={() => setUserRole('admin')}
                title="Accès complet Propriétaire"
              >
                👑 Propriétaire (Admin)
              </button>
              <button
                type="button"
                className={`role-btn ${!isAdmin ? 'active' : ''}`}
                onClick={() => setUserRole('agent')}
                title="Saisie simplifiée terrain pour gérant ou ouvrier"
              >
                🚜 Agent Terrain
              </button>
            </div>
          </div>

          {/* Bouton Sauvegarde & Paramètres */}
          <button
            type="button"
            className="settings-btn"
            onClick={onOpenSettings}
            title="Sauvegarde & Données"
          >
            ⚙️ Données
          </button>
        </div>
      </div>

      {/* Navigation principale */}
      <nav className="header-nav">
        {visibleNav.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-tab ${currentTab === item.id ? 'active' : ''} ${item.highlight ? 'highlight' : ''}`}
            onClick={() => setCurrentTab(item.id)}
          >
            <span className="nav-tab-icon">{item.icon}</span>
            <span className="nav-tab-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </header>
  )
}
