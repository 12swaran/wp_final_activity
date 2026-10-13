import { api } from '../../services/api';
import { Pagination } from '../../components/common/Forms';
import React, { useEffect, useState } from 'react';
import { Search, Mail, Reply, Trash2, CheckCircle2, Clock, Archive } from 'lucide-react';
import { Inquiry } from '../../types';
import { inquiriesApi } from '../../services/api';

export const AdminInquiriesPage: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1),
    [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Reply modal
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const fetchInquiries = () => {
    setLoading(true);
    inquiriesApi
      .getAllAdmin({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search || undefined,
        limit: 20,
        page,
      })
      .then((res) => {
        setInquiries(res.data || []);
        setPages(res.meta?.totalPages || 1);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter, search, page]);
  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await inquiriesApi.updateStatus(id, newStatus);
      fetchInquiries();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this inquiry?')) {
      try {
        await inquiriesApi.delete(id);
        fetchInquiries();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !replyText.trim()) return;

    setReplyLoading(true);
    try {
      await inquiriesApi.reply(selectedInquiry._id, replyText);
      setReplyText('');
      setSelectedInquiry(null);
      fetchInquiries();
    } catch (err) {
      console.error(err);
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <button
        className="underline"
        onClick={async () => {
          const response = await api.get('/inquiries/export', {
            params: { search, status: statusFilter },
            responseType: 'blob',
          });
          const url = URL.createObjectURL(response.data);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'inquiries.csv';
          link.click();
          URL.revokeObjectURL(url);
        }}
      >
        Export matching inquiries as CSV
      </button>
      <Pagination page={page} totalPages={pages} onChange={setPage} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Inquiries &amp; Messages</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage contact submissions, track response statuses, and reply directly via email.
          </p>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {['all', 'new', 'in_progress', 'resolved', 'archived'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-primary text-white shadow-glow'
                  : 'bg-secondary text-muted-foreground hover:text-white border border-border'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by name, email, subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-primary"
        />
      </div>

      {/* Inquiries Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-muted-foreground animate-pulse">
            Loading inquiries...
          </div>
        ) : inquiries.length === 0 ? (
          <div className="py-20 text-center text-xs text-muted-foreground">
            No inquiries match this criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/60 text-white font-semibold uppercase tracking-wider text-[11px] border-b border-border">
                <tr>
                  <th className="py-3.5 px-5">Client</th>
                  <th className="py-3.5 px-5">Subject &amp; Message</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inquiries.map((inq) => (
                  <tr key={inq._id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-5">
                      <p className="font-bold text-white">{inq.name}</p>
                      <p className="text-[11px] text-muted-foreground">{inq.email}</p>
                      {inq.phone && <p className="text-[10px] text-primary">{inq.phone}</p>}
                    </td>
                    <td className="py-4 px-5 max-w-md">
                      <p className="font-semibold text-white truncate">{inq.subject}</p>
                      <p className="text-muted-foreground line-clamp-2 mt-0.5">{inq.message}</p>
                      {inq.replyHistory && inq.replyHistory.length > 0 && (
                        <span className="inline-block mt-1 text-[10px] text-emerald-400">
                          ✓ {inq.replyHistory.length} email replies sent
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <select
                        value={inq.status}
                        onChange={(e) => handleStatusChange(inq._id, e.target.value)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold bg-secondary border focus:outline-none ${
                          inq.status === 'new'
                            ? 'text-rose-400 border-rose-500/30'
                            : inq.status === 'in_progress'
                              ? 'text-amber-400 border-amber-500/30'
                              : 'text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td className="py-4 px-5 text-muted-foreground whitespace-nowrap">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedInquiry(inq)}
                        className="rounded-lg bg-primary/20 hover:bg-primary text-primary hover:text-white p-2 transition-colors"
                        title="Reply via Email"
                      >
                        <Reply className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(inq._id)}
                        className="rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white p-2 transition-colors"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Email Reply Modal */}
      {selectedInquiry && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit record"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
        >
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Reply to {selectedInquiry.name}</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Sending this will dispatch an email to{' '}
              <span className="text-white font-medium">{selectedInquiry.email}</span> and log it
              into inquiry history.
            </p>

            <div className="mb-4 rounded-xl border border-border bg-secondary/50 p-3 text-xs text-muted-foreground">
              <p className="font-semibold text-white">Original Message:</p>
              <p className="mt-1 italic">{selectedInquiry.message}</p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <label
                  className="block text-xs font-medium text-white mb-1"
                  htmlFor="AdminInquiriesPage-field-0"
                >
                  Your Email Response *
                </label>
                <textarea
                  required
                  rows={6}
                  value={replyText}
                  id="AdminInquiriesPage-field-0"
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Hi there, thanks for reaching out. We would be glad to help with your project..."
                  className="w-full rounded-xl border border-border bg-secondary p-3 text-xs text-white focus:outline-none focus:border-primary resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className="rounded-full border border-border bg-card px-5 py-2 text-xs font-semibold text-muted-foreground hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replyLoading || !replyText.trim()}
                  className="glow-card rounded-full bg-primary px-6 py-2 text-xs font-semibold text-white shadow-glow hover:scale-105 transition-all disabled:opacity-50"
                >
                  {replyLoading ? 'Sending Email...' : 'Send Email Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
