// Utilitaires de calcul et formatage pour Fama-Ferme

export const formatFCFA = (amount) => {
  const num = Math.round(Number(amount) || 0)
  return new Intl.NumberFormat('fr-FR').format(num) + ' FCFA'
}

export const formatDateFr = (dateStr) => {
  if (!dateStr) return '-'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

// Calcul de l'effectif vivant actuel d'une bande
export const getBatchLiveCount = (batch, dailyLogs = []) => {
  if (!batch) return 0
  const totalDead = dailyLogs
    .filter((log) => log.batchId === batch.id)
    .reduce((sum, log) => sum + (Number(log.mortality) || 0), 0)
  return Math.max(0, (Number(batch.initialCount) || 0) - totalDead)
}

// Total de la mortalité d'une bande
export const getBatchTotalMortality = (batchId, dailyLogs = []) => {
  return dailyLogs
    .filter((log) => log.batchId === batchId)
    .reduce((sum, log) => sum + (Number(log.mortality) || 0), 0)
}

// Calcul des statistiques de ponte d'une bande
export const getBatchEggStats = (batchId, dailyLogs = []) => {
  const logs = dailyLogs.filter((log) => log.batchId === batchId)
  const totalIntact = logs.reduce((sum, log) => sum + (Number(log.eggsIntact) || 0), 0)
  const totalBroken = logs.reduce((sum, log) => sum + (Number(log.eggsBroken) || 0), 0)
  const totalEggs = totalIntact + totalBroken
  const brokenRate = totalEggs > 0 ? ((totalBroken / totalEggs) * 100).toFixed(1) : '0.0'
  return {
    totalIntact,
    totalBroken,
    totalEggs,
    brokenRate,
    traysCount: Math.floor(totalIntact / 30), // 30 œufs par plateau/alvéole
    remainingEggs: totalIntact % 30,
  }
}
