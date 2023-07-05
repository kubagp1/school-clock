import { useUser } from "@clerk/nextjs";
import { Padding } from "@mui/icons-material";
import { Button, Container, Link, Paper, Typography } from "@mui/material";
import { api } from "~/utils/api";
import { Configuration } from "~/utils/configuration";
import { Theme } from "~/utils/theme";

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
    <Link href={`/dashboard/configuration/${cfg.id}`}>
      <Paper
        sx={{ width: 1 / 3, marginInline: "auto", p: 2, my: 1 }}
        key={cfg.id}
      >
        <Typography variant="h6">{cfg.name}</Typography>
        <Typography variant="body1">{cfg.id}</Typography>
        <b>Base theme: </b> {cfg.baseTheme.name}
        <br />
        <b>Rules: </b> {cfg.rules.map((r) => r.name).join(", ")}
        <br />
        <b>Instances: </b> {cfg.instances.map((i) => i.name).join(", ")}
      </Paper>
    </Link>
  ));
}

function Themes() {
  const { data, isError, isLoading } = api.theme.getAll.useQuery();

  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError) return <Typography>Error</Typography>;

  return data.map((theme) => (
    <Paper sx={{ width: 1 / 3, marginInline: "auto", p: 2 }} key={theme.id}>
      <Typography variant="h6">{theme.name}</Typography>
      <Typography variant="body1">{theme.id}</Typography>
    </Paper>
  ));
}

export default function Dashboard() {
  return (
    <Container>
      <Typography variant="h4" sx={{ textAlign: "center" }}>
        Dashboard
      </Typography>
      <Typography variant="h5" sx={{ textAlign: "center" }}>
        Configurations
      </Typography>
      <Link
        href="/dashboard/new-configuration"
        sx={{ display: "block", mx: "auto" }}
      >
        <Button sx={{ mx: "auto", display: "block" }}>New configuration</Button>
      </Link>
      <Configurations />
      <Typography variant="h5" sx={{ textAlign: "center" }}>
        Themes
      </Typography>
      <Link href="/dashboard/new-theme" sx={{ display: "block", mx: "auto" }}>
        <Button sx={{ mx: "auto", display: "block" }}>New Theme</Button>
      </Link>
      <Themes />
    </Container>
  );
}
