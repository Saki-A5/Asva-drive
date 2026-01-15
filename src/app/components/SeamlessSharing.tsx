import Image from "next/image";
import { Share2 } from "lucide-react";
export default function SeamlessSharing() {
  return (
    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
      <div>
        <div className="w-12 h-12 bg-[radial-gradient(ellipse_at_center,#02427E_0%,#050E3F_100%)] text-white rounded-xl flex items-center justify-center mb-6 dark:text-[#0AFEF2] dark:bg-none">
          <Share2 className="w-8 h-8" />
        </div>
        <h3 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
          Campus-Wide Collaboration
        </h3>
        <p className="text-lg text-slate-600 leading-relaxed mb-6 dark:text-white">
          Collaborating on group projects shouldn&apos;t be a nightmare. ASVA
          makes sharing as easy as a single click within your university
          network.
        </p>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <span className="text-emerald-500 font-bold mt-1">→</span>
            <span>
              <strong>Shared Hubs:</strong> Create a folder for your group where
              everyone can edit simultaneously.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-emerald-500 font-bold mt-1">→</span>
            <span>
              <strong>Zero-Data Transfers:</strong> Since it&apos;s on-campus,
              sharing a 2GB project file doesn&apos;t use your personal internet
              data.
            </span>
          </li>
        </ul>
      </div>
      <div className="bg-slate-100 rounded-3xl aspect-video shadow-2xl border border-slate-200 flex items-center justify-center text-slate-400 italic relative">
        <Image
          src="/preview.webp"
          alt="Preview Image"
          fill
          className="rounded-3xl"
        />
      </div>
    </div>
  );
}
