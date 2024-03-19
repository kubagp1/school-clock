import Marquee from "react-fast-marquee";
import { useTheme } from "./ThemeProvider";

export function NewsTicker() {
  const theme = useTheme();

  return (
    <div>
      {theme.newsTickerText.length > 0 && (
        <Marquee
          key={theme.newsTickerText} // reset the marquee when the text changes
          speed={theme.newsTickerSpeed}
          loop={theme.newsTickerLoop}
          style={{
            visibility: theme.newsTickerHidden ? "hidden" : "unset",
            width: "100%",
            padding: "32px",
            backgroundColor: "#ddd",
          }}
        >
          {theme.newsTickerText}
        </Marquee>
      )}
    </div>
  );
}
