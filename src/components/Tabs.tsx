import { mergeProps, Tabs } from "@base-ui-components/react";
import { cva } from "class-variance-authority";

const tabsRootVariants = cva("w-full");

interface TabsRootProps extends React.ComponentProps<typeof Tabs.Root> {}

export function TabsRoot(props: TabsRootProps) {
  const rootMerge = mergeProps<typeof Tabs.Root>(props, {
    className: tabsRootVariants(),
  });

  return <Tabs.Root {...rootMerge} />;
}

const tabsTabVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-background data-[active]:text-foreground data-[active]:shadow-inset cursor-pointer hover:text-foreground duration-350 relative z-10",
);

interface TabsTabProps extends React.ComponentProps<typeof Tabs.Tab> {}

export function TabsTab(props: TabsTabProps) {
  return (
    <Tabs.Tab
      {...props}
      className={[tabsTabVariants(), props.className].filter(Boolean).join(" ")}
    />
  );
}

const tabsListVariants = cva(
  "relative inline-flex h-12 items-center justify-center rounded-2xl bg-linear-to-tl from-background to-highlight/75 p-1 text-muted-foreground shadow-raised border-3 border-border gap-4",
);

interface TabsListProps extends React.ComponentProps<typeof Tabs.List> {}

export function TabsList(props: TabsListProps) {
  const listMerge = mergeProps<typeof Tabs.List>(props, {
    className: tabsListVariants(),
  });
  return <Tabs.List {...listMerge} />;
}

const tabsIndicatorVariants = cva(
  "absolute rounded-sm bg-background shadow-raised transition-all duration-200 border-1 border-background",
);

interface TabsIndicatorProps extends React.ComponentProps<
  typeof Tabs.Indicator
> {}

export function TabsIndicator(props: TabsIndicatorProps) {
  const mergeIndicator = mergeProps<typeof Tabs.Indicator>(props, {
    className: tabsIndicatorVariants(),
  });

  return <Tabs.Indicator {...mergeIndicator} />;
}

const tabsPanelVariants = cva(
  "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
);

interface TabsPanelProps extends React.ComponentProps<typeof Tabs.Panel> {}

export function TabsPanel(props: TabsPanelProps) {
  return (
    <Tabs.Panel
      {...props}
      className={[tabsPanelVariants(), props.className].filter(Boolean).join(" ")}
    />
  );
}
