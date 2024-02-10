import {
  Typography,
  Paper,
  TextField,
  Box,
  Divider,
  Button,
  Alert,
} from "@mui/material";
import Head from "next/head";
import router from "next/router";
import { useRef } from "react";
import { getDashboardLayout } from "~/components/DashboardLayout";
import ThemeEditor from "~/components/dashboard/ThemeEditor";
import { type ThemeData } from "~/server/api/routers/theme";
import { api } from "~/utils/api";

function NewTheme() {
  const nameRef = useRef<HTMLInputElement>(null);
  const dataRef = useRef<ThemeData | null>(null);

  const { mutate, isLoading, isError } = api.theme.create.useMutation({
    onSuccess: async (newTheme) => {
      await router.push(`/dashboard/theme/${newTheme.id}`);
    },
  });

  const handleSubmit = () => {
    if (nameRef.current?.value && dataRef.current) {
      mutate({
        name: nameRef.current.value,
        data: dataRef.current,
      });
    }
  };

  return (
    <>
      <Head>
        <title>New theme</title>
      </Head>
      <Typography variant="h4" sx={{ mb: 1 }}>
        New Theme
      </Typography>
      <Paper>
        <Box sx={{ p: 2 }}>
          <TextField label="Name" inputRef={nameRef} />
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <ThemeEditor onChange={(data) => (dataRef.current = data)} />
        </Box>
        <Divider />
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "right",
            alignItems: "center",
            gap: 2,
          }}
        >
          {isError && (
            <Alert severity="error">Error. Failed to create the theme.</Alert>
          )}
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            Create
          </Button>
        </Box>
      </Paper>
    </>
  );
}

NewTheme.getLayout = getDashboardLayout;

export default NewTheme;
