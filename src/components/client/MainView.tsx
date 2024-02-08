import { useCallback, useContext, useEffect } from "react";
import { InstanceSecretContext } from "./InstanceSecretProvider";
import { type RouterOutputs, api } from "~/utils/api";

import styles from "./MainView.module.css";

type CSSVariableName = "clock-display" | "clock-color" | "clock-size";

function useCSSVariable(name: CSSVariableName) {
  const setValue = useCallback((value: string) => {
    document.documentElement.style.setProperty(`--${name}`, value);
  }, []);

  return setValue;
}

export function MainView() {
  const { instanceSecret } = useContext(InstanceSecretContext);

  const {
    data: instance,
    isLoading,
    isError,
  } = api.instance.getBySecret.useQuery(instanceSecret ?? "", {
    enabled: instanceSecret !== null,
    refetchInterval: 1000 * 60,
    refetchIntervalInBackground: true,
  });

  if (instanceSecret === null) {
    return <div>This should never happen. instanceSecret == null</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error</div>;
  }

  if (instance === null) {
    return <div>Different error</div>;
  }

  return <InnerMainView instance={instance} />;
}

function useStyling(
  instance: NonNullable<RouterOutputs["instance"]["getBySecret"]>
) {
  const setClockDisplay = useCSSVariable("clock-display");
  useEffect(() => {
    setClockDisplay(
      instance.configuration.baseTheme.hideClock ? "none" : "unset"
    );
  }, [instance.configuration.baseTheme.hideClock, setClockDisplay]);

  const setClockColor = useCSSVariable("clock-color");
  useEffect(() => {
    setClockColor(instance.configuration.baseTheme.clockColor ?? "unset");
  }, [instance.configuration.baseTheme.clockColor, setClockColor]);

  const setClockSize = useCSSVariable("clock-size");
  useEffect(() => {
    if (instance.configuration.baseTheme.clockSize === null) {
      setClockSize("unset");
      return;
    }
    setClockSize(`${instance.configuration.baseTheme.clockSize}vh`);
  }, [instance.configuration.baseTheme.clockSize, setClockSize]);
}

function InnerMainView({
  instance,
}: {
  instance: NonNullable<RouterOutputs["instance"]["getBySecret"]>;
}) {
  useStyling(instance);

  return <div className={styles.clock}>12:30</div>;
}
