import db from "../../database/index.js";

//order_id,action,reason,actor_snapshot,old_value,new_value,actor_type,actor_id
async function createNewLogRecord(data, t) {
  await db.AuditLog.create(data, { transaction: t });
}
async function createBulkNewLogRecords(data, t) {
  await db.AuditLog.bulkCreate(data, { transaction: t });
}
const auditLogsRepository = { createNewLogRecord, createBulkNewLogRecords };
export default auditLogsRepository;
