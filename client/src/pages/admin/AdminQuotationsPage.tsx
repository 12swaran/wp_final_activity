import { Field, downloadFile } from '../../components/common/Forms';
import { Pagination } from '../../components/common/Forms';
import React, { useEffect, useState } from 'react';
import { Search, DollarSign, Edit3, Trash2, CheckCircle2, Clock, X } from 'lucide-react';
import { QuotationRequest } from '../../types';
import { quotationsApi } from '../../services/api';

export const AdminQuotationsPage: React.FC = () => {
  const [quotations, setQuotations] = useState<QuotationRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1),
    [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Edit quote modal
  const [editingQuote, setEditingQuote] = useState<QuotationRequest | null>(null);
  const [estimateInput, setEstimateInput] = useState<number>(0);
  const [proposal, setProposal] = useState('');
  const [notesInput, setNotesInput] = useState<string>('');
  const [statusInput, setStatusInput] = useState<string>('new');
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchQuotations = () => {
    setLoading(true);
    quotationsApi
      .getAllAdmin({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search || undefined,
        limit: 20,
        page,
      })
      .then((res) => {
        setQuotations(res.data || []);
        setPages(res.meta?.totalPages || 1);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuotations();
  }, [statusFilter, search, page]);
  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  const openEditModal = (q: QuotationRequest) => {
    setEditingQuote(q);
    setProposal(q.proposal || '');
    setEstimateInput(q.estimatedQuote || 0);
    setNotesInput(q.notes || '');
    setStatusInput(q.status);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuote) return;

    setSaveLoading(true);
    try {
      await quotationsApi.update(editingQuote._id, {
        estimatedQuote: estimateInput,
        notes: notesInput,
        status: statusInput,
        proposal,
      });
      setEditingQuote(null);
      fetchQuotations();
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this quotation request?')) {
      try {
        await quotationsApi.delete(id);
        fetchQuotations();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Pagination page={page} totalPages={pages} onChange={setPage} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quotation Proposals Pipeline</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review custom website requests, assign estimates, and track client deal status.
          </p>
        </div>

        {/* Pipeline Filters */}
        <div className="flex flex-wrap gap-2">
          {['all', 'new', 'reviewing', 'quoted', 'accepted', 'declined'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-primary text-white shadow-glow'
                  : 'bg-secondary text-muted-foreground hover:text-white border border-border'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by client, company, project..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-primary"
        />
      </div>

      {/* Quotes Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-muted-foreground animate-pulse">
            Loading quotation pipeline...
          </div>
        ) : quotations.length === 0 ? (
          <div className="py-20 text-center text-xs text-muted-foreground">
            No quotations found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/60 text-white font-semibold uppercase tracking-wider text-[11px] border-b border-border">
                <tr>
                  <th className="py-3.5 px-5">Client / Brand</th>
                  <th className="py-3.5 px-5">Project Scope</th>
                  <th className="py-3.5 px-5">Client Budget</th>
                  <th className="py-3.5 px-5">Assigned Quote</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {quotations.map((q) => (
                  <tr key={q._id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-5">
                      <p className="font-bold text-white">{q.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {q.company || 'Private Client'}
                      </p>
                      <p className="text-[10px] text-primary">{q.email}</p>
                    </td>
                    <td className="py-4 px-5 max-w-xs">
                      <p className="font-semibold text-white">{q.projectType}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {q.description}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {q.requiredFeatures?.slice(0, 2).map((f, i) => (
                          <span
                            key={i}
                            className="text-[9px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-muted-foreground">
                      <p className="text-white font-medium">{q.budgetRange}</p>
                      <p className="text-[10px]">{q.timeline}</p>
                    </td>
                    <td className="py-4 px-5 font-bold font-display text-emerald-400">
                      {q.estimatedQuote ? `$${q.estimatedQuote}` : '—'}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
                          q.status === 'new'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : q.status === 'quoted'
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              : q.status === 'accepted'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(q)}
                        className="rounded-lg bg-primary/20 hover:bg-primary text-primary hover:text-white p-2 transition-colors"
                        title="Update Estimate & Notes"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(q._id)}
                        className="rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white p-2 transition-colors"
                        title="Delete"
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

      {/* Edit Estimate & Status Modal */}
      {editingQuote && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit record"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
        >
          <div className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xl relative">
            <button
              data-dialog-close
              aria-label="Close"
              onClick={() => setEditingQuote(null)}
              className="absolute top-5 right-5 text-muted-foreground hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Update Proposal Estimate</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Client: {editingQuote.name} ({editingQuote.company || 'Private'})
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <Field
                label="Quotation scope and terms"
                value={proposal}
                onChange={setProposal}
                multiline
              />
              {editingQuote.attachments?.map((id, index) => (
                <button
                  type="button"
                  key={id}
                  className="block underline"
                  onClick={() => downloadFile(id, `client-brief-${index + 1}`)}
                >
                  Download client brief {index + 1}
                </button>
              ))}
              <div>
                <label
                  className="block text-xs font-medium text-white mb-1"
                  htmlFor="AdminQuotationsPage-field-0"
                >
                  Quote Status
                </label>
                <select
                  value={statusInput}
                  id="AdminQuotationsPage-field-0"
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="new">New</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="quoted">Quoted</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-white mb-1"
                  htmlFor="AdminQuotationsPage-field-1"
                >
                  Estimated Proposal Amount ($)
                </label>
                <input
                  type="number"
                  value={estimateInput}
                  id="AdminQuotationsPage-field-1"
                  onChange={(e) => setEstimateInput(Number(e.target.value))}
                  placeholder="449"
                  className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-white mb-1"
                  htmlFor="AdminQuotationsPage-field-2"
                >
                  Internal Admin Notes
                </label>
                <textarea
                  rows={3}
                  value={notesInput}
                  id="AdminQuotationsPage-field-2"
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Requires custom Google Calendar integration; 7-day turnaround agreed."
                  className="w-full rounded-xl border border-border bg-secondary p-3 text-xs text-white focus:outline-none focus:border-primary resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  data-dialog-close
                  aria-label="Close"
                  onClick={() => setEditingQuote(null)}
                  className="rounded-full border border-border bg-card px-5 py-2 text-xs font-semibold text-muted-foreground hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="glow-card rounded-full bg-primary px-6 py-2 text-xs font-semibold text-white shadow-glow hover:scale-105 transition-all disabled:opacity-50"
                >
                  {saveLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
