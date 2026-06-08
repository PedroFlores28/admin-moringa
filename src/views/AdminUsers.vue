<template>
  <Layout>
    <section class="section">
      <div class="container">
        <div class="level">
          <div class="level-left">
            <div>
              <h1 class="title">Administradores</h1>
              <p class="subtitle">Crear perfiles con acceso limitado por módulo.</p>
            </div>
          </div>
          <div class="level-right">
            <button class="button is-link" @click="openCreate">
              <span class="icon"><i class="fas fa-user-plus"></i></span>
              <span>Nuevo administrador</span>
            </button>
          </div>
        </div>

        <div class="table-container">
          <table class="table is-fullwidth is-striped is-hoverable">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Usuario</th>
                <th>Estado</th>
                <th>Módulos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="admin in admins" :key="admin.id">
                <td>
                  {{ admin.name }}
                  <span v-if="admin.isSuperAdmin" class="tag is-warning is-light ml-1">Principal</span>
                </td>
                <td><code>{{ admin.dni }}</code></td>
                <td>
                  <span class="tag" :class="admin.adminActive ? 'is-success' : 'is-danger'">
                    {{ admin.adminActive ? "Activo" : "Inactivo" }}
                  </span>
                </td>
                <td>
                  <span v-if="admin.isSuperAdmin" class="has-text-grey">Todos los módulos</span>
                  <span v-else>{{ (admin.permissions || []).length }} asignados</span>
                </td>
                <td class="has-text-right">
                  <button
                    class="button is-small is-info is-light"
                    :disabled="admin.isSuperAdmin"
                    @click="openEdit(admin)"
                  >
                    Editar
                  </button>
                </td>
              </tr>
              <tr v-if="!loading && !admins.length">
                <td colspan="5" class="has-text-centered py-5">Sin administradores</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="help is-danger" v-if="alert">{{ alert }}</p>
      </div>
    </section>

    <div class="modal" :class="{ 'is-active': showModal }">
      <div class="modal-background" @click="closeModal"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">{{ editing ? "Editar administrador" : "Nuevo administrador" }}</p>
          <button class="delete" aria-label="close" @click="closeModal"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Nombre completo</label>
            <div class="control">
              <input class="input" v-model="form.name" placeholder="Nombre y apellidos" />
            </div>
          </div>
          <div class="field">
            <label class="label">Usuario</label>
            <div class="control">
              <input
                class="input"
                v-model="form.username"
                placeholder="Usuario de acceso"
                :disabled="editing && editing.isSuperAdmin"
              />
            </div>
            <p class="help">Se usa para iniciar sesión en el panel.</p>
          </div>
          <div class="field">
            <label class="label">{{ editing ? "Nueva contraseña (opcional)" : "Contraseña" }}</label>
            <div class="control">
              <input
                class="input"
                type="password"
                v-model="form.password"
                minlength="6"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <p class="help" v-if="!editing">La contraseña debe tener al menos 6 caracteres.</p>
          </div>
          <p class="help is-danger modal-alert" v-if="modalAlert">{{ modalAlert }}</p>
          <div class="field" v-if="editing && !editing.isSuperAdmin">
            <label class="label">Estado</label>
            <div class="control">
              <label class="checkbox">
                <input type="checkbox" v-model="form.adminActive" />
                Cuenta activa
              </label>
            </div>
          </div>
          <div class="field" v-if="!editing || !editing.isSuperAdmin">
            <label class="label">Permisos por módulo</label>
            <div class="permissions-grid">
              <label v-for="mod in assignableModules" :key="mod.id" class="checkbox permission-item">
                <input type="checkbox" :value="mod.id" v-model="form.permissions" />
                {{ mod.label }}
              </label>
            </div>
            <p class="help">
              <button type="button" class="button is-small is-light" @click="selectAllModules">Todos</button>
              <button type="button" class="button is-small is-light" @click="clearModules">Ninguno</button>
            </p>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-link" :class="{ 'is-loading': saving }" :disabled="saving" @click="save">
            Guardar
          </button>
          <button class="button" :disabled="saving" @click="closeModal">Cancelar</button>
        </footer>
      </div>
    </div>
  </Layout>
</template>

<script>
import Layout from "@/views/Layout";
import api from "@/api";

export default {
  components: { Layout },
  data() {
    return {
      loading: true,
      saving: false,
      alert: null,
      admins: [],
      modules: [],
      showModal: false,
      modalAlert: null,
      editing: null,
      form: {
        name: "",
        username: "",
        password: "",
        permissions: [],
        adminActive: true,
      },
    };
  },
  computed: {
    assignableModules() {
      return (this.modules || []).filter((m) => m.id !== "admin-users");
    },
  },
  async created() {
    const account = JSON.parse(localStorage.getItem("adminAccount") || "null");
    this.$store.commit("SET_ACCOUNT", account);
    await this.load();
  },
  methods: {
    async load() {
      this.loading = true;
      this.alert = null;
      try {
        const { data } = await api.adminUsers.GET();
        if (data.error) {
          this.alert = data.msg || "Error al cargar";
          return;
        }
        this.admins = data.admins || [];
        this.modules = data.modules || [];
      } catch (e) {
        this.alert = "No se pudo cargar administradores";
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.form = {
        name: "",
        username: "",
        password: "",
        permissions: ["dashboard"],
        adminActive: true,
      };
    },
    translateError(msg) {
      const map = {
        "name required": "El nombre completo es obligatorio.",
        "username required": "El usuario es obligatorio.",
        "password min 6 chars": "La contraseña debe tener al menos 6 caracteres.",
        "username already exists": "Ese usuario ya existe. Elige otro.",
        "superadmin required": "Solo el administrador principal puede gestionar usuarios.",
        "forbidden module": "No tienes permiso para esta acción.",
        "invalid action": "Acción no válida.",
      };
      return map[msg] || msg || "No se pudo guardar.";
    },
    validateForm() {
      const name = String(this.form.name || "").trim();
      const username = String(this.form.username || "").trim();
      const password = String(this.form.password || "");
      if (!name) return "El nombre completo es obligatorio.";
      if (!username) return "El usuario es obligatorio.";
      if (!this.editing && password.length < 6) {
        return "La contraseña debe tener al menos 6 caracteres.";
      }
      if (this.editing && password && password.length < 6) {
        return "La nueva contraseña debe tener al menos 6 caracteres.";
      }
      if (!this.editing && (!this.form.permissions || !this.form.permissions.length)) {
        return "Selecciona al menos un módulo de acceso.";
      }
      return null;
    },
    openCreate() {
      this.editing = null;
      this.modalAlert = null;
      this.resetForm();
      this.showModal = true;
    },
    openEdit(admin) {
      this.modalAlert = null;
      this.editing = admin;
      this.form = {
        name: admin.name || "",
        username: admin.dni || "",
        password: "",
        permissions: [...(admin.permissions || [])],
        adminActive: admin.adminActive !== false,
      };
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.modalAlert = null;
      this.editing = null;
    },
    selectAllModules() {
      this.form.permissions = this.assignableModules.map((m) => m.id);
    },
    clearModules() {
      this.form.permissions = [];
    },
    async save() {
      this.saving = true;
      this.alert = null;
      this.modalAlert = null;

      const validationError = this.validateForm();
      if (validationError) {
        this.modalAlert = validationError;
        this.saving = false;
        return;
      }

      try {
        if (this.editing) {
          const upd = await api.adminUsers.POST({
            action: "update",
            id: this.editing.id,
            name: this.form.name,
            username: this.form.username,
            permissions: this.form.permissions,
            adminActive: this.form.adminActive,
          });
          if (upd.data && upd.data.error) {
            this.modalAlert = this.translateError(upd.data.msg);
            return;
          }
          if (this.form.password) {
            const pwd = await api.adminUsers.POST({
              action: "update_password",
              id: this.editing.id,
              password: this.form.password,
            });
            if (pwd.data && pwd.data.error) {
              this.modalAlert = this.translateError(pwd.data.msg);
              return;
            }
          }
        } else {
          const { data } = await api.adminUsers.POST({
            action: "create",
            name: this.form.name,
            username: this.form.username,
            password: this.form.password,
            permissions: this.form.permissions,
          });
          if (data.error) {
            this.modalAlert = this.translateError(data.msg);
            return;
          }
        }
        this.closeModal();
        await this.load();
      } catch (e) {
        const status = e && e.response && e.response.status;
        const msg = e && e.response && e.response.data && e.response.data.msg;
        if (status === 404) {
          this.modalAlert = "El servidor no tiene el módulo de administradores. Reinicia o despliega «serve».";
        } else {
          this.modalAlert = this.translateError(msg);
        }
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<style scoped>
.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px 12px;
  max-height: 280px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 6px;
}
.permission-item {
  display: block;
  font-size: 0.9rem;
}
.ml-1 {
  margin-left: 0.5rem;
}
.py-5 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}
.modal-alert {
  margin-top: 12px;
  padding: 10px 12px;
  background: #fff5f5;
  border-radius: 6px;
  font-weight: 600;
}
</style>
