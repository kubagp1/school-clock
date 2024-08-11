import { Clock } from "./Clock";
import { NewsTicker } from "./NewsTicker";

export function App() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
      }}
    >
      <Clock />
      <NewsTicker />
    </div>
  );
}
