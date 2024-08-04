module.exports = {
  plugins: {
    //mantine defaults
    "postcss-preset-mantine": {},
    "postcss-simple-vars": {
      variables: {
        "mantine-breakpoint-xs": "36em",
        "mantine-breakpoint-sm": "48em",
        "mantine-breakpoint-md": "62em",
        "mantine-breakpoint-lg": "75em",
        "mantine-breakpoint-xl": "88em",
      },
    },

    //for mantine and tailwind compatibility
    "postcss-import": {},
    "tailwindcss/nesting": {},
    //tailwind defaults
    tailwindcss: {},
    autoprefixer: {},
  },
};
