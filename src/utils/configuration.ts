import { type Instance } from "./instance";
import { type Rule } from "./rule";
import { type Theme } from "./theme";

export type Configuration = {
  id: string;
  name: string;
  instances: Instance[];
  baseTheme: Theme;
  rules: Rule[];
};
