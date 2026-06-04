import { useEffect, useState } from 'react';
import { CheckCircle2, Printer, ArrowRight, Zap, Clock } from 'lucide-react';
import { PatientRecord, DEPT_META } from '../types';

interface TokenConfirmationProps {
  patient: PatientRecord;
  onReset: () => void;
}

export default function TokenConfirmation({ patient, onReset }: TokenConfirmationProps) {
  const [countdown, setCountdown] = useState(10);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const total = 10000;
    const frame = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, total - elapsed);
      setProgress((remaining / total) * 100);
      setCountdown(Math.ceil(remaining / 1000));
      if (remaining > 0) requestAnimationFrame(frame);
      else onReset();
    };
    const raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [onReset]);

  const safeName = (patient.full_name ?? patient.name ?? '').toString();
  const safeToken = (patient.token_number ?? patient.token ?? '').toString();
  const safeDept = patient.department_ui ?? patient.department ?? patient.dept ?? 'Unknown';
  const safePriority = patient.priority ?? 'Normal';
  const safeAge = patient.age ?? '';
  const safeGender = patient.gender ?? '';

  const deptMeta = DEPT_META[safeDept as keyof typeof DEPT_META] ?? undefined;

  const formattedDate = new Date(patient.registered_at ?? patient.registeredAt ?? Date.now()).toLocaleString('en-IN', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-token, #print-token * { visibility: visible !important; }
          #print-token { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; }
        }
      `}</style>

      <div className="h-full flex items-center justify-center">
        <div className="w-full max-w-lg flex flex-col items-center gap-5">
          {/* Success ring */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-500" strokeWidth={2} />
            </div>
            {patient.priority === 'Urgent' && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
                <Zap size={12} className="text-white" />
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Registration Successful</p>
            <p className="text-base font-semibold text-gray-700 mt-0.5">Welcome, {safeName.split(' ')[0] || 'Guest'}</p>
          </div>

          {/* Token card */}
          <div id="print-token" className="w-full rounded-3xl overflow-hidden shadow-2xl shadow-gray-900/15">
            {/* Card header */}
            <div className="bg-gray-900 px-8 py-6 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Token Number</p>
                <div className="text-6xl font-black text-white tracking-tight font-mono leading-none">
                  {safeToken}
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${deptMeta?.bg} ${deptMeta?.color} ${deptMeta?.border} border`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${deptMeta?.dot}`} />
                  {safeDept}
                </div>
                {safePriority === 'Urgent' && (
                  <div className="mt-2 flex items-center gap-1 justify-end text-rose-400 text-xs font-bold">
                    <Zap size={11} /> URGENT
                  </div>
                )}
              </div>
            </div>

            {/* Card body */}
            <div className="bg-white px-8 py-5 grid grid-cols-3 gap-4 border border-gray-100 rounded-b-3xl">
                {[
                { label: 'Patient', value: safeName || '—' },
                { label: 'Age / Gender', value: `${safeAge} yrs, ${safeGender}` },
                { label: 'Registered At', value: formattedDate },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-sm font-semibold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <button
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl hover:border-gray-900 hover:text-gray-900 transition-all duration-200 text-sm"
            >
              <Printer size={16} />
              Print Token
            </button>
            <button
              onClick={onReset}
              className="flex-1 bg-gray-900 text-white font-bold py-3.5 rounded-2xl hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2 text-sm group"
            >
              Next Patient
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Countdown bar */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <Clock size={11} /> Auto-reset in {countdown}s
              </span>
              <span className="text-[11px] text-gray-300">for next patient</span>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 rounded-full transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
