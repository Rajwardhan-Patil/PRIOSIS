import React, { useState, useEffect } from 'react'
import { IncidentProvider, useIncidentContext } from './context/IncidentContext'
import { StatusBar } from './components/common/StatusBar'
import { KeyboardShortcutsModal } from './components/common/KeyboardShortcutsModal'
import { TourPopover } from './components/common/TourPopover'
import { NuGenAdvisorModal } from './components/common/NuGenAdvisorModal'

import { CommandView } from './components/dashboard/CommandView'
import { IncidentsView } from './components/incidents/IncidentsView'
import { RiskModelView } from './components/risk/RiskModelView'
import { UnitsView } from './components/units/UnitsView'
import { RoutesView } from './components/routing/RoutesView'
import { DataSourcesView } from './components/datasources/DataSourcesView'
import { AboutView } from './components/about/AboutView'

const MainApp: React.FC = () => {
  const { activeTab, setActiveTab, toggleTheme, toggleLanguage } = useIncidentContext()
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)
  const [isTourOpen, setIsTourOpen] = useState(false)
  const [isNuGenAdvisorOpen, setIsNuGenAdvisorOpen] = useState(false)

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return

      if (e.key === '?') {
        e.preventDefault()
        setIsShortcutsOpen(prev => !prev)
      } else if (e.key === 't' || e.key === 'T') {
        toggleTheme()
      } else if (e.key === 'l' || e.key === 'L') {
        toggleLanguage()
      } else if (e.key === 'n' || e.key === 'N') {
        setIsNuGenAdvisorOpen(prev => !prev)
      } else if (e.key === 'Escape') {
        setIsShortcutsOpen(false)
        setIsTourOpen(false)
        setIsNuGenAdvisorOpen(false)
      } else if (e.key === '1') {
        setActiveTab('dashboard')
      } else if (e.key === '2') {
        setActiveTab('incidents')
      } else if (e.key === '3') {
        setActiveTab('resources')
      } else if (e.key === '4') {
        setActiveTab('routing')
      } else if (e.key === '5') {
        setActiveTab('risk')
      } else if (e.key === '6') {
        setActiveTab('datasources')
      } else if (e.key === '7') {
        setActiveTab('about')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setActiveTab, toggleTheme, toggleLanguage])

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0E0F11] text-[#ECEDEF] flex flex-col font-sans antialiased selection:bg-[#ECEDEF] selection:text-[#0E0F11]">
      {/* 48px Top Navigation Bar (Wordmark, Place, Text Tabs, Status Line, Demo, Shortcuts) */}
      <StatusBar
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onToggleTour={() => setIsTourOpen(prev => !prev)}
        onOpenNuGenAdvisor={() => setIsNuGenAdvisorOpen(true)}
        isTourOpen={isTourOpen}
      />

      {/* Main View Area (Edge-to-edge, no left rail) */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#0E0F11]">
        {activeTab === 'dashboard' && <CommandView onOpenNuGenAdvisor={() => setIsNuGenAdvisorOpen(true)} />}
        {activeTab === 'incidents' && <IncidentsView />}
        {activeTab === 'resources' && <UnitsView />}
        {activeTab === 'routing' && <RoutesView />}
        {activeTab === 'risk' && <RiskModelView />}
        {activeTab === 'datasources' && <DataSourcesView />}
        {activeTab === 'about' && <AboutView />}
      </main>

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* NuGen Tactical Advisor Modal */}
      <NuGenAdvisorModal
        isOpen={isNuGenAdvisorOpen}
        onClose={() => setIsNuGenAdvisorOpen(false)}
      />

      {/* Step-by-step evaluator tour popover */}
      <TourPopover
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />
    </div>
  )
}

function App() {
  return (
    <IncidentProvider>
      <MainApp />
    </IncidentProvider>
  )
}

export default App
