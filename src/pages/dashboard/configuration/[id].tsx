import {
  type GetServerSideProps,
  type InferGetServerSidePropsType,
} from "next";

import { api } from "~/utils/api";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Divider,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { createSSRHelpers } from "~/utils/ssrHelpers";
import Head from "next/head";
import { getDashboardLayout } from "~/components/DashboardLayout";
import { type NextPageWithLayout } from "~/pages/_app";
import { type RefObject, useRef, useState } from "react";
import { type RouterOutput } from "~/server/api/root";
import NextLink from "next/link";
import SelectTheme from "~/components/dashboard/SelectTheme";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import { CenteredLoading } from "~/components/Loading";
import { useRouter } from "next/router";
import { RulesSection } from "~/components/dashboard/configuration/RulesSection";
import { useIsMutating } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { NewsTickerSection } from "~/components/dashboard/configuration/NewsTickerSection";

export function useEditableField<T>(
  mutate: (value: T) => void,
  reset: () => void,
  ref: RefObject<HTMLElement & { value: T }>
) {
  const [isEditing, setIsEditing] = useState(false);

  const startEdit = () => setIsEditing(true);

  const cancelEdit = () => {
    setIsEditing(false);
    reset();
  };

  const saveEdit = () => {
    if (ref.current?.value) {
      mutate(ref.current.value);
    }
  };

  const onSuccess = () => {
    setIsEditing(false);
  };

  return {
    isEditing,
    startEdit,
    cancelEdit,
    saveEdit,
    onSuccess,
  };
}

function NameField(props: {
  configuration: RouterOutput["configuration"]["getById"];
}) {
  const utils = api.useContext();

  const { configuration } = props;

  const nameRef = useRef<HTMLInputElement>(null);

  const { mutate, isLoading, isError, reset } =
    api.configuration.changeName.useMutation({
      onSuccess: () => {
        void utils.configuration.getAll.invalidate();
        void utils.configuration.getById.invalidate(configuration.id);
        onSuccess();
      },
    });

  const mutateWrapper = (value: string) =>
    mutate({ id: configuration.id, name: value });

  const { isEditing, startEdit, cancelEdit, saveEdit, onSuccess } =
    useEditableField(mutateWrapper, reset, nameRef);

  return !isEditing ? (
    <Typography variant="h4">
      {configuration.name} <Button onClick={startEdit}>Edit name</Button>
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
          defaultValue={configuration.name}
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

function BaseThemeField(props: {
  configuration: RouterOutput["configuration"]["getById"];
}) {
  const utils = api.useContext();

  const { configuration } = props;

  const selectRef = useRef<HTMLSelectElement>(null);

  const { mutate, isLoading, isError, reset } =
    api.configuration.changeBaseTheme.useMutation({
      onSuccess: () => {
        void utils.configuration.getById.invalidate(configuration.id);
        onSuccess();
      },
    });

  const mutateWrapper = (value: string) =>
    mutate({ id: configuration.id, baseThemeId: value });

  const { isEditing, startEdit, cancelEdit, saveEdit, onSuccess } =
    useEditableField(mutateWrapper, reset, selectRef);

  return (
    <>
      {isError && isEditing && (
        <Alert severity="error" sx={{ my: 1 }}>
          Error. Failed to change base theme.
        </Alert>
      )}
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
        {!isEditing ? (
          <>
            <Link
              component={NextLink}
              href={`/dashboard/theme/${configuration.baseThemeId}`}
            >
              {configuration.baseTheme.name}
            </Link>
            <Button onClick={startEdit} disableRipple sx={{ ml: 2 }}>
              Change base theme
            </Button>
          </>
        ) : (
          <>
            <SelectTheme
              defaultValue={configuration.baseThemeId}
              inputRef={selectRef}
              sx={{ mr: 1 }}
              variant="outlined"
              size="small"
            ></SelectTheme>
            <Button onClick={saveEdit} disabled={isLoading}>
              Save
            </Button>
            <Button color="error" onClick={cancelEdit} disableRipple>
              Cancel
            </Button>
          </>
        )}
      </Box>
    </>
  );
}

function DeleteButton(props: {
  configuration: RouterOutput["configuration"]["getById"];
}) {
  const { configuration } = props;

  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClose = () => setDialogOpen(false);

  const handleDelete = () => {
    mutate(configuration.id);
  };

  const { mutate, isLoading, isError } = api.configuration.delete.useMutation({
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
        Delete this configuration
      </Button>
      <Dialog onClose={handleClose} open={dialogOpen}>
        <DialogTitle>Delete configuration?</DialogTitle>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography>
            Are you sure you want to delete the configuration{" "}
            <strong>{configuration.name}</strong> and all of its rules? This
            action cannot be undone.
          </Typography>
          {isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Error. Failed to delete configuration.
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

const InstancesSection = (props: {
  configuration: RouterOutput["configuration"]["getById"];
}) => {
  const { configuration } = props;
  const utils = api.useContext();
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const handleClose = () => setDialogOpen(false);

  const { mutate, isLoading, isError } = api.instance.create.useMutation({
    onSuccess: (instance) => {
      void utils.configuration.getById.invalidate(configuration.id);
      void router.push(`/dashboard/instance/${instance.id}`);
    },
  });

  const createInstance = () => {
    if (nameRef.current?.value) {
      mutate({
        name: nameRef.current.value,
        configurationId: configuration.id,
      });
    }
  };

  const openDialog = () => setDialogOpen(true);

  return (
    <>
      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>Create a new instance</DialogTitle>
        <Divider />
        <Box sx={{ p: 2 }}>
          <TextField
            label="Name"
            variant="outlined"
            inputRef={nameRef}
          ></TextField>
        </Box>
        <DialogActions>
          <Button color="error" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={createInstance}>Create</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Typography variant="h6">Instances</Typography>
          <Button onClick={openDialog}>Create new instance</Button>
        </Box>
        {configuration.instances.map((instance) => (
          <div key={instance.id}>
            <Link
              component={NextLink}
              href={`/dashboard/instance/${instance.id}`}
            >
              {instance.name}
            </Link>
          </div>
        ))}
      </Box>
    </>
  );
};

interface PageProps {
  configurationId: string;
}

const ConfigurationPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = (pageProps) => {
  const { data, isError, isLoading } = api.configuration.getById.useQuery(
    pageProps.configurationId
  );

  const isMutatingRules = useIsMutating(getQueryKey(api.rule.update));
  const isMutatingRulesOrder = useIsMutating(getQueryKey(api.rule.updateOrder));

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
        <Typography>Failed to load configuration</Typography>
        <Link component={NextLink} href="/dashboard">
          <Button>Go back to the dashboard</Button>
        </Link>
      </Box>
    );

  return (
    <>
      <Head>
        <title>{`${data.name} | Configuration`}</title>
      </Head>
      <Paper>
        <Box sx={{ p: 2 }}>
          <NameField configuration={data}></NameField>
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Base theme</Typography>
          <BaseThemeField configuration={data}></BaseThemeField>
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">
            Rules{" "}
            {isMutatingRules || isMutatingRulesOrder ? (
              <Typography color="GrayText" variant="body1" component="span">
                Saving...
              </Typography>
            ) : null}
          </Typography>
          <RulesSection configuration={data} />
        </Box>
        <Divider />
        <InstancesSection configuration={data} />
        <Divider />
        <NewsTickerSection configuration={data} />
        <Divider />
        <Box sx={{ p: 2 }}>
          <DeleteButton configuration={data} />
        </Box>
      </Paper>
    </>
  );
};

ConfigurationPage.getLayout = getDashboardLayout;

export default ConfigurationPage;

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context
) => {
  const helpers = createSSRHelpers(context.req);

  if (typeof context.params?.id !== "string") throw new Error("Invalid id");

  await helpers.configuration.getById.prefetch(context.params.id);

  return {
    props: {
      trpcState: helpers.dehydrate(),
      configurationId: context.params.id,
    },
  };
};
