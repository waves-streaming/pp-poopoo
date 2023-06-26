import { useState, useContext, useEffect } from "react";
import {
  getAccessGroupInfo,
  createAccessGroup,
  addAccessGroupMembers,
  getSingleProfile,
  accessGroupStandardDerivation,
} from "deso-protocol";
import { DeSoIdentityContext } from "react-deso-protocol";
import {
  Avatar,
  Paper,
  Group,
  Text,
  TextInput,
  Space,
  Center,
  Divider,
  Modal,
  ActionIcon,
  Tooltip,
  Button,
  Textarea,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconUserPlus } from "@tabler/icons-react";

export const CreateStream = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const { currentUser } = useContext(DeSoIdentityContext);
  const [userNotFound, setuserNotFound] = useState("");
  const [chatMember, setaddChatMember] = useState("");

  const createStreamChat = async () => {
    try {
      const resp = await createAccessGroup({
        AccessGroupOwnerPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        AccessGroupPublicKeyBase58Check:
          "BC1YLjYHZfYDqaFxLnfbnfVY48wToduQVHJopCx4Byfk4ovvwT6TboD",
        AccessGroupKeyName: `${currentUser.ProfileEntryResponse.Username}'s Wave Chat`,
      });
      console.log(resp);
    } catch (error) {
      console.log("something happened: " + error);
    }
  };

  const fetchStreamChat = async () => {
    try {
      const resp = await getAccessGroupInfo({
        AccessGroupOwnerPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        AccessGroupKeyName: `${currentUser.ProfileEntryResponse.Username}'s Wave Chat`,
      });
      console.log(resp);
    } catch (error) {
      console.log("something happened: " + error);
    }
  };

  const addChatMember = async () => {
    try {
      const request = {
        Username: chatMember,
        NoErrorOnMissing: true,
      };

      const profileResponse = await getSingleProfile(request);
      console.log(profileResponse);
      if (profileResponse === null) {
        setuserNotFound("User not found");
        return;
      }

      const groupMemberList = [
        {
          CurrentUserPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
          ProfileEntryResponse: profileResponse.Profile.PublicKeyBase58Check,
        },
      ];

      const resp = await addAccessGroupMembers({
        AccessGroupOwnerPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        AccessGroupKeyName: `${currentUser.ProfileEntryResponse.Username}'s Wave Chat`,
        AccessGroupMemberList: [profileResponse.Profile.PublicKeyBase58Check],
      });

      console.log(resp);
    } catch (error) {
      console.log("Error adding member " + error);
    }
  };

  return (
    <>
      <Modal opened={opened} onClose={close} title="Add Users" centered>
        <TextInput
          value={chatMember}
          error={userNotFound ? userNotFound : null}
          onChange={(event) => setaddChatMember(event.currentTarget.value)}
          placeholder="Enter Username"
          variant="filled"
          withAsterisk
        />

        <Space h="sm" />
        <Button
          onClick={() => {
            addChatMember();
          }}
          variant="light"
          color="blue"
          radius="xl"
          size="xs"
        >
          Add
        </Button>
      </Modal>

      <Center>
        <Divider my="sm" />
        <Paper style={{ width: "555px" }} shadow="xl" p="lg" withBorder>
          <Text fz="lg" fw={777} variant="gradient" align="center">
            Your Waves Chat
          </Text>
          <Tooltip label="Add Chat Members">
            <ActionIcon onClick={open}>
              <IconUserPlus size="1.125rem" />
            </ActionIcon>
          </Tooltip>
          <Divider my="sm" />
          <Group style={{ height: "555px" }}> chat section</Group>
          <Textarea placeholder="Send Chat" radius="lg" size="md" />
          <Space h="xs" />
          <Group position="right">
            <Button onClick={fetchStreamChat}>Chat</Button>
          </Group>
        </Paper>
      </Center>
    </>
  );
};
