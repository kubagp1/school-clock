import { useTheme } from "./ThemeProvider";
import { useTime } from "./TimeProvider";

export const Clock = () => {
  const theme = useTheme();
  const { internetTime } = useTime();

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          color: theme.clockColor,
          fontSize: `${theme.clockSize}px`,
          display: theme.hideClock ? "none" : "unset",
        }}
      >
        {String(internetTime.getHours()).padStart(2, "0")}:
        {String(internetTime.getMinutes()).padStart(2, "0")}:
        {String(internetTime.getSeconds()).padStart(2, "0")}
      </div>
    </div>
  );
};
