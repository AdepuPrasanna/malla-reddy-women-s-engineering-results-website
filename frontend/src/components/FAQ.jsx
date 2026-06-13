import { FAQ_ITEMS } from "../lib/api";

export default function FAQ() {
  return (
    <section id="faq" className="border-t border-[rgb(var(--border)/0.06)] py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="mt-3 text-[rgb(var(--text-muted))]">Common questions about checking MRECW exam results.</p>
        </div>
        <div className="mt-10 space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <details key={item.q} className="group card overflow-hidden" open={i === 0}>
              <summary className="cursor-pointer px-5 py-4 font-semibold marker:content-none">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-brand-400 transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="border-t border-[rgb(var(--border)/0.08)] px-5 py-4 text-sm leading-relaxed text-[rgb(var(--text-muted))]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
