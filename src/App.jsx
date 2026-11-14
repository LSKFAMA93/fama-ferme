import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import DailyLogForm from './components/DailyLogForm'
import BatchesAndSites from './components/BatchesAndSites'
import StockManager from './components/StockManager'
import SalesManager from './components/SalesManager'
import FinanceManager from './components/FinanceManager'
import SettingsModal from './components/SettingsModal'
import { initialData } from './data/initialData'
import './App.css'

const STORAGE_KEY = 'fama-ferme-data-v1'
const ROLE_KEY = 'fama-ferme-role-v1'

function App() {
  // 1. État des données avec persistance localStorage
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Erreur lecture localStorage', e)
    }
    return initialData
  })

  // 2. Rôle de l'utilisateur (Propriétaire Admin vs Agent Terrain)
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem(ROLE_KEY) || 'admin'
  })

  // 3. Onglet actif
  const [currentTab, setCurrentTab] = useState('dashboard')

  // 4. Modale paramètres / sauvegarde
  const [showSettings, setShowSettings] = useState(false)

  // Sauvegarde automatique à chaque changement de données
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('Erreur écriture localStorage', e)
    }
  }, [data])

  useEffect(() => {
    try {
      localStorage.setItem(ROLE_KEY, userRole)
    } catch (e) {
      console.error('Erreur écriture rôle', e)
    }
  }, [userRole])

  // --- Handlers Saisie Terrain ---
  const handleAddLog = (newLog) => {
    setData((prev) => {
      let updatedInventory = [...prev.inventoryItems]

      // Déduction automatique du stock d'aliment si renseigné
      if (newLog.feedItemId && newLog.feedQuantityKg > 0) {
        updatedInventory = updatedInventory.map((item) => {
          if (item.id === newLog.feedItemId) {
            // Si l'aliment est en sac de 50kg
            if (item.unit.includes('50kg')) {
              const bagsUsed = newLog.feedQuantityKg / 50
              return { ...item, quantity: Math.max(0, Math.round((item.quantity - bagsUsed) * 10) / 10) }
            } else {
              return { ...item, quantity: Math.max(0, item.quantity - newLog.feedQuantityKg) }
            }
          }
          return item
        })
      }

      // Ajout automatique au stock d'œufs de vente (plateaux de 30)
      if (newLog.eggsIntact > 0) {
        const traysAdded = Math.floor(newLog.eggsIntact / 30)
        if (traysAdded > 0) {
          updatedInventory = updatedInventory.map((item) => {
            if (item.category === 'oeufs' || item.id === 'stock-4') {
              return { ...item, quantity: item.quantity + traysAdded }
            }
            return item
          })
        }
      }

      return {
        ...prev,
        dailyLogs: [newLog, ...prev.dailyLogs],
        inventoryItems: updatedInventory,
      }
    })
  }

  const handleDeleteLog = (logId) => {
    setData((prev) => ({
      ...prev,
      dailyLogs: prev.dailyLogs.filter((l) => l.id !== logId),
    }))
  }

  // --- Handlers Bandes & Infrastructures ---
  const handleAddBatch = (newBatch) => {
    setData((prev) => ({
      ...prev,
      batches: [...prev.batches, newBatch],
    }))
  }

  const handleDeleteBatch = (batchId) => {
    setData((prev) => ({
      ...prev,
      batches: prev.batches.filter((b) => b.id !== batchId),
    }))
  }

  const handleAddBuilding = (newBld) => {
    setData((prev) => ({
      ...prev,
      buildings: [...prev.buildings, newBld],
    }))
  }

  const handleAddSite = (newSite) => {
    setData((prev) => ({
      ...prev,
      sites: [...prev.sites, newSite],
    }))
  }

  // --- Handlers Stocks ---
  const handleAddStockItem = (newItem) => {
    setData((prev) => ({
      ...prev,
      inventoryItems: [...prev.inventoryItems, newItem],
    }))
  }

  const handleUpdateStockQuantity = (itemId, newQty) => {
    setData((prev) => ({
      ...prev,
      inventoryItems: prev.inventoryItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQty } : item
      ),
    }))
  }

  // --- Handlers Ventes & Clients ---
  const handleAddSale = (newSale) => {
    setData((prev) => {
      let updatedInventory = [...prev.inventoryItems]

      // Déduction du stock d'œufs si la vente concerne des plateaux
      const eggItemSale = (newSale.items || []).find(
        (it) => it.description.toLowerCase().includes('œuf') || it.description.toLowerCase().includes('oeuf')
      )
      if (eggItemSale) {
        updatedInventory = updatedInventory.map((item) => {
          if (item.category === 'oeufs' || item.id === 'stock-4') {
            return { ...item, quantity: Math.max(0, item.quantity - eggItemSale.quantity) }
          }
          return item
        })
      }

      return {
        ...prev,
        sales: [newSale, ...prev.sales],
        inventoryItems: updatedInventory,
      }
    })
  }

  const handleAddClient = (newClient) => {
    setData((prev) => ({
      ...prev,
      clients: [...prev.clients, newClient],
    }))
  }

  // --- Handlers Dépenses ---
  const handleAddExpense = (newExpense) => {
    setData((prev) => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
    }))
  }

  const handleDeleteExpense = (expId) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== expId),
    }))
  }

  const handleRestoreData = (newData) => {
    setData(newData)
  }

  return (
    <div className="app-container">
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userRole={userRole}
        setUserRole={setUserRole}
        onOpenSettings={() => setShowSettings(true)}
      />

      <main className="main-content">
        {currentTab === 'dashboard' && (
          <Dashboard
            data={data}
            onNavigate={(tab) => setCurrentTab(tab)}
            userRole={userRole}
          />
        )}

        {currentTab === 'daily-log' && (
          <DailyLogForm
            data={data}
            onAddLog={handleAddLog}
            onDeleteLog={handleDeleteLog}
            userRole={userRole}
          />
        )}

        {currentTab === 'batches' && (
          <BatchesAndSites
            data={data}
            onAddBatch={handleAddBatch}
            onAddBuilding={handleAddBuilding}
            onAddSite={handleAddSite}
            onDeleteBatch={handleDeleteBatch}
            userRole={userRole}
          />
        )}

        {currentTab === 'stocks' && (
          <StockManager
            data={data}
            onAddStockItem={handleAddStockItem}
            onUpdateStockQuantity={handleUpdateStockQuantity}
            userRole={userRole}
          />
        )}

        {currentTab === 'sales' && (
          <SalesManager
            data={data}
            onAddSale={handleAddSale}
            onAddClient={handleAddClient}
            userRole={userRole}
          />
        )}

        {currentTab === 'finances' && (
          <FinanceManager
            data={data}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            userRole={userRole}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>
          🌾 <strong>Fama-Ferme</strong> — Application web de gestion avicole et agricole | Conçue pour un usage personnel | Devise : FCFA (XOF)
        </p>
      </footer>

      {showSettings && (
        <SettingsModal
          data={data}
          onRestoreData={handleRestoreData}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

export default App
