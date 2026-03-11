import { app } from "./routes/app";

const PORT = Number(process.env.PORT ?? 3001);

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

app.get("/api/auth/me", (req, res) => {
  // ここはあなたの実装に合わせて名前を変える
  // 例: req.session.user が入ってる前提
  const user = (req as any).session?.user ?? null;

  if (!user) {
    return res.status(401).json({ ok: false, user: null });
  }

  return res.json({ ok: true, user });
});