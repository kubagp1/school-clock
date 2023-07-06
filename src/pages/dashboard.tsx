import { UserButton, useUser } from "@clerk/nextjs";
import { Padding } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Link,
  Paper,
  Stack,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from "@mui/material";
import { Fragment } from "react";
import { api } from "~/utils/api";
import { Configuration } from "~/utils/configuration";
import { Theme } from "~/utils/theme";
import NextLink from "next/link";

// const configurations: Configuration[] = [
//   {
//     name: "ZST Default Configuration",
//     id: "3094uyhtr",
//     baseTheme: {
//       id: "3094dfsdfwer4wtreg",
//       name: "ZST Default Theme",
//       todo: "Add theme here",
//     },
//     instances: [
//       {
//         id: "3094uyhtr",
//         name: "ZST Zegar technikum",
//         lastAlive: new Date().getMilliseconds(),
//         tags: ["technikum"],
//       },
//     ],
//     rules: [
//       {
//         id: "3094uyhtr",
//         name: "Dzień ziemi",
//         condition: {
//           todo: "Add condition here",
//         },
//         themes: [
//           {
//             id: "3094dfsdfwer4wtreg",
//             name: "ZST Dzień ziemi Theme",
//             todo: "Add theme here",
//           },
//         ],
//       },
//     ],
//   },
// ];

// const themes: Theme[] = [
//   {
//     id: "3094dfsdfwer4wtreg",
//     name: "ZST Dzień ziemi Theme",
//     todo: "Add theme here",
//   },
//   {
//     id: "3094dfsdfwer4wtreg",
//     name: "ZST Default Theme",
//     todo: "Add theme here",
//   },
// ];

function Configurations() {
  const { data, isError, isLoading } = api.configuration.getAll.useQuery();

  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError) return <Typography>Error</Typography>;

  return data.map((cfg) => (
    <Fragment key={cfg.id}>
      <Divider />
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

  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError) return <Typography>Error</Typography>;

  return data.map((theme) => (
    <Fragment key={theme.id}>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Link
          component={NextLink}
          href={`/dashboard/theme/${theme.id}`}
          underline="hover"
        >
          <Typography variant="h6">{theme.name}</Typography>
        </Link>
      </Box>
    </Fragment>
  ));
}

export default function Dashboard() {
  return (
    <Box
      sx={{
        height: "100vh",
        bgcolor: "#f5f5f5",
      }}
    >
      <AppBar>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            school-clock Dashboard
          </Typography>
          <UserButton></UserButton>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Box>
        <Container>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Stack sx={{ mt: 2 }}>
                <Paper>
                  <Typography variant="h5" sx={{ py: 1.5, p: 2 }}>
                    Configurations
                  </Typography>
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
        </Container>
      </Box>
    </Box>
    // <Container>
    //   <Typography variant="h4" sx={{ textAlign: "center" }}>
    //     Dashboard
    //   </Typography>
    //   <Typography variant="h5" sx={{ textAlign: "center" }}>
    //     Configurations
    //   </Typography>
    //   <Link
    //     href="/dashboard/new-configuration"
    //     sx={{ display: "block", mx: "auto" }}
    //   >
    //     <Button sx={{ mx: "auto", display: "block" }}>New configuration</Button>
    //   </Link>
    //   <Configurations />
    //   <Typography variant="h5" sx={{ textAlign: "center" }}>
    //     Themes
    //   </Typography>
    //   <Link href="/dashboard/new-theme" sx={{ display: "block", mx: "auto" }}>
    //     <Button sx={{ mx: "auto", display: "block" }}>New Theme</Button>
    //   </Link>
    //   <Themes />
    // </Container>
  );
}
