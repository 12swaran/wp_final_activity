import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Globe,
  Smartphone,
  Zap,
  Search,
  Code,
  Rocket,
  Star,
  ChevronDown,
  Mail,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Service, Project, PricingPlan, FAQ, Testimonial } from '../../types';
import { servicesApi, projectsApi, pricingApi, faqApi, testimonialsApi } from '../../services/api';

const iconMap: Record<string, React.ReactNode> = {
  Globe: <Globe className="h-6 w-6" />,
  Smartphone: <Smartphone className="h-6 w-6" />,
  Zap: <Zap className="h-6 w-6" />,
  Search: <Search className="h-6 w-6" />,
  Code: <Code className="h-6 w-6" />,
  Rocket: <Rocket className="h-6 w-6" />,
};

export const HomePage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pricing, setPricing] = useState<PricingPlan[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servData, projData, priceData, faqData, testData] = await Promise.all([
          servicesApi.getAll().catch(() => []),
          projectsApi.getAll({ limit: 3 }).then((res) => res.data).catch(() => []),
          pricingApi.getAll().catch(() => []),
          faqApi.getActive().catch(() => []),
          testimonialsApi.getApproved().catch(() => []),
        ]);

        setServices(servData || []);
        setProjects(projData || []);
        setPricing(priceData || []);
        setFaqs(faqData || []);
        setTestimonials(testData || []);
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="relative overflow-hidden">
      {/* ======================================================== */}
      {/* 1. HERO SECTION                                          */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32">
        <div className="hero-grid absolute inset-0 pointer-events-none"></div>

        <div className="relative mx-auto max-w-6xl px-6 text-center">
          {/* Top Pill Badge */}
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            Freelance Web Designer &amp; Developer
          </div>

          {/* Main Headline */}
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight md:text-6xl tracking-tight text-white">
            A beautiful website for your business,{' '}
            <span className="text-gradient">without the big price tag</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg leading-relaxed">
            I build simple, fast, modern websites for small businesses and startups — live in days, not months.
          </p>

          {/* Call to Action Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/pricing"
              className="glow-card inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-semibold text-white shadow-glow transition-transform hover:scale-105 active:scale-95"
            >
              See Pricing <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-8 py-3.5 font-semibold text-white transition-colors hover:bg-secondary active:scale-95"
            >
              View My Work
            </Link>
          </div>

          {/* 3 Metric Summary Cards */}
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-border/40 pt-10">
            <div>
              <div className="font-display text-2xl font-bold text-primary md:text-3xl">25+</div>
              <div className="mt-1 text-xs text-muted-foreground md:text-sm">Websites delivered</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-primary md:text-3xl">5–7 days</div>
              <div className="mt-1 text-xs text-muted-foreground md:text-sm">Average delivery</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-primary md:text-3xl">100%</div>
              <div className="mt-1 text-xs text-muted-foreground md:text-sm">Happy clients</div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. SERVICES SECTION                                      */}
      {/* ======================================================== */}
      <section id="services" className="border-t border-border py-20 md:py-28 bg-card/20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="text-sm font-medium tracking-widest text-primary uppercase">What I do</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl text-white">
              Everything your business needs to shine online
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service._id}
                to={`/services/${service.slug}`}
                className="group rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-card block"
              >
                <div className="mb-4 inline-flex rounded-xl bg-secondary p-3 text-primary group-hover:bg-primary/20 transition-colors">
                  {iconMap[service.icon] || <Globe className="h-6 w-6" />}
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors flex items-center justify-between">
                  {service.title}
                  <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {service.shortDescription}
                </p>
                {service.startingPrice > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/50 text-xs font-medium text-primary">
                    Starting from ${service.startingPrice}
                  </div>
                )}
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-light transition-colors"
            >
              Explore detailed service specifications and deliverables <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. RECENT WORK / PORTFOLIO SECTION                       */}
      {/* ======================================================== */}
      <section id="work" className="border-t border-border py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="text-sm font-medium tracking-widest text-primary uppercase">Recent work</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl text-white">Websites that get real results</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project._id}
                to={`/portfolio/${project.slug}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-card flex flex-col"
              >
                <div className="overflow-hidden aspect-video bg-secondary">
                  <img
                    src={project.featuredImage}
                    alt={project.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-medium tracking-wide text-primary uppercase">{project.category}</p>
                    <h3 className="mt-1 text-lg font-semibold text-white group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-sm font-medium text-emerald-400">
                      {project.resultStat}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-border/50">
                    {project.technologies.slice(0, 3).map((tech, idx) => (
                      <span key={idx} className="rounded-md bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-white hover:bg-secondary transition-colors"
            >
              View All Case Studies &amp; Projects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. PRICING PACKAGES SECTION                              */}
      {/* ======================================================== */}
      <section id="pricing" className="border-t border-border py-20 md:py-28 bg-card/10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="text-sm font-medium tracking-widest text-primary uppercase">Pricing</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl text-white">Simple, honest pricing</h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              One-time payment. No hidden fees. You own your website forever.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 items-stretch">
            {pricing.map((plan) => {
              const isPopular = plan.isPopular;
              return (
                <div
                  key={plan._id}
                  className={`relative flex flex-col justify-between rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 ${
                    isPopular
                      ? 'glow-card border-primary/60 bg-card shadow-glow-lg'
                      : 'border-border bg-card'
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-white shadow-md">
                      {plan.badge || 'MOST POPULAR'}
                    </span>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                    <div className="mt-6 font-display text-4xl font-bold text-white">
                      ${plan.price}
                      <span className="ml-1 text-sm font-normal text-muted-foreground">
                        {plan.billingCycle}
                      </span>
                    </div>

                    <ul className="mt-8 space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-4">
                    <Link
                      to={`/quote?package=${encodeURIComponent(plan.name)}`}
                      className={`block w-full rounded-full py-3 text-center text-sm font-semibold transition-transform hover:scale-105 active:scale-95 ${
                        isPopular
                          ? 'bg-primary text-white shadow-glow'
                          : 'border border-border bg-secondary text-white hover:bg-muted'
                      }`}
                    >
                      {plan.ctaText || 'Get Started'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/pricing"
              className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
            >
              View detailed side-by-side feature comparison table &amp; custom project calculator →
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. PROCESS WORKFLOW SECTION                              */}
      {/* ======================================================== */}
      <section id="process" className="border-t border-border py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="text-sm font-medium tracking-widest text-primary uppercase">How it works</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl text-white">From idea to launch in 3 steps</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="font-display text-4xl font-bold text-primary/40">01</div>
              <h3 className="mt-4 text-lg font-semibold text-white">Tell me about your business</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                A quick discovery chat about what you do, who your ideal customers are, and what goals your website needs to achieve.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="font-display text-4xl font-bold text-primary/40">02</div>
              <h3 className="mt-4 text-lg font-semibold text-white">I design &amp; build</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                You get an interactive live staging preview within 3 to 5 days, and we refine the copy, layout, and styling together.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="font-display text-4xl font-bold text-primary/40">03</div>
              <h3 className="mt-4 text-lg font-semibold text-white">Launch &amp; grow</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Your site goes live with secure SSL, fast DNS routing, and Google indexing. Plus free ongoing support to ensure peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. TESTIMONIALS & REVIEWS SECTION                        */}
      {/* ======================================================== */}
      {testimonials.length > 0 && (
        <section className="border-t border-border py-20 md:py-28 bg-card/20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-14 text-center">
              <p className="text-sm font-medium tracking-widest text-primary uppercase">Social Proof</p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl text-white">Trusted by business owners</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.slice(0, 3).map((item) => (
                <div key={item._id} className="rounded-2xl border border-border bg-card p-7 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-amber-400 mb-3">
                      {[...Array(item.rating || 5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm italic text-muted-foreground leading-relaxed">
                      "{item.reviewText}"
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-3 pt-4 border-t border-border/50">
                    {item.avatarUrl ? (
                      <img src={item.avatarUrl} alt={item.clientName} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">
                        {item.clientName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-semibold text-white">{item.clientName}</h4>
                      <p className="text-xs text-muted-foreground">{item.company} • {item.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link to="/reviews" className="text-sm font-medium text-primary hover:underline">
                Read all verified client feedback or submit your review →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 7. FREQUENTLY ASKED QUESTIONS SECTION                    */}
      {/* ======================================================== */}
      {faqs.length > 0 && (
        <section className="border-t border-border py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-6">
            <div className="mb-14 text-center">
              <p className="text-sm font-medium tracking-widest text-primary uppercase">FAQs</p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl text-white">Frequently asked questions</h2>
            </div>

            <div className="space-y-4">
              {faqs.slice(0, 5).map((faq, idx) => (
                <div
                  key={faq._id}
                  className="rounded-2xl border border-border bg-card overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-6 text-left font-semibold text-white hover:text-primary transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                        openFaqIndex === idx ? 'rotate-180 text-primary' : ''
                      }`}
                    />
                  </button>
                  {openFaqIndex === idx && (
                    <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link to="/faqs" className="text-xs text-muted-foreground hover:text-primary underline">
                Browse all FAQs categorized by process, pricing, and technical setup →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 8. CALL TO ACTION BANNER                                 */}
      {/* ======================================================== */}
      <section id="contact" className="border-t border-border py-20 md:py-28 bg-gradient-to-b from-card/30 to-background">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold md:text-5xl text-white">
            Ready to get your business <span className="text-gradient">online?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-muted-foreground leading-relaxed">
            Tell me about your project and I'll get back to you within 24 hours with a free quote and timeline.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/quote"
              className="glow-card inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-semibold text-white shadow-glow transition-transform hover:scale-105 active:scale-95"
            >
              <Sparkles className="h-4 w-4" /> Request a Free Quote
            </Link>
            <Link
              to="/book"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-8 py-3.5 font-semibold text-white transition-colors hover:bg-secondary active:scale-95"
            >
              <Calendar className="h-4 w-4 text-primary" /> Book 30-Min Discovery Call
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
