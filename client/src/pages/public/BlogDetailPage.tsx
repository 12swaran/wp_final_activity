import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, User, Tag, ArrowRight } from 'lucide-react';
import { BlogPost } from '../../types';
import { blogApi } from '../../services/api';

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      blogApi
        .getBySlug(slug)
        .then((data) => setPost(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-40 pb-24 text-center">
        <p className="text-muted-foreground animate-pulse">Loading article...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-40 pb-24 text-center">
        <h1 className="text-2xl font-bold text-white">Article Not Found</h1>
        <p className="mt-2 text-muted-foreground">The requested article could not be found.</p>
        <Link to="/blog" className="mt-4 inline-block text-primary hover:underline">
          ← Back to all articles
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24">
      <div className="mx-auto max-w-3xl px-6">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Articles
        </Link>

        {/* Article Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Recent'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readTimeMinutes} min read
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {post.author}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            {post.title}
          </h1>

          <p className="text-base text-muted-foreground leading-relaxed italic border-l-2 border-primary/50 pl-4 py-1">
            {post.summary}
          </p>

          {post.coverImage && (
            <div className="rounded-2xl overflow-hidden border border-border aspect-video bg-secondary my-6">
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mt-8 space-y-6 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap border-b border-border pb-12">
          {post.content}
        </div>

        {/* Tags */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" /> Tags:
          </span>
          {post.tags.map((tag, i) => (
            <Link
              key={i}
              to={`/blog?tag=${encodeURIComponent(tag)}`}
              className="rounded-lg bg-secondary px-2.5 py-1 text-xs text-muted-foreground hover:text-white"
            >
              #{tag}
            </Link>
          ))}
        </div>

        {/* Author / CTA Card */}
        <div className="mt-12 rounded-2xl border border-border bg-card p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-base font-bold text-white">Have questions about your own website?</h3>
            <p className="text-xs text-muted-foreground mt-1">Get free advice on your website design or conversion rate.</p>
          </div>
          <Link
            to="/quote"
            className="glow-card shrink-0 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-white shadow-glow hover:scale-105 transition-all"
          >
            Start a Project
          </Link>
        </div>
      </div>
    </div>
  );
};
