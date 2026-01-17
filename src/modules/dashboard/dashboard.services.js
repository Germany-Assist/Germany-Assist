import orderRepository from "../order/order.repository.js";
import dashboardRepository from "./dashboard.repository.js";
import ordersMapper from "../order/order.mapper.js";
export async function SPFinancialConsole(SPId) {
  const [grossTotal, escrow, balance, disputes, orders] = await Promise.all([
    dashboardRepository.grossTotalForSP(SPId),
    dashboardRepository.escrowForSP(SPId),
    dashboardRepository.balanceForSP(SPId),
    dashboardRepository.disputesForSP(SPId),
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

const dashboardServices = { SPFinancialConsole };
export default dashboardServices;
