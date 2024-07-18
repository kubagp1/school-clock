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
  const newsTickerTextRef = useRef<HTMLInputElement>(null);
  const newsTickerSpeedRef = useRef<HTMLInputElement>(null);
  const newsTickerLoopRef = useRef<HTMLInputElement>(null);
  const newsTickerHiddenRef = useRef<HTMLInputElement>(null);

  const enabledHideClockRef = useRef<HTMLInputElement>(null);
  const enabledClockColorRef = useRef<HTMLInputElement>(null);
  const enabledClockSizeRef = useRef<HTMLInputElement>(null);
  const enabledNewsTickerTextRef = useRef<HTMLInputElement>(null);
  const enabledNewsTickerSpeedRef = useRef<HTMLInputElement>(null);
  const enabledNewsTickerLoopRef = useRef<HTMLInputElement>(null);
  const enabledNewsTickerHiddenRef = useRef<HTMLInputElement>(null);

  const handleChange = () => {
    if (
      !hideClockRef.current ||
      !enabledHideClockRef.current ||
      !clockColorRef.current ||
      !enabledClockColorRef.current ||
      !clockSizeRef.current ||
      !enabledClockSizeRef.current ||
      !newsTickerTextRef.current ||
      !enabledNewsTickerTextRef.current ||
      !newsTickerSpeedRef.current ||
      !enabledNewsTickerSpeedRef.current ||
      !newsTickerLoopRef.current ||
      !enabledNewsTickerLoopRef.current ||
      !newsTickerHiddenRef.current ||
      !enabledNewsTickerHiddenRef.current
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
      {
        name: "newsTickerText",
        value: newsTickerTextRef.current.value,
        enabled: enabledNewsTickerTextRef.current.checked || false,
      },
      {
        name: "newsTickerSpeed",
        value: parseInt(newsTickerSpeedRef.current.value),
        enabled: enabledNewsTickerSpeedRef.current.checked || false,
      },
      {
        name: "newsTickerLoop",
        value: parseInt(newsTickerLoopRef.current.value),
        enabled: enabledNewsTickerLoopRef.current.checked || false,
      },
      {
        name: "newsTickerHidden",
        value: newsTickerHiddenRef.current.checked,
        enabled: enabledNewsTickerHiddenRef.current.checked || false,
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

        <ThemeField
          onChange={handleChange}
          defaultChecked={initialFields.newsTickerText.enabled}
          inputRef={enabledNewsTickerTextRef}
        >
          <TextField
            label="News Ticker Text"
            inputRef={newsTickerTextRef}
            onChange={handleChange}
            defaultValue={initialFields.newsTickerText.value}
          />
        </ThemeField>

        <ThemeField
          onChange={handleChange}
          defaultChecked={initialFields.newsTickerSpeed.enabled}
          inputRef={enabledNewsTickerSpeedRef}
        >
          <TextField
            label="News Ticker Speed"
            inputRef={newsTickerSpeedRef}
            type="number"
            onChange={handleChange}
            defaultValue={initialFields.newsTickerSpeed.value}
          />
        </ThemeField>

        <ThemeField
          onChange={handleChange}
          defaultChecked={initialFields.newsTickerLoop.enabled}
          inputRef={enabledNewsTickerLoopRef}
        >
          <TextField
            label="News Ticker Loop"
            inputRef={newsTickerLoopRef}
            type="number"
            onChange={handleChange}
            defaultValue={initialFields.newsTickerLoop.value}
          />
        </ThemeField>

        <ThemeField
          onChange={handleChange}
          defaultChecked={initialFields.newsTickerHidden.enabled}
          inputRef={enabledNewsTickerHiddenRef}
        >
          <FormControlLabel
            control={
              <Checkbox
                defaultChecked={initialFields.newsTickerHidden.value}
                inputRef={newsTickerHiddenRef}
              />
            }
            label="Hide News Ticker"
            onChange={handleChange}
          />
        </ThemeField>
      </Box>
    </>
  );
}
