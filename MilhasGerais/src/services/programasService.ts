// programasService.ts
// Os "programas" do frontend são derivados dos UserProfiles no backend.
// Não existe um endpoint /api/programas — os dados vêm de /api/dashboard/resumo.
// Este arquivo é mantido por compatibilidade mas redireciona ao dashboardService.
export { dashboardService as programasService } from './dashboardService';
