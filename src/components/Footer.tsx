import Link from "next/link";
import {
  Globe,
  Share2,
  Camera,
  Code2,
  ArrowRight,
  Zap
} from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Draw Results", href: "/draw" },
    { label: "Pricing", href: "/pricing" },
    { label: "Admin Console", href: "/admin" },
  ],
  Impact: [
    { label: "Charity Directory", href: "/charity" },
    { label: "Ethos", href: "#" },
    { label: "Partner Program", href: "#" },
    { label: "Impact Report 2024", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap size={16} className="text-secondary-light" />
              </div>
              <span className="font-display text-lg font-extrabold tracking-tight text-primary">
                ELEVATED IMPACT
              </span>
            </Link>
            <p className="text-text-muted max-w-xs mb-8 text-sm leading-relaxed">
              Transforming athletic excellence into global social progress. Join the elite community of digital philanthropists.
            </p>
            <div className="flex gap-4">
              {[Globe, Share2, Camera, Code2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Cols */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-bold text-sm text-primary mb-6 uppercase tracking-wider">
                {title}
              </h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter / Bottom */}
        <div className="mt-20 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-text-muted">
            © 2024 Elevated Impact Platform. All rights reserved. Vetted and Verified Philanthropy.
          </p>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">System Status: Optimal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
