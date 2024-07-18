import { Dialog } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import type { RouterOutput } from "~/server/api/root";
import { api } from "~/utils/api";
import type { BaseNewsTicker } from "~/utils/newsTicker";

type EditorDialogProps = (
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      newsTicker: BaseNewsTicker;
    }
) & {
  onSubmit: (newNewsTicker: BaseNewsTicker) => void;
  open: boolean;
  onClose: () => void;
};

function EditorDialog(props: EditorDialogProps) {
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const loopRef = useRef<HTMLInputElement>(null);
  const speedRef = useRef<HTMLInputElement>(null);
  const forceHiddenFalseRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!startRef.current?.value) return;
    if (!endRef.current?.value) return;
    if (!textRef.current?.value) return;
    if (!loopRef.current?.value) return;
    if (!speedRef.current?.value) return;
    if (forceHiddenFalseRef.current?.checked === undefined) return;

    props.onSubmit({
      startAt: new Date(startRef.current.value),
      endAt: new Date(endRef.current.value),
      text: textRef.current.value,
      loop: parseInt(loopRef.current.value),
      speed: parseInt(speedRef.current.value),
      forceHiddenFalse: forceHiddenFalseRef.current.checked,
    });
  };

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <div style={{ padding: "32px" }}>
        <h2>{props.mode === "create" ? "Create" : "Edit"} news ticker</h2>
        start:{" "}
        <input
          ref={startRef}
          defaultValue={
            props.mode === "edit"
              ? convertToDateTimeLocalString(props.newsTicker.startAt)
              : ""
          }
          type="datetime-local"
        />
        <br />
        end:{" "}
        <input
          ref={endRef}
          defaultValue={
            props.mode === "edit"
              ? convertToDateTimeLocalString(props.newsTicker.endAt)
              : ""
          }
          type="datetime-local"
        />
        <br />
        text:{" "}
        <textarea
          ref={textRef}
          cols={60}
          rows={10}
          defaultValue={props.mode === "edit" ? props.newsTicker.text : ""}
        />
        <br />
        loop:{" "}
        <input
          ref={loopRef}
          defaultValue={props.mode === "edit" ? props.newsTicker.loop : ""}
          type="number"
        />{" "}
        <br />
        speed:{" "}
        <input
          ref={speedRef}
          defaultValue={props.mode === "edit" ? props.newsTicker.speed : ""}
          type="number"
        />{" "}
        <br />
        <label htmlFor="hiddenfalse">force hidden false</label>{" "}
        <input
          ref={forceHiddenFalseRef}
          defaultChecked={
            props.mode === "edit"
              ? props.newsTicker.forceHiddenFalse
              : undefined
          }
          type="checkbox"
          id="hiddenfalse"
        />
        <br />
        <button onClick={handleSubmit}>
          {props.mode === "create" ? "Create" : "Edit"}
        </button>
        <button onClick={props.onClose}>Cancel</button>
      </div>
    </Dialog>
  );
}

const convertToDateTimeLocalString = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}` as const;
};

function useEditorDialogCreate(configurationId: string): {
  setOpen: (value: boolean) => void;
  props: Extract<EditorDialogProps, { mode: "create" }>;
} {
  const utils = api.useContext();

  const [open, setOpen] = useState(false);

  const { mutate } = api.newsTicker.create.useMutation({
    onSuccess: () => {
      void utils.newsTicker.getAll.invalidate();
    },
  });

  const handleSubmit = (newNewsTicker: BaseNewsTicker) => {
    void mutate({
      configurationId,
      ...newNewsTicker,
    });
    setOpen(false);
  };

  return {
    setOpen,
    props: {
      mode: "create",
      open,
      onClose: () => setOpen(false),
      onSubmit: handleSubmit,
    },
  };
}

function useEditorDialogEdit(newsTicker: BaseNewsTicker & { id: string }): {
  setOpen: (value: boolean) => void;
  props: Extract<EditorDialogProps, { mode: "edit" }>;
} {
  const utils = api.useContext();

  const [open, setOpen] = useState(false);

  const { mutate } = api.newsTicker.update.useMutation({
    onSuccess: () => {
      void utils.newsTicker.getAll.invalidate();
    },
  });

  const handleSubmit = (newNewsTicker: BaseNewsTicker) => {
    void mutate({
      id: newsTicker.id,
      ...newNewsTicker,
    });
    setOpen(false);
  };

  return {
    setOpen,
    props: {
      mode: "edit",
      newsTicker,
      open,
      onClose: () => setOpen(false),
      onSubmit: handleSubmit,
    },
  };
}

function NewsTickerEditButton(props: {
  newsTicker: BaseNewsTicker & { id: string };
}) {
  const editDialog = useEditorDialogEdit(props.newsTicker);

  return (
    <>
      <button
        onClick={() => {
          editDialog.setOpen(true);
        }}
      >
        Edit
      </button>
      <EditorDialog {...editDialog.props} />
    </>
  );
}

function NewsTickerDeleteButton(props: { id: string }) {
  const utils = api.useContext();

  const { mutate } = api.newsTicker.delete.useMutation({
    onSuccess: () => {
      void utils.newsTicker.getAll.invalidate();
    },
  });

  return (
    <button
      onClick={() => {
        void mutate(props.id);
      }}
    >
      Delete
    </button>
  );
}

export function NewsTickerSection(props: {
  configuration: NonNullable<RouterOutput["configuration"]["getById"]>;
}) {
  const {
    data: newsTickers,
    isLoading: isLoadingNewsTickers,
    isError: isNewsTickersError,
  } = api.newsTicker.getAll.useQuery(props.configuration.id);

  const createDialog = useEditorDialogCreate(props.configuration.id);

  return (
    <div>
      <h2>News tickers</h2>
      <button
        onClick={() => {
          createDialog.setOpen(true);
        }}
      >
        Create
      </button>
      <EditorDialog {...createDialog.props} />
      <div>
        {isLoadingNewsTickers ? (
          <p>Loading...</p>
        ) : isNewsTickersError ? (
          "Error loading"
        ) : newsTickers?.length ? (
          newsTickers.map((newsTicker) => (
            <div key={newsTicker.id}>
              <span>{newsTicker.text.substring(0, 50)}</span>
              <NewsTickerEditButton newsTicker={newsTicker} />

              <NewsTickerDeleteButton id={newsTicker.id} />
            </div>
          ))
        ) : (
          <p>No news tickers</p>
        )}
      </div>
    </div>
  );
}
