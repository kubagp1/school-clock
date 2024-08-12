import { createContext, useContext } from "react";
import { type RouterOutputs, api } from "~/utils/api";
import { useInstanceSecret } from "./InstanceSecretProvider";
import { StartupMessage } from "./StartupMessage";

type InstanceContextState = RouterOutputs["instance"]["getBySecret"];

export type Instance = InstanceContextState;

export const InstanceContext = createContext<InstanceContextState | undefined>(
  undefined,
);

export const InstanceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const instanceSecret = useInstanceSecret();

  const {
    data: instance,
    isLoading,
    isError,
  } = api.instance.getBySecret.useQuery(instanceSecret, {
    refetchInterval: 1000 * 60,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
  });

  if (isLoading)
    return <StartupMessage type="loading">Loading instance...</StartupMessage>;
  if (isError)
    return <StartupMessage type="error">Error loading instance</StartupMessage>; //TODO: better error handling, see #17

  return (
    <InstanceContext.Provider value={instance}>
      {children}
    </InstanceContext.Provider>
  );
};

export const useInstance = () => {
  const instance = useContext(InstanceContext);
  if (!instance) {
    throw new Error("useInstance must be used within an InstanceProvider");
  }
  return instance;
};
