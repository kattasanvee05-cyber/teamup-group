import { motion } from 'framer-motion'
import { FiMail, FiClock, FiUsers } from 'react-icons/fi'

export default function SupportUs() {
  return (
    <section className="border-t border-white/[0.06] px-5 py-14 sm:px-10" style={{ marginTop: '400px' }}>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-7xl"
      >
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">

          {/* ── Left ── */}
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-white/40">
              Support &amp; Contact
            </p>
            <h2 className="text-4xl font-black leading-tight text-white sm:text-5xl">
              We're here to help.
            </h2>
            <p className="mt-5 text-base leading-[1.9] text-white/60">
              Running into a bug, have a feature request, or just want to share feedback?
              Our team reviews every message and typically responds within one business day.
            </p>
            <p className="mt-4 text-base leading-[1.9] text-white/60">
              For urgent issues — a borrowed item not updating, an application stuck in
              pending, or a broken page — please include a brief description of the problem
              and your username so we can resolve it quickly.
            </p>

            <a
              href="mailto:noreply.teamup.com@gmail.com"
              className="mt-7 inline-flex items-center gap-2.5 text-sm font-bold text-white transition-opacity hover:opacity-75"
            >
              <FiMail size={15} />
              Send us an email
              <span className="flex items-center gap-1.5 font-normal text-white/50">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Usually responds within 24 hrs
              </span>
            </a>
          </div>

          {/* ── Right card ── */}
          <div className="w-full shrink-0 lg:w-72">
            <div
              className="rounded-2xl border border-white/[0.1] p-6"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                Contact
              </p>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <FiMail size={15} className="mt-0.5 shrink-0 text-[#4fd1ff]" />
                  <div>
                    <p className="text-xs text-white/40">Email</p>
                    <p className="mt-0.5 text-sm font-semibold text-white">
                      noreply.teamup.com@gmail.com
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiClock size={15} className="mt-0.5 shrink-0 text-amber-400" />
                  <div>
                    <p className="text-xs text-white/40">Response time</p>
                    <p className="mt-0.5 text-sm font-semibold text-white">
                      Within 1 business day
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiUsers size={15} className="mt-0.5 shrink-0 text-violet-400" />
                  <div>
                    <p className="text-xs text-white/40">Team</p>
                    <p className="mt-0.5 text-sm font-semibold text-white">
                      JNTUH University, Student Dev Team
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </section>
  )
}
