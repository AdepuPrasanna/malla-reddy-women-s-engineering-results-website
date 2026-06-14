import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { SITE_URL } from "@/shared/constants/seo";
import { fetchFooterSettings, queryKeys } from "@/shared/lib/api";
import type { FooterLink, FooterSection } from "@/shared/types/settings";

const FALLBACK_SECTIONS: FooterSection[] = [
  {
    id: "quick-links",
    title: "Quick Links",
    links: [
      { id: "ql-1", label: "Academic Results", href: "/academic-results" },
      { id: "ql-2", label: "Class Results", href: "/class-results" },
      { id: "ql-3", label: "Help Center", href: "/help-center" },
    ],
  },
  {
    id: "legal",
    title: "Legal",
    links: [
      { id: "lg-1", label: "Privacy Policy", href: "/help-center" },
      { id: "lg-2", label: "Terms of Service", href: "/help-center" },
    ],
  },
];

function FooterLinkItem({ link }: { link: FooterLink }) {
  const className = "hover:text-primary-light";
  if (link.external || link.href.startsWith("http")) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {link.label}
      </a>
    );
  }
  return <Link to={link.href} className={className}>{link.label}</Link>;
}

export function Footer() {
  const { data } = useQuery({
    queryKey: queryKeys.footer(),
    queryFn: fetchFooterSettings,
    staleTime: 60_000,
  });

  const sections = data?.sections?.length ? data.sections : FALLBACK_SECTIONS;

  return (
    <footer className="mt-auto w-full border-t border-foreground/10 bg-surface px-4 pb-24 pt-10 sm:px-6 lg:px-8 lg:pb-10">
      <div className="mx-auto grid max-w-content gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-display font-semibold">MRECW Results Portal</h3>
          <p className="mt-2 text-sm text-muted">
            Malla Reddy Engineering College for Women (Autonomous), Hyderabad — fast academic insights for students.
          </p>
        </div>
        {sections.map((section) => (
          <div key={section.id}>
            <h4 className="text-sm font-semibold">{section.title}</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {section.links.map((link) => (
                <li key={link.id}>
                  <FooterLinkItem link={link} />
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h4 className="text-sm font-semibold">Contact</h4>
          <p className="mt-3 text-sm text-muted">Hyderabad, Telangana, India</p>
          <p className="mt-1 text-sm text-muted">{SITE_URL}</p>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-content text-center text-xs text-muted">
        © {new Date().getFullYear()} MRECW Results Portal. Built for MRECW students.
      </p>
    </footer>
  );
}
