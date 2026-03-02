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
            <CardFooter className="space-x-1.5">
              <NeoSwitch />
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}

export default App;
