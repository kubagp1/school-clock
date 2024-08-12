import clsx from "clsx";

type StartupMessageProps = {
  type: "loading" | "error";
  children: string;
};

export const StartupMessage = (props: StartupMessageProps) => {
  return (
    <div
      className={clsx(
        "bg-client-bg flex min-h-screen justify-center text-center text-white",
        props.type === "loading" ? "bg-client-bg" : "bg-red-600",
        props.type === "loading" ? "items-end pb-24" : "items-center",
      )}
    >
      <div>
        <p className="mb-3 text-2xl font-black">
          {props.type === "loading" ? "Loading" : "Error"}
        </p>
        <p className="text-sm">{props.children}</p>
      </div>
    </div>
  );
};
