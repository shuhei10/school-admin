import { app } from "./routes/app";

const PORT = Number(process.env.PORT ?? 3001);

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

export default app;