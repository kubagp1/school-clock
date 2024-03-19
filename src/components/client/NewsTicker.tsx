import Marquee from "react-fast-marquee";
import { useTheme } from "./ThemeProvider";
import { use, useEffect, useState } from "react";
import { set } from "zod";

export function NewsTicker() {
  const theme = useTheme();

  const [marqueeFinished, setMarqueeFinished] = useState(false);

  const handleMarqueeFinish = () => {
    setMarqueeFinished(true);
  };

  useEffect(() => {
    setMarqueeFinished(false);
  }, [theme.newsTickerText]);

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
          onFinish={handleMarqueeFinish}
        >
          <span style={{ paddingLeft: "100vw" }}>{theme.newsTickerText}</span>
        </Marquee>
      )}
    </div>
  );
}
