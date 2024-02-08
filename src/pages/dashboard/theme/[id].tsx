import ErrorOutline from "@mui/icons-material/ErrorOutline";
import {
  Box,
  Typography,
  Button,
  Link,
  Alert,
  TextField,
  Dialog,
  DialogActions,
  DialogTitle,
  Divider,
  Paper,
} from "@mui/material";
import {
  type GetServerSideProps,
  type InferGetServerSidePropsType,
} from "next";
import { getDashboardLayout } from "~/components/DashboardLayout";
import { CenteredLoading } from "~/components/Loading";
import { type NextPageWithLayout } from "~/pages/_app";
import { api } from "~/utils/api";
import { createSSRHelpers } from "~/utils/ssrHelpers";
import NextLink from "next/link";
import { useRef, useState } from "react";
import { RouterOutput } from "~/server/api/root";
import { useEditableField } from "../configuration/[id]";
import Head from "next/head";
import { useRouter } from "next/router";
import ThemeEditor from "~/components/ThemeEditor";
import { ThemeData } from "~/server/api/routers/theme";

function NameField(props: { theme: RouterOutput["theme"]["getById"] }) {
  const utils = api.useContext();

  const { theme } = props;

  const nameRef = useRef<HTMLInputElement>(null);

  const { mutate, isLoading, isError, reset } =
    api.theme.changeName.useMutation({
      onSuccess: () => {
        void utils.theme.getAll.invalidate();
        void utils.theme.getById.invalidate(theme.id);
        onSuccess();
      },
    });

  const mutateWrapper = (value: string) =>
    mutate({ id: theme.id, name: value });

  const { isEditing, startEdit, cancelEdit, saveEdit, onSuccess } =
    useEditableField(mutateWrapper, reset, nameRef);

  return !isEditing ? (
    <Typography variant="h4">
      {theme.name} <Button onClick={startEdit}>Edit name</Button>
    </Typography>
  ) : (
    <>
      {isError && isEditing && (
        <Alert severity="error" sx={{ my: 1 }}>
          Error. Failed to change name.
        </Alert>
      )}
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
        <TextField
          defaultValue={theme.name}
          label="Name"
          variant="outlined"
          inputRef={nameRef}
        ></TextField>
        <Button onClick={saveEdit} disabled={isLoading}>
          Save
        </Button>
        <Button color="error" onClick={cancelEdit}>
          Cancel
        </Button>
      </Box>
    </>
  );
}

function DeleteButton(props: { theme: RouterOutput["theme"]["getById"] }) {
  const { theme } = props;

  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClose = () => setDialogOpen(false);

  const handleDelete = () => {
    mutate(theme.id);
  };

  const { mutate, isLoading, isError } = api.theme.delete.useMutation({
    onSuccess: async () => {
      await router.push("/dashboard");
    },
  });

  return (
    <>
      <Button
        color="error"
        variant="outlined"
        onClick={() => setDialogOpen(true)}
      >
        Delete this theme
      </Button>
      <Dialog onClose={handleClose} open={dialogOpen}>
        <DialogTitle>Delete theme?</DialogTitle>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography>
            Are you sure you want to delete the theme{" "}
            <strong>{theme.name}</strong> and all of its rules? This action
            cannot be undone.
          </Typography>
          {isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Error. Failed to delete theme.
            </Alert>
          )}
        </Box>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button color="error" onClick={handleDelete} disabled={isLoading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

const ThemeSection = (props: { theme: ThemeData & { id: string } }) => {
  const themeRef = useRef<ThemeData>(props.theme);

  const handleChange = (theme: ThemeData) => {
    themeRef.current = theme;
  };

  const handleSave = () => {
    if (!themeRef.current) {
      alert("Failed to save changes");
      return;
    }

    mutate({
      id: props.theme.id,
      data: themeRef.current,
    });
  };

  const { mutate } = api.theme.changeData.useMutation({
    onSuccess: () => {
      alert("Saved changes");
    },
    onError: () => {
      alert("Failed to save changes");
    },
  });

  return (
    <>
      <ThemeEditor theme={props.theme} onChange={handleChange}></ThemeEditor>
      <Box sx={{ display: "flex", justifyContent: "right" }}>
        <Button variant="contained" sx={{ mt: 2 }} onClick={handleSave}>
          Save changes
        </Button>
      </Box>
    </>
  );
};

interface PageProps {
  themeId: string;
}

const ThemePage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = (pageProps) => {
  const { data, isError, isLoading } = api.theme.getById.useQuery(
    pageProps.themeId
  );

  if (isLoading) return <CenteredLoading />;
  if (isError || data === null)
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          mt: 4,
        }}
      >
        <ErrorOutline fontSize="large" />
        <Typography variant="h5">Error</Typography>
        <Typography>Failed to load theme</Typography>
        <Link component={NextLink} href="/dashboard">
          <Button>Go back to the dashboard</Button>
        </Link>
      </Box>
    );

  return (
    <>
      <Head>
        <title>{data.name} | Theme</title>
      </Head>
      <Paper>
        <Box sx={{ p: 2 }}>
          <NameField theme={data}></NameField>
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <ThemeSection theme={data} />
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <DeleteButton theme={data} />
        </Box>
      </Paper>
    </>
  );
};

ThemePage.getLayout = getDashboardLayout;

export default ThemePage;

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context
) => {
  const helpers = createSSRHelpers(context.req);

  if (typeof context.params?.id !== "string") throw new Error("Invalid id");

  await helpers.theme.getById.prefetch(context.params.id);

  return {
    props: {
      trpcState: helpers.dehydrate(),
      themeId: context.params.id,
    },
  };
};
