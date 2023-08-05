import {
  type GetServerSideProps,
  type InferGetServerSidePropsType,
} from "next";

import { api } from "~/utils/api";
import {
  Alert,
  Box,
  Button,
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
import SelectTheme from "~/components/SelectTheme";
import { ErrorOutline } from "@mui/icons-material";
import { CenteredLoading } from "~/components/Loading";

function useEditableField<T>(
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

interface PageProps {
  configurationId: string;
}

const ConfigurationPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = (pageProps) => {
  const { data, isError, isLoading } = api.configuration.getById.useQuery(
    pageProps.configurationId
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
        <Typography>Failed to load configuration</Typography>
        <Link component={NextLink} href="/dashboard">
          <Button>Go back to the dashboard</Button>
        </Link>
      </Box>
    );

  return (
    <>
      <Head>
        <title>{data.name} | Configuration</title>
      </Head>
      <Paper>
        <Box sx={{ p: 2 }}>
          <NameField configuration={data}></NameField>
        </Box>
        <Divider></Divider>
        <Box sx={{ p: 2 }}>
          <Typography variant="h5">Base theme</Typography>
          <BaseThemeField configuration={data}></BaseThemeField>
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
  // const helpers = createSSRHelpers(context.req);

  // if (typeof context.params?.id !== "string") throw new Error("Invalid id");

  // await helpers.configuration.getById.prefetch(context.params.id);

  // return {
  //   props: {
  //     trpcState: helpers.dehydrate(),
  //     configurationId: context.params.id,
  //   },
  // };

  await Promise.resolve();

  return {
    props: {
      configurationId: "1",
    },
  };
};
