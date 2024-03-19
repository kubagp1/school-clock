import { useEffect } from "react";
import { api } from "~/utils/api";

type Props = {
  setInstanceSecret: (value: string) => void;
};

export function RequestInstanceSecretView(props: Props) {
  const { setInstanceSecret } = props;

  const {
    mutate: createSecretRequest,
    data: secretRequest,
    isError,
    isLoading,
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
      enabled: secretRequest !== undefined,
      refetchInterval: 1000,
      onSuccess: (data) => {
        if (data === null) return;
        setInstanceSecret(data);
      },
    }
  );

  return (
    <div>
      <h1>Request Instance Secret</h1>
      {isLoading && <p>Loading...</p>}
      {isError && <p>Error</p>}
      {secretRequest && "Request code: " + secretRequest.requestCode}
    </div>
  );
}
