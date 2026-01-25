import dashboardServices from "./dashboard.services.js";
import authUtil from "../../utils/authorize.util.js";
export async function SPFinancialConsole(req, res, next) {
  try {
    const user = await authUtil.checkRoleAndPermission(
      req.auth,
      ["service_provider_root", "service_provider_rep"],
      true,
      "financial",
      "access",
    );
    const results = await dashboardServices.SPFinancialConsole(
      req.auth.relatedId,
    );
    res.send(results);
  } catch (error) {
    next(error);
  }
}
export async function adminStatisticalFinance(req, res, next) {
  try {
    const user = await authUtil.checkRoleAndPermission(
      req.auth,
      ["admin", "super_admin"],
      true,
      "view",
      "analytics",
    );
    const results = await dashboardServices.adminStatisticalFinance();
    res.send(results);
  } catch (error) {
    next(error);
  }
}
export async function adminStatisticalServices(req, res, next) {
  try {
    const user = await authUtil.checkRoleAndPermission(
      req.auth,
      ["admin", "super_admin"],
      true,
      "service",
      "statistical",
    );
    const results = await dashboardServices.adminStatisticalServices();
    res.send(results);
  } catch (error) {
    next(error);
  }
}
const dashboardController = {
  SPFinancialConsole,
  adminStatisticalServices,
  adminStatisticalFinance,
};
export default dashboardController;
