import { useTheme } from "../providers/theme-provider";
import Button from "./Button";
import { Sun, Moon } from "lucide-react";

export default function Nav() {
  const { setTheme, theme } = useTheme();
  return (
    <nav className="py-8 px-12 flex justify-between items-center">
      <h1 className="font-bold">Neo UI</h1>
      <Button
        shape={"circle"}
        size={"icon"}
        onClick={() => {
          if (theme === "light") {
            setTheme("dark");
          } else {
            setTheme("light");
          }
        }}
      >
        {theme === "light" ? (
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90 tetx-warning" />
        ) : (
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0 text-primary" />
        )}
      </Button>
    </nav>
  );
}
