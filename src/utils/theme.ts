import { z } from "zod";
import type { Prettify } from "./utils";
import { RouterOutput } from "~/server/api/root";
import { ThemeField } from "@prisma/client";

export const themeFieldsArraySchema = z.array(
  z
    .union([
      z.object({ name: z.literal("hideClock"), value: z.boolean() }),
      z.object({ name: z.literal("clockColor"), value: z.string() }),
      z.object({ name: z.literal("clockSize"), value: z.number() }),
    ])
    .and(
      z.object({
        enabled: z.boolean(),
      })
    )
);

export type ThemeFieldsArray = z.infer<typeof themeFieldsArraySchema>;

export type ThemeFieldsRecord = {
  [K in ThemeFieldsArray[number]["name"]]: Prettify<
    Extract<ThemeFieldsArray[number], { name: K }>
  >;
};

export type ThemeFieldsNameValue = {
  [K in ThemeFieldsArray[number]["name"]]: Extract<
    ThemeFieldsArray[number],
    { name: K }
  >["value"];
};

export function themeFieldsToPartialRecord(fields: ThemeFieldsArray) {
  return fields.reduce((acc, field) => {
    acc = { ...acc, [field.name]: field };
    return acc;
  }, {} as Partial<ThemeFieldsRecord>);
}

export function validateThemeFieldsArray(fields: ThemeField[]) {
  return themeFieldsArraySchema.parse(fields);
}

export const defaultThemeFields = {
  clockColor: {
    name: "clockColor",
    value: "#ff0000",
    enabled: false,
  },
  clockSize: {
    name: "clockSize",
    value: 64,
    enabled: false,
  },
  hideClock: {
    name: "hideClock",
    value: false,
    enabled: false,
  },
} as const satisfies ThemeFieldsRecord;

export function onlyEnabledFields(fields: ThemeFieldsArray) {
  return fields.filter((field) => field.enabled);
}

export function themeFieldsRecordToNameValue(
  fields: ThemeFieldsRecord
): ThemeFieldsNameValue {
  return Object.fromEntries(
    Object.entries(fields).map(([name, field]) => [name, field.value])
  ) as ThemeFieldsNameValue;
}
