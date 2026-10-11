import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { PricingPlan } from '../../types';
import { pricingApi } from '../../services/api';

export const AdminPricingPage: React.FC = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(199);
  const [billingCycle, setBillingCycle] = useState('one-time');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [featuresText, setFeaturesText] = useState('');
  const [ctaText, setCtaText] = useState('Get Started');
  const [orderIndex, setOrderIndex] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchPlans = () => {
    setLoading(true);
    pricingApi
      .getAllAdmin()
      .then((data) => setPlans(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setPrice(199);
    setBillingCycle('one-time');
    setDescription('');
    setBadge('');
    setIsPopular(false);
    setFeaturesText('');
    setCtaText('Get Started');
    setOrderIndex(plans.length + 1);
    setModalOpen(true);
  };

  const openEdit = (plan: PricingPlan) => {
    setEditingId(plan._id);
    setName(plan.name);
    setPrice(plan.price);
    setBillingCycle(plan.billingCycle);
    setDescription(plan.description);
    setBadge(plan.badge || '');
    setIsPopular(plan.isPopular);
    setFeaturesText(plan.features ? plan.features.join('\n') : '');
    setCtaText(plan.ctaText || 'Get Started');
    setOrderIndex(plan.orderIndex || 0);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    setSubmitting(true);
    const features = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      name: name.trim(),
      price: Number(price),
      billingCycle: billingCycle.trim(),
      description: description.trim(),
      badge: badge.trim(),
      isPopular,
      features,
      ctaText: ctaText.trim(),
      orderIndex: Number(orderIndex),
    };

    try {
      if (editingId) {
        await pricingApi.update(editingId, payload);
      } else {
        await pricingApi.create(payload);
      }
      setModalOpen(false);
      fetchPlans();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this pricing plan?')) {
      try {
        await pricingApi.delete(id);
        fetchPlans();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Pricing Packages</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage tiers, featured badges, price points, and included checklist features.</p>
        </div>
        <button
          onClick={openCreate}
          className="glow-card inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-glow hover:scale-105 transition-all"
        >
          <Plus className="h-4 w-4" /> Add Pricing Tier
        </button>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {loading ? (
          <div className="col-span-3 py-20 text-center text-xs text-muted-foreground animate-pulse">
            Loading pricing tiers...
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan._id}
              className={`rounded-2xl border bg-card p-6 flex flex-col justify-between ${
                plan.isPopular ? 'border-primary/60 shadow-glow' : 'border-border'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  {plan.badge && (
                    <span className="rounded-full bg-primary/20 text-primary px-2.5 py-0.5 text-[10px] font-bold">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{plan.description}</p>
                <div className="mt-4 font-display text-3xl font-bold text-white">
                  ${plan.price}
                  <span className="text-xs text-muted-foreground font-normal ml-1">{plan.billingCycle}</span>
                </div>

                <ul className="mt-6 space-y-2 text-xs">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Order: #{plan.orderIndex}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => openEdit(plan)}
                    className="p-1.5 rounded-lg bg-secondary hover:bg-muted text-white text-xs"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan._id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Plan Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xl relative my-8">
            <button onClick={() => setModalOpen(false)} className="absolute top-5 right-5 text-muted-foreground hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">
              {editingId ? 'Edit Pricing Plan' : 'Add Pricing Plan'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white mb-1">Plan Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Business"
                    className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white mb-1">Price ($) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Most popular for small businesses..."
                  className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="MOST POPULAR"
                    className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white mb-1">Button CTA Text</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Get Started"
                    className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1">Features (One per line)</label>
                <textarea
                  rows={5}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="Up to 5 pages&#10;Custom design for your brand&#10;Contact & booking forms&#10;Delivered in 7 days"
                  className="w-full rounded-xl border border-border bg-secondary p-3 text-xs text-white focus:outline-none focus:border-primary resize-none font-mono"
                ></textarea>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="accent-primary h-4 w-4 rounded"
                  />
                  <span>Highlight as "Most Popular" Tier</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
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
                  {submitting ? 'Saving...' : editingId ? 'Update Tier' : 'Create Tier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
