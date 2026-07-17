import { Router, type IRouter } from "express";
import { db, activityLogsTable, desc } from "@workspace/db";
import { GetActivityLogsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/activity-logs", async (req, res): Promise<void> => {
  if (!req.session?.userId || req.session.userType !== "crm") {
    res.status(403).json({ error: "CRM access required" });
    return;
  }

  const queryParsed = GetActivityLogsQueryParams.safeParse(req.query);
  const params = queryParsed.success ? queryParsed.data : {};
  const limit = params.limit ?? 100;
  const offset = params.offset ?? 0;

  const logs = await db
    .select()
    .from(activityLogsTable)
    .orderBy(desc(activityLogsTable.createdAt))
    .limit(limit)
    .offset(offset);

  const result = logs.map((l) => ({
    id: l.id,
    userName: l.userName,
    action: l.action,
    plotNumber: l.plotNumber,
    oldData: l.oldData ?? null,
    newData: l.newData ?? null,
    createdAt: l.createdAt.toISOString(),
  }));

  res.json(result);
});

export default router;
