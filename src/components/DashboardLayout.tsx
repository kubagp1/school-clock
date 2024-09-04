import { UserButton } from "@clerk/nextjs";
import { GeistSans } from "geist/font/sans";
import { type ReactElement } from "react";
import clsx from "clsx";
import { dark as darkClerkTheme } from "@clerk/themes";
import { cn } from "~/utils/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

const DashboardLayout = ({
  children,
  breadcrumbs,
}: {
  children: ReactElement;
  breadcrumbs: ReactElement;
}) => {
  return (
    <div
      className={clsx(
        GeistSans.className,
        "dark min-h-screen bg-black text-neutral-100",
      )}
    >
      <div className="flex flex-row items-center justify-between border-b border-neutral-800 bg-neutral-950 px-6 py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="inline-block text-lg hover:underline"
                title="Home page"
              >
                <Logo className="text-neutral-100" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator></BreadcrumbSeparator>
            {breadcrumbs}
          </BreadcrumbList>
        </Breadcrumb>

        <UserButton showName appearance={{ baseTheme: darkClerkTheme }} />
      </div>

      <div className="container mx-auto max-w-[1360px] pt-4">{children}</div>
    </div>
  );
};

const Logo = (props: { className?: string }) => (
  <span className={cn("text-lg", props.className)}>
    school <span className="font-black">:</span> clock
  </span>
);

export const getDashboardLayout = (
  page: ReactElement,
  breadcrumbs: ReactElement,
) => <DashboardLayout breadcrumbs={breadcrumbs}>{page}</DashboardLayout>;
