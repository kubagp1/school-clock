import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";

import { api } from "~/utils/api";
import { Typography } from "@mui/material";
import { createSSRHelpers } from "~/utils/ssrHelpers";

interface PageProps {
  configurationId: string;
}

const ConfigurationPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = (pageProps) => {
  const { data, isError, isLoading } = api.configuration.getById.useQuery(
    pageProps.configurationId
  );

  if (isLoading) console.log("Loading...");
  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError) return <Typography>Error</Typography>;

  if (data === null) return <Typography>Not found</Typography>;

  return (
    <div>
      <Typography variant="h4">{data.name}</Typography>
      <Typography variant="h5">Base theme</Typography>
      <Typography variant="body1">{data.baseTheme.name}</Typography>
      <Typography variant="h5">Rules</Typography>
      <Typography variant="body1">
        {data.rules.map((r) => r.name).join(", ")}
      </Typography>
      <Typography variant="h5">Instances</Typography>
      <Typography variant="body1">
        {data.instances.map((i) => i.name).join(", ")}
      </Typography>
    </div>
  );
};

export default ConfigurationPage;

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context
) => {
  const helpers = await createSSRHelpers(context.req);

  if (typeof context.params?.id !== "string") throw new Error("Invalid id");

  await helpers.configuration.getById.prefetch(context.params.id);

  return {
    props: {
      trpcState: helpers.dehydrate(),
      configurationId: context.params.id,
    },
  };
};
