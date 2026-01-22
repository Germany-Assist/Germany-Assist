import orderRepository from "../order/order.repository.js";
import dashboardRepository from "./dashboard.repository.js";
import ordersMapper from "../order/order.mapper.js";
import serviceServices from "../service/service.services.js";
import serviceMappers from "../service/service.mappers.js";
export async function SPFinancialConsole(SPId) {
  const [grossTotal, escrow, balance, disputes, orders] = await Promise.all([
    dashboardRepository.totalGross({ serviceProviderId: SPId }),
    dashboardRepository.totalEscrow({ serviceProviderId: SPId }),
    dashboardRepository.totalBalance({ serviceProviderId: SPId }),
    dashboardRepository.disputes({ serviceProviderId: SPId }),
    orderRepository.getOrdersForSP(SPId),
  ]);
  return {
    success: true,
    data: {
      grossTotal: grossTotal / 100,
      escrow: escrow / 100,
      balance: balance / 100,
      disputes,
      orders: { ...orders, data: ordersMapper.sanitizeOrders(orders.data) },
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
