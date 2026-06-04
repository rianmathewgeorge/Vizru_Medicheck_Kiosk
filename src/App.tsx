import { useState } from 'react';
import { Activity, LayoutDashboard, ClipboardList, ChevronRight } from 'lucide-react';
import { DEPARTMENTS } from './types';
import PatientForm from './components/PatientForm';
import TokenConfirmation from './components/TokenConfirmation';
import AdminDashboard from './components/AdminDashboard';
import { ViewState, PatientRecord } from './types';

export default function App() {
  const [view, setView] = useState<ViewState>('registration');
  const [registeredPatient, setRegisteredPatient] = useState<PatientRecord | null>(null);

  const handleSuccess = (patient: PatientRecord) => {
    setRegisteredPatient(patient);
    setView('success');
  };

  const handleReset = () => {
    setRegisteredPatient(null);
    setView('registration');
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4 landscape-only">
      {/* Tablet frame — 10-inch landscape */}
      <div className="w-full max-w-[1024px] h-[768px] bg-white rounded-[2rem] shadow-[0_32px_80px_-12px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden border border-gray-200/60">

        {/* Header */}
        <header className="flex items-center justify-between px-7 py-4 border-b border-gray-100 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-900/20">
              <Activity size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-sm font-black text-gray-900 tracking-tight leading-none">MediCheck</h1>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">Patient Self Check-In Kiosk</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-1 bg-gray-100/80 rounded-2xl p-1">
            <button
              onClick={() => setView('registration')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200
                ${view === 'registration' || view === 'success'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'}`}
            >
              <ClipboardList size={13} />
              Register
            </button>
            <button
              onClick={() => setView('admin')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200
                ${view === 'admin'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutDashboard size={13} />
              Triage
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[11px] text-gray-400 font-medium">Live</span>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 overflow-hidden">
          {/* Registration View */}
          {view === 'registration' && (
            <div className="h-full flex">
              {/* Left sidebar */}
              <aside className="w-52 bg-gray-950 flex flex-col shrink-0">
                <div className="flex-1 flex flex-col justify-between p-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-white/5 rounded-xl px-3 py-1.5 mb-5">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Kiosk Active</span>
                    </div>
                    <h2 className="text-white text-2xl font-black leading-tight tracking-tight mb-3">
                      Fast.<br/>Seamless.<br/>Private.
                    </h2>
                    <p className="text-white/30 text-xs leading-relaxed">
                      Check in quickly. Your data is protected by our privacy shield.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mb-3">Available Departments</p>
                    {DEPARTMENTS.map((d) => (
                      <div key={d} className="flex items-center gap-2.5 py-1.5">
                        <div className="w-1 h-1 bg-white/20 rounded-full" />
                        <span className="text-white/40 text-xs font-medium">{d}</span>
                        <ChevronRight size={10} className="text-white/10 ml-auto" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom accent */}
                <div className="h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-rose-500 opacity-60" />
              </aside>

              {/* Form */}
              <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="px-7 pt-6 pb-2 border-b border-gray-50 shrink-0">
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">Patient Registration</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Fields marked <span className="text-rose-400">*</span> are required
                  </p>
                </div>
                <div className="flex-1 px-7 py-5 overflow-y-auto">
                  <PatientForm onSuccess={handleSuccess} />
                </div>
              </div>
            </div>
          )}

          {/* Success View */}
          {view === 'success' && registeredPatient && (
            <div className="h-full px-7 py-5 overflow-y-auto">
              <TokenConfirmation patient={registeredPatient} onReset={handleReset} />
            </div>
          )}

          {/* Admin View */}
          {view === 'admin' && (
            <div className="h-full flex flex-col px-7 py-5 overflow-hidden">
              <div className="flex items-baseline justify-between mb-4 shrink-0">
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">Triage Dashboard</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Click department cards to filter &bull; Status updates sync live</p>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <AdminDashboard />
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="shrink-0 flex items-center justify-between px-7 py-2.5 border-t border-gray-50 bg-gray-50/50">
          <p className="text-[10px] text-gray-300 font-medium uppercase tracking-widest">
            MediCheck &bull; Powered by Local FastAPI Backend &bull; HIPAA-Conscious Design
          </p>
          {/* Hidden demo toggle */}
          <button
            onClick={() => setView(view === 'admin' ? 'registration' : 'admin')}
            className="text-[10px] text-transparent hover:text-gray-300 transition-colors px-2 py-1 select-none"
            tabIndex={-1}
          >
            &bull;&bull;&bull;
          </button>
        </footer>
      </div>
    </div>
  );
}
