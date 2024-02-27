import {
  type GetServerSideProps,
  type InferGetServerSidePropsType,
} from "next";
import { type NextPageWithLayout } from "~/pages/_app";
import { api } from "~/utils/api";
import { createSSRHelpers } from "~/utils/ssrHelpers";
import { CenteredLoading } from "~/components/Loading";
import { getDashboardLayout } from "~/components/DashboardLayout";
import {
  Alert,
  Box,
  Button,
  Divider,
  Link,
  Paper,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import NextLink from "next/link";
import Head from "next/head";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useEffect, useRef, useState } from "react";
import type { RouterOutput } from "~/server/api/root";
import { useEditableField } from "../configuration/[id]";
import SelectTheme from "~/components/dashboard/SelectTheme";
import RuleConditionEditor from "~/components/dashboard/RuleConditionEditor";
import {
  type Condition,
  conditionSchema,
  defaultCondition,
} from "~/utils/conditions";
import RuleConditionTester from "~/components/dashboard/RuleConditionTester";

function NameField(props: {
  rule: NonNullable<RouterOutput["rule"]["getById"]>;
}) {
  const utils = api.useContext();

  const { rule } = props;

  const nameRef = useRef<HTMLInputElement>(null);

  const { mutate, isLoading, isError, reset } = api.rule.changeName.useMutation(
    {
      onSuccess: () => {
        void utils.rule.getAll.invalidate();
        void utils.rule.getById.invalidate(rule.id);
        onSuccess();
      },
    }
  );

  const mutateWrapper = (value: string) => mutate({ id: rule.id, name: value });

  const { isEditing, startEdit, cancelEdit, saveEdit, onSuccess } =
    useEditableField(mutateWrapper, reset, nameRef);

  return !isEditing ? (
    <Typography variant="h4">
      {rule.name} <Button onClick={startEdit}>Edit name</Button>
    </Typography>
  ) : (
    <>
      {isError && isEditing && (
        <Alert severity="error" sx={{ my: 1 }}>
          Error. Failed to change name.
        </Alert>
      )}
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
        <TextField
          defaultValue={rule.name}
          label="Name"
          variant="outlined"
          inputRef={nameRef}
        ></TextField>
        <Button onClick={saveEdit} disabled={isLoading}>
          Save
        </Button>
        <Button color="error" onClick={cancelEdit}>
          Cancel
        </Button>
      </Box>
    </>
  );
}

function RuleThemeField(props: {
  rule: NonNullable<RouterOutput["rule"]["getById"]>;
}) {
  const utils = api.useContext();

  const { rule } = props;

  const selectRef = useRef<HTMLSelectElement>(null);

  const { mutate, isLoading, isError, reset } =
    api.rule.changeTheme.useMutation({
      onSuccess: () => {
        void utils.rule.getById.invalidate(rule.id);
        onSuccess();
      },
    });

  const mutateWrapper = (value: string) =>
    mutate({ id: rule.id, themeId: value });

  const { isEditing, startEdit, cancelEdit, saveEdit, onSuccess } =
    useEditableField(mutateWrapper, reset, selectRef);

  return (
    <>
      {isError && isEditing && (
        <Alert severity="error" sx={{ my: 1 }}>
          Error. Failed to change theme.
        </Alert>
      )}
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
        {!isEditing ? (
          <>
            <Link
              component={NextLink}
              href={`/dashboard/theme/${rule.themeId}`}
            >
              {rule.theme.name}
            </Link>
            <Button onClick={startEdit} disableRipple sx={{ ml: 2 }}>
              Change theme
            </Button>
          </>
        ) : (
          <>
            <SelectTheme
              defaultValue={rule.themeId}
              inputRef={selectRef}
              sx={{ mr: 1 }}
              variant="outlined"
              size="small"
            ></SelectTheme>
            <Button onClick={saveEdit} disabled={isLoading}>
              Save
            </Button>
            <Button color="error" onClick={cancelEdit} disableRipple>
              Cancel
            </Button>
          </>
        )}
      </Box>
    </>
  );
}

interface PageProps {
  ruleId: string;
}

const RulePage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = (pageProps) => {
  const utils = api.useContext();
  const { data, isError, isLoading } = api.rule.getById.useQuery(
    pageProps.ruleId
  );

  const belowMd = useMediaQuery(useTheme().breakpoints.down("md"));

  const [condition, setCondition] = useState<Condition | null>(null);

  useEffect(() => {
    if (condition !== null) return;
    if (data === undefined || data === null) return;
    const parsedCondition = conditionSchema.safeParse(data.condition);
    if (parsedCondition.success === false) {
      console.log(parsedCondition.error, data.condition);
      setCondition(defaultCondition);
      return;
    }
    setCondition(parsedCondition.data);
  }, [data, condition]);

  const {
    mutate,
    isLoading: isMutating,
    isError: isErrorMutating,
  } = api.rule.updateCondition.useMutation({
    onSettled: async () => {
      await utils.rule.getById.invalidate(pageProps.ruleId);
      setCondition(null);
    },
  });

  const handleExportCondition = () => {
    if (condition === null) return;
    const json = JSON.stringify(condition, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data?.name ?? "unknown"}_condition.json`;
    a.click();
  };

  const handleImportCondition = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = () => {
      const files = input.files;
      if (files === null) return;
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result !== "string") return;
        try {
          const parsed: unknown = JSON.parse(result);
          const parsedCondition = conditionSchema.safeParse(parsed);
          if (parsedCondition.success === false) {
            alert("Invalid condition");
            return;
          }
          setCondition(parsedCondition.data);
        } catch (e) {
          alert("Invalid condition");
        }
      };
      if (file === undefined) return;
      reader.readAsText(file);
    };
    input.click();
  };

  if (isLoading) return <CenteredLoading />;
  if (isError || data === null)
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          mt: 4,
        }}
      >
        <ErrorOutline fontSize="large" />
        <Typography variant="h5">Error</Typography>
        <Typography>Failed to load rule</Typography>
        <Link component={NextLink} href="/dashboard">
          <Button>Go back to the dashboard</Button>
        </Link>
      </Box>
    );

  return (
    <>
      <Head>
        <title>{`${data.name} | Rule`}</title>
      </Head>
      <Paper>
        <Box sx={{ p: 2 }}>
          <Link
            component={NextLink}
            href={`/dashboard/configuration/${data.configurationId}`}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <ArrowBackIcon />
            <span>
              Go back to <strong>{data.configuration.name}</strong>
            </span>
          </Link>
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <NameField rule={data} />
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography variant="h5">Theme</Typography>
          <RuleThemeField rule={data} />
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography variant="h5">Condition</Typography>
          {condition !== null && (
            <>
              <button
                onClick={() => {
                  mutate({ id: data.id, condition });
                }}
              >
                {isMutating
                  ? "Saving..."
                  : isErrorMutating
                  ? "Failed to save. Retry"
                  : "Save condition"}
              </button>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: belowMd ? "column" : "row",
                }}
              >
                <div style={{ flexGrow: 1 }}>
                  <RuleConditionEditor
                    condition={condition}
                    onChange={(value) => {
                      setCondition(value);
                    }}
                  />
                  <button onClick={handleExportCondition}>
                    Export condition
                  </button>{" "}
                  <button onClick={handleImportCondition}>
                    Import condition
                  </button>
                </div>
                <div>
                  <Typography variant="h6" sx={{ pt: 2, pb: 1 }}>
                    Tester
                  </Typography>
                  <RuleConditionTester condition={condition} />
                </div>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </>
  );
};

RulePage.getLayout = getDashboardLayout;

export default RulePage;

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context
) => {
  const helpers = createSSRHelpers(context.req);

  if (typeof context.params?.id !== "string") throw new Error("Invalid id");

  await helpers.rule.getById.prefetch(context.params.id);

  return {
    props: {
      trpcState: helpers.dehydrate(),
      ruleId: context.params.id,
    },
  };
};
