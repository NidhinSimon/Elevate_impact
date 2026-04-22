"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Search, Globe, Heart, ArrowRight, Calendar, Users, Zap, ExternalLink, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { charityService, Charity } from "@/services/charityService";
import Link from "next/link";

const categories = ["All Stories", "Learning", "Well-Being", "Nature", "Youth"];

export default function CharityDirectory() {
  const [selectedCategory, setSelectedCategory] = useState("All Stories");
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    charityService.getCharities().then(data => {
      setCharities(data);
      setLoading(false);
    });
  }, []);

  const filteredCharities = selectedCategory === "All Stories"
    ? charities
    : charities.filter(c => c.category === selectedCategory);

  const featuredCharity = charities.find(c => c.featured) || charities[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-32 pb-20 px-6 max-w-[1400px] mx-auto">
        {/* Hero Section */}
        <div className="max-w-4xl mb-12">
          <h1 className="text-6xl font-black text-primary mb-4 tracking-tighter leading-[1.1]">
            Small acts, <span className="text-secondary italic">together.</span>
          </h1>
          <p className="text-lg text-text-muted font-medium max-w-2xl">
            Choose a story to join today. Every moment of your effort fuels the growth of these incredible communities. We're turning collective energy into real human progress.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-16">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={20} />
            <input
              type="text"
              placeholder="Find a cause close to your heart..."
              className="w-full bg-white border border-gray-100 rounded-full py-5 pl-16 pr-8 text-primary font-semibold shadow-sm focus:shadow-xl focus:shadow-primary/5 outline-none transition-all"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${selectedCategory === cat
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                    : "bg-white text-text-muted border border-gray-100 hover:border-primary/20 hover:text-primary"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 size={48} className="animate-spin text-primary opacity-20" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Partner List */}
            <div className="lg:col-span-7 space-y-8">
              {filteredCharities.map((charity) => (
                <Link
                  key={charity.id}
                  href={`/charity/${charity.id}`}
                  className="block group relative bg-white rounded-[32px] p-8 border border-gray-100 hover:border-primary/10 transition-all hover:shadow-2xl hover:shadow-primary/5"
                >
                  <div className="flex items-start gap-6 mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-surface-container-low flex items-center justify-center p-3 shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform">
                      <Image
                        src={charity.image_url}
                        alt={charity.name}
                        width={80}
                        height={80}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 pt-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-black text-primary mb-1">{charity.name}</h3>
                          <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">{charity.tagline}</p>
                        </div>
                        <div className="text-text-muted group-hover:text-primary transition-colors">
                          <ExternalLink size={20} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-text-muted font-medium leading-relaxed mb-8">
                    {charity.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-50">
                    <div className="bg-surface-container-low/50 p-6 rounded-2xl">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Community Support</p>
                      <p className="text-2xl font-black text-primary">{charity.community_support}</p>
                    </div>
                    <div className="bg-surface-container-low/50 p-6 rounded-2xl relative overflow-hidden">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Your Collective Impact</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-black text-secondary">{charity.collective_impact}</p>
                        <Zap size={16} className="text-secondary animate-pulse" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Right Column: Featured Partner Detail (Sticky) */}
            {featuredCharity && (
              <div className="lg:col-span-5 sticky top-32">
                <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-2xl shadow-primary/5">
                  <div className="relative h-64 w-full">
                    <Image
                      src={featuredCharity.image_url}
                      alt={featuredCharity.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-6 left-6">
                      <span className="px-4 py-2 bg-secondary text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
                        Featured Partnership
                      </span>
                    </div>
                  </div>

                  <div className="p-10">
                    <h2 className="text-4xl font-black text-primary mb-6 leading-tight">
                      {featuredCharity.name}
                    </h2>
                    <p className="text-text-muted font-medium leading-relaxed mb-10 line-clamp-4">
                      {featuredCharity.description}
                    </p>

                    {/* Progress Card */}
                    <div className="mb-10">
                      <div className="flex justify-between items-end mb-3">
                        <p className="text-sm font-bold text-primary">Community Moonshot</p>
                        <p className="text-xs font-bold text-text-muted">
                          ${(featuredCharity.raised_amount / 1000).toFixed(0)}k / ${(featuredCharity.goal_amount / 1000).toFixed(0)}k
                        </p>
                      </div>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full shadow-sm"
                          style={{ width: `${(featuredCharity.raised_amount / featuredCharity.goal_amount) * 100}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/charity/${featuredCharity.id}`}
                      className="w-full py-6 bg-secondary text-white rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-secondary/20 group"
                    >
                      <Heart size={24} className="group-hover:fill-white transition-all" /> View Mission Details
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />

      <style jsx>{`
        .bg-background { background-color: var(--background); }
        .text-primary { color: var(--primary); }
        .text-secondary { color: var(--secondary); }
        .bg-surface-container-low { background-color: var(--surface-container-low); }
        .text-text-muted { color: var(--text-muted); }
      `}</style>
    </div>
  );
}
