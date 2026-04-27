import { create } from 'zustand';

/**
 * Store de UI global con Zustand.
 * Maneja estado transversal de interfaz: modales, notificaciones, navbar.
 */
const useUIStore = create((set) => ({
  // --- Estado del modal de separación ---
  separationModalOpen: false,
  selectedDepartment: null,
  selectedProject: null,

  // openSeparationModal acepta depto + proyecto opcional
  // Si no se pasa proyecto, intenta tomar department.proyecto (cuando viene del endpoint de disponibles)
  openSeparationModal: (department, project = null) =>
    set({
      separationModalOpen: true,
      selectedDepartment: department,
      selectedProject: project || department?.proyecto || null,
    }),
  closeSeparationModal: () =>
    set({ separationModalOpen: false, selectedDepartment: null, selectedProject: null }),

  // --- Estado del modal de detalle de departamento ---
  departmentModalOpen: false,
  departmentModalData: null,

  openDepartmentModal: (department) =>
    set({ departmentModalOpen: true, departmentModalData: department }),
  closeDepartmentModal: () =>
    set({ departmentModalOpen: false, departmentModalData: null }),

  // --- Notificaciones toast ---
  toast: null, // { message: string, type: 'success' | 'error' | 'info' }

  showToast: (message, type = 'info') => {
    set({ toast: { message, type } });
    // Auto-ocultar después de 4 segundos
    setTimeout(() => set({ toast: null }), 4000);
  },
  hideToast: () => set({ toast: null }),

  // --- Navbar scroll state ---
  navbarScrolled: false,
  setNavbarScrolled: (scrolled) => set({ navbarScrolled: scrolled }),

  // --- Menú móvil ---
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  toggleMobileMenu: () =>
    set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
}));

export default useUIStore;
