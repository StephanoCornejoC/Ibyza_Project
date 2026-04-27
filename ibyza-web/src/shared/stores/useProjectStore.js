import { create } from 'zustand';

/**
 * Store de proyectos con Zustand.
 * Cachea los datos de proyectos para evitar re-fetching innecesario
 * al navegar entre páginas dentro de la misma sesión.
 */
const useProjectStore = create((set, get) => ({
  // --- Lista de proyectos ---
  projects: [],
  projectsLoaded: false,

  setProjects: (projects) => set({ projects, projectsLoaded: true }),
  clearProjects: () => set({ projects: [], projectsLoaded: false }),

  // --- Proyecto detalle (cache por slug) ---
  // Estructura: { [slug]: { data, departments, advances } }
  projectCache: {},

  setProjectDetail: (slug, data) =>
    set((state) => ({
      projectCache: {
        ...state.projectCache,
        [slug]: { ...state.projectCache[slug], data },
      },
    })),

  setProjectDepartments: (slug, departments) =>
    set((state) => ({
      projectCache: {
        ...state.projectCache,
        [slug]: { ...state.projectCache[slug], departments },
      },
    })),

  setProjectAdvances: (slug, advances) =>
    set((state) => ({
      projectCache: {
        ...state.projectCache,
        [slug]: { ...state.projectCache[slug], advances },
      },
    })),

  getProjectFromCache: (slug) => get().projectCache[slug] || null,

  // --- Filtros activos en la página de proyectos ---
  filters: {
    estado: '',   // 'disponible' | 'separado' | 'vendido' | ''
    tipo: '',     // '1dorm' | '2dorm' | '3dorm' | ''
  },

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  clearFilters: () =>
    set({ filters: { estado: '', tipo: '' } }),
}));

export default useProjectStore;
