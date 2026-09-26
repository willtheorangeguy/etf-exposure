// migrate-entry: runs migrations then exits. Invoked via tsx-free approach:
// a tiny compiled-free entry that imports the migrate function.
import { migrate } from "./migrate";

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
