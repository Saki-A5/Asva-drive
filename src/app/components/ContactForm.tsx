import { PhoneIcon, MapPinIcon, Mail } from "lucide-react";

export default function ContactForm() {
  return (
    <section id="contact" className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Text */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-800 mb-4 dark:text-white">
            Get In Touch
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto italic">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eligendi
            harum deserunt minima, nesciunt commodi natus.
          </p>
        </div>

        {/* Form Card */}
        <div className="max-w-5xl mx-auto bg-white rounded-[40px] shadow-xl shadow-teal-900/5 overflow-hidden flex flex-col md:flex-row">
          {/* Left Sidebar: Contact Information */}
          <div className="md:w-2/5 bg-[radial-gradient(ellipse_at_center,#02427E_0%,#050E3F_100%)] p-10 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">Contact Information</h3>
              <p className="text-teal-50 mb-10 opacity-90">
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nemo,
                deserunt.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <PhoneIcon className="w-6 h-6" />
                  </div>
                  <div className="text-sm">
                    <p>+8801779717686</p>
                    <p>+888678363866</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    {/* <EnvelopeIcon className="w-6 h-6" /> */}
                    <Mail className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium">Support@uprankly.com</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <MapPinIcon className="w-6 h-6" />
                  </div>
                  <p className="text-sm">New York, USA</p>
                </div>
              </div>
            </div>

            {/* Decorative Circle in corner */}
            <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
          </div>

          {/* Right Section: Actual Form */}
          <div className="md:w-3/5 p-10 lg:p-16">
            <form className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Name Input */}
                <div className="relative group">
                  <label className="text-xs font-bold text-[#050E3F] uppercase tracking-wider block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Trangely"
                    className="w-full py-2 border-b-2 border-slate-100 focus:border-[#050E3F] outline-none transition-colors text-slate-700 font-medium placeholder:text-slate-300"
                  />
                </div>
                {/* Email Input */}
                <div className="relative group">
                  <label className="text-xs font-bold text-[#050E3F] uppercase tracking-wider block mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    placeholder="hello@nurency.com"
                    className="w-full py-2 border-b-2 border-slate-100 focus:border-[#050E3F] outline-none transition-colors text-slate-700 font-medium placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Subject Input */}
              <div className="relative group">
                <label className="text-xs font-bold text-[#050E3F] uppercase tracking-wider block mb-1">
                  Your Subject
                </label>
                <input
                  type="text"
                  placeholder="I want to hire you quickly"
                  className="w-full py-2 border-b-2 border-slate-100 focus:border-[#050E3F] outline-none transition-colors text-slate-700 font-medium placeholder:text-slate-300"
                />
              </div>

              {/* Message Input */}
              <div className="relative group">
                <label className="text-xs font-bold text-[#050E3F] uppercase tracking-wider block mb-1">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Write here your message"
                  className="w-full py-2 border-b-2 border-slate-100 focus:border-[#050E3F] outline-none transition-colors text-slate-700 font-medium placeholder:text-slate-300 resize-none"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="px-10 py-4 rounded-xl font-bold transition-all shadow-lg shadow-teal-500/20 active:scale-95 bg-[#0AFEF2] text-[#050E3F] cursor-pointer"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
