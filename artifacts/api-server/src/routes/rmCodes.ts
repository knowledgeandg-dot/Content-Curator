import { Router, type IRouter } from "express";
import { db, rmCodesTable, eq } from "@workspace/db";
import {
  CreateRmCodeBody,
  UpdateRmCodeBody,
  UpdateRmCodeParams,
  DeleteRmCodeParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function requireCrm(req: any, res: any): boolean {
  if (!req.session?.userId || req.session.userType !== "crm") {
    res.status(403).json({ error: "CRM access required" });
    return false;
  }
  return true;
}

router.get("/rm-codes", async (req, res): Promise<void> => {
  if (!requireCrm(req, res)) return;

  const codes = await db.select().from(rmCodesTable).orderBy(rmCodesTable.rmCode);
  const result = codes.map((c) => ({
    id: c.id,
    rmCode: c.rmCode,
    salesPersonName: c.salesPersonName,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
  }));

  res.json(result);
});

router.post("/rm-codes", async (req, res): Promise<void> => {
  if (!requireCrm(req, res)) return;

  const parsed = CreateRmCodeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [code] = await db
    .insert(rmCodesTable)
    .values({
      rmCode: parsed.data.rmCode,
      salesPersonName: parsed.data.salesPersonName,
      status: parsed.data.status,
    })
    .returning();

  res.status(201).json({
    id: code.id,
    rmCode: code.rmCode,
    salesPersonName: code.salesPersonName,
    status: code.status,
    createdAt: code.createdAt.toISOString(),
  });
});

router.patch("/rm-codes/:id", async (req, res): Promise<void> => {
  if (!requireCrm(req, res)) return;

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateRmCodeParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateRmCodeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateValues: Record<string, unknown> = {};
  if (parsed.data.rmCode !== undefined) updateValues.rmCode = parsed.data.rmCode;
  if (parsed.data.salesPersonName !== undefined)
    updateValues.salesPersonName = parsed.data.salesPersonName;
  if (parsed.data.status !== undefined) updateValues.status = parsed.data.status;

  const [code] = await db
    .update(rmCodesTable)
    .set(updateValues)
    .where(eq(rmCodesTable.id, params.data.id))
    .returning();

  if (!code) {
    res.status(404).json({ error: "RM Code not found" });
    return;
  }

  res.json({
    id: code.id,
    rmCode: code.rmCode,
    salesPersonName: code.salesPersonName,
    status: code.status,
    createdAt: code.createdAt.toISOString(),
  });
});

router.delete("/rm-codes/:id", async (req, res): Promise<void> => {
  if (!requireCrm(req, res)) return;

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteRmCodeParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [code] = await db
    .delete(rmCodesTable)
    .where(eq(rmCodesTable.id, params.data.id))
    .returning();

  if (!code) {
    res.status(404).json({ error: "RM Code not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
