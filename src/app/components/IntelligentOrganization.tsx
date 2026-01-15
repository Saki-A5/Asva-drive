import Image from "next/image";
import { Folder } from "lucide-react";
export default function IntelligentOrganization() {
  return (
    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
      <div>
        <div className="w-12 h-12 bg-[radial-gradient(ellipse_at_center,#02427E_0%,#050E3F_100%)] text-white rounded-xl flex items-center justify-center mb-6 dark:text-[#0AFEF2] dark:bg-none">
          <Folder className="w-8 h-8" />
        </div>
        <h3 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
          Smart Academic Organization
        </h3>
        <p className="text-lg text-slate-600 leading-relaxed mb-6 dark:text-white">
          Generic cloud storage treats your &quot;Final Project&quot; the same
          as a vacation photo. ASVA Drive recognizes file types like **MATLAB
          scripts, AutoCAD designs, and Lab Reports**.
        </p>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <span className="text-sky-500 font-bold mt-1">→</span>
            <span>
              <strong>Pre-structured Folders:</strong> Automatic sorting by
              Semester, Course Code, and Resource Type.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-sky-500 font-bold mt-1">→</span>
            <span>
              <strong>Version Control:</strong> Keep track of
              &quot;Essay_Draft_1&quot; and &quot;Essay_Final&quot; without the
              clutter.
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
