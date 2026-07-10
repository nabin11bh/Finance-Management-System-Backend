import app from "./src/app";

const PORT = 3001;

app.listen(PORT, () => {
  console.log(` Finance backend running on http://localhost:${PORT}`);
});