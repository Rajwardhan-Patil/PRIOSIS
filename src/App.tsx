import React from 'react'
import { IncidentProvider, useIncidentContext } from './context/IncidentContext'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { DemoBanner } from './components/common/DemoBanner'
import { DisclaimerModal } from './components/common/DisclaimerModal'
import { JudgeGuidedTour } from './components/demo/JudgeGuidedTour'

import { OperationsDashboard } from './components/dashboard/OperationsDashboard'
import { IncidentExplorer } from './components/incidents/IncidentExplorer'
import { RiskAnalysis } from './components/risk/RiskAnalysis'
import { ResourceAllocation } from './components/resources/ResourceAllocation'
import { RouteReplanning } from './components/routing/RouteReplanning'
import { DataSourcesView } from './components/datasources/DataSourcesView'
import { AboutView } from './components/about/AboutView'

const MainContent: React.FC = () => {
  const { activeTab } = useIncidentContext()

  return (
    <main className="flex-1 p-4 lg:p-6 pb-24 overflow-y-auto">
      {activeTab === 'dashboard' && <OperationsDashboard />}
      {activeTab === 'incidents' && <IncidentExplorer />}
      {activeTab === 'risk' && <RiskAnalysis />}
      {activeTab === 'resources' && <ResourceAllocation />}
      {activeTab === 'routing' && <RouteReplanning />}
      {activeTab === 'datasources' && <DataSourcesView />}
      {activeTab === 'about' && <AboutView />}
    </main>
  )
}

function App() {
  return (
    <IncidentProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Header />
        <DemoBanner />

        <div className="flex-1 flex flex-col lg:flex-row">
          <Sidebar />
          <MainContent />
        </div>

        <JudgeGuidedTour />
        <DisclaimerModal />
      </div>
    </IncidentProvider>
  )
}

export default App
