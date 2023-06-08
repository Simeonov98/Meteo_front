import { type Config } from "tailwindcss";
import withMT from "@material-tailwind/react/utils/withMT";
export default withMT({
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config);
