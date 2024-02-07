import { ErrorOutline } from "@mui/icons-material";
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
import { type RouterOutput } from "~/server/api/root";
import { useEditableField } from "../configuration/[id]";
import Head from "next/head";
import { useRouter } from "next/router";

function NameField(props: { instance: RouterOutput["instance"]["getById"] }) {
  const utils = api.useContext();

  const { instance } = props;

  const nameRef = useRef<HTMLInputElement>(null);

  const { mutate, isLoading, isError, reset } =
    api.instance.changeName.useMutation({
      onSuccess: () => {
        void utils.instance.getAll.invalidate();
        void utils.instance.getById.invalidate(instance.id);
        onSuccess();
      },
    });

  const mutateWrapper = (value: string) =>
    mutate({ id: instance.id, name: value });

  const { isEditing, startEdit, cancelEdit, saveEdit, onSuccess } =
    useEditableField(mutateWrapper, reset, nameRef);

  return !isEditing ? (
    <Typography variant="h4">
      {instance.name} <Button onClick={startEdit}>Edit name</Button>
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
          defaultValue={instance.name}
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

function DeleteButton(props: {
  instance: RouterOutput["instance"]["getById"];
}) {
  const { instance } = props;

  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClose = () => setDialogOpen(false);

  const handleDelete = () => {
    mutate(instance.id);
  };

  const { mutate, isLoading, isError } = api.instance.delete.useMutation({
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
        Delete this instance
      </Button>
      <Dialog onClose={handleClose} open={dialogOpen}>
        <DialogTitle>Delete instance?</DialogTitle>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography>
            Are you sure you want to delete the instance{" "}
            <strong>{instance.name}</strong> and all of its rules? This action
            cannot be undone.
          </Typography>
          {isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Error. Failed to delete instance.
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

const parseTags = (tags: string) => {
  return tags.split(",").map((tag) => tag.trim());
};

function InstanceSection(props: {
  instance: RouterOutput["instance"]["getById"];
}) {
  const { instance } = props;

  return (
    <Box>
      <Typography variant="h5">Instance</Typography>
      <Typography>
        <strong>Id:</strong> {instance.id}
      </Typography>
      <Typography>
        <strong>Tags:</strong>{" "}
        {parseTags(instance.tags).reduce((acc, tag) => `${acc}, ${tag}`)}
      </Typography>
      <Typography>
        <strong>Secret:</strong> {instance.secret}
      </Typography>
    </Box>
  );
}

interface PageProps {
  instanceId: string;
}

const instancePage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = (pageProps) => {
  const { data, isError, isLoading } = api.instance.getById.useQuery(
    pageProps.instanceId
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
        <Typography>Failed to load instance</Typography>
        <Link component={NextLink} href="/dashboard">
          <Button>Go back to the dashboard</Button>
        </Link>
      </Box>
    );

  return (
    <>
      <Head>
        <title>{data.name} | Instance</title>
      </Head>
      <Paper>
        <Box sx={{ p: 2 }}>
          <NameField instance={data}></NameField>
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <InstanceSection instance={data} />
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <DeleteButton instance={data} />
        </Box>
      </Paper>
    </>
  );
};

instancePage.getLayout = getDashboardLayout;

export default instancePage;

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context
) => {
  const helpers = createSSRHelpers(context.req);

  if (typeof context.params?.id !== "string") throw new Error("Invalid id");

  await helpers.instance.getById.prefetch(context.params.id);

  return {
    props: {
      trpcState: helpers.dehydrate(),
      instanceId: context.params.id,
    },
  };
};
