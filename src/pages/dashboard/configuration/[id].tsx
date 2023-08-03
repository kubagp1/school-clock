import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";

import { api } from "~/utils/api";
import {
  Box,
  Button,
  Divider,
  Link,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { createSSRHelpers } from "~/utils/ssrHelpers";
import Head from "next/head";
import { getDashboardLayout } from "~/components/DashboardLayout";
import { NextPageWithLayout } from "~/pages/_app";
import { useRef, useState } from "react";
import { inferProcedureOutput } from "@trpc/server";
import { AppRouter, RouterOutput } from "~/server/api/root";
import NextLink from "next/link";
import SelectTheme from "~/components/SelectTheme";

function NameField(props: {
  configuration: RouterOutput["configuration"]["getById"];
}) {
  const utils = api.useContext();

  const { configuration } = props;

  const [isEditing, setIsEditing] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const startEdit = () => setIsEditing(true);

  const cancelEdit = () => setIsEditing(false);

  const { mutate, isLoading, isError } =
    api.configuration.changeName.useMutation({
      onSuccess: () => {
        utils.configuration.getAll.invalidate();
        utils.configuration.getById.invalidate(configuration.id);
        setIsEditing(false);
      },
    });

  const saveEdit = () => {
    if (nameRef.current?.value) {
      mutate({
        id: configuration.id,
        name: nameRef.current.value,
      });
    }
  };

  return !isEditing ? (
    <Typography variant="h4">
      {configuration.name} <Button onClick={startEdit}>Edit name</Button>
    </Typography>
  ) : (
    <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
      <TextField
        defaultValue={configuration.name}
        label="Name"
        variant="outlined"
        inputRef={nameRef}
      ></TextField>
      <Button onClick={saveEdit}>Save</Button>
      <Button color="error" onClick={cancelEdit}>
        Cancel
      </Button>
    </Box>
  );
}

function BaseThemeField(props: {
  configuration: RouterOutput["configuration"]["getById"];
}) {
  const utils = api.useContext();

  const { configuration } = props;

  const [isEditing, setIsEditing] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  const startEdit = () => setIsEditing(true);

  const cancelEdit = () => setIsEditing(false);

  const { mutate, isLoading, isError } =
    api.configuration.changeBaseTheme.useMutation({
      onSuccess: () => {
        utils.configuration.getById.invalidate(configuration.id);
        setIsEditing(false);
      },
    });

  const saveEdit = () => {
    if (selectRef.current?.value) {
      mutate({
        id: configuration.id,
        baseThemeId: selectRef.current.value,
      });
    }
  };

  return (
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
          <Button onClick={saveEdit}>Save</Button>
          <Button color="error" onClick={cancelEdit} disableRipple>
            Cancel
          </Button>
        </>
      )}
    </Box>
  );
}

interface PageProps {
  configurationId: string;
}

const ConfigurationPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = (pageProps) => {
  const utils = api.useContext();

  const { data, isError, isLoading } = api.configuration.getById.useQuery(
    pageProps.configurationId
  );

  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError) return <Typography>Error</Typography>;

  if (data === null) return <Typography>Not found</Typography>;

  return (
    // <div>
    //   <Typography variant="h4">{data.name}</Typography>
    //   <Typography variant="h5">Base theme</Typography>
    //   <Typography variant="body1">{data.baseTheme.name}</Typography>
    //   <Typography variant="h5">Rules</Typography>
    //   <Typography variant="body1">
    //     {data.rules.map((r) => r.name).join(", ")}
    //   </Typography>
    //   <Typography variant="h5">Instances</Typography>
    //   <Typography variant="body1">
    //     {data.instances.map((i) => i.name).join(", ")}
    //   </Typography>
    // </div>

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
  const helpers = await createSSRHelpers(context.req);

  if (typeof context.params?.id !== "string") throw new Error("Invalid id");

  await helpers.configuration.getById.prefetch(context.params.id);

  return {
    props: {
      trpcState: helpers.dehydrate(),
      configurationId: context.params.id,
    },
  };
};
