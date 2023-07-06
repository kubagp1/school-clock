import { UserButton } from "@clerk/nextjs";
import { Box, AppBar, Toolbar, Typography, Container } from "@mui/material";
import { ReactElement } from "react";

const DashboardLayout = ({ children }: { children: ReactElement }) => {
  return (
    <Box
      sx={{
        height: "100vh",
        bgcolor: "#f5f5f5",
      }}
    >
      <AppBar sx={{ bgcolor: "#fefefe", color: "#010101" }} elevation={2}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            school-clock Dashboard
          </Typography>
          <UserButton></UserButton>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Box>
        <Container sx={{ pt: 2 }}>{children}</Container>
      </Box>
    </Box>
  );
};

export const getDashboardLayout = (page: ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);
