import { Instance } from "./instance";
import { Rule } from "./rule";
import { Theme } from "./theme";

export type Configuration = {
  id: string;
  name: string;
  instances: Instance[];
  baseTheme: Theme;
  rules: Rule[];
};
