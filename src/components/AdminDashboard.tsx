import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Search, ChevronDown, Users, Zap, CheckCircle2, Clock3, XCircle, TrendingUp } from 'lucide-react';
import { DEPARTMENTS, DEPT_META, PatientRecord } from '../types';
import { supabase } from '../lib/supabase';

const STATUSES = ['Waiting', 'In Progress', 'Completed', 'Cancelled'] as const;
type Status = (typeof STATUSES)[number];

const STATUS_STYLES: Record<Status, string> = {
  Waiting:      'bg-amber-50 text-amber-700 border-amber-200',
  'In Progress':'bg-sky-50 text-sky-700 border-sky-200',
  Completed:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled:    'bg-gray-100 text-gray-500 border-gray-200',
};

const STATUS_ICONS: Record<Status, React.ReactNode> = {
  Waiting:       <Clock3 size={11} />,
  'In Progress': <TrendingUp size={11} />,
  Completed:     <CheckCircle2 size={11} />,
  Cancelled:     <XCircle size={11} />,
};

export default function AdminDashboard() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('registered_at', { ascending: false });
      if (!error && data) {
        setPatients(data as PatientRecord[]);
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();

    // Real-time subscription
    const channel = supabase
      .channel('patients-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, () => {
        fetchPatients();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchPatients]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    const { error } = await supabase.from('patients').update({ status }).eq('id', id);
    if (!error) {
      setPatients((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
    }
    setUpdatingId(null);
  };

  const filtered = patients.filter((p) => {
    const matchSearch = p.full_name.toLowerCase().includes(search.toLowerCase()) ||
                        p.token_number.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter ? p.department === deptFilter : true;
    const matchStatus = statusFilter ? p.status === statusFilter : true;
    return matchSearch && matchDept && matchStatus;
  });

  const waitingByDept = DEPARTMENTS.reduce<Record<string, number>>((acc, dept) => {
    acc[dept] = patients.filter((p) => p.department === dept && p.status === 'Waiting').length;
    return acc;
  }, {});

  const totalWaiting = patients.filter((p) => p.status === 'Waiting').length;
  const totalToday = patients.length;
  const totalCompleted = patients.filter((p) => p.status === 'Completed').length;
  const totalUrgent = patients.filter((p) => p.priority === 'Urgent' && p.status === 'Waiting').length;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Registered Today', value: totalToday, icon: <Users size={16} />, cls: 'text-gray-900' },
          { label: 'Waiting', value: totalWaiting, icon: <Clock3 size={16} />, cls: 'text-amber-600' },
          { label: 'Completed', value: totalCompleted, icon: <CheckCircle2 size={16} />, cls: 'text-emerald-600' },
          { label: 'Urgent Queue', value: totalUrgent, icon: <Zap size={16} />, cls: 'text-rose-600' },
        ].map(({ label, value, icon, cls }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className={`${cls} opacity-70`}>{icon}</div>
            <div>
              <div className={`text-2xl font-black tabular-nums ${cls}`}>{value}</div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Department KPI cards */}
      <div className="grid grid-cols-5 gap-2">
        {DEPARTMENTS.map((dept) => {
          const meta = DEPT_META[dept];
          const active = deptFilter === dept;
          return (
            <button
              key={dept}
              onClick={() => setDeptFilter(active ? '' : dept)}
              className={`rounded-2xl p-3 text-left transition-all duration-200 border-2
                ${active ? 'border-gray-900 bg-gray-900' : `${meta.border} ${meta.bg} hover:border-opacity-80`}
              `}
            >
              <div className={`text-2xl font-black tabular-nums ${active ? 'text-white' : meta.color}`}>
                {waitingByDept[dept]}
              </div>
              <div className={`text-[10px] font-bold leading-tight mt-0.5 ${active ? 'text-gray-400' : 'text-gray-500'}`}>
                {dept}
              </div>
              <div className={`text-[9px] mt-1 ${active ? 'text-gray-500' : 'text-gray-400'}`}>waiting</div>
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            placeholder="Search name or token..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border-2 border-gray-100 focus:border-gray-900 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-300"
          />
        </div>
        <div className="relative">
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="border-2 border-gray-100 focus:border-gray-900 rounded-xl pl-3.5 pr-8 py-2.5 text-sm text-gray-700 outline-none appearance-none cursor-pointer bg-white transition-colors"
          >
            <option value="">All Depts</option>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div className="relative">
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border-2 border-gray-100 focus:border-gray-900 rounded-xl pl-3.5 pr-8 py-2.5 text-sm text-gray-700 outline-none appearance-none cursor-pointer bg-white transition-colors"
          >
            <option value="">All Status</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button
          onClick={fetchPatients}
          disabled={loading}
          className="border-2 border-gray-100 hover:border-gray-900 rounded-xl p-2.5 text-gray-400 hover:text-gray-900 transition-all duration-200 disabled:opacity-40"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
        {lastUpdated && (
          <span className="text-[11px] text-gray-300 whitespace-nowrap hidden xl:block">
            {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-2xl border border-gray-100 min-h-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-gray-300">
            <Users size={32} strokeWidth={1.5} className="mb-3" />
            <p className="text-sm font-medium text-gray-400">No patients found</p>
            <p className="text-xs text-gray-300 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-900 z-10">
              <tr>
                {['Token', 'Name', 'Age', 'Dept', 'Priority', 'Status', 'Time'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const deptMeta = DEPT_META[p.department];
                return (
                  <tr
                    key={p.id}
                    className={`border-b border-gray-50 transition-colors hover:bg-gray-50/80 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                  >
                    <td className="px-4 py-3 font-mono font-black text-gray-900">{p.token_number}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900 leading-tight">{p.full_name}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{p.mobile_number}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.age}y, {p.gender}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${deptMeta?.bg} ${deptMeta?.color} ${deptMeta?.border}`}>
                        {p.department}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.priority === 'Urgent' ? (
                        <span className="flex items-center gap-1 text-rose-600 font-bold text-[11px]"><Zap size={11} />Urgent</span>
                      ) : (
                        <span className="text-gray-400 text-[11px]">Normal</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        {updatingId === p.id ? (
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                            <RefreshCw size={11} className="animate-spin" /> Updating...
                          </div>
                        ) : (
                          <select
                            value={p.status}
                            onChange={(e) => updateStatus(p.id, e.target.value)}
                            className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 cursor-pointer appearance-none outline-none transition-colors ${STATUS_STYLES[p.status as Status] || ''}`}
                          >
                            {STATUSES.map((s) => <option key={s}>{s}</option>)}
                          </select>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-gray-400 whitespace-nowrap">
                      {new Date(p.registered_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-300 shrink-0">
        <span>{filtered.length} of {patients.length} records</span>
        <span className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Live — real-time updates active
        </span>
      </div>
    </div>
  );
}
