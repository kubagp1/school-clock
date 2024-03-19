import { useEffect, useState } from "react";
import InstanceSecretProvider from "~/components/client/InstanceSecretProvider";
import { App } from "~/components/client/App";
import { InstanceProvider } from "~/components/client/InstanceProvider";
import { ThemeProvider } from "~/components/client/ThemeProvider";
import { TimeProvider } from "~/components/client/TimeProvider";

export default function Client() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) return "Running on server or something went wrong.";

  // no server-side rendering

  return (
    <TimeProvider>
      <InstanceSecretProvider>
        <InstanceProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </InstanceProvider>
      </InstanceSecretProvider>
    </TimeProvider>
  );
}
