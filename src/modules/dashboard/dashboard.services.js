export async function SPFinancialConsole() {
  // gross sales - one value - all orders (active - pending completion - completed)
  // escrow      - one value - all orders (pending completion)
  // balance     - one value - all payouts (-- paid)
  // each order should describe the status and summarize the situation
  // actions (go to dispute - close the order)
  // i should create a route for all the orders with filtration
  return { success: true };
}

const dashboardServices = { SPFinancialConsole };
export default dashboardServices;
