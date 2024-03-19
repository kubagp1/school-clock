import { createContext, useContext, useState } from "react";
import { RequestInstanceSecretView } from "./RequestInstanceSecretView";

export const InstanceSecretContext = createContext<string | undefined>(
  undefined
);

export default function InstanceSecretProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [instanceSecret, setInstanceSecret] = useState<string | null>(
    localStorage.getItem("instanceSecret")
  );

  const setAndStoreInstanceSecret = (value: string) => {
    localStorage.setItem("instanceSecret", value);
    setInstanceSecret(value);
  };

  if (!instanceSecret)
    return (
      <RequestInstanceSecretView
        setInstanceSecret={setAndStoreInstanceSecret}
      />
    );

  return (
    <InstanceSecretContext.Provider value={instanceSecret}>
      {children}
    </InstanceSecretContext.Provider>
  );
}

export const useInstanceSecret = () => {
  const instanceSecret = useContext(InstanceSecretContext);
  if (!instanceSecret) {
    throw new Error(
      "useInstanceSecret must be used within an InstanceSecretProvider"
    );
  }
  return instanceSecret;
};
