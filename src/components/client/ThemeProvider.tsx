import { createContext, useContext } from "react";
import {
  type ThemeFieldsNameValue,
  themeFieldsToPartialRecord,
  validateThemeFieldsArray,
  defaultThemeFields,
  onlyEnabledFields,
  themeFieldsRecordToNameValue,
} from "~/utils/theme";
import { useInstance } from "./InstanceProvider";
import {
  type Circumstances,
  isConditionTrue,
  validateCondition,
} from "~/utils/conditions";
import { useTime } from "./TimeProvider";

type ThemeContextState = ThemeFieldsNameValue;

export const ThemeContext = createContext<ThemeContextState | undefined>(
  undefined
);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const instance = useInstance();
  const { internetTime } = useTime();

  const baseThemeEnabledFields = themeFieldsToPartialRecord(
    onlyEnabledFields(
      validateThemeFieldsArray(instance.configuration.baseTheme.fields)
    )
  );

  const currentCircumstances = generateCircumstances(internetTime);

  const enabledRules = instance.configuration.rules.filter(
    (rule) => rule.enabled
  );

  const activeRules = enabledRules.filter((rule) =>
    isConditionTrue(validateCondition(rule.condition), currentCircumstances)
  );

  const activeRulesOnlyEnabled = activeRules.map((rule) => ({
    ...rule,
    theme: {
      ...rule.theme,
      fields: onlyEnabledFields(validateThemeFieldsArray(rule.theme.fields)),
    },
  }));

  const activeRulesSorted = activeRulesOnlyEnabled.sort(
    (a, b) => b.index - a.index
  );

  const activeRulesThemeFields = activeRulesSorted.map((rule) =>
    themeFieldsToPartialRecord(rule.theme.fields)
  );

  const themeFields = {
    ...defaultThemeFields,
    ...baseThemeEnabledFields,
    ...activeRulesThemeFields.reduce((acc, val) => ({ ...acc, ...val }), {}),
  };

  const theme = themeFieldsRecordToNameValue(themeFields);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return theme;
};

function generateCircumstances(time: Date): Circumstances {
  return {
    weekday: time.getDay(),
    day: time.getDate(),
    month: time.getMonth(),
    year: time.getFullYear(),
    hour: time.getHours(),
    minute: time.getMinutes(),
    second: time.getSeconds(),
    datetime: time,
  };
}
