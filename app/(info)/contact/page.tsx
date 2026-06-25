import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Lawbite",
  description: "Get in touch with the Lawbite team.",
};

export default function ContactPage() {
  return (
    <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div className="mx-auto max-w-6xl px-6">
        <article className="mx-auto max-w-3xl">
          <header className="border-b border-white/10 pb-10">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/40">
              / Contact
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              Get in Touch
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65">
              Have a question, suggestion, or need support? We&apos;d love to
              hear from you.
            </p>
          </header>

          <div className="mt-10 space-y-10 text-[15px] leading-[1.75] text-white/75">
            <section>
              <h2 className="text-xl font-semibold text-white">
                Contact Information
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/40">
                    Email
                  </p>
                  <p className="mt-1 text-white/90">hello@lawbite.example</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/40">
                    Support
                  </p>
                  <p className="mt-1 text-white/90">support@lawbite.example</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/40">
                    Social
                  </p>
                  <p className="mt-1 text-white/90">
                    X (Twitter) &middot; LinkedIn &middot; GitHub
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                Response Time
              </h2>
              <p className="mt-3">
                We aim to respond to all inquiries within 24&ndash;48 hours
                during business days. For urgent matters, please include
                &ldquo;Urgent&rdquo; in your subject line.
              </p>
            </section>
          </div>
        </article>
      </div>
    </section>
  );
}
