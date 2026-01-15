import orderRepository from "../order/order.repository.js";
import dashboardRepository from "./dashboard.repository.js";
import ordersMapper from "../order/order.mapper.js";
export async function SPFinancialConsole(SPId) {
  // gross sales - one value - all orders (active - pending completion - completed)
  // escrow      - one value - all orders (pending completion)
  // balance     - one value - all payouts (-- paid)
  // disputes
  // each order should describe the status and summarize the situation
  // actions (go to dispute - close the order)
  // i should create a route for all the orders with filtration
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
