import dashboardRepository from "./dashboard.repository.js";

export async function SPFinancialConsole(SPId) {
  const [grossTotal, escrow, balance, disputes, orders] = await Promise.all([
    dashboardRepository.totalGross({ serviceProviderId: SPId }),
    dashboardRepository.totalEscrow({ serviceProviderId: SPId }),
    dashboardRepository.totalBalance({ serviceProviderId: SPId }),
    dashboardRepository.disputes({ serviceProviderId: SPId }),
  ]);
  return {
    success: true,
    data: {
      grossTotal: grossTotal / 100,
      escrow: escrow / 100,
      balance: balance / 100,
      disputes,
    },
  };
}
export async function adminStatisticalFinance() {
  const [grossTotal, escrow, disputes] = await Promise.all([
    dashboardRepository.totalGross(),
    dashboardRepository.totalEscrow(),
    dashboardRepository.disputes(),
  ]);
  return {
    success: true,
    data: {
      grossTotal: grossTotal / 100,
      escrow: escrow / 100,
      disputes,
    },
  };
}
export async function adminStatisticalServices() {
  const [
    totalServices,
    totalLiveServices,
    totalPendingServices,
    totalRejectedServices,
  ] = await Promise.all([
    dashboardRepository.totalServices(),
    dashboardRepository.totalLiveServices(),
    dashboardRepository.totalPendingServices(),
    dashboardRepository.totalRejectedServices(),
  ]);
  return {
    success: true,
    data: {
      totalServices,
      totalLiveServices,
      totalPendingServices,
      totalRejectedServices,
    },
  };
}
const dashboardServices = {
  SPFinancialConsole,
  adminStatisticalServices,
  adminStatisticalFinance,
};
export default dashboardServices;
