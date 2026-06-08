import Vue from "vue";
import Router from "vue-router";

import Login from "./views/Login.vue";
import Sucursal from "./views/Sucursal.vue";
import Logout from "./views/Logout.vue";
import Dashboard from "./views/Dashboard.vue";
import Users from "./views/Users.vue";
import Affiliations from "./views/Affiliations.vue";
import Collects from "./views/Collects.vue";
import OfficeCollects from "./views/OfficeCollects.vue";
import Activations from "./views/Activations.vue";
// import Promos       from './views/Promos.vue'
import Banner from "./views/Banner.vue";
import Tree from "./views/Tree.vue";
import MLMTree from "./views/MLMTree.vue";
import Stock from "./views/Stock.vue";
import Offices from "./views/Offices.vue";
import Operations from "./views/Operations.vue";
import Pay from "./views/Pay.vue";
import Wallet from "./views/Wallet.vue";
import Products from "./views/Products.vue";
import Plans from "./views/Plans.vue";
import Kadex from "./views/Kadex.vue";
import Closed from "./views/Closed.vue";
import Reports from "./views/Reports.vue";
import Transaction from "./views/Trans.vue";
import LeadershipPredictions from "./views/LeadershipPredictions.vue";
import AIPredictions from "./views/AIPredictions.vue";
import AIQualityPredictions from "./views/AIQualityPredictions.vue";
import DeliveryManagement from "./views/DeliveryManagement.vue";
import PaymentMethods from "./views/PaymentMethods.vue";
import DashboardConfig from "./views/DashboardConfig.vue";
import GeneralPassword from "./views/GeneralPassword.vue";
import Flyers from "./views/Flyers.vue";
import Periods from "./views/Periods.vue";
import Materials from "./views/Materials.vue";
import Audios from "./views/Audios.vue";
import Books from "./views/Books.vue";
import RankHistorySummary from "./views/RankHistorySummary.vue";
import ValidacionVouchers from "./views/ValidacionVouchers.vue";
import Agenda from "./views/Agenda.vue";
import ChangePassword from "./views/ChangePassword.vue";
import Sessions from "./views/Sessions.vue";
import BonusReports from "./views/BonusReports.vue";
import AdminUsers from "./views/AdminUsers.vue";
import { hasPermission, routePermission, getDefaultRouteForAccount } from "./lib/permissions";
import store from "./store";

// import Reports      from './views/Reports.vue'

Vue.use(Router);

const routes = [
  {
    path: "*",
    redirect: "/dashboard",
  },
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/login",
    component: Login,
    meta: { requiresNoAuth: true },
  },
  {
    path: "/dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/trans",
    component: Transaction,
    meta: { requiresAuth: true },
  },
  {
    path: "/sucursal",
    component: Sucursal,
    meta: { requiresNoAuth: true },
  },
  {
    path: "/logout",
    component: Logout,
  },
  {
    path: "/change-password",
    component: ChangePassword,
    meta: { requiresAuth: true, title: "Cambiar contraseña" },
  },
  {
    path: "/sessions",
    component: Sessions,
    meta: { requiresAuth: true, title: "Sesiones" },
  },
  {
    path: "/userBs:filter",
    component: Users,
    meta: { requiresAuth: true },
  },
  {
    path: "/affiliationBs:filter",
    component: Affiliations,
    meta: { requiresAuth: true },
  },
  {
    path: "/collectBs:filter",
    component: Collects,
    meta: { requiresAuth: true },
  },
  {
    path: "/office-collectBs:filter",
    component: OfficeCollects,
    meta: { requiresAuth: true },
  },
  {
    path: "/activationBs:filter",
    component: Activations,
    meta: { requiresAuth: true },
  },
  // {
  //   path: '/promotionBs:filter',
  //   path: '/promotions',
  //   component: Promos,
  //   meta: { requiresAuth: true }
  // },
  {
    path: "/banner",
    component: Banner,
    meta: { requiresAuth: true },
  },
  {
    path: "/tree",
    component: Tree,
    meta: { requiresAuth: true },
  },
  {
    path: "/mlm-tree",
    component: MLMTree,
    meta: { requiresAuth: true },
  },
  {
    path: "/stock",
    component: Stock,
    meta: { requiresAuth: true },
  },
  {
    path: "/offices",
    component: Offices,
    meta: { requiresAuth: true },
  },

  {
    path: "/operationBs:filter",
    component: Operations,
    meta: { requiresAuth: true },
  },
  {
    path: "/pay",
    component: Pay,
    meta: { requiresAuth: true },
  },
  {
    path: "/wallet",
    component: Wallet,
    meta: { requiresAuth: true },
  },
  {
    path: "/products",
    component: Products,
    meta: { requiresAuth: true },
  },
  {
    path: "/plans",
    component: Plans,
    meta: { requiresAuth: true },
  },
  {
    path: "/kadex",
    component: Kadex,
    meta: { requiresAuth: true },
  },
  {
    path: "/closed",
    component: Closed,
    meta: { requiresAuth: true },
  },
  {
    path: "/reports",
    component: Reports,
    meta: { requiresAuth: true },
  },
  {
    path: "/bonus-reports",
    component: BonusReports,
    meta: { requiresAuth: true },
  },
  {
    path: "/leadership-predictions",
    component: LeadershipPredictions,
    meta: { requiresAuth: true },
  },
  {
    path: "/ai-predictions",
    component: AIPredictions,
    meta: { requiresAuth: true },
  },
  {
    path: "/ai-quality-predictions",
    component: AIQualityPredictions,
    meta: { requiresAuth: true },
  },
  {
    path: "/delivery-management",
    component: DeliveryManagement,
    meta: { requiresAuth: true },
  },
  {
    path: "/payment-methods",
    component: PaymentMethods,
    meta: { requiresAuth: true },
  },
  {
    path: "/periods",
    component: Periods,
    meta: { requiresAuth: true },
  },
  {
    path: "/dashboard-config",
    component: DashboardConfig,
    meta: { requiresAuth: true },
  },
  {
    path: "/general-password",
    component: GeneralPassword,
    meta: { requiresAuth: true, title: "CLAVE MAESTRA" },
  },
  {
    path: "/flyers",
    component: Flyers,
    meta: { requiresAuth: true },
  },
  {
    path: "/materials",
    component: Materials,
    meta: { requiresAuth: true },
  },
  {
    path: "/audios",
    component: Audios,
    meta: { requiresAuth: true },
  },
  {
    path: "/books",
    component: Books,
    meta: { requiresAuth: true },
  },
  {
    path: "/rank-history-summary",
    component: RankHistorySummary,
    meta: { requiresAuth: true, permission: "rank-history" },
  },
  {
    path: "/validacion-vouchers",
    component: ValidacionVouchers,
    meta: { requiresAuth: true },
  },
  {
    path: "/agenda",
    component: Agenda,
    meta: { requiresAuth: true, permission: "materials" },
  },
  {
    path: "/admin-users",
    component: AdminUsers,
    meta: { requiresAuth: true, title: "Administradores", permission: "admin-users" },
  },
  {
    path: "/forbidden",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
];

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

const DEFAULT_DOCUMENT_TITLE = "Moringa Admin";

function hydrateAccount() {
  if (store.state.account) return store.state.account;
  try {
    const raw = localStorage.getItem("adminAccount");
    if (raw) {
      const account = JSON.parse(raw);
      store.commit("SET_ACCOUNT", account);
      return account;
    }
  } catch (_) {}
  return null;
}

router.beforeEach((to, from, next) => {
  const requiresNoAuth = to.matched.some(
    (record) => record.meta.requiresNoAuth
  );
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  const session = localStorage.getItem("adminSession");

  if (requiresNoAuth && session) {
    const account = hydrateAccount();
    return next({ path: getDefaultRouteForAccount(account) });
  }
  if (requiresAuth && !session) {
    return next({ path: "/login" });
  }

  if (requiresAuth && session) {
    const account = hydrateAccount();
    const perm = to.meta && to.meta.permission ? to.meta.permission : routePermission(to.path);
    if (perm && account && !hasPermission(account, perm)) {
      const fallback = getDefaultRouteForAccount(account);
      if (to.path === fallback) {
        return next({ path: "/change-password" });
      }
      return next({ path: fallback });
    }
  }

  next();
});

router.afterEach((to) => {
  const leaf = to.matched[to.matched.length - 1];
  if (leaf && leaf.meta && leaf.meta.title) {
    document.title = leaf.meta.title;
  } else {
    document.title = DEFAULT_DOCUMENT_TITLE;
  }
});

export default router;
