/** Nombres visibles: catálogo class/master; histórico basic→CLASS, standard→VIP. */

const CLASS_PLAN_IDS = new Set(["class", "basic", "business"]);
const VIP_PLAN_IDS = new Set(["master", "standard", "empresario"]);
export const CLASS_DISPLAY_NAME = "CLASS";
export const VIP_DISPLAY_NAME = "VIP";

function normalizeId(value) {
  return String(value || "").trim().toLowerCase();
}

function isLegacyEmpresarioName(name) {
  const n = String(name || "").trim().toLowerCase();
  return n === "empresario" || /empresario/.test(n);
}

function isLegacyEjecutivoName(name) {
  const n = String(name || "").trim().toLowerCase();
  return n === "ejecutivo" || /ejecutivo/.test(n) || n === "emprendedor";
}

function isLegacyDistribuidorName(name) {
  const n = String(name || "").trim().toLowerCase();
  return n === "distribuidor" || /distribuidor/.test(n);
}

function isVipPlan(ref) {
  if (!ref) return false;
  const id = normalizeId(ref.id != null ? ref.id : ref);
  return (
    VIP_PLAN_IDS.has(id) ||
    isLegacyEmpresarioName(ref.name) ||
    isLegacyDistribuidorName(ref.name) ||
    /vip/.test(normalizeId(ref.name || ""))
  );
}

export function resolvePlanDisplayName(ref) {
  if (ref == null || ref === "") return "-";
  if (typeof ref === "string") {
    const id = normalizeId(ref);
    if (id === "basic" || CLASS_PLAN_IDS.has(id)) return CLASS_DISPLAY_NAME;
    if (id === "standard" || VIP_PLAN_IDS.has(id)) return VIP_DISPLAY_NAME;
    if (isLegacyEmpresarioName(ref) || isLegacyDistribuidorName(ref)) {
      return VIP_DISPLAY_NAME;
    }
    if (isLegacyEjecutivoName(ref)) return CLASS_DISPLAY_NAME;
    return ref;
  }
  const id = normalizeId(ref.id);
  const rawName = String(ref.name || "").trim();

  if (id === "basic" || CLASS_PLAN_IDS.has(id)) return CLASS_DISPLAY_NAME;
  if (id === "standard" || VIP_PLAN_IDS.has(id)) return VIP_DISPLAY_NAME;

  if (isLegacyEmpresarioName(rawName) || isLegacyDistribuidorName(rawName)) {
    return VIP_DISPLAY_NAME;
  }
  if (isLegacyEjecutivoName(rawName)) return CLASS_DISPLAY_NAME;

  if (rawName) return rawName;

  if (VIP_PLAN_IDS.has(id)) return VIP_DISPLAY_NAME;
  if (CLASS_PLAN_IDS.has(id)) return CLASS_DISPLAY_NAME;
  if (id) return id.charAt(0).toUpperCase() + id.slice(1);
  return "-";
}

export function normalizePlanList(plans) {
  return (plans || []).map((plan) => ({
    ...plan,
    name: resolvePlanDisplayName(plan),
  }));
}
