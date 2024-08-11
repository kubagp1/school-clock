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
    <div
      style={{
        backgroundColor: "black",
        color: "white",
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ fontSize: "64px" }}>Pair this device</span>
      <span>
        For more information see:{" "}
        <a
          style={{
            color: "white",
          }}
          href="#"
        >
          https://todo.com/make-docs
        </a>
      </span>
      <div style={{ marginBlock: "32px" }}>
        {isLoading && <p>Loading pairing code...</p>}
        {isError && <p>Error loading pairing code</p>}
        {secretRequest &&
          "Pairing code: " + formatRequestCode(secretRequest.requestCode)}
      </div>
    </div>
  );
}

function formatRequestCode(code: string) {
  // 123456789 => 123 456 789, 12345678 => 123 456 78 ...
  return code.replace(/(\d{3})(?=\d)/g, "$1 ");
}
