import { Box, CircularProgress } from "@mui/material";

export const CenteredLoading = () => {
  return (
    <Box sx={{ display: "grid", placeItems: "center", my: 2 }}>
      <CircularProgress />
    </Box>
  );
};
