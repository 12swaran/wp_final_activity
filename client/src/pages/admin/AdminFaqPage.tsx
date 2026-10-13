import { Field as ListSearch, Pagination as ListPages } from '../../components/common/Forms';
import { api } from '../../services/api';
import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { FAQ } from '../../types';
import { faqApi } from '../../services/api';

export const AdminFaqPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [listPage, setListPage] = useState(1),
    [listPages, setListPages] = useState(1),
    [listSearch, setListSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('General');
  const [orderIndex, setOrderIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const categories = ['General', 'Pricing', 'Process', 'Technical'];

  const fetchFaqs = () => {
    setLoading(true);
    api
      .get('/faqs/admin/all', { params: { page: listPage, limit: 20, search: listSearch } })
      .then((res) => {
        setFaqs(res.data.data || []);
        setListPages(res.data.meta?.totalPages || 1);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    fetchFaqs();
  }, [listPage, listSearch]);

  const openCreate = () => {
    setEditingId(null);
    setQuestion('');
    setAnswer('');
    setCategory('General');
    setOrderIndex(faqs.length + 1);
    setModalOpen(true);
  };

  const openEdit = (f: FAQ) => {
    setEditingId(f._id);
    setQuestion(f.question);
    setAnswer(f.answer);
    setCategory(f.category || 'General');
    setOrderIndex(f.orderIndex || 0);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    setSubmitting(true);
    const payload = {
      question: question.trim(),
      answer: answer.trim(),
      category: category.trim(),
      orderIndex: Number(orderIndex),
      isActive: true,
    };

    try {
      if (editingId) {
        await faqApi.update(editingId, payload);
      } else {
        await faqApi.create(payload);
      }
      setModalOpen(false);
      fetchFaqs();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this FAQ?')) {
      try {
        await faqApi.delete(id);
        fetchFaqs();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <ListSearch
        label="Search records"
        value={listSearch}
        onChange={(value) => {
          setListSearch(value);
          setListPage(1);
        }}
      />
      <ListPages page={listPage} totalPages={listPages} onChange={setListPage} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Frequently Asked Questions</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage public accordions, categorize queries, and update support answers.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="glow-card inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-glow hover:scale-105 transition-all"
        >
          <Plus className="h-4 w-4" /> Add FAQ
        </button>
      </div>

      {/* FAQs Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-muted-foreground animate-pulse">
            Loading FAQs...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/60 text-white font-semibold uppercase tracking-wider text-[11px] border-b border-border">
                <tr>
                  <th className="py-3.5 px-5">Order</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Question &amp; Answer</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {faqs.map((faq) => (
                  <tr key={faq._id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-5 font-mono text-muted-foreground font-semibold">
                      #{faq.orderIndex}
                    </td>
                    <td className="py-4 px-5">
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                        {faq.category}
                      </span>
                    </td>
                    <td className="py-4 px-5 max-w-md">
                      <p className="font-bold text-white">{faq.question}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                        {faq.answer}
                      </p>
                    </td>
                    <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openEdit(faq)}
                        className="rounded-lg bg-primary/20 hover:bg-primary text-primary hover:text-white p-2 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(faq._id)}
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

      {/* FAQ Modal */}
      {modalOpen && (
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
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-muted-foreground hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">
              {editingId ? 'Edit FAQ' : 'Add New FAQ'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-medium text-white mb-1"
                    htmlFor="AdminFaqPage-field-0"
                  >
                    Category
                  </label>
                  <select
                    value={category}
                    id="AdminFaqPage-field-0"
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-xs font-medium text-white mb-1"
                    htmlFor="AdminFaqPage-field-1"
                  >
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={orderIndex}
                    id="AdminFaqPage-field-1"
                    onChange={(e) => setOrderIndex(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-white mb-1"
                  htmlFor="AdminFaqPage-field-2"
                >
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={question}
                  id="AdminFaqPage-field-2"
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="How long does it take to launch?"
                  className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-white mb-1"
                  htmlFor="AdminFaqPage-field-3"
                >
                  Answer *
                </label>
                <textarea
                  rows={4}
                  required
                  value={answer}
                  id="AdminFaqPage-field-3"
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Our standard turnaround is 5 to 7 business days..."
                  className="w-full rounded-xl border border-border bg-secondary p-3 text-xs text-white focus:outline-none focus:border-primary resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  data-dialog-close
                  aria-label="Close"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-border bg-card px-5 py-2 text-xs font-semibold text-muted-foreground hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="glow-card rounded-full bg-primary px-6 py-2 text-xs font-semibold text-white shadow-glow hover:scale-105 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update FAQ' : 'Save FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
