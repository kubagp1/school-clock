import { Theme } from "./theme";

export type Rule = {
  id: string;
  name: string;
  condition: Condition;
  themes: Theme[];
};
