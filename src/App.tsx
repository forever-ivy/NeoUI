
import Button from "./components/Button"



function App() {

  return (
    <main>
      <h1>Hello</h1>
      <div className="space-x-2">
      <Button variant={"primary"}>Submit</Button>
      <Button variant={"destructive"} >Cancel</Button>
      </div>
    </main>
  )
}

export default App
