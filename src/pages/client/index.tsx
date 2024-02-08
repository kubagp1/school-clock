import { useContext, useEffect, useState } from "react";
import InstanceSecretProvider, {
  InstanceSecretContext,
} from "~/components/client/InstanceSecretProvider";
import { RequestInstanceSecretView } from "../../components/client/RequestInstanceSecretView";
import { MainView } from "~/components/client/MainView";

function App() {
  const { instanceSecret } = useContext(InstanceSecretContext);

  return (
    <div>{!instanceSecret ? <RequestInstanceSecretView /> : <MainView />}</div>
  );
}

export default function Client() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) return "Enable JavaScript to view this page.";

  // no server-side rendering

  return (
    <InstanceSecretProvider>
      <App />
    </InstanceSecretProvider>
  );
}
