import { app } from "./src/routes/app";

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});