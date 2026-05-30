import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Youtube } from "lucide-react";
import { PaaraLogo } from "./PaaraLogo";
import ThemeSwitcher from "./ThemeSwitcher";

export function Footer() {
  return (
    <>
    <footer className="bg-[#0F2219] text-[#F5EDD8] mt-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <PaaraLogo height={80} />
              <div>
                <div className="font-display text-2xl tracking-[0.32em]">PAARA</div>
                <div className="urdu text-[#C9921A] text-sm">پارہ</div>
              </div>
            </div>
            <p className="font-display italic text-xl text-[rgba(245,237,216,0.85)] max-w-md leading-relaxed">
              A precious piece of Pakistan — heritage crafts, verified artisans, delivered with care.
            </p>
            <div className="flex gap-3 mt-8">
              {[Instagram, Twitter, Youtube].map((Icon, i) => (
                <button
                  key={i}
                  className="w-10 h-10 rounded-full grid place-items-center border border-[rgba(201,146,26,0.3)] hover:bg-[#C9921A] hover:text-[#1C3A2A] transition-all"
                  aria-label="Social"
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          <FooterCol
            title="Explore"
            links={[
              ["Products", "/products"],
              ["Regions", "/regions"],
              ["Brands", "/brands"],
              ["Heritage Stories", "/heritage"],
            ]}
          />
          <FooterCol
            title="Sell"
            links={[
              ["Become an Artisan", "/sell"],
              ["Seller Dashboard", "/seller"],
              ["Verification", "/verification"],
              ["Resources", "/resources"],
            ]}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pb-12 border-t border-[rgba(201,146,26,0.18)] pt-12">
          <FooterCol
            title="Company"
            links={[
              ["About", "/about"],
              ["Contact", "/contact"],
              ["Press", "/press"],
              ["Careers", "/careers"],
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              ["Terms", "/terms"],
              ["Privacy", "/privacy"],
              ["Refund Policy", "/refunds"],
              ["Shipping", "/shipping"],
            ]}
          />
          <div className="col-span-2">
            <div className="eyebrow !text-[#C9921A] mb-3">Heritage Letter</div>
            <p className="text-sm text-[rgba(245,237,216,0.7)] mb-4 leading-relaxed">
              Quiet monthly stories from artisans, regions, and craft houses. No noise.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-1 bg-transparent border border-[rgba(201,146,26,0.3)] rounded-full px-5 py-3 text-sm text-[#F5EDD8] placeholder:text-[rgba(245,237,216,0.4)] focus:outline-none focus:border-[#C9921A]"
              />
              <button type="submit" className="btn btn-primary">Subscribe</button>
            </form>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-[rgba(245,237,216,0.08)]">
          <p className="text-xs tracking-[0.2em] uppercase text-[rgba(245,237,216,0.5)]">
            © {new Date().getFullYear()} PAARA · Crafted in Pakistan
          </p>
          <p className="urdu text-[#C9921A]">ہماری میراث، آپ کا اعتماد</p>
        </div>
      </div>
    </footer>
    <ThemeSwitcher />
    </>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="eyebrow !text-[#C9921A] mb-4">{title}</div>
      <ul className="space-y-3">
        {links.map(([label, to]) => (
          <li key={to}>
            <Link
              to={to}
              className="text-sm text-[rgba(245,237,216,0.8)] hover:text-[#C9921A] transition-colors"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
