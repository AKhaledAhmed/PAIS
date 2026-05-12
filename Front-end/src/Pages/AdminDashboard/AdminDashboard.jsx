import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';
import Loader from '../../Components/Loader/Loader';
import {
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Pill,
  Bell,
  ArrowRight,
  Sparkles,
  ClipboardList,
} from 'lucide-react';

const API = 'https://pais-production.up.railway.app';

function StatCard({ title, value, subtitle, icon: Icon, tone }) {
  const tones = {
    slate: 'from-slate-600 to-slate-800',
    amber: 'from-amber-500 to-orange-600',
    emerald: 'from-emerald-500 to-teal-600',
    rose: 'from-rose-500 to-red-600',
    cyan: 'from-cyan-500 to-cyan-800',
  };
  const gradient = tones[tone] || tones.slate;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-linear-to-br ${gradient} p-px shadow-lg shadow-slate-900/10`}
    >
      <div className="rounded-2xl bg-white/95 backdrop-blur-sm p-5 h-full min-h-31 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
        </div>
        <div>
          <p className="text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function QuickLinkCard({ to, title, description, icon: Icon, accent }) {
  return (
    <Link
      to={to}
      className="group relative flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-cyan-300 hover:shadow-md hover:shadow-cyan-500/10"
    >
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent}`}
      >
        <Icon className="h-6 w-6 text-white" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900">{title}</h3>
          <ArrowRight className="h-4 w-4 text-cyan-600 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
        </div>
        <p className="mt-1 text-sm text-slate-500 leading-snug">{description}</p>
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pharmacies, setPharmacies] = useState([]);
  const [drugCount, setDrugCount] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    let cancelled = false;

    async function load() {
      const headers = { Authorization: `Bearer ${token}` };

      const [phRes, drRes] = await Promise.allSettled([
        axios.get(`${API}/api/admin/pharmacies`, { headers }),
        axios.get(`${API}/api/drugs`, { headers }),
      ]);

      if (cancelled) return;

      if (phRes.status === 'fulfilled' && phRes.value.data?.success) {
        setPharmacies(Array.isArray(phRes.value.data.data) ? phRes.value.data.data : []);
      }

      if (drRes.status === 'fulfilled') {
        const body = drRes.value.data;
        if (Array.isArray(body)) setDrugCount(body.length);
        else if (Array.isArray(body?.data)) setDrugCount(body.data.length);
        else if (typeof body?.count === 'number') setDrugCount(body.count);
        else setDrugCount('—');
      } else {
        setDrugCount('—');
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const pending = pharmacies.filter((p) => p.status === 'pending').length;
    const approved = pharmacies.filter((p) => p.status === 'approved').length;
    const rejected = pharmacies.filter((p) => p.status === 'rejected').length;
    return { total: pharmacies.length, pending, approved, rejected };
  }, [pharmacies]);

  const pendingPreview = useMemo(
    () => pharmacies.filter((p) => p.status === 'pending').slice(0, 5),
    [pharmacies]
  );

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Admin';

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-cyan-900 via-slate-900 to-indigo-950 px-6 py-10 text-white shadow-xl shadow-cyan-900/20 sm:px-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-200/90 ring-1 ring-white/20">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Control center
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Welcome back, {displayName}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-cyan-100/80">
              Monitor pharmacy onboarding, keep the drug catalog accurate, and stay on top of system
              notifications — all from one place.
            </p>
          </div>
          <Link
            to="/admin/pharmacies"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-cyan-900 shadow-lg transition hover:bg-cyan-50"
          >
            Review queue
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
          <ClipboardList className="h-5 w-5 text-cyan-700" aria-hidden />
          At a glance
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Pharmacies"
            value={stats.total}
            subtitle="Registered in PAIS"
            icon={Building2}
            tone="slate"
          />
          <StatCard
            title="Pending review"
            value={stats.pending}
            subtitle="Awaiting your decision"
            icon={Clock}
            tone="amber"
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            subtitle="Active partners"
            icon={CheckCircle2}
            tone="emerald"
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
            subtitle="Closed applications"
            icon={XCircle}
            tone="rose"
          />
          <StatCard
            title="Drug catalog"
            value={drugCount ?? '—'}
            subtitle="Items in master list"
            icon={Pill}
            tone="cyan"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Quick links */}
        <section className="space-y-4 lg:col-span-3">
          <h2 className="text-lg font-bold text-slate-900">Shortcuts</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <QuickLinkCard
              to="/admin/pharmacies"
              title="Pharmacies"
              description="Approve, reject, or inspect pharmacy applications and licenses."
              icon={Building2}
              accent="bg-linear-to-br from-cyan-600 to-cyan-900"
            />
            <QuickLinkCard
              to="/admin/drugs"
              title="Drug catalog"
              description="Add, edit, or remove medicines visible across the platform."
              icon={Pill}
              accent="bg-linear-to-br from-teal-500 to-emerald-800"
            />
            <QuickLinkCard
              to="/admin/notifications"
              title="Notifications"
              description="System alerts and messages for administrators."
              icon={Bell}
              accent="bg-linear-to-br from-indigo-500 to-violet-800"
            />
            <QuickLinkCard
              to="/admin/profile"
              title="Your profile"
              description="Account details and administrator identity."
              icon={Sparkles}
              accent="bg-linear-to-br from-slate-600 to-slate-900"
            />
          </div>
        </section>

        {/* Pending spotlight */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-900">Needs attention</h2>
            <Link
              to="/admin/pharmacies"
              className="text-xs font-bold text-cyan-700 hover:text-cyan-900 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 rounded-2xl border border-amber-200/80 bg-linear-to-b from-amber-50/90 to-white p-1 shadow-sm">
            <div className="rounded-xl bg-white/80 p-4">
              {pendingPreview.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  No pending pharmacies — you are all caught up.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {pendingPreview.map((p) => (
                    <li key={p._id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">{p.pharmacyName}</p>
                        <p className="truncate text-xs text-slate-500">{p.address || p.pharmacyEmail}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                        Pending
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
