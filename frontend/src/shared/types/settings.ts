export interface FooterLink {
  id: string;
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
}

export interface FooterSettings {
  sections: FooterSection[];
  updatedAt?: string;
}

export interface FeedbackItem {
  id: string;
  message: string;
  status: "new" | "read" | "resolved";
  source?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  role: "admin";
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
