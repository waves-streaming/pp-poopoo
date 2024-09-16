import {
  createStyles,
  Card,
  Center,
  Title,
  Text,
  List,
  ThemeIcon,
  Group,
  Button,
  Divider,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { ERROR_TYPES, identity } from "deso-protocol";
import { GiWaveCrest } from "react-icons/gi";

const useStyles = createStyles((theme) => ({
  inner: {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: `calc(${theme.spacing.xl} * 2)`,
    paddingBottom: `calc(${theme.spacing.xl} * 2)`,
  },

  content: {
    maxWidth: 480,

    [theme.fn.smallerThan("md")]: {
      maxWidth: "100%",
      marginRight: 0,
    },
  },
}));

export function Welcome() {
  const { classes } = useStyles();

  return (
    <Card shadow="xl" p="xl" radius="xl" withBorder>
      <Center>
        <div className={classes.inner}>
          <div className={classes.content}>
            <Title
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
              order={1}
              weight={2222}
              align="center"
            >
              Your De
            </Title>
            <Divider my="sm" />
            <Divider
              my="xs"
              variant="dashed"
              labelPosition="center"
              label={
                <>
                  <Title c="dimmed" order={3} weight={777} align="center">
                    Decentralized Social Literacy
                  </Title>
                </>
              }
            />

            <Text color="dimmed" mt="md">
              By embracing decentralized social media, you can take control of
              your online presence and enjoy a more equitable, secure, and
              transparent experience. With decentralized social media, you'll
              have access to the following benefits:
            </Text>

            <List
              mt={30}
              spacing="sm"
              size="sm"
              icon={
                <ThemeIcon size={20} radius="xl">
                  <IconCheck size={12} stroke={1.5} />
                </ThemeIcon>
              }
            >
              <List.Item>
                <b>Open Source</b> – Decentralized social media encourages
                open-source applications and algorithms, allowing for greater
                transparency and fairness in the digital world.
              </List.Item>
              <List.Item>
                <b>Open Data</b> – Say goodbye to companies privately owning and
                selling your data. With the DeSo Blockchain, your data is freely
                available to you.
              </List.Item>
              <List.Item>
                <b>Monetization</b> – Get paid for your contributions on social
                media with Social-Tips, NFTs, Creator-Coins, and cash-out to USD
                with ease.
              </List.Item>
              <List.Item>
                <b>Content Ownership</b> – Content is stored on-chain, meaning
                its not platform exclusive, this ensures ownership of what you
                create.
              </List.Item>
              <List.Item>
                <b>Interconnected</b> – No more having to rebuild your following
                as new social medias arise. Your followers and content will be
                accessible across every app on the DeSo Blockchain.
              </List.Item>
              <List.Item>
                <b>No Investment Needed</b> – Decentralized social media offers
                an accessible and affordable way to benefit from this
                revolutionary technology, without ever having to invest any
                money.
              </List.Item>

              <List.Item>
                <b>Direct to Creator</b> – Say goodbye to intermediaries taking
                huge chunks of revenue from content creators. Decentralized
                social media ensures that all payments go directly to the
                creators you support.
              </List.Item>
            </List>
          </div>
        </div>
      </Center>
      <Group spacing="xs" grow>
        <Button
          variant="default"
          radius="lg"
          onClick={() => {
            identity
              .login({
                getFreeDeso: true,
              })
              .catch((err) => {
                if (err?.type === ERROR_TYPES.NO_MONEY) {
                  alert("You need DESO in order to post!");
                } else {
                  alert(err);
                }
              });
          }}
        >
          Login
        </Button>

        <Button
          leftIcon={<GiWaveCrest size="1rem" />}
          variant="gradient"
          radius="lg"
          gradient={{ from: "cyan", to: "indigo" }}
          onClick={() => {
            identity
              .login({
                getFreeDeso: true,
              })
              .catch((err) => {
                if (err?.type === ERROR_TYPES.NO_MONEY) {
                  alert("You need DESO in order to post!");
                } else {
                  alert(err);
                }
              });
          }}
        >
          Sign Up
        </Button>
      </Group>
    </Card>
  );
}
