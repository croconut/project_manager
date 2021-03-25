import crypto from "crypto";

export const TaskStage = [
  "To-Do",
  "In Progress",
  "Complete",
  "Cancelled",
] as const;
export type Stage = typeof TaskStage[number];

export const ID_ADDITION = "Z";

// why whatever request might fail
// should implement these as keys in backend so i can just check if the specific key exists on login
// or register or whatever
export const RequestFails = [
  "login",
  "user_parse",
  "tasklists_parse",
  "email_match",
  "username_match",
  "email_and_username_match",
  "lookup",
  "unknown",
  "none_yet",
  "no_cookie",
  "old_version"
] as const;
export type TRequestFail = typeof RequestFails[number];

export const UpdateFails = [
  "logout",
  "returned_tasklist",
  "tasks",
  "unknown",
  "none_yet",
  "old_version"
] as const;
export type TUpdateFail = typeof UpdateFails[number];

export const CurrentStatus = [
  "INITIAL",
  "UPDATING",
  "FETCHING",
  "SYNCED",
  "FETCH_NEEDED",
  "UPDATE_NEEDED",
] as const;
export type TStatus = typeof CurrentStatus[number];

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

const IconGeneration = (): Array<string> => {
  const max = 640;
  const arr = Array<string>(max);
  for (let i = 0; i < max; i++) {
    let strNum = i.toString(16);
    if (strNum.length === 1) {
      strNum = "\f00" + strNum;
    } else if (strNum.length === 2) {
      strNum = "\f0" + strNum;
    } else {
      strNum = "\f" + strNum;
    }
    arr[i] = strNum;
  }
  return arr;
};

export const hexToRGB = (hex: string) => {
  if (hex.length !== 7) {
    return null;
  }
  const newHex = hex.slice(1);
  const r = parseInt(newHex.slice(0, 2), 16);
  const g = parseInt(newHex.slice(2, 4), 16);
  const b = parseInt(newHex.slice(4, 6), 16);
  return [r, g, b];
};

export const hashPassword = (password: string) => {
  const sha = crypto.createHash("sha512").update(String(password));
  return sha.digest("hex");
};

export const Icons: Array<string> = IconGeneration();
