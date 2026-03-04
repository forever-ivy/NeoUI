import Button from "./components/Button";
import Nav from "./components/Nav";
import Card, {
  CardDescription,
  CardHeader,
  CardTittle,
  CardContent,
  CardFooter,
} from "./components/Card";

import NeoSwitch from "./components/NeoSwitch";
import Text from "./components/Text";
import NeoCheckBox from "./components/NeoCheckBox";
import NeoSlider from "./components/NeoSlider";
import NeoProgress from "./components/NeoProgress";
import { Badge } from "./components/Badge";
import Input from "./components/Input";
import { TabsList, TabsPanel, TabsRoot, TabsTab } from "./components/Tabs";

function App() {
  return (
    <main>
      <Nav />
      <div className="space-x-2 space-y-2">
        <div className="px-6">
          <Text size="xl" weight="semibold">
            Neomorphic Typography
          </Text>
          <Text size="sm" tone="muted">
            A raised text effect tuned for this UI style.
          </Text>
        </div>
        <div className="p-5 space-x-5">
          <Button variant={"default"}>Submit</Button>
          <Button variant={"primary"}>Submit</Button>
          <Button variant={"destructive"}>Cancel</Button>
          <Button variant={"warning"}>Waring</Button>
          <Button variant={"primary"} disabled>
            Waring
          </Button>
          <Badge variant={"default"}>Hello</Badge>
          <Badge variant={"primary"}>Good</Badge>
          <Badge variant={"warning"}>Hey</Badge>
          <Badge variant={"destructive"}>Like</Badge>
        </div>
        <div className="m-6">
          <Card>
            <CardHeader>
              <CardTittle>This is my tittle</CardTittle>
              <CardDescription>This is the price of my product</CardDescription>
            </CardHeader>
            <CardContent>
              <ul>
                <li className="flex items-center gap-1.5">
                  <NeoCheckBox />A Ziggy Stardust
                </li>
                <li className="flex items-center gap-1.5">
                  <NeoCheckBox />B born this way
                </li>
                <li className="flex items-center gap-1.5">
                  <NeoCheckBox disabled />C call of the duty
                </li>
              </ul>
            </CardContent>
            <CardFooter className=" flex-col space-y-5">
              <NeoSwitch />
              <NeoSlider variant={"secondary"} />
              <Input />
            </CardFooter>
          </Card>
        </div>
        <div className="m-6 flex space-x-10">
          <Card className="w-[20%]">
            <CardHeader>
              <CardTittle>Progress bars</CardTittle>
              <CardDescription>Simple vertical/horizontal bars</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 h-36 flex gap-6">
              <NeoProgress orientation={"vertical"} max={100} value={25} />
              <NeoProgress orientation={"vertical"} max={100} value={50} />
              <NeoProgress orientation={"vertical"} max={100} value={75} />
            </CardContent>
          </Card>
          <Card className="w-[20%]">
            <CardHeader>
              <CardTittle>Progress bars</CardTittle>
              <CardDescription>Simple vertical/horizontal bars</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 ">
              <NeoProgress orientation={"horizontal"} max={100} value={25} />
              <NeoProgress orientation={"horizontal"} max={100} value={50} />
              <NeoProgress orientation={"horizontal"} max={100} value={75} />
            </CardContent>
          </Card>
          <Card className="w-[20%]">
            <CardHeader>
              <CardTittle>Progress bars</CardTittle>
              <CardDescription>Simple vertical/horizontal bars</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 h-36 flex gap-6">
              <NeoProgress
                variant={"secondary"}
                orientation={"vertical"}
                max={100}
                value={25}
              />
              <NeoProgress
                variant={"secondary"}
                orientation={"vertical"}
                max={100}
                value={50}
              />
              <NeoProgress
                variant={"secondary"}
                orientation={"vertical"}
                max={100}
                value={75}
              />
            </CardContent>
          </Card>
          <Card className="w-[20%]">
            <CardHeader>
              <CardTittle>Progress bars</CardTittle>
              <CardDescription>Simple vertical/horizontal bars</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 ">
              <NeoProgress
                variant={"secondary"}
                orientation={"horizontal"}
                max={100}
                value={25}
              />
              <NeoProgress
                variant={"secondary"}
                orientation={"horizontal"}
                max={100}
                value={50}
              />
              <NeoProgress
                variant={"secondary"}
                orientation={"horizontal"}
                max={100}
                value={75}
              />
            </CardContent>
          </Card>
        </div>
        <Card className="m-6">
          <CardHeader>
            <TabsRoot>
              <TabsList className={"space-x-2"}>
                <TabsTab value={"overview"}>Overview</TabsTab>
                <TabsTab value={"user"}>User</TabsTab>
              </TabsList>

              <TabsPanel value={"overview"}>
                <h2>This is overview</h2>
                <p>This is more info about the overview</p>
              </TabsPanel>

              <TabsPanel value={"user"}>
                <h2>This is for the user</h2>
              </TabsPanel>
            </TabsRoot>
          </CardHeader>
        </Card>
      </div>
    </main>
  );
}

export default App;
