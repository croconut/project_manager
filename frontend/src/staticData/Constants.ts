import crypto from "crypto";

export const TaskStage = ["To-Do", "Ongoing", "Complete", "Cancelled"] as const;
export type Stage = typeof TaskStage[number];

export const MIN_CHAR = 14;
export const MAX_CHAR = 128;
export const MIN_NO_RESTRICTIONS = 32;

// just says i need at least one uppercase, lowercase
// and one number and optionally special characters
export const PASSWORD_REQ = new RegExp(
  `^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*()_-]{${MIN_CHAR},${MAX_CHAR}}$`
);
export const USER_REGEX = new RegExp("^[A-Za-z][a-zA-Z0-9_-]*$");
export const EMAIL_REGEX = new RegExp(`^.+[@]+(?=.*[.]).+$`);

const IconGeneration = ():Array<string> => {
  const max = 640;
  const arr = Array<string>(max);
  for (let i = 0; i < max; i++) {
    let strNum = i.toString(16);
    if (strNum.length === 1) {
      strNum = "\f00" + strNum;
    }
    else if (strNum.length === 2) {
      strNum = "\f0" + strNum;
    }
    else {
      strNum = "\f" + strNum;
    }
    arr[i] = strNum;
  }
  return arr;
}

export const hashPassword = (password: string) => {
  const sha = crypto.createHash("sha512").update(String(password));
  return sha.digest("hex");
}

export const Icons: Array<string> = IconGeneration();
