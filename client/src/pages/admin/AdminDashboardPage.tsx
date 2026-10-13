import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  FileSpreadsheet,
  Calendar,
  Briefcase,
  Layers,
  Star,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { DashboardStats } from '../../types';
import { dashboardApi } from '../../services/api';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getStats()
      .then((data) => setStats(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-muted-foreground animate-pulse">
        Aggregating database statistics...
      </div>
    );
  }

  const kpi = stats?.kpi;
  const activity = stats?.recentActivity;

  return (
    <div className="space-y-8">
      {/* Top Welcome Title */}
      <div>
        <h1 className="text-2xl font-bold text-white">Live Operations Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Real-time database metrics, customer inquiries, appointment bookings, and proposal
          pipelines.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Inquiries */}
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground">Inquiries</span>
            <div className="p-2 rounded-xl bg-primary/20 text-primary">
              <Inbox className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-white">
              {kpi?.inquiries.total || 0}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[11px] font-semibold">
                {kpi?.inquiries.new || 0} New Unread
              </span>
              <Link to="/admin/inquiries" className="text-primary hover:underline text-[11px]">
                Manage →
              </Link>
            </div>
          </div>
        </div>

        {/* Quotations Pipeline */}
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground">Quotes Pipeline</span>
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-400">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-white">
              ${kpi?.quotations.pipelineValue?.toLocaleString() || 0}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground text-[11px]">
                {kpi?.quotations.total || 0} requests ({kpi?.quotations.new || 0} new)
              </span>
              <Link to="/admin/quotations" className="text-primary hover:underline text-[11px]">
                Pipeline →
              </Link>
            </div>
          </div>
        </div>

        {/* Appointments */}
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground">Appointments</span>
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-white">
              {kpi?.appointments.confirmed || 0}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-emerald-400 text-[11px] font-medium">
                {kpi?.appointments.today || 0} Scheduled Today
              </span>
              <Link to="/admin/appointments" className="text-primary hover:underline text-[11px]">
                Calendar →
              </Link>
            </div>
          </div>
        </div>

        {/* Active Chats & Content */}
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground">Customer Chats</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-white">
              {kpi?.content.activeChats || 0}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground text-[11px]">
                {kpi?.content.pendingReviews || 0} pending review
              </span>
              <Link to="/admin/chats" className="text-primary hover:underline text-[11px]">
                Live Chat →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Database Content Stats Pill Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/admin/services"
          className="rounded-xl border border-border bg-secondary/40 p-3 hover:bg-secondary transition-colors flex items-center justify-between"
        >
          <span className="text-xs text-muted-foreground">Services Active</span>
          <span className="text-sm font-bold text-white">{kpi?.content.services || 0}</span>
        </Link>
        <Link
          to="/admin/portfolio"
          className="rounded-xl border border-border bg-secondary/40 p-3 hover:bg-secondary transition-colors flex items-center justify-between"
        >
          <span className="text-xs text-muted-foreground">Projects Published</span>
          <span className="text-sm font-bold text-white">{kpi?.content.projects || 0}</span>
        </Link>
        <Link
          to="/admin/testimonials"
          className="rounded-xl border border-border bg-secondary/40 p-3 hover:bg-secondary transition-colors flex items-center justify-between"
        >
          <span className="text-xs text-muted-foreground">Testimonials</span>
          <span className="text-sm font-bold text-white">{kpi?.content.testimonials || 0}</span>
        </Link>
        <Link
          to="/admin/blog"
          className="rounded-xl border border-border bg-secondary/40 p-3 hover:bg-secondary transition-colors flex items-center justify-between"
        >
          <span className="text-xs text-muted-foreground">Blog Articles</span>
          <span className="text-sm font-bold text-white">{kpi?.content.blogPosts || 0}</span>
        </Link>
      </div>

      {/* Two Column Activity Tables */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Latest Inquiries Table */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Inbox className="h-4 w-4 text-primary" /> Latest Inquiries
            </h2>
            <Link to="/admin/inquiries" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>

          {activity?.inquiries && activity.inquiries.length > 0 ? (
            <div className="divide-y divide-border/60">
              {activity.inquiries.map((inq) => (
                <div key={inq._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="truncate">
                    <p className="font-semibold text-white truncate">{inq.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{inq.subject}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        inq.status === 'new'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : inq.status === 'in_progress'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {inq.status}
                    </span>
                    <Link to="/admin/inquiries" className="text-muted-foreground hover:text-white">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-6 text-center">
              No inquiries logged yet.
            </p>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" /> Upcoming Calls
            </h2>
            <Link to="/admin/appointments" className="text-xs text-primary hover:underline">
              View calendar
            </Link>
          </div>

          {activity?.appointments && activity.appointments.length > 0 ? (
            <div className="divide-y divide-border/60">
              {activity.appointments.map((app) => (
                <div key={app._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="truncate">
                    <p className="font-semibold text-white truncate">{app.clientName}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {app.appointmentDate} at {app.startTime} ({app.serviceType})
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0 ${
                      app.status === 'confirmed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : app.status === 'cancelled'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-6 text-center">
              No upcoming appointments booked.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
