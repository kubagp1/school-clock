import { useUser } from "@clerk/nextjs";
import {
  Box,
  Button,
  Divider,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Fragment } from "react";
import { api } from "~/utils/api";
import NextLink from "next/link";
import { getDashboardLayout } from "~/components/DashboardLayout";
import Head from "next/head";
import { CenteredLoading } from "~/components/Loading";
import ErrorOutline from "@mui/icons-material/ErrorOutline";

function Error(props: { message: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        gap: 1,
        my: 2,
        px: 2,
        textAlign: "center",
      }}
    >
      <ErrorOutline fontSize="large" />
      <Typography variant="h5">Error</Typography>
      <Typography variant="body1">{props.message}</Typography>
    </Box>
  );
}

function Configurations() {
  const { data, isError, isLoading } = api.configuration.getAll.useQuery();

  if (isLoading) return <CenteredLoading />;

  if (isError)
    return (
      <Error
        message="An error occured loading your configurations. Please try again
      later."
      />
    );

  return data.map((cfg, i) => (
    <Fragment key={cfg.id}>
      {i != 0 && <Divider />}
      <Box sx={{ p: 2 }}>
        <Link
          component={NextLink}
          href={`/dashboard/configuration/${cfg.id}`}
          underline="hover"
        >
          <Typography variant="h6">{cfg.name}</Typography>
        </Link>
        <Box sx={{ mb: 1 }}></Box>
        <table style={{ borderSpacing: "0px", minWidth: "50%" }}>
          <tbody>
            <tr>
              <td>
                <b>Base theme</b>
              </td>
              <td>{cfg.baseTheme.name}</td>
            </tr>
            <tr>
              <td>
                <b>Rules</b>
              </td>
              <td>{cfg.rules.map((r) => r.name).join(", ")}</td>
            </tr>
            <tr>
              <td>
                <b>Instances</b>
              </td>
              <td>{cfg.instances.map((i) => i.name).join(", ")}</td>
            </tr>
          </tbody>
        </table>
      </Box>
    </Fragment>
  ));
}

function Themes() {
  const { data, isError, isLoading } = api.theme.getAll.useQuery();

  if (isLoading) return <CenteredLoading />;
  if (isError)
    return (
      <Error
        message="An error occured loading your themes. Please try again
  later."
      />
    );

  return data.map((theme, i) => (
    <Fragment key={theme.id}>
      {i != 0 && <Divider />}
      <Box sx={{ p: 2 }}>
        <Link
          component={NextLink}
          href={`/dashboard/theme/${theme.id}`}
          underline="hover"
        >
          <Typography variant="h6">{theme.name}</Typography>
        </Link>
        <Box sx={{ mb: 1 }}></Box>
        <table style={{ borderSpacing: "0px", minWidth: "50%" }}>
          <tbody>
            <tr>
              <td>
                <b>Enabled fields</b>
              </td>
              <td>{theme.enabledFieldsCount}</td>
            </tr>
          </tbody>
        </table>
      </Box>
    </Fragment>
  ));
}

function Dashboard() {
  const { user, isLoaded: isUserLoaded } = useUser();

  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <Typography variant="h4">
        {isUserLoaded && user !== null ? (
          <>
            Hello <b>{user.username}</b>!
          </>
        ) : (
          "Hello!"
        )}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Stack sx={{ mt: 2 }}>
            <Paper>
              <Typography variant="h5" sx={{ py: 1.5, p: 2 }}>
                Configurations
              </Typography>
              <Divider />
              <Configurations />
              <Divider />
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <NextLink href="/dashboard/new-configuration">
                  <Button sx={{ m: 2 }}>New configuration</Button>
                </NextLink>
              </Box>
            </Paper>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack sx={{ mt: 2 }}>
            <Paper>
              <Typography variant="h5" sx={{ py: 1.5, p: 2 }}>
                Themes
              </Typography>
              <Divider />
              <Themes />
              <Divider />
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <NextLink href="/dashboard/new-theme">
                  <Button sx={{ m: 2 }}>New theme</Button>
                </NextLink>
              </Box>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}

Dashboard.getLayout = getDashboardLayout;

export default Dashboard;
