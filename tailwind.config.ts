import { type Config } from "tailwindcss";
import withMT from "@material-tailwind/react/utils/withMT";
export default withMT({
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors:{
      
      'base': '#393646',
      'firstLayer': '#4F4557',
      'secondLayer': '#6D5D6E',
      'thirdLayer': '#F4EEE0'
    },
    extend: {},
  },
  plugins: [],
} satisfies Config);
