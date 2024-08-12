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
    },
  );

  return (
    <div className="bg-client-bg flex min-h-screen items-center justify-center text-white">
      <div className="max-w-md px-6 text-center">
        <div className="mb-6 inline-block rounded-full bg-[#2c2c2e] p-4">
          <LinkIcon className="h-10 w-10 text-[#007aff]" />
        </div>
        <h1 className="mb-4 text-4xl font-bold">Pair this device</h1>
        <p className="mb-2 text-lg">
          For more information see:{" "}
          <a href="#" className="text-[#007aff] underline">
            https://todo.com/make-docs
          </a>
        </p>
        <div className="mt-8 rounded-lg bg-[#2c2c2e] p-6">
          {isLoading && <p className="text-2xl">Loading pairing code...</p>}
          {isError && <p className="text-2xl">Error loading pairing code</p>}
          {secretRequest && (
            <>
              <p className="mb-2 text-2xl font-bold">Pairing code:</p>
              <p className="text-4xl font-bold">
                {formatRequestCode(secretRequest.requestCode)}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function formatRequestCode(code: string) {
  // 123456789 => 123 456 789, 12345678 => 123 456 78 ...
  return code.replace(/(\d{3})(?=\d)/g, "$1 ");
}

function LinkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
