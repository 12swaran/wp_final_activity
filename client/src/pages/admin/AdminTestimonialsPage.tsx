import React, { useEffect, useState } from 'react';
import { Star, CheckCircle, XCircle, Trash2, ShieldCheck, Clock } from 'lucide-react';
import { Testimonial } from '../../types';
import { testimonialsApi } from '../../services/api';

export const AdminTestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = () => {
    setLoading(true);
    testimonialsApi
      .getAllAdmin()
      .then((data) => setTestimonials(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (id: string, isApproved: boolean) => {
    try {
      await testimonialsApi.toggleApprove(id, { isApproved });
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFeature = async (id: string, isFeatured: boolean) => {
    try {
      await testimonialsApi.toggleApprove(id, { isFeatured });
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this review?')) {
      try {
        await testimonialsApi.delete(id);
        fetchReviews();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Client Reviews Moderation</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review, approve, or feature client testimonials submitted from the public reviews page.
        </p>
      </div>

      {/* Testimonials Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-muted-foreground animate-pulse">
            Loading testimonials...
          </div>
        ) : testimonials.length === 0 ? (
          <div className="py-20 text-center text-xs text-muted-foreground">
            No testimonials recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/60 text-white font-semibold uppercase tracking-wider text-[11px] border-b border-border">
                <tr>
                  <th className="py-3.5 px-5">Client &amp; Company</th>
                  <th className="py-3.5 px-5">Rating</th>
                  <th className="py-3.5 px-5">Review Feedback</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Featured</th>
                  <th className="py-3.5 px-5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {testimonials.map((t) => (
                  <tr key={t._id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-5">
                      <p className="font-bold text-white">{t.clientName}</p>
                      <p className="text-[11px] text-muted-foreground">{t.company} • {t.role}</p>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(t.rating || 5)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-muted-foreground max-w-sm italic">
                      "{t.reviewText}"
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          t.isApproved
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {t.isApproved ? 'Approved' : 'Pending Review'}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <button
                        onClick={() => handleFeature(t._id, !t.isFeatured)}
                        className={`text-[11px] px-2 py-0.5 rounded-lg border transition-colors ${
                          t.isFeatured
                            ? 'bg-primary/20 border-primary text-primary font-bold'
                            : 'bg-secondary border-border text-muted-foreground hover:text-white'
                        }`}
                      >
                        {t.isFeatured ? '★ Featured' : 'Standard'}
                      </button>
                    </td>
                    <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                      {!t.isApproved ? (
                        <button
                          onClick={() => handleApprove(t._id, true)}
                          className="rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white px-2.5 py-1 text-[11px] font-semibold transition-colors"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApprove(t._id, false)}
                          className="rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white px-2.5 py-1 text-[11px] font-semibold transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(t._id)}
                        className="rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white p-1.5 transition-colors"
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
    </div>
  );
};
