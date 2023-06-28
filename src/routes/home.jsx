import {
  Space,
  Image,
  Text,
  Center,
  Paper,
  Divider,
  Button,
} from "@mantine/core";
import { DeSoIdentityContext } from "react-deso-protocol";
import { useState, useContext } from "react";
import { identity } from "deso-protocol";
import people from "../assets/people.png";

export const Home = () => {
  const { currentUser, isLoading } = useContext(DeSoIdentityContext);
  return (
    <>
      <div>
        {currentUser ? (
          <iframe
            title="heroswap"
            width="100%"
            style={{
              border: "none",
              borderRadius: "22px",
              height: "555px",
            }}
            src={`https://heroswap.com/widget?affiliateAddress=${currentUser.PublicKeyBase58Check}`}
          />
        ) : (
          <>
            <Center>
              <Paper shadow="xl" radius="xl" p="xl" withBorder>
                <Center>
                  <Image src={people} width="111px" height="111px" />
                </Center>
                <Space h="sm" />
                <Text align="center" fw={555}>
                  When you log in to your DeSo Account, your Public Key serves
                  as your Affiliate Address, and 50% of fees are returned to
                  your DeSo Wallet.
                </Text>
                <Space h="md" />
                <Text align="center" fw={555}>
                  Your payout will be automatically distributed to this address
                  every month after you've earned a minimum of $50 on fees.
                </Text>
                <Space h="md" />
                <Center>
                  <Button variant="default" onClick={() => identity.login()}>
                    Login
                  </Button>
                  <Space w="md" />
                  <Button
                    variant="gradient"
                    gradient={{ from: "cyan", to: "indigo" }}
                    onClick={() => identity.login()}
                  >
                    Sign Up
                  </Button>
                </Center>
              </Paper>
            </Center>
            <Space h="md" />
            <iframe
              title="heroswap"
              width="100%"
              style={{
                border: "none",
                borderRadius: "22px",
                height: "555px",
              }}
              src="https://heroswap.com/widget?affiliateAddress=BC1YLfjx3jKZeoShqr2r3QttepoYmvJGEs7vbYx1WYoNmNW9FY5VUu6"
            />
          </>
        )}
      </div>

      <Space h="md" />
    </>
  );
};
