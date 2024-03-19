import { createContext, useContext } from "react";
import { type RouterOutputs, api } from "~/utils/api";
import { useInstanceSecret } from "./InstanceSecretProvider";

type InstanceContextState = RouterOutputs["instance"]["getBySecret"];

export const InstanceContext = createContext<InstanceContextState | undefined>(
  undefined
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

  if (isLoading) return <div>Loading instance</div>;
  if (isError) return <div>Error loading instance.</div>; //TODO: better error handling, see #17

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
