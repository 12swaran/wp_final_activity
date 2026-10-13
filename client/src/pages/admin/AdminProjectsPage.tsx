import { Field as ListSearch, Pagination as ListPages } from '../../components/common/Forms';
import { api } from '../../services/api';
import { UploadField } from '../../components/common/Forms';
import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, ExternalLink, Image } from 'lucide-react';
import { Project } from '../../types';
import { projectsApi } from '../../services/api';

export const AdminProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [listPage, setListPage] = useState(1),
    [listPages, setListPages] = useState(1),
    [listSearch, setListSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [clientName, setClientName] = useState('');
  const [resultStat, setResultStat] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [technologiesText, setTechnologiesText] = useState('');
  const [caseStudyMarkdown, setCaseStudyMarkdown] = useState('');
  const [isFeatured, setIsFeatured] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = () => {
    setLoading(true);
    api
      .get('/projects', { params: { page: listPage, limit: 20, search: listSearch } })
      .then((res) => {
        setProjects(res.data.data || []);
        setListPages(res.data.meta?.totalPages || 1);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    fetchProjects();
  }, [listPage, listSearch]);

  const openCreate = () => {
    setEditingId(null);
    setGallery([]);
    setTitle('');
    setCategory('Coffee Shop & Bakery');
    setClientName('');
    setResultStat('Online orders up 40%');
    setFeaturedImage(
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    );
    setLiveUrl('');
    setGithubUrl('');
    setTechnologiesText('React, TypeScript, Tailwind CSS');
    setCaseStudyMarkdown('### The Challenge\n...\n\n### The Solution\n...\n\n### The Outcome\n...');
    setIsFeatured(true);
    setModalOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditingId(p._id);
    setGallery(p.galleryImages || []);
    setTitle(p.title);
    setCategory(p.category);
    setClientName(p.clientName);
    setResultStat(p.resultStat || '');
    setFeaturedImage(p.featuredImage);
    setLiveUrl(p.liveUrl || '');
    setGithubUrl(p.githubUrl || '');
    setTechnologiesText(p.technologies ? p.technologies.join(', ') : '');
    setCaseStudyMarkdown(p.caseStudyMarkdown || '');
    setIsFeatured(p.isFeatured);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category.trim() || !featuredImage.trim()) return;

    setSubmitting(true);
    const technologies = technologiesText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      category: category.trim(),
      clientName: clientName.trim() || 'Client',
      resultStat: resultStat.trim(),
      featuredImage: featuredImage.trim(),
      galleryImages: gallery,
      liveUrl: liveUrl.trim(),
      githubUrl: githubUrl.trim(),
      technologies,
      caseStudyMarkdown: caseStudyMarkdown.trim(),
      isFeatured,
    };

    try {
      if (editingId) {
        await projectsApi.update(editingId, payload);
      } else {
        await projectsApi.create(payload);
      }
      setModalOpen(false);
      fetchProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this project?')) {
      try {
        await projectsApi.delete(id);
        fetchProjects();
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
          <h1 className="text-2xl font-bold text-white">Portfolio &amp; Case Studies</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage project case studies, client statistics, live demos, and cover images.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="glow-card inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-glow hover:scale-105 transition-all"
        >
          <Plus className="h-4 w-4" /> Add Case Study
        </button>
      </div>

      {/* Projects Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-muted-foreground animate-pulse">
            Loading projects...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/60 text-white font-semibold uppercase tracking-wider text-[11px] border-b border-border">
                <tr>
                  <th className="py-3.5 px-5">Project Title</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Client</th>
                  <th className="py-3.5 px-5">Result Metric</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects.map((p) => (
                  <tr key={p._id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.featuredImage}
                          alt={p.title}
                          className="h-10 w-14 rounded-lg object-cover bg-secondary"
                        />
                        <div>
                          <p className="font-bold text-white">{p.title}</p>
                          {p.liveUrl && (
                            <a
                              href={p.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                            >
                              {p.liveUrl} <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-muted-foreground">{p.category}</td>
                    <td className="py-4 px-5 font-medium text-white">{p.clientName}</td>
                    <td className="py-4 px-5 text-emerald-400 font-semibold">
                      {p.resultStat || '—'}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${p.isFeatured ? 'bg-emerald-500/10 text-emerald-400' : 'bg-secondary text-muted-foreground'}`}
                      >
                        {p.isFeatured ? 'Featured' : 'Standard'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-lg bg-primary/20 hover:bg-primary text-primary hover:text-white p-2 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
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

      {/* Project Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit record"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto"
        >
          <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xl relative my-8">
            <button
              data-dialog-close
              aria-label="Close"
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-muted-foreground hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">
              {editingId ? 'Edit Project Case Study' : 'Create New Case Study'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <UploadField
                label="Upload featured project image"
                onUploaded={(file) => setFeaturedImage(file.url)}
              />
              <UploadField
                label="Upload gallery screenshot"
                onUploaded={(file) => setGallery((previous) => [...previous, file.url])}
              />
              {gallery.map((url, index) => (
                <div key={url} className="flex gap-3">
                  <img
                    src={url}
                    alt={`Gallery screenshot ${index + 1}`}
                    className="h-16 w-24 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setGallery((previous) => previous.filter((_, i) => i !== index))}
                  >
                    Remove screenshot
                  </button>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-medium text-white mb-1"
                    htmlFor="AdminProjectsPage-field-0"
                  >
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    id="AdminProjectsPage-field-0"
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Bean & Bloom"
                    className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium text-white mb-1"
                    htmlFor="AdminProjectsPage-field-1"
                  >
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={category}
                    id="AdminProjectsPage-field-1"
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Coffee Shop & Bakery"
                    className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-medium text-white mb-1"
                    htmlFor="AdminProjectsPage-field-2"
                  >
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    id="AdminProjectsPage-field-2"
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Bean & Bloom Roasters"
                    className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium text-white mb-1"
                    htmlFor="AdminProjectsPage-field-3"
                  >
                    Key Outcome Metric
                  </label>
                  <input
                    type="text"
                    value={resultStat}
                    id="AdminProjectsPage-field-3"
                    onChange={(e) => setResultStat(e.target.value)}
                    placeholder="Online orders up 40%"
                    className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-white mb-1"
                  htmlFor="AdminProjectsPage-field-4"
                >
                  Cover Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={featuredImage}
                  id="AdminProjectsPage-field-4"
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-medium text-white mb-1"
                    htmlFor="AdminProjectsPage-field-5"
                  >
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={liveUrl}
                    id="AdminProjectsPage-field-5"
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium text-white mb-1"
                    htmlFor="AdminProjectsPage-field-6"
                  >
                    GitHub / Code URL
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    id="AdminProjectsPage-field-6"
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-white mb-1"
                  htmlFor="AdminProjectsPage-field-7"
                >
                  Technologies (comma separated)
                </label>
                <input
                  type="text"
                  value={technologiesText}
                  id="AdminProjectsPage-field-7"
                  onChange={(e) => setTechnologiesText(e.target.value)}
                  placeholder="React, TypeScript, Tailwind CSS, Stripe"
                  className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-white mb-1"
                  htmlFor="AdminProjectsPage-field-8"
                >
                  Case Study Content (Markdown)
                </label>
                <textarea
                  rows={4}
                  value={caseStudyMarkdown}
                  id="AdminProjectsPage-field-8"
                  onChange={(e) => setCaseStudyMarkdown(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary p-3 text-xs text-white focus:outline-none focus:border-primary resize-none font-mono"
                ></textarea>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="accent-primary h-4 w-4 rounded"
                  />
                  <span>Feature on Home Page showcase</span>
                </label>
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
                  {submitting ? 'Saving...' : editingId ? 'Update Case Study' : 'Publish Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
