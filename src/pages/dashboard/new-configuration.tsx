import {
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";
import { useRef } from "react";
import { getDashboardLayout } from "~/components/DashboardLayout";
import { api } from "~/utils/api";

function NewConfiguration() {
  const utils = api.useContext();
  const router = useRouter();

  const {
    data: themes,
    isError: isThemesError,
    isLoading: isThemesLoading,
  } = api.theme.getAll.useQuery();

  const nameRef = useRef<HTMLInputElement>(null);
  const themeRef = useRef<HTMLInputElement>(null);

  const { mutate, isLoading: isMutationLoading } =
    api.configuration.create.useMutation({
      onSuccess: (newCfg) => {
        utils.configuration.getAll.invalidate();
        router.push(`/dashboard/configuration/${newCfg.id}`);
      },
    });

  const handleSubmit = () => {
    if (nameRef.current?.value && themeRef.current?.value) {
      mutate({
        name: nameRef.current.value,
        baseThemeId: themeRef.current.value,
      });
    }
  };

  return (
    <>
      <Head>
        <title>New configuration</title>
      </Head>
      <Typography variant="h4" sx={{ mb: 1 }}>
        New Configuration
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Grid container>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Name</Typography>
            <TextField
              required
              type="text"
              label="Configuration name"
              inputRef={nameRef}
            ></TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" sx={{ mt: 1 }}>
              Base theme
            </Typography>
            {themes != undefined && (
              <Select
                inputRef={themeRef}
                defaultValue={themes[0]?.id}
                sx={{ minWidth: 210 }}
              >
                {themes.map((theme) => (
                  <MenuItem key={theme.id} value={theme.id}>
                    {theme.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            onClick={handleSubmit}
            disabled={isMutationLoading}
            variant="contained"
          >
            Create new configuration
          </Button>
        </Box>
      </Paper>
    </>
  );
}

NewConfiguration.getLayout = getDashboardLayout;

export default NewConfiguration;
