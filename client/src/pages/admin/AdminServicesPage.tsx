import { Field as ListSearch, Pagination as ListPages } from '../../components/common/Forms';
import { api } from '../../services/api';
import { Field } from '../../components/common/Forms';
import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Globe,
  Smartphone,
  Zap,
  Search,
  Code,
  Rocket,
} from 'lucide-react';
import { Service } from '../../types';
import { servicesApi } from '../../services/api';

export const AdminServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [listPage, setListPage] = useState(1),
    [listPages, setListPages] = useState(1),
    [listSearch, setListSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [icon, setIcon] = useState('Globe');
  const [deliverablesText, setDeliverablesText] = useState('');
  const [startingPrice, setStartingPrice] = useState<number>(199);
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(true);
  const [orderIndex, setOrderIndex] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const availableIcons = ['Globe', 'Smartphone', 'Zap', 'Search', 'Code', 'Rocket'];

  const fetchServices = () => {
    setLoading(true);
    api
      .get('/services/admin/all', { params: { page: listPage, limit: 20, search: listSearch } })
      .then((res) => {
        setServices(res.data.data || []);
        setListPages(res.data.meta?.totalPages || 1);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    fetchServices();
  }, [listPage, listSearch]);

  const openCreate = () => {
    setEditingId(null);
    setIsPublished(true);
    setTitle('');
    setShortDescription('');
    setFullDescription('');
    setIcon('Globe');
    setDeliverablesText('');
    setStartingPrice(199);
    setIsFeatured(true);
    setOrderIndex(services.length + 1);
    setModalOpen(true);
  };

  const openEdit = (serv: Service) => {
    setEditingId(serv._id);
    setIsPublished(serv.isPublished !== false);
    setTitle(serv.title);
    setShortDescription(serv.shortDescription);
    setFullDescription(serv.fullDescription || '');
    setIcon(serv.icon || 'Globe');
    setDeliverablesText(serv.deliverables ? serv.deliverables.join('\n') : '');
    setStartingPrice(serv.startingPrice);
    setIsFeatured(serv.isFeatured);
    setOrderIndex(serv.orderIndex || 0);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !shortDescription.trim()) return;

    setSubmitting(true);
    const deliverables = deliverablesText
      .split('\n')
      .map((d) => d.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim(),
      icon,
      deliverables,
      startingPrice: Number(startingPrice),
      isFeatured,
      isPublished,
      orderIndex: Number(orderIndex),
    };

    try {
      if (editingId) {
        await servicesApi.update(editingId, payload);
      } else {
        await servicesApi.create(payload);
      }
      setModalOpen(false);
      fetchServices();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this service?')) {
      try {
        await servicesApi.delete(id);
        fetchServices();
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
          <h1 className="text-2xl font-bold text-white">Services Management</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure offerings, deliverables checklists, and starting prices.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="glow-card inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-glow hover:scale-105 transition-all"
        >
          <Plus className="h-4 w-4" /> Add New Service
        </button>
      </div>

      {/* Services Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-muted-foreground animate-pulse">
            Loading services...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/60 text-white font-semibold uppercase tracking-wider text-[11px] border-b border-border">
                <tr>
                  <th className="py-3.5 px-5">Order</th>
                  <th className="py-3.5 px-5">Title &amp; Icon</th>
                  <th className="py-3.5 px-5">Short Description</th>
                  <th className="py-3.5 px-5">Starting Price</th>
                  <th className="py-3.5 px-5">Featured</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {services.map((serv) => (
                  <tr key={serv._id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-5 font-mono text-muted-foreground font-semibold">
                      {serv.orderIndex}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <span className="p-1.5 rounded-lg bg-secondary text-primary font-bold text-xs">
                          {serv.icon}
                        </span>
                        <span className="font-bold text-white">{serv.title}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-muted-foreground max-w-sm truncate">
                      {serv.shortDescription}
                    </td>
                    <td className="py-4 px-5 font-bold font-display text-white">
                      ${serv.startingPrice}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          serv.isFeatured
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {serv.isFeatured ? 'Featured' : 'Standard'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openEdit(serv)}
                        className="rounded-lg bg-primary/20 hover:bg-primary text-primary hover:text-white p-2 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(serv._id)}
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

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit record"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto"
        >
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xl relative my-8">
            <button
              data-dialog-close
              aria-label="Close"
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-muted-foreground hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">
              {editingId ? 'Edit Service' : 'Create New Service'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="flex gap-2">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />{' '}
                Published on the public website
              </label>
              <div>
                <label
                  htmlFor="AdminServicesPage-associated-0"
                  className="block text-xs font-medium text-white mb-1"
                >
                  Service Title *
                </label>
                <input
                  id="AdminServicesPage-associated-0"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Business Websites"
                  className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-medium text-white mb-1"
                    htmlFor="AdminServicesPage-field-0"
                  >
                    Icon
                  </label>
                  <select
                    value={icon}
                    id="AdminServicesPage-field-0"
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  >
                    {availableIcons.map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-xs font-medium text-white mb-1"
                    htmlFor="AdminServicesPage-field-1"
                  >
                    Starting Price ($)
                  </label>
                  <input
                    type="number"
                    value={startingPrice}
                    id="AdminServicesPage-field-1"
                    onChange={(e) => setStartingPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-white mb-1"
                  htmlFor="AdminServicesPage-field-2"
                >
                  Short Description *
                </label>
                <input
                  type="text"
                  required
                  value={shortDescription}
                  id="AdminServicesPage-field-2"
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="A clean, professional site that tells your story..."
                  className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-white mb-1"
                  htmlFor="AdminServicesPage-field-3"
                >
                  Deliverables (One per line)
                </label>
                <textarea
                  rows={4}
                  value={deliverablesText}
                  id="AdminServicesPage-field-3"
                  onChange={(e) => setDeliverablesText(e.target.value)}
                  placeholder="Custom multi-page UI architecture&#10;Mobile-responsive on all screen sizes&#10;Google Analytics setup"
                  className="w-full rounded-xl border border-border bg-secondary p-3 text-xs text-white focus:outline-none focus:border-primary resize-none font-mono"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-medium text-white mb-1"
                    htmlFor="AdminServicesPage-field-4"
                  >
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={orderIndex}
                    id="AdminServicesPage-field-4"
                    onChange={(e) => setOrderIndex(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-mono"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="accent-primary h-4 w-4 rounded"
                    />
                    <span>Featured on Home Page</span>
                  </label>
                </div>
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
                  {submitting ? 'Saving...' : editingId ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
