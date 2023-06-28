import {
  AppShell,
  useMantineTheme,
  Container,
  createStyles,
} from "@mantine/core";

import { MantineHeader } from "./MantineHeader";

const useStyles = createStyles((theme) => ({
  main: {
    width: "100%",
    maxWidth: "777px",
    margin: "0 auto",
    overflowX: "hidden",
  },
}));

export const MantineAppShell = ({ children }) => {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  return (
    <AppShell
      styles={{
        main: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      header={<MantineHeader />}
    >
      <Container className={classes.main}>{children}</Container>
    </AppShell>
  );
};
