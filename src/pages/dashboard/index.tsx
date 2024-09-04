import { ReactElement, ReactNode } from "react";
import { api } from "~/utils/api";
import NextLink from "next/link";
import { getDashboardLayout } from "~/components/DashboardLayout";
import Head from "next/head";
import { CenteredLoading } from "~/components/Loading";
import { BreadcrumbItem, BreadcrumbPage } from "~/components/ui/breadcrumb";
import {
  ChartColumnIncreasing,
  CircleAlert,
  ListChecks,
  MonitorCheck,
  MonitorX,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "~/utils/utils";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

function Error(props: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-neutral-800 p-6">
      <CircleAlert />
      <div className="text-neutral-400">{props.message}</div>
    </div>
  );
}

function bagdeFormatText(count: number, singular: string, plural: string) {
  return `${count} ${count == 1 ? singular : plural}`;
}

function getOnlineInstacesCount(instances: { lastSeen: Date | null }[]) {
  // instance is online if it was seen in the last 1 hour
  const now = new Date();
  return instances.filter(
    (i) => i.lastSeen && i.lastSeen.getTime() > now.getTime() - 60 * 60 * 1000,
  ).length;
}

function getOfflineInstacesCount(instances: { lastSeen: Date | null }[]) {
  return instances.length - getOnlineInstacesCount(instances);
}

const BAGDE_ICON_PROPS = {
  size: 13,
  className: "mr-1",
};

function Configurations() {
  const { data, isError, isLoading } = api.configuration.getAll.useQuery();

  if (isLoading) return <CenteredLoading />;

  if (isError)
    return (
      <Error
        message="An error occured while loading your configurations. Please try again
      later."
      />
    );

  const configurations = data.map((cfg, i) => (
    <NextLink
      href={`/dashboard/configuration/${cfg.id}`}
      key={cfg.id}
      className="group block border-b border-neutral-800 p-4 last:border-none"
    >
      <div className="pb-2 font-medium group-hover:underline">{cfg.name}</div>
      <div className="flex gap-2">
        <Badge variant="outline">
          <SlidersHorizontal {...BAGDE_ICON_PROPS} />
          {bagdeFormatText(cfg.rules.length, "Rule", "Rules")}
        </Badge>
        <Badge variant="outline">
          <MonitorCheck {...BAGDE_ICON_PROPS} />
          {bagdeFormatText(
            getOnlineInstacesCount(cfg.instances),
            "Online Instance",
            "Online Instances",
          )}
        </Badge>
        {getOfflineInstacesCount(cfg.instances) > 0 && (
          <Badge
            variant="outline"
            className="border-red-600 dark:border-red-600"
          >
            <MonitorX {...BAGDE_ICON_PROPS} />
            {bagdeFormatText(
              getOfflineInstacesCount(cfg.instances),
              "Offline Instance",
              "Offline Instances",
            )}
          </Badge>
        )}
      </div>
    </NextLink>
  ));

  return (
    <div className="rounded-lg border border-neutral-800">{configurations}</div>
  );
}

function Themes() {
  const { data, isError, isLoading } = api.theme.getAll.useQuery();

  if (isLoading) return <CenteredLoading />;
  if (isError)
    return (
      <Error
        message="An error occured while loading your themes. Please try again
  later."
      />
    );

  const themes = data
    .filter((theme) => !theme.internal)
    .map((theme, i) => (
      <NextLink
        key={theme.id}
        href={`/dashboard/theme/${theme.id}`}
        className="group block border-b border-neutral-800 p-4 last:border-none"
      >
        <div className="pb-2 font-medium group-hover:underline">
          {theme.name}
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">
            <ListChecks {...BAGDE_ICON_PROPS} />
            {bagdeFormatText(
              theme.enabledFieldsCount,
              "Enabled Field",
              "Enabled Fields",
            )}
          </Badge>
          <Badge variant="outline">
            <ChartColumnIncreasing {...BAGDE_ICON_PROPS} />
            {bagdeFormatText(3, "Use", "Uses")}
            {/* TODO: Implement this stat */}
          </Badge>
        </div>
      </NextLink>
    ));

  return <div className="rounded-lg border border-neutral-800">{themes}</div>;
}

function Dashboard() {
  return (
    <>
      <Head>
        <title>Dashboard - school:clock</title>
      </Head>

      <div className="flex flex-row gap-16">
        <div className="w-1/2">
          <div className="flex items-center justify-between pb-1 pt-3 font-medium">
            <div>Configurations</div>
            <Button variant="ghost" size="icon">
              <Plus className="cursor-pointer text-neutral-300 hover:text-inherit" />
            </Button>
          </div>
          <Configurations />
          <div className="flex justify-center py-4">
            <Button variant="outline" className="mx-auto">
              <Plus className="pr-2" /> Add Configuration
            </Button>
          </div>
        </div>
        <div className="w-1/2">
          <div className="flex items-center justify-between pb-1 pt-3 font-medium">
            <div>Themes</div>
            <Button variant="ghost" size="icon">
              <Plus className="cursor-pointer text-neutral-300 hover:text-inherit" />
            </Button>
          </div>
          <Themes />
          <div className="flex justify-center py-4">
            <Button variant="outline" className="mx-auto">
              <Plus className="pr-2" /> Add Theme
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

const breadcrumbs = (
  <BreadcrumbItem>
    <BreadcrumbPage>Dashboard</BreadcrumbPage>
  </BreadcrumbItem>
);

Dashboard.getLayout = (page: ReactElement) =>
  getDashboardLayout(page, breadcrumbs);

export default Dashboard;
