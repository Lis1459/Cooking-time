import { CookStatus } from "../../generated/prisma/enums.ts";

function parseCookStatus(status) {
  if (!Object.values(CookStatus).includes(status)) {
    throw new Error("Invalid cook status");
  }
  return status;
}
export default parseCookStatus;
