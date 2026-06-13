export const PAGES = {
  home: { id: "home", path: "home", label: "Home", hash: "#/" },
  allResults: { id: "all-results", path: "all-results", label: "All Results", hash: "#/all-results" },
  academicResult: { id: "academic-result", path: "academic-result", label: "Academic Result", hash: "#/academic-result" },
  backlogReport: { id: "backlog-report", path: "backlog-report", label: "Backlog Report", hash: "#/backlog-report" },
  classResult: { id: "class-result", path: "class-result", label: "Class Result", hash: "#/class-result" },
  creditsChecker: { id: "credits-checker", path: "credits-checker", label: "Credits Checker", hash: "#/credits-checker" },
  resultContrast: { id: "result-contrast", path: "result-contrast", label: "Result Contrast", hash: "#/result-contrast" },
  helpCenter: { id: "help-center", path: "help-center", label: "Help center", hash: "#/help-center" },
};

export const RESULTS_PAGES = [
  PAGES.allResults,
  PAGES.academicResult,
  PAGES.backlogReport,
  PAGES.classResult,
  PAGES.creditsChecker,
  PAGES.resultContrast,
];

export const ALL_PAGES = [PAGES.home, ...RESULTS_PAGES, PAGES.helpCenter];

export const HOME_CARDS = [
  { pageId: PAGES.academicResult.id, title: "Academic Result", description: "Access your overall academic performance with just a hall ticket." },
  { pageId: PAGES.backlogReport.id, title: "Backlog Report", description: "View your backlog subjects and pending credits in one clear report." },
  { pageId: PAGES.classResult.id, title: "Class Result", description: "View class rankings and compare performance across your section." },
  { pageId: PAGES.creditsChecker.id, title: "Credits Checker", description: "Check credits earned vs required for progression and graduation." },
  { pageId: PAGES.resultContrast.id, title: "Result Contrast", description: "Compare CGPA and subject grades between two hall tickets." },
];

export function getPageIdFromHash() {
  const raw = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  if (!raw || raw === "home") return PAGES.home.id;
  const match = ALL_PAGES.find((item) => item.path === raw);
  return match ? match.id : PAGES.home.id;
}

export function navigateTo(pageId) {
  const page = ALL_PAGES.find((item) => item.id === pageId) || PAGES.home;
  window.location.hash = page.hash;
}

export function isResultsPage(pageId) {
  return RESULTS_PAGES.some((p) => p.id === pageId);
}
