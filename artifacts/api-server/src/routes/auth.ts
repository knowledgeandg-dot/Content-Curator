import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, crmUsersTable, rmCodesTable, eq } from "@workspace/db";
import { LoginCrmBody, LoginRmBody } from "@workspace/api-zod";

declare module "express-session" {
  interface SessionData {
    userId?: number;
    userType?: "crm" | "sales";
    userName?: string;
    userEmail?: string | null;
    userRole?: string | null;
    userRmCode?: string | null;
  }
}

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginCrmBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [user] = await db
    .select()
    .from(crmUsersTable)
    .where(eq(crmUsersTable.email, email));

  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  req.session.userId = user.id;
  req.session.userType = "crm";
  req.session.userName = user.name;
  req.session.userEmail = user.email;
  req.session.userRole = user.role;
  req.session.userRmCode = null;

  res.json({
    type: "crm",
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    rmCode: null,
  });
});

router.post("/auth/login-rm", async (req, res): Promise<void> => {
  const parsed = LoginRmBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { rmCode } = parsed.data;

  const [rm] = await db
    .select()
    .from(rmCodesTable)
    .where(eq(rmCodesTable.rmCode, rmCode));

  if (!rm) {
    res.status(401).json({ error: "Invalid RM Code" });
    return;
  }

  if (rm.status !== "Active") {
    res.status(401).json({ error: "RM Code is inactive" });
    return;
  }

  req.session.userId = rm.id;
  req.session.userType = "sales";
  req.session.userName = rm.salesPersonName;
  req.session.userEmail = null;
  req.session.userRole = null;
  req.session.userRmCode = rm.rmCode;

  res.json({
    type: "sales",
    id: rm.id,
    name: rm.salesPersonName,
    email: null,
    role: null,
    rmCode: rm.rmCode,
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  if (!req.session.userId || !req.session.userType) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.json({
    type: req.session.userType,
    id: req.session.userId,
    name: req.session.userName ?? "",
    email: req.session.userEmail ?? null,
    role: req.session.userRole ?? null,
    rmCode: req.session.userRmCode ?? null,
  });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

export default router;
