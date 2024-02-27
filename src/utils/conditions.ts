import { z } from "zod";
import { type Prettify } from "./utils";

export const booleanConditionSchema: z.ZodType<BooleanCondition> = z.lazy(() =>
  z.object({
    type: z.literal("boolean"),
    operator: z.union([z.literal("and"), z.literal("or")]),
    conditions: z.array(conditionSchema),
  })
);

export type BooleanCondition = {
  type: "boolean";
  operator: "and" | "or";
  conditions: Condition[];
};

export const weekdayConditionSchema = z.object({
  type: z.literal("weekday"),
  operator: z.union([z.literal("eq"), z.literal("neq")]),
  value: z.number().min(0).max(6),
});

export type WeekdayCondition = z.infer<typeof weekdayConditionSchema>;

export const dayConditionSchema = z.object({
  type: z.literal("day"),
  operator: z.union([
    z.literal("eq"),
    z.literal("neq"),
    z.literal("gt"),
    z.literal("lt"),
  ]),
  value: z.number().min(1).max(31),
});

export type DayCondition = z.infer<typeof dayConditionSchema>;

export const monthConditionSchema = z.object({
  type: z.literal("month"),
  operator: z.union([
    z.literal("eq"),
    z.literal("neq"),
    z.literal("gt"),
    z.literal("lt"),
  ]),
  value: z.number().min(1).max(12),
});

export type MonthCondition = z.infer<typeof monthConditionSchema>;

export const yearConditionSchema = z.object({
  type: z.literal("year"),
  operator: z.union([
    z.literal("eq"),
    z.literal("neq"),
    z.literal("gt"),
    z.literal("lt"),
  ]),
  value: z.number().min(0),
});

export type YearCondition = z.infer<typeof yearConditionSchema>;

export const hourConditionSchema = z.object({
  type: z.literal("hour"),
  operator: z.union([
    z.literal("eq"),
    z.literal("neq"),
    z.literal("gt"),
    z.literal("lt"),
  ]),
  value: z.number().min(0).max(23),
});

export type HourCondition = z.infer<typeof hourConditionSchema>;

export const minuteConditionSchema = z.object({
  type: z.literal("minute"),
  operator: z.union([
    z.literal("eq"),
    z.literal("neq"),
    z.literal("gt"),
    z.literal("lt"),
  ]),
  value: z.number().min(0).max(59),
});

export type MinuteCondition = z.infer<typeof minuteConditionSchema>;

export const secondConditionSchema = z.object({
  type: z.literal("second"),
  operator: z.union([
    z.literal("eq"),
    z.literal("neq"),
    z.literal("gt"),
    z.literal("lt"),
  ]),
  value: z.number().min(0).max(59),
});

export type SecondCondition = z.infer<typeof secondConditionSchema>;

export const conditionSchema = z.union([
  weekdayConditionSchema,
  booleanConditionSchema,
  dayConditionSchema,
  monthConditionSchema,
  yearConditionSchema,
  hourConditionSchema,
  minuteConditionSchema,
  secondConditionSchema,
]);

export type Condition = Prettify<z.infer<typeof conditionSchema>>;

export function isBooleanCondition(
  condition: Condition
): condition is BooleanCondition {
  return condition.type === "boolean";
}

export const circumstancesKeys = [
  "weekday",
  "day",
  "month",
  "year",
  "hour",
  "minute",
  "second",
] as const;

export type Circumstances = {
  [K in (typeof circumstancesKeys)[number]]: number;
};

export function isConditionTrue(
  condition: Condition,
  circumstances: Circumstances
): boolean {
  if (isBooleanCondition(condition)) {
    return isBooleanConditionTrue(condition, circumstances);
  }

  return isSimpleConditionTrue(condition, circumstances);
}

function isBooleanConditionTrue(
  condition: BooleanCondition,
  circumstances: Circumstances
): boolean {
  if (condition.operator === "and") {
    return condition.conditions.every((condition) =>
      isConditionTrue(condition, circumstances)
    );
  }

  return condition.conditions.some((condition) =>
    isConditionTrue(condition, circumstances)
  );
}

function isSimpleConditionTrue(
  condition: Exclude<Condition, BooleanCondition>,
  circumstances: Circumstances
): boolean {
  const { type, operator, value } = condition;
  const circumstance = circumstances[type];

  switch (operator) {
    case "eq":
      return circumstance === value;
    case "neq":
      return circumstance !== value;
    case "gt":
      return circumstance > value;
    case "lt":
      return circumstance < value;
  }
}

export const defaultCondition: Condition = {
  type: "boolean",
  operator: "and",
  conditions: [],
};

export const countNestedSimpleConditions = (condition: Condition): number => {
  if (isBooleanCondition(condition)) {
    return condition.conditions.reduce(
      (acc, condition) => acc + countNestedSimpleConditions(condition),
      0
    );
  }

  return 1;
};
