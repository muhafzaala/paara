import { Link } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { ArrowLeft } from "lucide-react";

interface ComingSoonProps {
  eyebrow: string;
  title: string;
  urdu?: string;
  description: string;
}

export function ComingSoon({ eyebrow, title, urdu, description }: ComingSoonProps) {
  return (
    <div className="min-h-screen bg-[#F5EDD8] flex flex-col">
      <Nav variant="solid" />
      <main className="flex-1 grid place-items-center px-6 py-32">
        <div className="max-w-2xl text-center">
          <p className="eyebrow mb-4">{eyebrow}</p>
          {urdu && <p className="urdu text-[#C9921A] text-2xl mb-4">{urdu}</p>}
          <h1 className="display-serif text-5xl md:text-6xl text-[#1C3A2A] leading-[1.05] mb-6">
            {title}
          </h1>
          <p className="text-[#3D2914] text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            {description}
          </p>
          <Link to="/" className="btn btn-outline-forest">
            <ArrowLeft size={14} /> Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
