"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  Quote,
  Globe,
  ExternalLink,
  MessageCircle,
} from "lucide-react";

// ================================================================
// DATA
// ================================================================

const NAV_LINKS = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

const SERVICES = [
  {
    number: "01",
    title: "Architecture Design",
    description:
      "From concept to completion, we design buildings that are structurally sound, aesthetically compelling, and deeply connected to their context.",
    image:
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80",
  },
  {
    number: "02",
    title: "Interior Design",
    description:
      "We craft interior spaces that balance form and function — selecting materials, furnishings, and finishes that elevate everyday living.",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
  },
  {
    number: "03",
    title: "Space Planning",
    description:
      "Strategic layout design that maximizes flow, natural light, and usability — turning square footage into meaningful experience.",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
  },
  {
    number: "04",
    title: "Renovation & Restoration",
    description:
      "Breathing new life into existing structures while preserving their character — modern performance with timeless soul.",
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
  },
];

const PROJECTS = [
  {
    title: "The Meridian Residence",
    category: "Residential",
    year: "2024",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    size: "large",
  },
  {
    title: "Noma Gallery",
    category: "Commercial",
    year: "2024",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    size: "small",
  },
  {
    title: "Villa Serena",
    category: "Residential",
    year: "2023",
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    size: "small",
  },
  {
    title: "Harbor View Tower",
    category: "Commercial",
    year: "2023",
    image:
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
    size: "large",
  },
  {
    title: "Elara Boutique Hotel",
    category: "Hospitality",
    year: "2024",
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    size: "medium",
  },
  {
    title: "Oakwood Studio",
    category: "Residential",
    year: "2023",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    size: "medium",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Mitchell",
    role: "Homeowner",
    text: "Atelier transformed our vision into a home that exceeds every expectation. Their attention to detail and understanding of how we live made all the difference.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
  },
  {
    name: "James Chen",
    role: "CEO, Vertex Capital",
    text: "Our new headquarters reflects who we are — ambitious, precise, and forward-thinking. The team at Atelier delivered a workspace that inspires our entire team daily.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
  },
  {
    name: "Elena Vasquez",
    role: "Hotel Director, Elara Group",
    text: "The boutique hotel they designed for us consistently receives compliments from guests. It perfectly balances luxury with warmth — exactly what we wanted.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
  },
];

const TEAM = [
  {
    name: "Marcus Webb",
    role: "Founding Principal",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
  },
  {
    name: "Aisha Patel",
    role: "Design Director",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
  },
  {
    name: "Lukas Brandt",
    role: "Project Architect",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
  },
  {
    name: "Sophie Kim",
    role: "Interior Designer",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
  },
];

// ================================================================
// HEADER COMPONENT
// ================================================================

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = useCallback(
    (href: string) => {
      setMobileOpen(false);
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    },
    [],
  );

  return (
    <>
      <header
        className={`arch-header ${scrolled ? "arch-header-scrolled" : ""}`}
        role="banner"
      >
        <div className="arch-wrap flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="#hero" className="flex items-center gap-3 no-underline">
            <div className="w-10 h-10 bg-arch-accent flex items-center justify-center">
              <span className="text-white font-arch-display text-lg font-bold">A</span>
            </div>
            <div>
              <span className="text-arch-primary font-arch-display text-xl tracking-tight font-medium">
                Atelier
              </span>
              <span className="hidden sm:block text-[0.6rem] tracking-[0.25em] uppercase text-arch-muted font-semibold">
                Architecture & Design
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="text-[0.78rem] tracking-[0.1em] uppercase font-medium text-arch-muted hover:text-arch-primary transition-colors duration-300 bg-transparent border-none cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link href="#contact" className="arch-btn arch-btn-primary text-[0.7rem] py-2.5 px-6">
              Get a Quote
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden p-2 text-arch-primary bg-transparent border-none cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="fixed inset-0 z-90 bg-arch-cream lg:hidden">
          <div className="flex flex-col items-center justify-center h-full gap-8">
            <button
              className="absolute top-5 right-5 p-2 text-arch-primary bg-transparent border-none cursor-pointer"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={28} />
            </button>
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="text-2xl font-arch-display text-arch-primary bg-transparent border-none cursor-pointer"
              >
                {link.label}
              </button>
            ))}
            <Link
              href="#contact"
              className="arch-btn arch-btn-primary mt-4"
              onClick={() => setMobileOpen(false)}
            >
              Get a Quote
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

// ================================================================
// HERO SECTION
// ================================================================

function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center bg-arch-primary overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920&q=85"
          alt="Modern architectural interior with natural light"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      <div className="arch-wrap relative z-10 pt-24 pb-16">
        <div className="max-w-2xl">
          <p className="t-eyebrow arch-animate-up text-arch-accent mb-6">
            Award-Winning Studio
          </p>
          <h1 className="t-display text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl arch-animate-up arch-delay-1 mb-6">
            Designing
            <br />
            <span className="text-arch-accent italic font-arch-accent">spaces</span>
            <br />
            that inspire.
          </h1>
          <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-lg arch-animate-up arch-delay-2 mb-10">
            We are a boutique architecture and interior design studio creating
            thoughtful, enduring spaces for discerning clients worldwide.
          </p>
          <div className="flex flex-wrap gap-4 arch-animate-up arch-delay-3">
            <Link href="#projects" className="arch-btn arch-btn-primary">
              View Projects
              <ArrowRight size={16} />
            </Link>
            <Link href="#contact" className="arch-btn arch-btn-white">
              Book a Consultation
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 arch-animate-in arch-delay-5">
        <span className="text-[0.6rem] tracking-[0.3em] uppercase text-white/50 font-semibold">
          Scroll
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
      </div>
    </section>
  );
}

// ================================================================
// STATS STRIP
// ================================================================

function StatsStrip() {
  const stats = [
    { number: "250+", label: "Projects Completed" },
    { number: "18", label: "Years of Experience" },
    { number: "45", label: "Design Awards" },
    { number: "12", label: "Countries" },
  ];

  return (
    <section className="bg-white border-b border-arch-border">
      <div className="arch-wrap py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 arch-stagger">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="arch-stat-number">{stat.number}</p>
              <p className="text-xs tracking-[0.15em] uppercase text-arch-muted font-semibold mt-2">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ================================================================
// ABOUT SECTION
// ================================================================

function AboutSection() {
  return (
    <section id="about" className="arch-section bg-arch-cream">
      <div className="arch-wrap">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Images */}
          <div className="relative">
            <div className="arch-img-wrap aspect-[4/5] rounded-sm">
              <img
                src="https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&q=80"
                alt="Modern architectural interior design"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating accent image */}
            <div className="absolute -bottom-8 -right-4 md:-right-8 w-48 md:w-64 aspect-[3/4] arch-img-wrap rounded-sm border-4 border-arch-cream shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&q=80"
                alt="Architectural detail"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Experience badge */}
            <div className="absolute top-8 -left-4 md:-left-8 bg-arch-accent text-white px-6 py-4 text-center shadow-lg">
              <p className="font-arch-display text-3xl font-bold">18</p>
              <p className="text-[0.6rem] tracking-[0.2em] uppercase font-semibold">
                Years
              </p>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="t-eyebrow mb-4">About Us</p>
            <h2 className="t-display text-4xl md:text-5xl mb-6">
              We design spaces
              <br />
              <span className="text-arch-accent italic font-arch-accent">
                that tell stories.
              </span>
            </h2>
            <div className="arch-divider mb-8" />
            <p className="t-body text-base mb-6">
              Founded in 2006, Atelier is a multidisciplinary architecture and
              interior design studio based in New York. We believe great design
              emerges from a deep understanding of how people live, work, and
              interact with their environment.
            </p>
            <p className="t-body text-base mb-10">
              Our approach blends rigorous technical expertise with creative
              vision — every project is a dialogue between form, function, and
              the unique story our clients want their spaces to tell.
            </p>
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div>
                <p className="font-arch-display text-3xl text-arch-accent mb-1">
                  250+
                </p>
                <p className="text-sm text-arch-muted">Projects Delivered</p>
              </div>
              <div>
                <p className="font-arch-display text-3xl text-arch-accent mb-1">
                  45
                </p>
                <p className="text-sm text-arch-muted">Design Awards</p>
              </div>
            </div>
            <Link href="#projects" className="arch-btn arch-btn-outline">
              Our Portfolio
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ================================================================
// SERVICES SECTION
// ================================================================

function ServicesSection() {
  return (
    <section id="services" className="arch-section arch-section-dark">
      <div className="arch-wrap">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div className="max-w-xl">
            <p className="t-eyebrow mb-4">What We Do</p>
            <h2 className="t-display text-white text-4xl md:text-5xl">
              Comprehensive design
              <br />
              <span className="text-arch-accent italic font-arch-accent">
                services.
              </span>
            </h2>
          </div>
          <Link
            href="#contact"
            className="arch-btn arch-btn-primary shrink-0 self-start md:self-auto"
          >
            Start a Project
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-px bg-white/10">
          {SERVICES.map((service) => (
            <div
              key={service.number}
              className="group bg-arch-primary p-8 md:p-10 flex flex-col gap-6 hover:bg-arch-primary-light transition-colors duration-400"
            >
              <div className="flex items-start justify-between">
                <span className="text-arch-accent font-arch-display text-5xl font-light opacity-30 group-hover:opacity-100 transition-opacity duration-400">
                  {service.number}
                </span>
                <div className="w-12 h-12 overflow-hidden rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h3 className="t-display text-white text-2xl">{service.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {service.description}
              </p>
              <Link
                href="#contact"
                className="arch-btn arch-btn-ghost text-arch-accent self-start mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-400"
              >
                Learn More
                <ArrowUpRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ================================================================
// FEATURED PROJECTS SECTION
// ================================================================

function ProjectsSection() {
  return (
    <section id="projects" className="arch-section bg-white">
      <div className="arch-wrap">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div className="max-w-xl">
            <p className="t-eyebrow mb-4">Our Work</p>
            <h2 className="t-display text-4xl md:text-5xl">
              Selected
              <br />
              <span className="text-arch-accent italic font-arch-accent">
                projects.
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-arch-muted font-medium">
              Residential · Commercial · Hospitality
            </span>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 arch-stagger">
          {PROJECTS.map((project) => (
            <div
              key={project.title}
              className={`group relative overflow-hidden cursor-pointer ${
                project.size === "large"
                  ? "md:col-span-2 aspect-[16/9]"
                  : "aspect-[4/3]"
              }`}
            >
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                <p className="text-arch-accent text-[0.68rem] tracking-[0.2em] uppercase font-semibold mb-2">
                  {project.category} · {project.year}
                </p>
                <h3 className="t-display text-white text-2xl md:text-3xl">
                  {project.title}
                </h3>
              </div>
              {/* Corner arrow */}
              <div className="absolute top-6 right-6 w-10 h-10 border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                <ArrowUpRight size={18} className="text-white" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ================================================================
// TEAM SECTION
// ================================================================

function TeamSection() {
  return (
    <section className="arch-section bg-arch-cream">
      <div className="arch-wrap">
        <div className="text-center mb-14">
          <p className="t-eyebrow mb-4">Our Team</p>
          <h2 className="t-display text-4xl md:text-5xl">
            The people behind
            <br />
            <span className="text-arch-accent italic font-arch-accent">
              the vision.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 arch-stagger">
          {TEAM.map((member) => (
            <div key={member.name} className="group text-center">
              <div className="arch-img-wrap aspect-[3/4] rounded-sm mb-5 overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <h3 className="font-arch-display text-lg font-medium">
                {member.name}
              </h3>
              <p className="text-xs text-arch-muted tracking-[0.1em] uppercase mt-1">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ================================================================
// TESTIMONIALS SECTION
// ================================================================

function TestimonialsSection() {
  const [active, setActive] = useState(0);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  const prev = useCallback(() => {
    setActive(
      (prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length,
    );
  }, []);

  return (
    <section id="testimonials" className="arch-section arch-section-dark">
      <div className="arch-wrap">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div>
            <p className="t-eyebrow mb-4">Testimonials</p>
            <h2 className="t-display text-white text-4xl md:text-5xl mb-10">
              What our clients
              <br />
              <span className="text-arch-accent italic font-arch-accent">
                say about us.
              </span>
            </h2>

            <div className="relative">
              {TESTIMONIALS.map((testimonial, i) => (
                <div
                  key={testimonial.name}
                  className={`transition-all duration-500 ${
                    i === active
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 absolute inset-0 translate-x-4 pointer-events-none"
                  }`}
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <Star
                        key={j}
                        size={16}
                        className="text-arch-accent fill-arch-accent"
                      />
                    ))}
                  </div>

                  <Quote size={32} className="text-arch-accent/30 mb-4" />

                  <blockquote className="text-white/80 text-lg md:text-xl leading-relaxed mb-8 font-light">
                    &ldquo;{testimonial.text}&rdquo;
                  </blockquote>

                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-white font-medium text-sm">
                        {testimonial.name}
                      </p>
                      <p className="text-white/50 text-xs">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4 mt-10">
              <button
                onClick={prev}
                className="w-12 h-12 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-colors bg-transparent cursor-pointer"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={next}
                className="w-12 h-12 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-colors bg-transparent cursor-pointer"
                aria-label="Next testimonial"
              >
                <ChevronRight size={18} />
              </button>
              <span className="text-white/40 text-sm ml-2">
                {String(active + 1).padStart(2, "0")} / {String(TESTIMONIALS.length).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Image */}
          <div className="hidden lg:block">
            <div className="arch-img-wrap aspect-[3/4] rounded-sm">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"
                alt="Featured architectural project"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ================================================================
// CTA SECTION
// ================================================================

function CTASection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1920&q=80"
          alt="Luxury interior space"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="arch-wrap relative z-10 text-center">
        <p className="t-eyebrow text-arch-accent mb-4 arch-animate-up">
          Ready to Begin?
        </p>
        <h2 className="t-display text-white text-4xl md:text-5xl lg:text-6xl mb-6 arch-animate-up arch-delay-1">
          Let&apos;s create something
          <br />
          <span className="text-arch-accent italic font-arch-accent">
            extraordinary.
          </span>
        </h2>
        <p className="text-white/70 text-lg max-w-xl mx-auto mb-10 arch-animate-up arch-delay-2">
          Whether you&apos;re envisioning a new build, a renovation, or a complete
          interior transformation — we&apos;d love to hear your story.
        </p>
        <div className="flex flex-wrap justify-center gap-4 arch-animate-up arch-delay-3">
          <Link href="#contact" className="arch-btn arch-btn-primary">
            Schedule a Consultation
            <ArrowRight size={16} />
          </Link>
          <Link href="#projects" className="arch-btn arch-btn-white">
            View Our Work
          </Link>
        </div>
      </div>
    </section>
  );
}

// ================================================================
// CONTACT SECTION
// ================================================================

function ContactSection() {
  return (
    <section id="contact" className="arch-section bg-white">
      <div className="arch-wrap">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Info */}
          <div>
            <p className="t-eyebrow mb-4">Get in Touch</p>
            <h2 className="t-display text-4xl md:text-5xl mb-6">
              Start your
              <br />
              <span className="text-arch-accent italic font-arch-accent">
                project today.
              </span>
            </h2>
            <div className="arch-divider mb-8" />
            <p className="t-body text-base mb-10">
              We welcome inquiries from clients worldwide. Tell us about your
              project and we&apos;ll schedule an initial consultation to discuss
              your vision, timeline, and budget.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-arch-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={18} className="text-arch-accent" />
                </div>
                <div>
                  <p className="font-medium text-sm">Studio Location</p>
                  <p className="text-arch-muted text-sm mt-1">
                    425 Lexington Avenue, Suite 1200
                    <br />
                    New York, NY 10017
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-arch-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone size={18} className="text-arch-accent" />
                </div>
                <div>
                  <p className="font-medium text-sm">Phone</p>
                  <p className="text-arch-muted text-sm mt-1">+1 (212) 555-0147</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-arch-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail size={18} className="text-arch-accent" />
                </div>
                <div>
                  <p className="font-medium text-sm">Email</p>
                  <p className="text-arch-muted text-sm mt-1">
                    hello@atelier-studio.com
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-arch-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock size={18} className="text-arch-accent" />
                </div>
                <div>
                  <p className="font-medium text-sm">Working Hours</p>
                  <p className="text-arch-muted text-sm mt-1">
                    Mon – Fri: 9:00 AM – 6:00 PM
                    <br />
                    Sat: By Appointment
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-arch-surface-alt p-8 md:p-10 rounded-sm">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs tracking-[0.1em] uppercase text-arch-muted font-semibold mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="John Smith"
                    className="w-full bg-white border border-arch-border px-4 py-3 text-sm text-arch-primary outline-none focus:border-arch-accent focus:ring-2 focus:ring-arch-accent/10 transition-all"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs tracking-[0.1em] uppercase text-arch-muted font-semibold mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="w-full bg-white border border-arch-border px-4 py-3 text-sm text-arch-primary outline-none focus:border-arch-accent focus:ring-2 focus:ring-arch-accent/10 transition-all"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="project-type"
                  className="block text-xs tracking-[0.1em] uppercase text-arch-muted font-semibold mb-2"
                >
                  Project Type
                </label>
                <select
                  id="project-type"
                  className="w-full bg-white border border-arch-border px-4 py-3 text-sm text-arch-primary outline-none focus:border-arch-accent focus:ring-2 focus:ring-arch-accent/10 transition-all appearance-none cursor-pointer"
                >
                  <option>Residential</option>
                  <option>Commercial</option>
                  <option>Hospitality</option>
                  <option>Renovation</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-xs tracking-[0.1em] uppercase text-arch-muted font-semibold mb-2"
                >
                  Project Details
                </label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Tell us about your vision, timeline, and budget..."
                  className="w-full bg-white border border-arch-border px-4 py-3 text-sm text-arch-primary outline-none focus:border-arch-accent focus:ring-2 focus:ring-arch-accent/10 transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                className="arch-btn arch-btn-primary w-full justify-center"
              >
                Send Message
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// ================================================================
// FOOTER
// ================================================================

function Footer() {
  return (
    <footer className="bg-arch-primary text-white pt-16 pb-8">
      <div className="arch-wrap">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-arch-accent flex items-center justify-center">
                <span className="text-white font-arch-display text-lg font-bold">
                  A
                </span>
              </div>
              <span className="font-arch-display text-xl">Atelier</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Award-winning architecture and interior design studio creating
              spaces that inspire, function beautifully, and endure.
            </p>
            <div className="flex gap-3">
              {[Globe, ExternalLink, MessageCircle, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/50 transition-colors"
                  aria-label="Social media"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase font-semibold text-arch-accent mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {["About Us", "Services", "Projects", "Blog", "Contact"].map(
                (link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-white/60 text-sm hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase font-semibold text-arch-accent mb-6">
              Services
            </h4>
            <ul className="space-y-3">
              {[
                "Architecture Design",
                "Interior Design",
                "Space Planning",
                "Renovation",
                "Consultation",
              ].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-white/60 text-sm hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase font-semibold text-arch-accent mb-6">
              Newsletter
            </h4>
            <p className="text-white/60 text-sm mb-4">
              Stay updated with our latest projects and design insights.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex"
            >
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-white/10 border border-white/20 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-arch-accent transition-colors"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="bg-arch-accent text-white px-5 py-3 hover:bg-arch-accent-light transition-colors border-none cursor-pointer"
                aria-label="Subscribe"
              >
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs">
            © 2024 Atelier Architecture & Design. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Sitemap"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-white/40 text-xs hover:text-white/60 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ================================================================
// PAGE
// ================================================================

export default function ArchitecturePage() {
  return (
    <>
      <Header />
      <HeroSection />
      <StatsStrip />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
      <TeamSection />
      <TestimonialsSection />
      <CTASection />
      <ContactSection />
      <Footer />
    </>
  );
}
