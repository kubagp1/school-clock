import { useContext, useEffect } from "react";
import { InstanceSecretContext } from "~/components/client/InstanceSecretProvider";
import { api } from "~/utils/api";

export function RequestInstanceSecretView() {
  const { instanceSecret, setInstanceSecret } = useContext(
    InstanceSecretContext
  );

  const {
    mutate: createSecretRequest,
    data: secretRequest,
    isError: isSecretRequestError,
    isLoading: isSecretRequestLoading,
  } = api.instanceSecretRequest.create.useMutation();

  useEffect(() => {
    createSecretRequest();
  }, []);

  api.instanceSecretRequest.getSecret.useQuery(
    {
      requestCode: secretRequest?.requestCode ?? "",
      claimToken: secretRequest?.claimToken ?? "",
    },
    {
      enabled: secretRequest !== undefined && instanceSecret === null,
      refetchInterval: 1000 * 60,
      onSuccess: (data) => {
        if (data === null) return;
        setInstanceSecret(data);
      },
    }
  );

  return (
    <div>
      <h1>Request Instance Secret</h1>
      {isSecretRequestLoading && <p>Loading...</p>}
      {isSecretRequestError && <p>Error</p>}
      {secretRequest && "Request code: " + secretRequest.requestCode}
    </div>
  );
}
