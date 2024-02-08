import { createContext, useEffect, useState } from "react";

export const InstanceSecretContext = createContext<{
  instanceSecret: string | null;
  setInstanceSecret: (value: string) => void;
}>({
  instanceSecret: null,
  setInstanceSecret: () => {
    return;
  },
});

export default function InstanceSecretProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [instanceSecret, setInstanceSecret] = useState<string | null>(null);

  useEffect(() => {
    setInstanceSecret(localStorage.getItem("instanceSecret"));
  }, []);

  const setAndStoreInstanceSecret = (value: string) => {
    localStorage.setItem("instanceSecret", value);
    setInstanceSecret(value);
  };

  return (
    <InstanceSecretContext.Provider
      value={{ instanceSecret, setInstanceSecret: setAndStoreInstanceSecret }}
    >
      {children}
    </InstanceSecretContext.Provider>
  );
}
