import app from "./src/app";
import {env} from "./src/config/env"


app.listen(env.PORT, () => {
  console.log(` Finance backend running on http://localhost:${env.PORT}`);
});