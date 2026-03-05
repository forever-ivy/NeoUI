import { useRef } from "react";
import Button from "./components/Button";
import Nav from "./components/Nav";
import Card, {
  CardDescription,
  CardHeader,
  CardTittle,
  CardContent,
} from "./components/Card";

import NeoSwitch from "./components/NeoSwitch";
import Text from "./components/Text";
import NeoCheckBox from "./components/NeoCheckBox";
import NeoSlider from "./components/NeoSlider";
import NeoProgress from "./components/NeoProgress";
import { Badge } from "./components/Badge";
import Input from "./components/Input";
import { TabsList, TabsPanel, TabsRoot, TabsTab } from "./components/Tabs";
import Upload, { type UploadRef } from "./components/Upload";

const buttonExamples = [
  { label: "Default", variant: "default" },
  { label: "Primary", variant: "primary" },
  { label: "Warning", variant: "warning" },
  { label: "Destructive", variant: "destructive" },
] as const;

const badgeExamples = [
  { label: "Neutral", variant: "default" },
  { label: "Success", variant: "primary" },
  { label: "Attention", variant: "warning" },
  { label: "Danger", variant: "destructive" },
] as const;

const checklist = [
  { id: "design-tokens", label: "Design tokens and variants", disabled: false },
  { id: "a11y-focus", label: "Focus and keyboard states", disabled: false },
  { id: "build-test", label: "Build and test pipeline", disabled: true },
] as const;

const progressBlocks = [
  {
    title: "Vertical / Primary",
    description: "Compact meter for dense cards",
    orientation: "vertical" as const,
    variant: "primary" as const,
    values: [25, 55, 82],
    contentClassName: "h-36 flex items-end gap-5",
  },
  {
    title: "Horizontal / Primary",
    description: "Task progress in forms",
    orientation: "horizontal" as const,
    variant: "primary" as const,
    values: [20, 48, 76],
    contentClassName: "space-y-4",
  },
  {
    title: "Vertical / Secondary",
    description: "Muted progress channels",
    orientation: "vertical" as const,
    variant: "secondary" as const,
    values: [30, 60, 90],
    contentClassName: "h-36 flex items-end gap-5",
  },
  {
    title: "Horizontal / Secondary",
    description: "Background or queued work",
    orientation: "horizontal" as const,
    variant: "secondary" as const,
    values: [18, 44, 72],
    contentClassName: "space-y-4",
  },
] as const;

function App() {
  const uploadRef = useRef<UploadRef | null>(null);

  return (
    <main className="min-h-screen pb-12">
      <Nav />
      <div className="mx-auto w-full max-w-[1280px] space-y-6 px-4 sm:px-6 lg:px-10">
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-20 -right-14 h-56 w-56 rounded-full bg-primary/8 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-14 h-56 w-56 rounded-full bg-warning/10 blur-2xl" />
          <CardHeader className="relative space-y-3">
            <Badge variant="primary">NeoUI Design Playground</Badge>
            <Text size="xl" weight="semibold">
              Neomorphic components, consistent tokens, and reusable patterns.
            </Text>
            <Text size="sm" tone="muted" effect="flat">
              This page is organized by usage: primitives, controls, progress,
              and composition blocks.
            </Text>
          </CardHeader>
        </Card>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTittle>Variants</CardTittle>
              <CardDescription>
                Buttons and badges share the same semantic color system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                {buttonExamples.map((item) => (
                  <Button key={item.label} variant={item.variant}>
                    {item.label}
                  </Button>
                ))}
                <Button variant="primary" disabled>
                  Disabled
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {badgeExamples.map((item) => (
                  <Badge key={item.label} variant={item.variant}>
                    {item.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-3">
            <CardHeader>
              <CardTittle>Inputs and interactions</CardTittle>
              <CardDescription>
                Common controls grouped the way form pages consume them.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <Input placeholder="Type your project name..." />
                <ul className="space-y-2">
                  {checklist.map((item) => (
                    <li key={item.id} className="flex items-center gap-2">
                      <NeoCheckBox disabled={item.disabled} />
                      <span className="text-sm">{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-5">
                <NeoSwitch />
                <NeoSlider variant="secondary" />
                <Text size="sm" tone="muted" effect="flat">
                  Toggle, slide, and edit states use consistent focus/active
                  styles.
                </Text>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTittle>Progress Matrix</CardTittle>
              <CardDescription>
                Four progress layouts for dashboard and task tracking scenarios.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {progressBlocks.map((block) => (
                <div
                  key={block.title}
                  className="rounded-xl border-1 border-border p-4 shadow-inset"
                >
                  <h4 className="text-sm font-semibold">{block.title}</h4>
                  <p className="mb-4 text-xs text-muted-foreground">
                    {block.description}
                  </p>
                  <div className={block.contentClassName}>
                    {block.values.map((value) => (
                      <NeoProgress
                        key={`${block.title}-${value}`}
                        orientation={block.orientation}
                        variant={block.variant}
                        max={100}
                        value={value}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTittle>Tabs</CardTittle>
              <CardDescription>
                Content switching pattern for segmented views.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TabsRoot>
                <TabsList className="space-x-2">
                  <TabsTab value={"overview"}>Overview</TabsTab>
                  <TabsTab value={"usage"}>Usage</TabsTab>
                  <TabsTab value={"tokens"}>Tokens</TabsTab>
                </TabsList>

                <TabsPanel value={"overview"}>
                  <Text size="sm" effect="flat">
                    NeoUI ships style-consistent primitives ready for feature
                    pages.
                  </Text>
                </TabsPanel>

                <TabsPanel value={"usage"}>
                  <Text size="sm" effect="flat">
                    Compose cards, forms, and progress blocks without rewriting
                    visual logic.
                  </Text>
                </TabsPanel>

                <TabsPanel value={"tokens"}>
                  <Text size="sm" effect="flat">
                    Colors and shadows are driven by tokens for light/dark
                    parity.
                  </Text>
                </TabsPanel>
              </TabsRoot>
            </CardContent>
          </Card>

          <Card className="xl:col-span-3">
            <CardHeader>
              <CardTittle>Upload</CardTittle>
              <CardDescription>
                Basic upload flow: select or drag files, validate type and
                size, view progress, retry failed uploads.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => uploadRef.current?.open()}
                >
                  Open Selector
                </Button>
              </div>

              <Upload
                ref={uploadRef}
                accept="image/*,.pdf"
                maxCount={4}
                maxSizeMB={5}
                listType="picture"
                action="https://httpbin.org/post"
                method="POST"
                name="file"
                data={{ from: "NeoUI", env: "demo" }}
                timeout={12000}
                onPreview={(file) => {
                  console.info("[Upload:onPreview]", file.name);
                }}
                onExceed={(incomingFiles) => {
                  console.warn(
                    `[Upload:onExceed] ${incomingFiles.length} file(s) exceeded maxCount.`,
                  );
                }}
                onFileReject={(file, reason, message) => {
                  console.warn("[Upload:onFileReject]", {
                    name: file.name,
                    reason,
                    message,
                  });
                }}
                onDrop={(files) => {
                  console.info("[Upload:onDrop]", files.map((file) => file.name));
                }}
              />
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTittle>Typography</CardTittle>
            <CardDescription>
              Raised and flat text effects under the same token palette.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Text size="xl" weight="semibold">
              Neomorphic Typography
            </Text>
            <Text size="sm" tone="muted" effect="flat">
              A raised text effect tuned for this UI style.
            </Text>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default App;
