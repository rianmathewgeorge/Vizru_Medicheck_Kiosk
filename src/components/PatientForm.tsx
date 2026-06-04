import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  User, Calendar, Phone, MapPin, Stethoscope,
  ChevronDown, Loader2, AlertCircle, Shield, Zap, ArrowRight
} from 'lucide-react';
import TouchNumpad from './TouchNumpad';
import { DEPARTMENTS, DEPT_META, PatientFormData, PatientRecord } from '../types';
import { supabase } from '../lib/supabase';

const INACTIVITY_TIMEOUT = 30000;

const EMPTY_FORM: PatientFormData = {
  full_name: '',
  age: '',
  gender: '',
  mobile_number: '',
  address: '',
  department: '',
  priority: 'Normal',
};

interface PatientFormProps {
  onSuccess: (patient: PatientRecord) => void;
}

export default function PatientForm({ onSuccess }: PatientFormProps) {
  const [form, setForm] = useState<PatientFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<PatientFormData>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [numpadTarget, setNumpadTarget] = useState<'age' | 'mobile_number' | null>(null);
  const [shieldState, setShieldState] = useState<'idle' | 'warning' | 'clearing'>('idle');
  const [shieldCountdown, setShieldCountdown] = useState(3);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shieldInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearShield = useCallback(() => {
    setShieldState('idle');
    setShieldCountdown(3);
    if (shieldInterval.current) clearInterval(shieldInterval.current);
  }, []);

  const resetInactivity = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    clearShield();
    inactivityTimer.current = setTimeout(() => {
      setShieldState('warning');
      let count = 3;
      setShieldCountdown(count);
      shieldInterval.current = setInterval(() => {
        count -= 1;
        setShieldCountdown(count);
        if (count <= 0) {
          if (shieldInterval.current) clearInterval(shieldInterval.current);
          setShieldState('clearing');
          setTimeout(() => {
            setForm(EMPTY_FORM);
            setErrors({});
            setApiError('');
            setNumpadTarget(null);
            clearShield();
          }, 500);
        }
      }, 1000);
    }, INACTIVITY_TIMEOUT);
  }, [clearShield]);

  useEffect(() => {
    resetInactivity();
    const events = ['mousemove', 'keydown', 'touchstart', 'click', 'scroll'];
    events.forEach((e) => window.addEventListener(e, resetInactivity, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetInactivity));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (shieldInterval.current) clearInterval(shieldInterval.current);
    };
  }, [resetInactivity]);

  const validate = (): boolean => {
    const e: Partial<PatientFormData> = {};
    if (!form.full_name.trim()) e.full_name = 'Required';
    if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 1 || Number(form.age) > 120)
      e.age = 'Enter age 1–120';
    if (!form.gender) e.gender = 'Required';
    if (!/^\d{10}$/.test(form.mobile_number)) e.mobile_number = '10 digits required';
    if (!form.department) e.department = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert({
          full_name: form.full_name.trim(),
          age: Number(form.age),
          gender: form.gender,
          mobile_number: form.mobile_number,
          address: form.address.trim(),
          department: form.department,
          priority: form.priority,
        })
        .select()
        .single();

      if (error) throw error;
      onSuccess(data as PatientRecord);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fe = (field: string) => errors[field as keyof PatientFormData] || null;

  const inputBase = `w-full bg-white border-2 rounded-2xl px-4 py-3.5 text-gray-900 text-sm font-medium outline-none transition-all duration-200 placeholder:text-gray-300`;
  const inputCls = (field: string) =>
    `${inputBase} ${fe(field) ? 'border-red-400 bg-red-50/30' : 'border-gray-100 focus:border-gray-900 hover:border-gray-200'}`;

  return (
    <div className="relative h-full flex flex-col">
      {/* Privacy Shield */}
      {shieldState !== 'idle' && (
        <div className={`absolute inset-0 z-40 rounded-2xl flex flex-col items-center justify-center transition-all duration-500 ${shieldState === 'clearing' ? 'opacity-0' : 'opacity-100'}`}
          style={{ background: 'rgba(15,15,25,0.94)', backdropFilter: 'blur(8px)' }}>
          <div className="relative mb-5">
            <div className="w-20 h-20 rounded-full border-2 border-white/10 flex items-center justify-center">
              <Shield size={36} className="text-white/80" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
              <span className="text-white font-black text-sm">{shieldCountdown}</span>
            </div>
          </div>
          <p className="text-white text-lg font-bold mb-1">Privacy Shield Active</p>
          <p className="text-white/50 text-sm mb-6">Clearing form in {shieldCountdown} second{shieldCountdown !== 1 ? 's' : ''}</p>
          <button
            onClick={resetInactivity}
            className="px-6 py-2.5 bg-white text-gray-900 font-bold rounded-2xl text-sm hover:bg-gray-100 transition-colors"
          >
            I'm still here
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
        {/* Row 1: Full Name */}
        <div className="group">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 group-focus-within:text-gray-700 transition-colors">
            Full Name <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              className={`${inputCls('full_name')} pl-10`}
              placeholder="Patient's full name"
              value={form.full_name}
              onChange={(e) => { setForm({ ...form, full_name: e.target.value }); if (fe('full_name')) setErrors({ ...errors, full_name: '' }); }}
            />
          </div>
          {fe('full_name') && <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1"><AlertCircle size={11} />{fe('full_name')}</p>}
        </div>

        {/* Row 2: Age + Gender */}
        <div className="grid grid-cols-2 gap-3">
          <div className="group">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 group-focus-within:text-gray-700 transition-colors">
              Age <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Calendar size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <input
                type="text"
                readOnly
                className={`${inputCls('age')} pl-10 cursor-pointer`}
                placeholder="Tap to enter"
                value={form.age}
                onClick={() => setNumpadTarget('age')}
              />
            </div>
            {fe('age') && <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1"><AlertCircle size={11} />{fe('age')}</p>}
          </div>

          <div className="group">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
              Gender <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <select
                className={`${inputCls('gender')} appearance-none cursor-pointer`}
                value={form.gender}
                onChange={(e) => { setForm({ ...form, gender: e.target.value }); if (fe('gender')) setErrors({ ...errors, gender: '' }); }}
              >
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </div>
            {fe('gender') && <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1"><AlertCircle size={11} />{fe('gender')}</p>}
          </div>
        </div>

        {/* Row 3: Mobile + Department */}
        <div className="grid grid-cols-2 gap-3">
          <div className="group">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
              Mobile <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <input
                type="text"
                readOnly
                className={`${inputCls('mobile_number')} pl-10 cursor-pointer font-mono tracking-wider`}
                placeholder="Tap to enter"
                value={form.mobile_number}
                onClick={() => setNumpadTarget('mobile_number')}
              />
            </div>
            {fe('mobile_number') && <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1"><AlertCircle size={11} />{fe('mobile_number')}</p>}
          </div>

          <div className="group">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
              Department <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Stethoscope size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <select
                className={`${inputCls('department')} pl-10 appearance-none cursor-pointer`}
                value={form.department}
                onChange={(e) => { setForm({ ...form, department: e.target.value }); if (fe('department')) setErrors({ ...errors, department: '' }); }}
              >
                <option value="">Select dept.</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            {fe('department') && <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1"><AlertCircle size={11} />{fe('department')}</p>}
          </div>
        </div>

        {/* Row 4: Address */}
        <div className="group">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
            Address <span className="text-gray-300 font-normal normal-case text-[10px]">— optional</span>
          </label>
          <div className="relative">
            <MapPin size={15} className="absolute left-4 top-3.5 text-gray-300" />
            <textarea
              rows={2}
              className={`${inputBase} pl-10 border-gray-100 focus:border-gray-900 hover:border-gray-200 resize-none`}
              placeholder="Street, City, State"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
        </div>

        {/* Priority toggle */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Priority</label>
          <div className="flex gap-2">
            {['Normal', 'Urgent'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setForm({ ...form, priority: p })}
                className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 border-2 flex items-center justify-center gap-1.5
                  ${form.priority === p
                    ? p === 'Urgent'
                      ? 'bg-rose-500 border-rose-500 text-white'
                      : 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                  }`}
              >
                {p === 'Urgent' && <Zap size={13} />}
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Department quick preview */}
        {form.department && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border ${DEPT_META[form.department]?.border} ${DEPT_META[form.department]?.bg}`}>
            <div className={`w-2 h-2 rounded-full ${DEPT_META[form.department]?.dot}`} />
            <span className={`text-xs font-semibold ${DEPT_META[form.department]?.color}`}>{form.department}</span>
            <span className="text-xs text-gray-400 ml-auto">Queue active</span>
          </div>
        )}

        {/* API error */}
        {apiError && (
          <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3">
            <AlertCircle size={15} className="text-rose-500 mt-0.5 shrink-0" />
            <p className="text-sm text-rose-600">{apiError}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-auto w-full bg-gray-900 hover:bg-gray-800 active:bg-black disabled:bg-gray-200 text-white font-bold text-sm rounded-2xl py-4 transition-all duration-200 flex items-center justify-center gap-2.5 tracking-wide group shadow-lg shadow-gray-900/20"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Registering...</>
          ) : (
            <><span>Register Patient</span><ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" /></>
          )}
        </button>
      </form>

      {numpadTarget === 'age' && (
        <TouchNumpad label="Enter Age" value={form.age} maxLength={3}
          onChange={(v) => { setForm({ ...form, age: v }); if (fe('age')) setErrors({ ...errors, age: '' }); }}
          onClose={() => setNumpadTarget(null)} />
      )}
      {numpadTarget === 'mobile_number' && (
        <TouchNumpad label="Enter Mobile Number" value={form.mobile_number} maxLength={10}
          onChange={(v) => { setForm({ ...form, mobile_number: v }); if (fe('mobile_number')) setErrors({ ...errors, mobile_number: '' }); }}
          onClose={() => setNumpadTarget(null)} />
      )}
    </div>
  );
}
