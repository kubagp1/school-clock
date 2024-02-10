import {
  FormControlLabel,
  Checkbox,
  TextField,
  Box,
  Switch,
} from "@mui/material";
import { RefObject, useRef } from "react";
import { type ThemeData } from "~/server/api/routers/theme";

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
  onChange: (data: ThemeData) => void;
  theme?: ThemeData;
}) {
  const hideClockRef = useRef<HTMLInputElement>(null);
  const clockColorRef = useRef<HTMLInputElement>(null);
  const clockSizeRef = useRef<HTMLInputElement>(null);

  const enabledHideClockRef = useRef<HTMLInputElement>(null);
  const enabledClockColorRef = useRef<HTMLInputElement>(null);
  const enabledClockSizeRef = useRef<HTMLInputElement>(null);

  const handleChange = () => {
    if (
      !hideClockRef.current ||
      !clockColorRef.current ||
      !clockSizeRef.current
    ) {
      return;
    }

    props.onChange({
      hideClock: enabledHideClockRef.current?.checked
        ? hideClockRef.current.checked
        : null,
      clockColor: enabledClockColorRef.current?.checked
        ? clockColorRef.current.value
        : null,
      clockSize: enabledClockSizeRef.current?.checked
        ? parseInt(clockSizeRef.current.value)
        : null,
    });
  };

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <ThemeField
          onChange={handleChange}
          defaultChecked={!!(props.theme && props.theme.hideClock !== null)}
          inputRef={enabledHideClockRef}
        >
          <FormControlLabel
            control={
              <Checkbox
                defaultChecked={props.theme?.hideClock || undefined}
                inputRef={hideClockRef}
              />
            }
            label="Hide Clock"
            onChange={handleChange}
          />
        </ThemeField>

        <ThemeField
          onChange={handleChange}
          defaultChecked={!!(props.theme && props.theme.clockColor !== null)}
          inputRef={enabledClockColorRef}
        >
          <TextField
            label="Clock Color"
            inputRef={clockColorRef}
            onChange={handleChange}
            defaultValue={props.theme?.clockColor || undefined}
          />
        </ThemeField>

        <ThemeField
          onChange={handleChange}
          defaultChecked={!!(props.theme && props.theme.clockSize !== null)}
          inputRef={enabledClockSizeRef}
        >
          <TextField
            label="Clock Size"
            inputRef={clockSizeRef}
            type="number"
            onChange={handleChange}
            defaultValue={props.theme?.clockSize || undefined}
          />
        </ThemeField>
      </Box>
    </>
  );
}
