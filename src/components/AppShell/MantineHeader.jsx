import { identity } from "deso-protocol";
import { useContext } from "react";
import { DeSoIdentityContext } from "react-deso-protocol";
import { getDisplayName } from "../../helpers";
import swap from "../../assets/swap.png";
import {
  createStyles,
  Menu,
  Header,
  Group,
  Button,
  Text,
  Box,
  getStylesRef,
  rem,
  Loader,
  Image,
} from "@mantine/core";

import { RiHandCoinLine } from "react-icons/ri";

import {
  IconUser,
  IconReceipt2,
  IconLogout,
  IconSwitchHorizontal,
} from "@tabler/icons-react";

const useStyles = createStyles((theme) => ({
  buttonBox: {
    maxWidth: "222px",
  },
  link: {
    display: "flex",
    alignItems: "center",
    height: "100%",
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    textDecoration: "none",
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,

    [theme.fn.smallerThan("sm")]: {
      height: rem(42),
      display: "flex",
      alignItems: "center",
      width: "100%",
    },

    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    }),
  },

  subLink: {
    width: "100%",
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    borderRadius: theme.radius.md,

    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[7]
          : theme.colors.gray[0],
    }),

    "&:active": theme.activeStyles,
  },

  dropdownFooter: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[7]
        : theme.colors.gray[0],
    margin: `calc(${theme.spacing.md} * -1)`,
    marginTop: theme.spacing.sm,
    padding: `${theme.spacing.md} calc(${theme.spacing.md} * 2)`,
    paddingBottom: theme.spacing.xl,
    borderTop: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1]
    }`,
  },

  hiddenMobile: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  hiddenDesktop: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },

  linkIcon: {
    ref: getStylesRef("icon"),
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[2]
        : theme.colors.gray[6],
    marginRight: theme.spacing.sm,
  },

  linkActive: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
        .color,
      [`& .${getStylesRef("icon")}`]: {
        color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
          .color,
      },
    },
  },
}));

export const MantineHeader = () => {
  const { currentUser, alternateUsers, isLoading } =
    useContext(DeSoIdentityContext);

  const { classes } = useStyles();

  const handleUserSwitch = (publicKey) => {
    identity.setActiveUser(publicKey);
  };

  const handleLogout = () => {
    if (alternateUsers && alternateUsers.length > 0) {
      const firstAlternateUser = alternateUsers[0];
      identity.logout().then(() => {
        handleUserSwitch(firstAlternateUser.PublicKeyBase58Check);
      });
    } else {
      identity.logout();
    }
  };

  return (
    <nav className="main-nav">
      <div className="main-nav__user-actions">
        {isLoading ? (
          <Loader variant="bars" />
        ) : (
          <>
            <Box pb={5}>
              <Header height={88} px="md">
                <Group position="apart" sx={{ height: "100%" }}>
                  <Group>
                    <Image src={swap} width="77px" height="77px" />
                    <Text
                      fz="lg"
                      fw={1000}
                      inherit
                      variant="gradient"
                      component="span"
                    >
                      DeSo Hero Swap
                    </Text>
                  </Group>

                  <Group className={classes.hiddenMobile}>
                    {isLoading ? (
                      <div>Loading...</div>
                    ) : (
                      <>
                        {!currentUser && !alternateUsers?.length && (
                          <>
                            <Button
                              variant="default"
                              onClick={() => identity.login()}
                            >
                              Login
                            </Button>
                            <Button
                              variant="gradient"
                              gradient={{ from: "cyan", to: "indigo" }}
                              onClick={() => identity.login()}
                            >
                              Sign Up
                            </Button>
                          </>
                        )}

                        {!!currentUser && (
                          <Menu
                            trigger="hover"
                            openDelay={100}
                            closeDelay={400}
                            shadow="md"
                            width={200}
                            zIndex={1000000}
                          >
                            <Menu.Target>
                              <Button
                                variant="gradient"
                                gradient={{ from: "cyan", to: "indigo" }}
                              >
                                {getDisplayName(currentUser)}
                              </Button>
                            </Menu.Target>

                            <Menu.Dropdown>
                              {alternateUsers?.length > 0 && (
                                <Menu.Label>Accounts</Menu.Label>
                              )}

                              {alternateUsers?.map((user) => (
                                <Menu.Item
                                  icon={<IconUser size={17} />}
                                  key={user.PublicKeyBase58Check}
                                  onClick={() =>
                                    identity.setActiveUser(
                                      user.PublicKeyBase58Check
                                    )
                                  }
                                  style={{
                                    maxWidth: "190px", // Adjust the maximum width as needed
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {getDisplayName(user)}
                                </Menu.Item>
                              ))}

                              <Menu.Divider />

                              <Menu.Label>Visit DeSo Wallet</Menu.Label>
                              <Menu.Item
                                onClick={() =>
                                  window.open(
                                    "https://wallet.deso.com/",
                                    "_blank"
                                  )
                                }
                                icon={<IconReceipt2 size={17} />}
                              >
                                DeSo Wallet
                              </Menu.Item>

                              <Menu.Divider />

                              <Menu.Item
                                icon={<IconSwitchHorizontal size={17} />}
                                onClick={() => identity.login()}
                              >
                                Add Account
                              </Menu.Item>

                              <Menu.Item
                                icon={<IconLogout size={17} />}
                                onClick={handleLogout}
                              >
                                Logout
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        )}
                      </>
                    )}
                  </Group>
                </Group>
              </Header>
            </Box>
          </>
        )}
      </div>
    </nav>
  );
};
