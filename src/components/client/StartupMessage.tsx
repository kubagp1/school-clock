type StartupMessageProps = {
  type: "loading" | "error";
  children: string;
};

export const StartupMessage = (props: StartupMessageProps) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        paddingBottom: "16px",
        boxSizing: "border-box",
        backgroundColor: props.type === "loading" ? "black" : "red",
        color: "white",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "64px",
        }}
      >
        {props.type === "loading" ? "Loading..." : "Error"}
      </div>

      <div
        style={{
          textAlign: "center",
        }}
      >
        {props.children}
      </div>
    </div>
  );
};
