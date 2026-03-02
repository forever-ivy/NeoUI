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

function App() {
  return (
    <main>
      <Nav />
      <div className="space-x-2 space-y-2">
        <Button variant={"default"}>Submit</Button>
        <Button variant={"primary"}>Submit</Button>
        <Button variant={"destructive"}>Cancel</Button>
        <Button variant={"warning"}>Waring</Button>
        <Button variant={"primary"} disabled>
          Waring
        </Button>
        <div className="m-6">
          <Card>
            <CardHeader>
              <CardTittle>This is my tittle</CardTittle>
              <CardDescription>This is the price of my product</CardDescription>
            </CardHeader>
            <CardContent>
              <ul>
                <li>A</li>
                <li>B</li>
                <li>C</li>
              </ul>
            </CardContent>
            <CardFooter>
              <NeoSwitch />
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}

export default App;
