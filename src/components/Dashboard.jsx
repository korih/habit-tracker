import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import {
  fetchSkills,
  createSkill,
  renameSkill,
  deleteSkill as deleteSkillDB,
  upsertHistoryEntry,
  replaceHistoricalData,
} from '../lib/database'
import styles from './Dashboard.module.css'

export default function Dashboard({ user }) {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('add') // 'add' | 'rename' | 'manual'
  const [newSkillName, setNewSkillName] = useState('')
  const [selectedSkillId, setSelectedSkillId] = useState(null)
  const [manualHours, setManualHours] = useState('')
  const [manualStreaks, setManualStreaks] = useState('')

  const loadSkills = useCallback(async () => {
    try {
      const data = await fetchSkills()
      setSkills(data)
    } catch (err) {
      console.error('Failed to load skills:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSkills()
  }, [loadSkills])

  const getTodayString = () => new Date().toISOString().split('T')[0]

  const calculateStreak = (history) => {
    if (history.length === 0) return 0

    const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date))
    const today = getTodayString()
    const lastPractice = sortedHistory[0].date
    const daysSinceLastPractice = Math.floor(
      (new Date(today) - new Date(lastPractice)) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceLastPractice > 1) return 0

    let streak = 0
    let currentDate = new Date(today)

    for (const entry of sortedHistory) {
      const entryDateString = new Date(entry.date).toISOString().split('T')[0]
      const checkDateString = currentDate.toISOString().split('T')[0]

      if (entryDateString === checkDateString) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  const handleAddSkill = async () => {
    if (!newSkillName.trim()) return

    if (modalType === 'rename') {
      setSkills(skills.map(s => s.id === selectedSkillId ? { ...s, name: newSkillName } : s))
      setShowModal(false)
      setNewSkillName('')
      setSelectedSkillId(null)
      try {
        await renameSkill(selectedSkillId, newSkillName)
      } catch (err) {
        alert('Failed to rename skill: ' + err.message)
        await loadSkills()
      }
    } else {
      setShowModal(false)
      setNewSkillName('')
      try {
        const newSkill = await createSkill(newSkillName.trim())
        setSkills(prev => [...prev, newSkill])
      } catch (err) {
        alert('Failed to add skill: ' + err.message)
      }
    }
  }

  const openRenameModal = (skillId, currentName) => {
    setSelectedSkillId(skillId)
    setNewSkillName(currentName)
    setModalType('rename')
    setShowModal(true)
  }

  const openManualEntryModal = (skillId) => {
    setSelectedSkillId(skillId)
    setManualHours('')
    setManualStreaks('')
    setModalType('manual')
    setShowModal(true)
  }

  const applyManualEntry = async () => {
    const hours = parseFloat(manualHours) || 0
    const streaks = parseInt(manualStreaks) || 0
    if (hours < 0 || streaks < 0) return

    const today = getTodayString()

    setSkills(prev => prev.map(skill => {
      if (skill.id !== selectedSkillId) return skill

      const nonHistoricalEntries = skill.history.filter(h => h.date === today || h.xp !== 0.5)
      let updatedHistory = [...nonHistoricalEntries]

      if (streaks > 0) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        for (let i = 0; i < streaks; i++) {
          const dateString = yesterday.toISOString().split('T')[0]
          if (!updatedHistory.some(h => h.date === dateString)) {
            updatedHistory.push({ date: dateString, xp: 0.5 })
          }
          yesterday.setDate(yesterday.getDate() - 1)
        }
      }

      const currentStreak = calculateStreak(updatedHistory)
      const newLongestStreak = Math.max(skill.longestStreak, currentStreak)

      return { ...skill, totalXP: hours, longestStreak: newLongestStreak, history: updatedHistory }
    }))

    const updatedSkill = skills.find(s => s.id === selectedSkillId)

    setManualHours('')
    setManualStreaks('')
    setShowModal(false)
    setSelectedSkillId(null)

    try {
      // Recompute after local state update
      const nonHistoricalEntries = updatedSkill.history.filter(h => h.date === today || h.xp !== 0.5)
      let newHistory = [...nonHistoricalEntries]
      if (streaks > 0) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        for (let i = 0; i < streaks; i++) {
          const dateString = yesterday.toISOString().split('T')[0]
          if (!newHistory.some(h => h.date === dateString)) {
            newHistory.push({ date: dateString, xp: 0.5 })
          }
          yesterday.setDate(yesterday.getDate() - 1)
        }
      }
      const currentStreak = calculateStreak(newHistory)
      const newLongestStreak = Math.max(updatedSkill.longestStreak, currentStreak)
      const historicalEntries = newHistory.filter(h => h.date !== today)

      await replaceHistoricalData(selectedSkillId, historicalEntries, hours, newLongestStreak, today)
    } catch (err) {
      alert('Failed to save historical data: ' + err.message)
      await loadSkills()
    }
  }

  const handleDeleteSkill = async (id) => {
    if (!confirm('Are you sure you want to delete this skill?')) return
    setSkills(skills.filter(s => s.id !== id))
    try {
      await deleteSkillDB(id)
    } catch (err) {
      alert('Failed to delete skill: ' + err.message)
      await loadSkills()
    }
  }

  const addXP = async (skillId, xpAmount) => {
    const today = getTodayString()
    let updatedSkillData = null

    setSkills(prev => prev.map(skill => {
      if (skill.id !== skillId) return skill
      const updatedHistory = [...skill.history]
      const todayIndex = updatedHistory.findIndex(h => h.date === today)

      if (todayIndex >= 0) {
        updatedHistory[todayIndex] = { ...updatedHistory[todayIndex], xp: updatedHistory[todayIndex].xp + xpAmount }
      } else {
        updatedHistory.push({ date: today, xp: xpAmount })
      }

      const newTotalXP = skill.totalXP + xpAmount
      const currentStreak = calculateStreak(updatedHistory)
      const newLongestStreak = Math.max(skill.longestStreak, currentStreak)

      const todayEntry = updatedHistory.find(h => h.date === today)
      updatedSkillData = { todayXP: todayEntry ? todayEntry.xp : xpAmount, newTotalXP, newLongestStreak }

      return { ...skill, totalXP: newTotalXP, longestStreak: newLongestStreak, history: updatedHistory }
    }))

    if (!updatedSkillData) return
    try {
      await upsertHistoryEntry(
        skillId,
        today,
        updatedSkillData.todayXP,
        updatedSkillData.newTotalXP,
        updatedSkillData.newLongestStreak,
      )
    } catch (err) {
      alert('Failed to save XP: ' + err.message)
      await loadSkills()
    }
  }

  const exportData = () => {
    const dataStr = JSON.stringify(skills, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `habit-tracker-backup-${getTodayString()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importData = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target.result)
        if (!Array.isArray(importedData)) {
          alert('Invalid file format. Expected an array of skills.')
          return
        }
        const isValid = importedData.every(skill =>
          skill.id && skill.name &&
          typeof skill.totalXP === 'number' &&
          Array.isArray(skill.history)
        )
        if (!isValid) {
          alert('Invalid file format. Skills are missing required fields.')
          return
        }
        if (confirm('This will replace all your current data. Continue?')) {
          setSkills(importedData)
          alert('Data imported successfully!')
        }
      } catch {
        alert('Error reading file. Please make sure it\'s a valid JSON file.')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const formatDate = (dateString) => {
    const today = getTodayString()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    if (dateString === today) return 'Today'
    if (dateString === yesterdayStr) return 'Yesterday'
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const closeModal = () => {
    setShowModal(false)
    setNewSkillName('')
    setManualHours('')
    setManualStreaks('')
    setSelectedSkillId(null)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loadingSpinner} />
        <p>Loading your skills…</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>🎯 Streak &amp; XP Tracker</h1>
          <p>Build habits, track progress, maintain streaks</p>
          <div className={styles.userBar}>
            <span className={styles.userEmail}>{user.email || user.user_metadata?.full_name}</span>
            <button className={styles.signOutBtn} onClick={handleSignOut}>Sign out</button>
          </div>
        </div>

        <button
          className={styles.addSkillBtn}
          onClick={() => { setModalType('add'); setNewSkillName(''); setShowModal(true) }}
        >
          + Add New Skill
        </button>

        <div className={styles.importExportContainer}>
          <button className={styles.exportBtn} onClick={exportData}>📥 Export Data</button>
          <label className={styles.importBtn}>
            📤 Import Data
            <input type="file" accept=".json" onChange={importData} className={styles.importInput} />
          </label>
        </div>

        {skills.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No skills yet!</h2>
            <p>Click &ldquo;Add New Skill&rdquo; to start tracking your habits</p>
          </div>
        ) : (
          <div className={styles.skillsGrid}>
            {skills.map(skill => {
              const currentStreak = calculateStreak(skill.history)
              const sortedHistory = [...skill.history].sort((a, b) => new Date(b.date) - new Date(a.date))
              const lastEntry = sortedHistory[0] || null
              const todayXP = lastEntry?.date === getTodayString() ? lastEntry.xp : 0

              return (
                <div key={skill.id} className={styles.skillCard}>
                  <div className={styles.skillHeader}>
                    <div className={styles.skillName}>{skill.name}</div>
                    <div>
                      <button className={styles.renameBtn} onClick={() => openRenameModal(skill.id, skill.name)}>Rename</button>
                      <button className={styles.deleteBtn} onClick={() => handleDeleteSkill(skill.id)}>Delete</button>
                    </div>
                  </div>

                  <div className={styles.streakDisplay}>
                    <span>🔥</span>
                    <span>{currentStreak} day streak</span>
                  </div>

                  <div className={styles.xpDisplay}>⭐ {skill.totalXP.toFixed(1)} total hours</div>

                  <div className={styles.stats}>
                    <div className={styles.stat}>
                      <div className={styles.statValue}>{todayXP.toFixed(1)}</div>
                      <div className={styles.statLabel}>Today</div>
                    </div>
                    <div className={styles.stat}>
                      <div className={styles.statValue}>{skill.longestStreak}</div>
                      <div className={styles.statLabel}>Best Streak</div>
                    </div>
                  </div>

                  {lastEntry && (
                    <div className={styles.lastPractice}>Last practiced: {formatDate(lastEntry.date)}</div>
                  )}

                  <div className={styles.actionButtons} style={{ marginTop: '16px' }}>
                    <button className={`${styles.xpBtn} ${styles.xpHalf}`} onClick={() => addXP(skill.id, 0.5)}>
                      +0.5 XP (30 min)
                    </button>
                    <button className={`${styles.xpBtn} ${styles.xpFull}`} onClick={() => addXP(skill.id, 1)}>
                      +1 XP (1 hour)
                    </button>
                  </div>

                  <div className={styles.actionButtons} style={{ marginTop: '8px' }}>
                    <button className={`${styles.xpBtn} ${styles.xpRemove}`} onClick={() => addXP(skill.id, -0.5)}>
                      -0.5 XP (30 min)
                    </button>
                    <button className={`${styles.xpBtn} ${styles.xpRemove}`} onClick={() => addXP(skill.id, -1)}>
                      -1 XP (1 hour)
                    </button>
                  </div>

                  <button
                    className={styles.addSkillBtn}
                    style={{ width: '100%', marginTop: '12px', padding: '8px' }}
                    onClick={() => openManualEntryModal(skill.id)}
                  >
                    📝 Add Historical Data
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
          <div className={styles.modalContent}>
            {(modalType === 'add' || modalType === 'rename') && (
              <>
                <h2>{modalType === 'add' ? 'Add New Skill' : 'Rename Skill'}</h2>
                <div className={styles.formGroup}>
                  <label>{modalType === 'add' ? 'Skill Name' : 'New Name'}</label>
                  <input
                    type="text"
                    placeholder={modalType === 'add' ? 'e.g., Guitar Practice, Coding, Reading' : 'Enter new skill name'}
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddSkill() }}
                    autoFocus
                  />
                </div>
                <div className={styles.modalButtons}>
                  <button className={`${styles.modalBtn} ${styles.modalBtnCancel}`} onClick={closeModal}>Cancel</button>
                  <button className={`${styles.modalBtn} ${styles.modalBtnSubmit}`} onClick={handleAddSkill}>
                    {modalType === 'add' ? 'Add Skill' : 'Rename'}
                  </button>
                </div>
              </>
            )}

            {modalType === 'manual' && (
              <>
                <h2>Add Historical Data</h2>
                <p className={styles.modalNote}>
                  Set your total hours and streak history. This will replace any previous historical data.
                </p>
                <div className={styles.formGroup}>
                  <label>Total Hours Practiced</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="e.g., 50"
                    value={manualHours}
                    onChange={(e) => setManualHours(e.target.value)}
                  />
                  <p className={styles.inputHint}>Sets your total XP (replaces current value)</p>
                </div>
                <div className={styles.formGroup}>
                  <label>Previous Streak Days</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g., 15"
                    value={manualStreaks}
                    onChange={(e) => setManualStreaks(e.target.value)}
                  />
                  <p className={styles.inputHint}>Adds consecutive days before today (replaces old streak data)</p>
                </div>
                <div className={styles.modalButtons}>
                  <button className={`${styles.modalBtn} ${styles.modalBtnCancel}`} onClick={closeModal}>Cancel</button>
                  <button className={`${styles.modalBtn} ${styles.modalBtnSubmit}`} onClick={applyManualEntry}>Add Data</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
