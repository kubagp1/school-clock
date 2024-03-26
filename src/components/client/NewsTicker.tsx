import Marquee from "react-fast-marquee";
import { useTheme } from "./ThemeProvider";
import { useEffect, useState } from "react";

export function NewsTicker() {
  const theme = useTheme();

  const [marqueeFinished, setMarqueeFinished] = useState(true);

  const handleMarqueeFinish = (e: { elapsedTime: number }) => {
    console.log(e);
    if (e?.elapsedTime === 0) {
      console.error("Marquee bugged");
      return;
    } // bug in react-fast-marquee or Chrome, not sure

    setMarqueeFinished(true);
  };

  useEffect(() => {
    setMarqueeFinished(false);
  }, [theme.newsTickerText]);
  // TODO: Handle a scenario when the text stays the same but different rule sets it

  return (
    <div>
      {theme.newsTickerText.length > 0 && !marqueeFinished && (
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
          className="marquee"
          onFinish={handleMarqueeFinish as () => void}
        >
          <span style={{ paddingLeft: "100vw" }}>{theme.newsTickerText}</span>
        </Marquee>
      )}
    </div>
  );
}
