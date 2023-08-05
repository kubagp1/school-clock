import { UserButton, useUser } from "@clerk/nextjs";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Link,
} from "@mui/material";
import { type ReactElement } from "react";
import NextLink from "next/link";

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
          <Box sx={{ flexGrow: 1 }}>
            <Link component={NextLink} href="/dashboard" underline="none">
              <Typography variant="h6" component="span">
                school-clock Dashboard
              </Typography>
            </Link>
          </Box>
          <UserButton showName />
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
