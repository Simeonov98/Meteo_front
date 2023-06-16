import { type Config } from "tailwindcss";
import withMT from "@material-tailwind/react/utils/withMT";
export default withMT({
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors:{
      'base': '#213363',
      'firstLayer': '#17594A',
      'secondLayer': '#8EAC50',
      'thirdLayer': '#D3D04F'
    },
    extend: {},
  },
  plugins: [],
} satisfies Config);
