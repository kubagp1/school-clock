import {
  FormControlLabel,
  Checkbox,
  TextField,
  Box,
  Switch,
} from "@mui/material";
import { type RefObject, useRef } from "react";
import {
  type ThemeFieldsRecord,
  type ThemeFieldsArray,
  themeFieldsToPartialRecord,
  defaultThemeFields,
} from "~/utils/theme";

const ThemeField = (props: {
  onChange: () => void;
  inputRef: RefObject<HTMLInputElement>;
  defaultChecked: boolean;
  children: React.ReactNode;
}) => {
  return (
    <>
      <Box sx={{ display: "flex" }}>
        <FormControlLabel
          control={
            <Switch
              defaultChecked={props.defaultChecked}
              inputRef={props.inputRef}
            />
          }
          onChange={props.onChange}
          label="Enabled"
          sx={{ pr: 2 }}
        />
        {props.children}
      </Box>
    </>
  );
};

export default function ThemeEditor(props: {
  onChange: (data: ThemeFieldsArray) => void;
  initialFields?: ThemeFieldsArray;
}) {
  const initialFields: ThemeFieldsRecord =
    props.initialFields !== undefined
      ? {
          ...defaultThemeFields,
          ...themeFieldsToPartialRecord(props.initialFields),
        }
      : defaultThemeFields;
  // We merge the default styles because not all fields are guaranteed to be present in the database.

  const hideClockRef = useRef<HTMLInputElement>(null);
  const clockColorRef = useRef<HTMLInputElement>(null);
  const clockSizeRef = useRef<HTMLInputElement>(null);

  const enabledHideClockRef = useRef<HTMLInputElement>(null);
  const enabledClockColorRef = useRef<HTMLInputElement>(null);
  const enabledClockSizeRef = useRef<HTMLInputElement>(null);

  const handleChange = () => {
    if (
      !hideClockRef.current ||
      !enabledHideClockRef.current ||
      !clockColorRef.current ||
      !enabledClockColorRef.current ||
      !clockSizeRef.current ||
      !enabledClockSizeRef.current
    ) {
      alert("Something went wrong. null ref");
      return;
    }

    props.onChange([
      {
        name: "hideClock",
        value: hideClockRef.current.checked,
        enabled: enabledHideClockRef.current.checked || false,
      },
      {
        name: "clockColor",
        value: clockColorRef.current.value,
        enabled: enabledClockColorRef.current.checked || false,
      },
      {
        name: "clockSize",
        value: parseInt(clockSizeRef.current.value),
        enabled: enabledClockSizeRef.current.checked || false,
      },
    ]);
  };

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <ThemeField
          onChange={handleChange}
          defaultChecked={initialFields.hideClock.enabled}
          inputRef={enabledHideClockRef}
        >
          <FormControlLabel
            control={
              <Checkbox
                defaultChecked={initialFields.hideClock.value}
                inputRef={hideClockRef}
              />
            }
            label="Hide Clock"
            onChange={handleChange}
          />
        </ThemeField>

        <ThemeField
          onChange={handleChange}
          defaultChecked={initialFields.clockColor.enabled}
          inputRef={enabledClockColorRef}
        >
          <TextField
            label="Clock Color"
            inputRef={clockColorRef}
            onChange={handleChange}
            defaultValue={initialFields.clockColor.value}
          />
        </ThemeField>

        <ThemeField
          onChange={handleChange}
          defaultChecked={initialFields.clockSize.enabled}
          inputRef={enabledClockSizeRef}
        >
          <TextField
            label="Clock Size"
            inputRef={clockSizeRef}
            type="number"
            onChange={handleChange}
            defaultValue={initialFields.clockSize.value}
          />
        </ThemeField>
      </Box>
    </>
  );
}
