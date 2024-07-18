import styles from "./MainView.module.css";
import { useInstance } from "./InstanceProvider";
import { useTheme } from "./ThemeProvider";
import { useTime } from "./TimeProvider";
import { NewsTicker } from "./NewsTicker";

export function App() {
  const instance = useInstance();
  const theme = useTheme();
  const { internetTime } = useTime();

  return (
    <div>
      <div
        className={styles.clock}
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
      <div>{instance.name}</div>
      <NewsTicker />
    </div>
  );
}
