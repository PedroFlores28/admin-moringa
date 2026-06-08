export const ADMIN_MODULES = [
  { id: "dashboard", label: "Dashboard" },
  { id: "users", label: "Usuarios" },
  { id: "rank-history", label: "Historial de Rangos" },
  { id: "affiliations", label: "Afiliaciones" },
  { id: "products", label: "Productos" },
  { id: "transactions", label: "Transacciones" },
  { id: "collects", label: "Retiros" },
  { id: "kadex", label: "Inventario" },
  { id: "banner", label: "Banner" },
  { id: "materials", label: "Materiales" },
  { id: "tree", label: "Red" },
  { id: "payments", label: "Pagos" },
  { id: "offices", label: "Oficinas" },
  { id: "operations", label: "Compras" },
  { id: "closed", label: "Cierres" },
  { id: "bonus-reports", label: "Bonos" },
  { id: "periods", label: "Periodos" },
  { id: "sessions", label: "Sesiones" },
  { id: "admin-users", label: "Administradores" },
];

const MODULE_IDS = new Set(ADMIN_MODULES.map((m) => m.id));

export function isSuperAdmin(account) {
  if (!account || account.type !== "admin") return false;
  if (account.isSuperAdmin) return true;
  if (account.role === "superadmin") return true;
  if (String(account.id) === "admin") return true;
  if (String(account.dni || "").toUpperCase() === "MORINGA") return true;
  if (!account.permissions || account.permissions.length === 0) return true;
  return false;
}

export function hasPermission(account, moduleId) {
  if (!account || account.type !== "admin") return false;
  if (account.adminActive === false) return false;
  if (isSuperAdmin(account)) return true;
  const perms = Array.isArray(account.permissions) ? account.permissions : [];
  return perms.includes(moduleId);
}

const ROUTE_RULES = [
  { test: (p) => p === "/dashboard" || p === "/", perm: "dashboard" },
  { test: (p) => p.startsWith("/userBs"), perm: "users" },
  { test: (p) => p === "/rank-history-summary", perm: "rank-history" },
  { test: (p) => p.startsWith("/affiliationBs") || p.startsWith("/activationBs"), perm: "affiliations" },
  { test: (p) => p === "/products" || p === "/plans", perm: "products" },
  { test: (p) => p === "/trans", perm: "transactions" },
  { test: (p) => p.startsWith("/collectBs"), perm: "collects" },
  { test: (p) => p === "/kadex", perm: "kadex" },
  { test: (p) => p === "/banner", perm: "banner" },
  { test: (p) => p === "/materials" || p === "/flyers" || p === "/audios" || p === "/books" || p === "/agenda", perm: "materials" },
  { test: (p) => p === "/tree" || p === "/mlm-tree", perm: "tree" },
  { test: (p) => p === "/pay" || p === "/wallet" || p === "/validacion-vouchers" || p === "/payment-methods", perm: "payments" },
  { test: (p) => p === "/offices" || p.startsWith("/office-collectBs"), perm: "offices" },
  { test: (p) => p.startsWith("/operationBs") || p === "/delivery-management", perm: "operations" },
  { test: (p) => p === "/closed", perm: "closed" },
  { test: (p) => p === "/bonus-reports" || p === "/reports" || p.startsWith("/leadership") || p.startsWith("/ai-"), perm: "bonus-reports" },
  { test: (p) => p === "/periods", perm: "periods" },
  { test: (p) => p === "/sessions", perm: "sessions" },
  { test: (p) => p === "/admin-users", perm: "admin-users" },
  { test: (p) => p === "/dashboard-config" || p === "/general-password", perm: "admin-users" },
];

export function routePermission(path) {
  const p = String(path || "").split("?")[0];
  if (p === "/change-password" || p === "/logout" || p === "/login" || p === "/sucursal") {
    return null;
  }
  const rule = ROUTE_RULES.find((r) => r.test(p));
  return rule ? rule.perm : "dashboard";
}

export function normalizePermissions(list) {
  if (!Array.isArray(list)) return [];
  return [...new Set(list.filter((p) => MODULE_IDS.has(p)))];
}

const MODULE_HOME = {
  dashboard: "/dashboard",
  users: "/userBsall",
  "rank-history": "/rank-history-summary",
  affiliations: "/affiliationBsall",
  products: "/products",
  transactions: "/trans",
  collects: "/collectBsall",
  kadex: "/kadex",
  banner: "/banner",
  materials: "/materials",
  tree: "/tree",
  payments: "/pay",
  offices: "/offices",
  operations: "/operationBsplan",
  closed: "/closed",
  "bonus-reports": "/bonus-reports",
  periods: "/periods",
  sessions: "/sessions",
};

const MODULE_PRIORITY = [
  "dashboard",
  "users",
  "rank-history",
  "affiliations",
  "products",
  "transactions",
  "collects",
  "kadex",
  "banner",
  "materials",
  "tree",
  "payments",
  "offices",
  "operations",
  "closed",
  "bonus-reports",
  "periods",
  "sessions",
];

/** Primera ruta a la que el operador puede entrar tras login. */
export function getDefaultRouteForAccount(account) {
  if (!account) return "/login";
  for (const mod of MODULE_PRIORITY) {
    if (hasPermission(account, mod) && MODULE_HOME[mod]) {
      return MODULE_HOME[mod];
    }
  }
  return "/change-password";
}
