<template>
  <Layout>
    <i class="load" v-if="loading"></i>

    <section v-if="!loading" class="cierre-wrapper">

      <!-- ─── Header ─── -->
      <div class="cierre-header">
        <div>
          <h1 class="cierre-title">⚡ Cierre de Mes</h1>
          <p class="cierre-subtitle">Class Moringa · productos del periodo, residual y bonos por rango</p>
        </div>
        <button class="btn-iniciar" :class="{ 'btn-iniciar--loading': calculating }" @click="closed" :disabled="calculating">
          <span v-if="!calculating">🚀 Iniciar Cierre</span>
          <span v-else>⚙️ Calculando...</span>
        </button>
      </div>

      <!-- ─── Summary Cards ─── -->
      <div class="summary-cards" v-if="hasPreviewData">
        <div class="summary-card">
          <span class="summary-card__icon">💰</span>
          <div>
            <span class="summary-card__label">Total Bono Residual</span>
            <strong class="summary-card__value">Bs {{ totalResidual.toFixed(2) }}</strong>
          </div>
        </div>
        <div class="summary-card">
          <span class="summary-card__icon">💎</span>
          <div>
            <span class="summary-card__label">Usuarios con Rango</span>
            <strong class="summary-card__value">{{ usersWithRank }}</strong>
          </div>
        </div>
        <div class="summary-card">
          <span class="summary-card__icon">✅</span>
          <div>
            <span class="summary-card__label">Activos Full</span>
            <strong class="summary-card__value">{{ activosFull }}</strong>
          </div>
        </div>
        <div class="summary-card summary-card--accent">
          <span class="summary-card__icon">🏆</span>
          <div>
            <span class="summary-card__label">Bono logro / mant. rango (preview)</span>
            <strong class="summary-card__value">Bs {{ totalRankBonus.toFixed(2) }}</strong>
            <span
              v-if="totalRankBonus > 0"
              class="summary-card__sub"
            >{{ previewRankBonusLogroCount }} logro · {{ previewRankBonusMantCount }} mant.</span>
          </div>
        </div>
        <div class="summary-card summary-card--accent2">
          <span class="summary-card__icon">📌</span>
          <div>
            <span class="summary-card__label">Total preview (residual + rango)</span>
            <strong class="summary-card__value">Bs {{ totalPreviewCierre.toFixed(2) }}</strong>
          </div>
        </div>
        <div class="summary-card summary-card--warn" v-if="virtualResets.length">
          <span class="summary-card__icon">🧹</span>
          <div>
            <span class="summary-card__label">Saldo no disponible a quitar</span>
            <strong class="summary-card__value">Bs {{ totalVirtualReset.toFixed(2) }}</strong>
            <span class="summary-card__sub">{{ virtualResets.length }} usuario(s)</span>
          </div>
        </div>
      </div>

      <!-- ─── Saldo virtual (no disponible) que se elimina al confirmar ─── -->
      <div class="table-card table-card--warn" v-if="virtualResets.length">
        <div class="table-card__header">
          <h2 class="table-card__title">🧹 Saldo no disponible (virtual) · se quita al confirmar cierre</h2>
          <span class="badge badge--warn">{{ virtualResets.length }} usuarios · transacción «closed reset»</span>
        </div>
        <p class="virtual-reset-hint">
          Es el saldo acumulado en transacciones <strong>virtuales</strong> (ingresos menos egresos). Al cerrar, el motor registra un egreso <code>closed reset</code> por ese monto para cada usuario con saldo &gt; 0.
        </p>
        <div class="table-responsive">
          <table class="cierre-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>DNI</th>
                <th>Monto a quitar (Bs)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, ri) in virtualResets" :key="row.id || ri">
                <td class="td-num">{{ ri + 1 }}</td>
                <td class="td-name">{{ row.name || '—' }}</td>
                <td>{{ row.dni || '—' }}</td>
                <td class="td-bonus td-bonus--out">Bs {{ Number(row.amount || 0).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ─── Preview Table ─── -->
      <div class="table-card" v-if="tree && tree.length">
        <div class="table-card__header">
          <h2 class="table-card__title">📊 Previsualización · Class Moringa</h2>
          <span class="badge">{{ filteredTree.length }} en vista · {{ usersWithRank }} con rango (Plata+)</span>
        </div>
        <div class="table-search">
          <input v-model="search" class="search-input" placeholder="🔍 Buscar usuario..." />
        </div>
        <div class="table-responsive">
          <table class="cierre-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Productos personales</th>
                <th>Productos del equipo</th>
                <th>Estado</th>
                <th>Rango alcanzado</th>
                <th>Calificación actual</th>
                <th>Ciclos</th>
                <th>Bono residual (informativo)</th>
                <th>Bono de recalificación</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(node, i) in filteredTree" :key="node.id">
                <td class="td-num">{{ i + 1 }}</td>
                <td class="td-name">
                  {{ node.name }}
                  <div class="user-dni-sub">
                    <div v-if="node.token || node.id">Usuario: {{ node.token || node.id }}</div>
                    <div v-if="node.dni">CI: {{ node.dni }}</div>
                  </div>
                </td>
                <td class="td-compact">
                  <div class="mini-card">
                    <div class="mini-card__line">
                      Afiliación: {{ Number(node.personal_affiliations) || 0 }}
                      · Recompra: {{ Number(node.personal_recompras) || 0 }}
                    </div>
                    <div class="mini-card__total">Total: {{ displayPersonalProducts(node) }} prod.</div>
                  </div>
                </td>
                <td class="td-compact">
                  <div class="mini-card mini-card--team">
                    <div class="mini-card__total">Total equipo: {{ displayTeamProducts(node) }}</div>
                    <div v-if="teamLegsWithProducts(node).length" class="mini-legs">
                      <div
                        v-for="(leg, idx) in teamLegsWithProducts(node)"
                        :key="`${node.id}-leg-readable-${idx}`"
                        class="mini-leg"
                      >
                        <span class="mini-leg__name">{{ leg.name || 'Sin nombre' }}</span>
                        <span class="mini-leg__pts">{{ displayLegTeamProducts(leg) }}</span>
                      </div>
                    </div>
                    <span v-else class="td-zero">—</span>
                  </div>
                </td>
                <td>
                  <span
                    class="status-pill"
                    :class="isMonthlyActive(node) ? 'status-pill--on' : 'status-pill--off'"
                  >{{ isMonthlyActive(node) ? 'ACTIVO' : 'INACTIVO' }}</span>
                </td>
                <td>
                  <span class="rank-badge" :class="rankClass(achievedRank(node))">{{ rankLabel(achievedRank(node)) }}</span>
                </td>
                <td class="td-qualification">
                  <div class="qual-card">
                    <div class="qual-title" :class="{ 'qual-title--off': !qualificationHasProgress(node) }">
                      {{ qualificationTitle(node) }}
                    </div>
                    <div class="qual-sub">{{ qualificationSubtitle(node) }}</div>
                    <template v-if="isMonthlyActive(node)">
                      <div class="qual-meter">
                        <span>Volumen: {{ qualificationVolume(node) }}</span>
                        <div class="qual-bar">
                          <div class="qual-bar__fill" :style="{ width: qualificationVolumePct(node) + '%' }"></div>
                        </div>
                      </div>
                      <div
                        class="qual-structure"
                        :class="qualificationNeedsLegs(node) ? 'qual-structure--legs' : 'qual-structure--none'"
                      >
                        {{ qualificationStructure(node) }}
                      </div>
                    </template>
                  </div>
                </td>
                <td class="td-cycles">
                  <div class="cycle-grid">
                    <div
                      v-for="c in cycleBoxes(node)"
                      :key="`${node.id}-c-${c.index}`"
                      class="cycle-cell"
                    >
                      <div
                        class="cycle-box"
                        :class="[
                          'cycle-box--' + c.status,
                          { 'cycle-box--locked': c.locked }
                        ]"
                      >
                        <span class="cycle-box__code">{{ c.shortLabel || ('C' + c.index) }}</span>
                        <i v-if="c.locked" class="fas fa-lock cycle-box__lock"></i>
                      </div>
                      <span class="cycle-label" :class="'cycle-label--' + c.status">{{ cycleStatusText(c) }}</span>
                    </div>
                  </div>
                </td>
                <td class="td-residual">
                  <div class="residual-compact" :title="residualTooltip(node)">
                    Bs {{ Number(node.residual_bonus || 0).toFixed(0) }}
                    <span class="residual-compact__note">(informativo)</span>
                  </div>
                </td>
                <td class="td-rank-bonus">
                  <strong v-if="recalificationAmount(node) > 0">Bs {{ recalificationAmount(node).toFixed(2) }}</strong>
                  <span v-else class="td-zero">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="table-card save-bar" v-if="hasPreviewData">
        <div class="table-card__footer table-card__footer--solo">
          <button v-if="!saving" class="btn-guardar" @click="save">
            💾 Confirmar y Guardar Cierre
          </button>
          <button v-else class="btn-guardar btn-guardar--loading" disabled>
            ⏳ Guardando en base de datos...
          </button>
        </div>
      </div>

      <!-- ─── History Section ─── -->
      <div class="section-divider"><span>📂 Historial de Cierres</span></div>

      <div v-if="!closeds.length" class="empty-state">
        <span>📭</span>
        <p>No hay cierres registrados aún.</p>
      </div>

      <div class="table-card historical-card" v-for="(cl, ci) in closeds" :key="ci">
        <!-- Closed Header -->
        <div class="table-card__header clickable" @click="cl._open = !cl._open">
          <div class="historical-title-group">
            <h2 class="table-card__title">📅 {{ cl.date | date }}</h2>
            <div class="historical-chips">
              <span class="chip chip--purple">{{ (cl.users || []).length }} usuarios</span>
              <span class="chip chip--green" v-if="cl.data && cl.data.bonus_transactions">
                {{ cl.data.bonus_transactions }} transacciones
              </span>
              <span class="chip chip--blue" v-if="cl.data && cl.data.duration_ms">
                ⚡ {{ cl.data.duration_ms }}ms
              </span>
              <span class="chip chip--orange" v-if="cl.data && cl.data.reset_transactions">
                🧹 {{ cl.data.reset_transactions }} reset virtual
              </span>
              <span
                class="chip chip--accent"
                v-if="cl.data && cl.data.rank_bonus_total != null && Number(cl.data.rank_bonus_total) > 0"
              >
                🏆 rango Bs {{ Number(cl.data.rank_bonus_total).toFixed(2) }}
              </span>
            </div>
          </div>
          <span class="toggle-icon">{{ cl._open ? '▲' : '▼' }}</span>
        </div>

        <!-- Expandable Content -->
        <div v-if="cl._open">
          <div class="table-search">
            <input v-model="cl._search" class="search-input" placeholder="🔍 Buscar en este cierre..." />
          </div>
          <div class="table-responsive">
            <table class="cierre-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Productos</th>
                  <th>Productos del Equipo</th>
                  <th>Estado | Rango Cerrado</th>
                  <th>Periodos Calificados</th>
                  <th>Bono Residual</th>
                  <th>Bono Rango</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(user, i) in filteredHistory(cl)" :key="i">
                  <td class="td-num">{{ i + 1 }}</td>
                  <td class="td-name">
                    {{ user.name }}
                    <div class="user-dni-sub">
                      <div v-if="user.token || user.id || user.user_id">Usuario: {{ user.token || user.id || user.user_id }}</div>
                      <div v-if="user.dni">CI: {{ user.dni }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="personal-products-breakdown">
                      <div v-if="user.personal_affiliations > 0" class="sub-detail">Afiliaciones: {{ user.personal_affiliations }} {{ user.personal_affiliations === 1 ? 'producto' : 'productos' }}</div>
                      <div v-if="user.personal_recompras > 0" class="sub-detail">Recompras: {{ user.personal_recompras }} {{ user.personal_recompras === 1 ? 'producto' : 'productos' }}</div>
                      <div class="group-total" :style="(user.personal_affiliations > 0 || user.personal_recompras > 0) ? 'margin-top: 4px; padding-top: 4px; border-top: 1px dashed #e2e8f0;' : ''">
                        Total: {{ displayPersonalProducts(user) }} {{ displayPersonalProducts(user) === 1 ? 'producto' : 'productos' }}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="group-points-wrapper">
                      <div class="group-total">Total: {{ displayTeamProducts(user) }}</div>
                      <div
                        v-if="user.grouped_points_legs && user.grouped_points_legs.length"
                        class="group-legs-array"
                      >
                        <div class="legs-list">
                          <div
                            v-for="(leg, idx) in user.grouped_points_legs"
                            :key="`hist-${ci}-${i}-leg-${idx}`"
                            class="legs-list-item"
                          >
                            <span class="legs-user">
                              {{ leg.name || 'Sin nombre' }} · Usuario {{ leg.token || leg.dni || '-' }}
                            </span>
                            <span class="legs-points">{{ displayLegTeamProducts(leg) }} prod.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="rank-badge rank-activo" style="margin-right: 4px;">ACTIVO</span>
                    <span style="color: #cbd5e0; margin-right: 4px;">|</span>
                    <span class="rank-badge" :class="rankClass(user.rank)">{{ !user.rank || user.rank === 'none' ? 'Sin rango' : user.rank }}</span>
                  </td>
                  <td class="td-num">{{ user.qualified_periods != null ? user.qualified_periods : '—' }}</td>
                  <td class="td-bonus td-bonus--detail td-bonus--residual">
                    <template v-if="user.residual_bonus > 0">
                      <strong class="residual-amt">Bs {{ user.residual_bonus.toFixed(2) }}</strong>
                      <div class="residual-realtime-note">Pagado en tiempo real</div>
                      <ul
                        v-if="user.residual_lines && user.residual_lines.length"
                        class="residual-lines residual-lines--compact"
                      >
                        <li v-for="(ln, ri) in user.residual_lines" :key="`hist-${ci}-${i}-res-${ri}`">
                          <span class="residual-lines__lvl">Nv.{{ ln.level }}</span>
                          {{ ln.name || '—' }}
                          <span class="residual-lines__meta">· PR {{ Number(ln.pr || 0).toFixed(0) }}</span>
                          <span class="residual-lines__meta">· {{ formatResidualPct(ln.percentage) }}</span>
                          <span class="residual-lines__amt">→ Bs {{ Number(ln.amount || 0).toFixed(2) }}</span>
                        </li>
                      </ul>
                    </template>
                    <span v-else class="td-zero">—</span>
                  </td>
                  <td class="td-rank-bonus">
                    <template v-if="rankBonusForUser(cl, user.user_id || user.userId).total > 0">
                      <strong>Bs {{ rankBonusForUser(cl, user.user_id || user.userId).total.toFixed(2) }}</strong>
                      <ul class="rank-bonus-lines">
                        <li v-for="(ln, li) in rankBonusForUser(cl, user.user_id || user.userId).lines" :key="`hist-rb-${ci}-${i}-${li}`">
                          <span class="rank-bonus-tipo">{{ ln.tipo }}</span>
                          {{ ln.rank }} · Bs {{ Number(ln.amount).toFixed(2) }}
                        </li>
                      </ul>
                    </template>
                    <span v-else class="td-zero">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-if="cl.data && cl.data.virtual_balance_resets && cl.data.virtual_balance_resets.length"
            class="virtual-reset-hist"
          >
            <h3 class="virtual-reset-hist__title">🧹 Saldo no disponible retirado en este cierre</h3>
            <div class="table-responsive">
              <table class="cierre-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>DNI</th>
                    <th>Monto quitado (Bs)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(vr, vi) in cl.data.virtual_balance_resets" :key="vi">
                    <td class="td-num">{{ vi + 1 }}</td>
                    <td class="td-name">{{ vr.name || '—' }}</td>
                    <td>{{ vr.dni || '—' }}</td>
                    <td class="td-bonus td-bonus--out">Bs {{ Number(vr.amount || 0).toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="historical-meta" v-if="cl.data">
            <span>👥 Procesados: {{ cl.data.users_processed || 0 }}</span>
            <span>💳 Transacciones: {{ cl.data.bonus_transactions || 0 }}</span>
            <span>🔄 Resets: {{ cl.data.reset_transactions || 0 }}</span>
            <span v-if="cl.data.rank_bonus_applied_count != null">🏆 Bonos rango: {{ cl.data.rank_bonus_applied_count }}</span>
          </div>
        </div>
      </div>

    </section>
  </Layout>
</template>

<script>
import Layout from '@/views/Layout'
import api    from '@/api'

/**
 * Rangos "Bronce en adelante" para la card.
 * El motor Go (`cierre_engine`) usa nombres en ESPAÑOL mayúsculas: BRONCE, PLATA, ORO, RUBÍ, …
 * El admin antiguo podía usar inglés (star, silver, …). Normalizamos tildes y mayúsculas.
 * @see server/cierre_engine/engine/config.go — Ranks (excluimos ACTIVO).
 */
const RANKS_BRONCE_ADELANTE = new Set([
  // Motor Go (español)
  'bronce',
  'plata',
  'oro',
  'rubi',
  'esmeralda',
  'diamante',
  'doble diamante',
  'triple diamante',
  'diamante imperial',
  'diamante corona',
  'embajador sifrah',
  // Legacy inglés / admin
  'star',
  'master',
  'silver',
  'gold',
  'sapphire',
  'ruby',
  'diamante estrella',
])

/** Misma clave que el motor usa para comparar (sin tildes, minúsculas). */
function normalizeRankKey(rank) {
  return String(rank || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function isRankPlataOrAbove(rank) {
  const k = normalizeRankKey(rank)
  if (!k || k === 'bronce' || k === 'activo' || k === 'none') return false
  return RANKS_BRONCE_ADELANTE.has(k)
}

export default {
  components: { Layout },
  data() {
    return {
      loading:      true,
      calculating:  false,
      tree:         [],
      affiliations: [],
      activations:  [],
      closeds:      [],
      virtualResets: [],
      saving:       false,
      search:       '',
    }
  },
  created() {
    const account = JSON.parse(localStorage.getItem('session'))
    this.$store.commit('SET_ACCOUNT', account)
    this.GET()
  },
  filters: {
    date(val) {
      return new Date(val).toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' })
    },
  },
  computed: {
    totalResidual() {
      return (this.tree || []).reduce((sum, n) => sum + (n.residual_bonus || 0), 0)
    },
    totalRankBonus() {
      return (this.tree || []).reduce((sum, n) => sum + (Number(n.rank_bonus_total) || 0), 0)
    },
    previewRankBonusLogroCount() {
      return (this.tree || []).reduce((acc, node) => {
        const lines = node.rank_bonus_lines || []
        return acc + lines.filter((l) => l.tipo === 'logro').length
      }, 0)
    },
    previewRankBonusMantCount() {
      return (this.tree || []).reduce((acc, node) => {
        const lines = node.rank_bonus_lines || []
        return acc + lines.filter((l) => l.tipo === 'mantenimiento').length
      }, 0)
    },
    totalPreviewCierre() {
      return this.totalResidual + this.totalRankBonus
    },
    hasPreviewData() {
      return (
        (this.tree && this.tree.length > 0) ||
        (this.virtualResets && this.virtualResets.length > 0)
      )
    },
    totalVirtualReset() {
      return (this.virtualResets || []).reduce(
        (s, r) => s + (Number(r.amount) || 0),
        0
      )
    },
    /** Card: Plata en adelante. */
    usersWithRank() {
      return (this.tree || []).filter((e) => isRankPlataOrAbove(e.max_rank || e.rank)).length
    },
    activosFull() {
      return (this.tree || []).filter(e => e.activated).length
    },
    filteredTree() {
      const q = this.search.toLowerCase()
      return (this.tree || [])
        .filter((e) => {
          if (!q) return true
          const name = (e.name || '').toLowerCase()
          const dni = String(e.dni || '').toLowerCase()
          const token = String(e.token || '').toLowerCase()
          return name.includes(q) || dni.includes(q) || token.includes(q)
        })
    },
  },
  methods: {
    displayPersonalProducts(row) {
      if (!row) return 0
      if (row.personal_products != null) return Number(row.personal_products) || 0
      return Number(row.points) || 0
    },
    displayTeamProducts(row) {
      if (!row) return 0
      if (row.team_products != null) return Number(row.team_products) || 0
      return Number(row._total != null ? row._total : row.total_points || row.total) || 0
    },
    displayLegTeamProducts(leg) {
      if (!leg) return 0
      if (leg.team_products != null) return Number(leg.team_products) || 0
      return Number(leg.total_points) || 0
    },
    teamLegsWithProducts(row) {
      const legs = (row && row.grouped_points_legs) || []
      return legs.filter((leg) => this.displayLegTeamProducts(leg) > 0).slice(0, 4)
    },
    isMonthlyActive(row) {
      if (!row) return false
      if (row.monthly_active != null) return !!row.monthly_active
      return !!(row.activated || row._activated)
    },
    achievedRank(row) {
      if (!row) return ''
      return row.max_rank || row.rank || ''
    },
    rankLabel(rank) {
      const k = String(rank || '').trim()
      if (!k || k.toLowerCase() === 'none' || k.toLowerCase() === 'activo') return 'Sin rango'
      return k
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
    },
    qualificationOf(row) {
      return (row && row.qualification) || {}
    },
    qualificationTitle(row) {
      const q = this.qualificationOf(row)
      if (q.title) return q.title
      return this.isMonthlyActive(row) ? 'Buscando rango' : 'Sin calificación'
    },
    qualificationSubtitle(row) {
      const q = this.qualificationOf(row)
      if (!this.isMonthlyActive(row)) {
        return q.subtitle || 'Usuario inactivo. No acumula volumen ni requisitos.'
      }
      if (!this.qualificationHasProgress(row)) {
        return 'Comienza a calificar en el próximo ciclo.'
      }
      return q.subtitle || ''
    },
    qualificationHasProgress(row) {
      if (!this.isMonthlyActive(row)) return false
      const q = this.qualificationOf(row)
      const volume = Number(q.volumeCurrent) || 0
      const structure = Number(q.structureCurrent) || 0
      const cycles = this.cycleBoxes(row)
      const advanced = cycles.some((c) => c.status === 'completed' || c.status === 'in_progress')
      return volume > 0 || structure > 0 || advanced
    },
    residualTooltip(row) {
      const lines = (row && row.residual_lines) || []
      if (!lines.length) return 'Bono residual informativo'
      return lines
        .slice(0, 8)
        .map((ln) => `Nivel ${ln.level} · ${ln.name || '—'} · Bs ${Number(ln.amount || 0).toFixed(2)}`)
        .join('\n')
    },
    qualificationVolume(row) {
      const q = this.qualificationOf(row)
      const current = Number(q.volumeCurrent) || 0
      const required = Number(q.volumeRequired) || 0
      return current + ' / ' + required
    },
    qualificationVolumePct(row) {
      const q = this.qualificationOf(row)
      const required = Number(q.volumeRequired) || 0
      if (!required) return 0
      return Math.min(100, Math.round(((Number(q.volumeCurrent) || 0) / required) * 100))
    },
    qualificationStructure(row) {
      const q = this.qualificationOf(row)
      const required = Number(q.structureRequired) || 0
      if (!required) return 'Sin requisito de líneas'
      const label = q.structureLabel || 'Piernas requeridas'
      return label + ': ' + (q.structureCurrent || 0) + ' / ' + required
    },
    qualificationNeedsLegs(row) {
      const q = this.qualificationOf(row)
      return !!(q.needsLegs || Number(q.structureRequired) > 0)
    },
    cycleBoxes(row) {
      const cycles = row && row.rank_cycle && Array.isArray(row.rank_cycle.cycles)
        ? row.rank_cycle.cycles
        : []
      if (cycles.length) return cycles
      return [1, 2, 3, 4].map((index) => ({
        index,
        shortLabel: 'C' + index,
        status: 'pending',
        locked: false,
      }))
    },
    cycleStatusText(c) {
      if (!c) return 'Pendiente'
      if (c.statusLabel) return c.statusLabel
      if (c.status === 'completed') return 'Completado'
      if (c.status === 'in_progress') return 'En curso'
      return 'Pendiente'
    },
    recalificationAmount(row) {
      if (!row) return 0
      const rec = Number(row.recalification_bonus)
      if (rec > 0) return rec
      return Number(row.rank_bonus_total) || 0
    },
    rankClass(rank) {
      if (!rank || this.rankLabel(rank) === 'Sin rango') return 'rank-none'
      return 'rank-' + String(rank).toLowerCase().replace(/ /g, '-')
    },
    /** Porcentaje residual del motor Go (ej. 0.05 → 5.00%). */
    formatResidualPct(p) {
      const n = Number(p)
      if (!Number.isFinite(n)) return '—'
      return (n * 100).toFixed(2) + '%'
    },
    filteredHistory(cl) {
      const q = (cl._search || '').toLowerCase()
      return (cl.users || []).filter((u) => {
        if (!q) return true
        const name = (u.name || '').toLowerCase()
        const dni = String(u.dni || '').toLowerCase()
        const token = String(u.token || '').toLowerCase()
        return name.includes(q) || dni.includes(q) || token.includes(q)
      })
    },
    rankBonusForUser(cl, userId) {
      if (!cl || !cl.data || !userId) return { total: 0, lines: [] }
      const logro = Array.isArray(cl.data.rank_bonus_logro) ? cl.data.rank_bonus_logro : []
      const mant = Array.isArray(cl.data.rank_bonus_mantenimiento) ? cl.data.rank_bonus_mantenimiento : []
      const lines = [...logro, ...mant].filter((x) => x && x.user_id === userId)
      const total = lines.reduce((s, x) => s + Number(x.amount || 0), 0)
      return { total, lines }
    },
    async GET() {
      this.loading = true
      try {
        const { data } = await api.closeds.GET()
        this.closeds = (data.closeds || []).reverse().map(c => ({ ...c, _open: false, _search: '' }))
      } catch (e) {
        console.error('Error loading closures:', e)
      } finally {
        this.loading = false
      }
    },
    async closed() {
      this.calculating = true
      try {
        const { data } = await api.closeds.POST({ action: 'new' })

        this.tree         = data.tree || []
        this.virtualResets = data.virtual_resets || []
        this.affiliations = data.affiliations  || []
        this.activations  = data.activations   || []
      } catch (e) {
        console.error('Error calculating:', e)
        const d = e.response && e.response.data
        let msg = '❌ Error al calcular el cierre.'
        if (d && (d.details || d.stderr || d.stdoutHint)) {
          msg += '\n\n' + (d.details || d.error || '')
          if (d.stderr) msg += '\n\n' + d.stderr
          else if (d.stdoutHint) msg += '\n\n(salida)\n' + d.stdoutHint
        } else {
          msg += ' Revisa la terminal donde corre Next (server) y la consola del navegador.'
        }
        alert(msg)
      } finally {
        this.calculating = false
      }
    },
    async save() {
      if (!confirm('⚠️ Está a punto de guardar el cierre. Este proceso actualizará la base de datos y NO se puede revertir. ¿Confirmar?')) return
      this.saving = true
      try {
        const { data } = await api.closeds.POST({ action: 'save', data: {
          tree:         this.tree,
          affiliations: this.affiliations,
          activations:  this.activations,
        }})
        const rb = data && data.rank_bonuses
        let extra = ''
        if (rb && !rb.error && typeof rb.totalAmount === 'number') {
          const lines = (rb.applied || []).length
          const logro = rb.logro_count != null ? rb.logro_count : (rb.applied || []).filter(x => x.tipo === 'logro').length
          const mant  = rb.mantenimiento_count != null ? rb.mantenimiento_count : (rb.applied || []).filter(x => x.tipo === 'mantenimiento').length
          extra = `\nBonos rango aplicados: Bs ${rb.totalAmount.toFixed(2)} (${lines} líneas; logro=${logro}, mant=${mant}).`
          if (lines === 0) {
            extra += `\nNota: si en preview viste bonos pero aquí sale 0, revisa DB_URL/DB_NAME (Node) vs DB_URL_DEV/PROD (Go) y/o RankBonusPayment histórico.`
          }
        } else if (rb && rb.error) {
          extra = `\n⚠️ Bonos rango: ${rb.error}`
        }
        alert(`✅ Cierre guardado exitosamente.${extra}`)
        location.reload()
      } catch (e) {
        console.error('Error saving:', e)
        alert('❌ Error al guardar el cierre.')
      } finally {
        this.saving = false
      }
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }

.cierre-wrapper {
  font-family: 'Inter', sans-serif;
  padding: 24px;
  background: #f4f6f9;
  min-height: 100vh;
}

/* ─── Header ─── */
.cierre-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 24px 32px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}
.cierre-title  { font-size: 1.6rem; font-weight: 700; color: #fff; margin: 0; }
.cierre-subtitle { font-size: 0.83rem; color: #a0aec0; margin: 4px 0 0; }

.btn-iniciar {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff; border: none;
  padding: 12px 28px; border-radius: 10px;
  font-size: 1rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(102,126,234,0.4);
}
.btn-iniciar:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102,126,234,0.5); }
.btn-iniciar:disabled, .btn-iniciar--loading { opacity: 0.7; cursor: default; }

/* ─── Summary Cards ─── */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 16px; margin-bottom: 24px;
}
.summary-card {
  background: #fff; border-radius: 12px; padding: 20px;
  display: flex; align-items: center; gap: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border-left: 4px solid #667eea;
}
.summary-card__icon { font-size: 2rem; }
.summary-card__label { display: block; font-size: 0.76rem; color: #718096; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
.summary-card__value { font-size: 1.5rem; font-weight: 700; color: #1a202c; }
.summary-card--accent { border-left-color: #d69e2e; }
.summary-card--accent2 { border-left-color: #38a169; }
.summary-card--warn { border-left-color: #dd6b20; }
.summary-card__sub { display: block; font-size: 0.72rem; color: #718096; margin-top: 4px; }

.table-card--warn { border-top: 3px solid #ed8936; }
.badge--warn { background: #fffaf0; color: #c05621; border: 1px solid #fbd38d; }
.virtual-reset-hint { margin: 0 24px 16px; font-size: 0.85rem; color: #4a5568; line-height: 1.45; }
.td-bonus--out { color: #c53030; font-weight: 600; }
.chip--orange { background: #fffaf0; color: #c05621; }
.virtual-reset-hist { padding: 16px 24px 8px; border-top: 1px solid #e2e8f0; }
.virtual-reset-hist__title { font-size: 0.95rem; margin: 0 0 12px; color: #2d3748; }
.save-bar { margin-bottom: 20px; }
.table-card__footer--solo { padding: 18px 24px; border-top: none; }

.td-rank-bonus { vertical-align: top; font-size: 0.82rem; max-width: 240px; }
.rank-bonus-lines { margin: 6px 0 0; padding-left: 1.1rem; color: #4a5568; font-size: 0.76rem; line-height: 1.35; }
.rank-bonus-tipo { text-transform: capitalize; color: #6b46c1; font-weight: 600; margin-right: 4px; }

/* ─── Table Card ─── */
.table-card {
  background: #fff; border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  margin-bottom: 20px; overflow: hidden;
}
.table-card__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 24px; border-bottom: 1px solid #e2e8f0;
}
.table-card__header.clickable { cursor: pointer; user-select: none; }
.table-card__header.clickable:hover { background: #f7fafc; }
.table-card__title { font-size: 1rem; font-weight: 600; color: #1a202c; margin: 0; }
.toggle-icon { font-size: 0.8rem; color: #a0aec0; }

.historical-title-group { display: flex; flex-direction: column; gap: 6px; }
.historical-chips { display: flex; gap: 8px; flex-wrap: wrap; }

.badge {
  font-size: 0.78rem; color: #718096; background: #f7fafc;
  padding: 4px 12px; border-radius: 20px; border: 1px solid #e2e8f0;
}
.chip {
  font-size: 0.74rem; font-weight: 600; padding: 3px 10px; border-radius: 20px;
}
.chip--purple { background: #e9d8fd; color: #553c9a; }
.chip--green  { background: #c6f6d5; color: #276749; }
.chip--blue   { background: #bee3f8; color: #2a69ac; }

/* ─── Search ─── */
.table-search { padding: 12px 24px; border-bottom: 1px solid #f0f4f8; }
.search-input {
  width: 100%; max-width: 380px;
  padding: 8px 14px; border: 1px solid #e2e8f0;
  border-radius: 8px; font-size: 0.88rem; outline: none;
  transition: border 0.2s;
}
.search-input:focus { border-color: #667eea; }

/* ─── Table ─── */
.table-responsive { overflow-x: auto; }
.cierre-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; table-layout: auto; }
.cierre-table thead th {
  background: #f8fafc; color: #334155; font-weight: 700;
  padding: 10px 12px; text-align: left;
  text-transform: uppercase; font-size: 0.68rem; letter-spacing: 0.04em;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}
.cierre-table tbody tr { border-bottom: 1px solid #f1f5f9; }
.cierre-table tbody tr:hover { background: #f8fafc; }
.cierre-table td { padding: 10px 12px; color: #2d3748; vertical-align: middle; }
.td-num   { color: #a0aec0; font-weight: 600; width: 40px; }
.td-name  { font-weight: 500; }
.user-dni-sub {
  font-size: 0.75rem;
  font-weight: 400;
  color: #64748b;
  margin-top: 4px;
  line-height: 1.2;
}
.td-bonus { font-weight: 700; color: #38a169; }
.td-bonus--detail { vertical-align: top; font-size: 0.82rem; max-width: 320px; font-weight: 400; }
.td-bonus--detail strong { font-weight: 700; color: #276749; display: block; margin-bottom: 4px; }
.residual-lines {
  margin: 6px 0 0;
  padding-left: 1.1rem;
  color: #4a5568;
  font-size: 0.76rem;
  line-height: 1.4;
  font-weight: 400;
}
.residual-lines--compact { font-size: 0.72rem; max-width: 280px; }
.residual-lines li { margin-bottom: 4px; }
.residual-lines__lvl {
  font-weight: 600;
  color: #2f855a;
  margin-right: 4px;
}
.residual-lines__meta { color: #718096; }
.residual-lines__amt { font-weight: 600; color: #276749; }
.td-zero  { color: #cbd5e0; }
.group-points-wrapper { display: flex; flex-direction: column; gap: 4px; }
.group-total { font-weight: 600; color: #2d3748; }
.group-legs-array {
  margin-top: 2px;
}
.legs-list {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 4px 6px;
  max-height: 160px;
  overflow: auto;
}
.legs-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 5px 6px;
  border-bottom: 1px dashed #e2e8f0;
  font-size: 0.78rem;
}
.legs-list-item:last-child {
  border-bottom: none;
}
.legs-user {
  color: #2d3748;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.legs-points {
  color: #1f6f43;
  font-weight: 700;
  white-space: nowrap;
}

/* ─── Rank Badges ─── */
.rank-badge {
  display: inline-block; padding: 4px 10px; border-radius: 999px;
  font-size: 0.72rem; font-weight: 600;
  letter-spacing: 0.02em; white-space: nowrap;
}
.rank-none { background: #eef2f7; color: #64748b; text-transform: none; }
.status-pill {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
}
.status-pill--on { background: #16a34a; color: #fff; }
.status-pill--off { background: #ef4444; color: #fff; }
.rank-bronce   { background: #fef3c7; color: #92400e; }
.rank-plata    { background: #ebf4ff; color: #2b6cb0; }
.rank-oro      { background: #fffbeb; color: #b7791f; border: 1px solid #f6e05e; }
.rank-rubi,
.rank-diamante,
.rank-doble-diamante,
.rank-triple-diamante,
.rank-diamante-estrella { background: #faf5ff; color: #553c9a; border: 1px solid #d6bcfa; }
.rank-none { background: #eef2f7; color: #64748b; text-transform: none; }

/* ─── Save Button ─── */
.table-card__footer { padding: 18px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; }
.btn-guardar {
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: #fff; border: none; padding: 12px 32px;
  border-radius: 10px; font-size: 1rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(72,187,120,0.35);
}
.btn-guardar:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(72,187,120,0.5); }
.btn-guardar--loading { opacity: 0.7; cursor: default; }

/* ─── Section Divider ─── */
.section-divider {
  display: flex; align-items: center;
  text-transform: uppercase; font-size: 0.74rem;
  font-weight: 700; color: #a0aec0; letter-spacing: 0.08em;
  margin: 8px 0 20px;
}
.section-divider::before,
.section-divider::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }
.section-divider::before { margin-right: 12px; }
.section-divider::after  { margin-left: 12px; }

/* ─── Historical Meta ─── */
.historical-meta {
  display: flex; gap: 24px; flex-wrap: wrap;
  padding: 12px 24px; font-size: 0.82rem;
  color: #718096; border-top: 1px solid #e2e8f0;
  background: #f7fafc;
}

/* ─── Empty State ─── */
.empty-state { text-align: center; padding: 48px; color: #a0aec0; }
.empty-state span { font-size: 3rem; display: block; margin-bottom: 12px; }

.historical-card { margin-bottom: 14px; }

.sub-detail { font-size: 0.85rem; color: #4a5568; line-height: 1.4; }

.td-bonus--residual .residual-amt { color: #718096 !important; }
.residual-realtime-note { font-size: 0.75rem; color: #a0aec0; font-style: italic; margin-bottom: 4px; }
.td-bonus--residual .residual-lines__amt { color: #718096; }

.td-qualification { min-width: 190px; max-width: 230px; }
.qual-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 10px;
}
.qual-title { font-weight: 700; color: #1e293b; font-size: 0.78rem; }
.qual-title--off { color: #64748b; font-weight: 600; }
.qual-sub { font-size: 0.7rem; color: #94a3b8; margin-top: 3px; line-height: 1.3; }
.qual-meter { margin-top: 6px; font-size: 0.7rem; color: #475569; }
.qual-bar {
  margin-top: 4px;
  height: 5px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}
.qual-bar__fill {
  height: 100%;
  background: #2563eb;
  border-radius: 999px;
}
.qual-structure { margin-top: 6px; font-size: 0.7rem; }
.qual-structure--none { color: #94a3b8; }
.qual-structure--legs {
  color: #9a3412;
  font-weight: 700;
  background: #fff7ed;
  border: 1px solid #fdba74;
  border-radius: 6px;
  padding: 4px 6px;
  margin-top: 8px;
}

.td-compact { min-width: 140px; }
.mini-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 10px;
  min-width: 140px;
}
.mini-card__line { font-size: 0.72rem; color: #64748b; }
.mini-card__total {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid #e2e8f0;
  font-size: 0.78rem;
  font-weight: 700;
  color: #0f172a;
}
.mini-card--team { min-width: 160px; }
.mini-legs { margin-top: 6px; display: flex; flex-direction: column; gap: 3px; }
.mini-leg {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.68rem;
}
.mini-leg__name {
  color: #475569;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mini-leg__pts { color: #15803d; font-weight: 700; }

.td-cycles { min-width: 196px; }
.cycle-grid {
  display: grid;
  grid-template-columns: repeat(4, 42px);
  gap: 8px;
}
.cycle-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.cycle-box {
  width: 36px;
  height: 36px;
  border-radius: 7px;
  border: 1.5px solid #dbe3ee;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  font-size: 0.68rem;
  font-weight: 700;
  color: #64748b;
}
.cycle-box--completed {
  background: #16a34a;
  border-color: #16a34a;
  color: #fff;
}
.cycle-box--locked {
  background: #111827;
  border-color: #111827;
  color: #fff;
}
.cycle-box--in_progress {
  background: #fff;
  border-color: #2563eb;
  color: #2563eb;
}
.cycle-box--pending {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #94a3b8;
}
.cycle-box__lock { font-size: 0.55rem; line-height: 1; }
.cycle-label {
  font-size: 0.58rem;
  text-align: center;
  color: #94a3b8;
  line-height: 1.15;
  width: 100%;
}
.cycle-label--completed { color: #16a34a; font-weight: 600; }
.cycle-label--in_progress { color: #2563eb; font-weight: 600; }

.td-residual { white-space: nowrap; }
.residual-compact { font-size: 0.8rem; font-weight: 600; color: #334155; }
.residual-compact__note { color: #94a3b8; font-weight: 500; font-size: 0.72rem; }
.td-rank-bonus { white-space: nowrap; }
</style>
