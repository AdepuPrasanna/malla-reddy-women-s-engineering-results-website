import { useState } from "react";
import { FAQ_ITEMS } from "../lib/api";
import { ChevronRightIcon, MessageIcon, QuestionCircleIcon } from "../components/Icons";

export default function HelpCenterPage() {
  const [view, setView] = useState("home");
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (view === "faq") {
    return (
      <div className="mx-auto max-w-3xl">
        <button type="button" onClick={() => setView("home")} className="mb-6 text-sm text-sky-400 hover:underline">
          ← Back to Help center
        </button>
        <h1 className="help-center-title">FREQUENT QUESTIONS</h1>
        <div className="mt-8 space-y-3">
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
    );
  }

  if (view === "feedback") {
    return (
      <div className="mx-auto max-w-xl">
        <button type="button" onClick={() => setView("home")} className="mb-6 text-sm text-sky-400 hover:underline">
          ← Back to Help center
        </button>
        <h1 className="help-center-title">SUGGESTION / FEEDBACK</h1>
        <p className="mt-2 text-center text-sm text-[rgb(var(--text-muted))]">Share your ideas to help us improve MRECW Results.</p>
        {submitted ? (
          <div className="card mt-8 p-6 text-center text-[rgb(var(--text-muted))]">Thank you for your feedback!</div>
        ) : (
          <form
            className="card mt-8 space-y-4 p-6"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write your suggestion or feedback here…"
              className="input-field min-h-[140px] resize-y"
              required
            />
            <button type="submit" className="btn-result w-full sm:w-auto">Submit</button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="help-center-title">HELP CENTER</h1>
      <p className="mt-3 text-sm font-medium uppercase tracking-widest text-[rgb(var(--text-muted))]">How can we help you?</p>

      <div className="mt-10 space-y-4">
        <button type="button" onClick={() => setView("faq")} className="help-action-card help-action-blue">
          <span className="help-action-icon help-action-icon-blue">
            <QuestionCircleIcon />
          </span>
          <span className="flex-1 text-left">
            <span className="block font-display text-lg font-bold">Frequent Questions</span>
            <span className="mt-1 block text-sm text-[rgb(var(--text-muted))]">
              Browse common questions about MRECW results, CGPA, and how the site works.
            </span>
          </span>
          <ChevronRightIcon className="shrink-0 text-[rgb(var(--text-muted))]" />
        </button>

        <button type="button" onClick={() => setView("feedback")} className="help-action-card help-action-purple">
          <span className="help-action-icon help-action-icon-purple">
            <MessageIcon />
          </span>
          <span className="flex-1 text-left">
            <span className="block font-display text-lg font-bold">Suggestion / Feedback</span>
            <span className="mt-1 block text-sm text-[rgb(var(--text-muted))]">
              Share feedback or ideas to help us improve your experience — every suggestion counts.
            </span>
          </span>
          <ChevronRightIcon className="shrink-0 text-[rgb(var(--text-muted))]" />
        </button>
      </div>
    </div>
  );
}
