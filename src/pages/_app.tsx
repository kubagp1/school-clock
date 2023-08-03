import { AppProps, type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { NextPage } from "next";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactElement, ReactNode } from "react";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp: AppType = ({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <ClerkProvider {...pageProps}>
      {getLayout(<Component {...pageProps} />)}
      <ReactQueryDevtools initialIsOpen={false} />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
