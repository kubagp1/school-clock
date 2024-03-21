import type { RouterOutput } from "~/server/api/root";

export function NewsTickerSection(props: {
  configuration: NonNullable<RouterOutput["configuration"]["getById"]>;
}) {
  return (
    <div>
      <h2>News tickers</h2>
      <button>Add news ticker</button>
    </div>
  );
}
