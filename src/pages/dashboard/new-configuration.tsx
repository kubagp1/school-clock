import {
  Alert,
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";
import { useRef } from "react";
import { getDashboardLayout } from "~/components/DashboardLayout";
import SelectTheme from "~/components/SelectTheme";
import { api } from "~/utils/api";

function NewConfiguration() {
  const router = useRouter();

  const nameRef = useRef<HTMLInputElement>(null);
  const themeRef = useRef<HTMLInputElement>(null);

  const {
    mutate,
    isLoading: isLoading,
    isError,
  } = api.configuration.create.useMutation({
    onSuccess: async (newCfg) => {
      await router.push(`/dashboard/configuration/${newCfg.id}`);
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
            <SelectTheme inputRef={themeRef} sx={{ minWidth: 210 }} />
          </Grid>
        </Grid>

        {isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Error. Failed to create new configuration.
          </Alert>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
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
