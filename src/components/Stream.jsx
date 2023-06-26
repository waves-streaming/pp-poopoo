import { Player, useCreateStream, useUpdateStream } from "@livepeer/react";
import { useMemo, useState, useContext, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import {
  updateProfile,
  getIsFollowing,
  updateFollowingStatus,
} from "deso-protocol";
import {
  Paper,
  Textarea,
  Group,
  Button,
  Space,
  Center,
  CopyButton,
  ActionIcon,
  Tooltip,
  Card,
  Badge,
  Loader,
  Text,
  createStyles,
  Progress,
} from "@mantine/core";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { useInterval } from "@mantine/hooks";
import { DeSoIdentityContext } from "react-deso-protocol";

const useStyles = createStyles((theme) => ({
  button: {
    position: "relative",
    transition: "background-color 150ms ease",
  },

  progress: {
    ...theme.fn.cover(-1),
    height: "auto",
    backgroundColor: "transparent",
    zIndex: 0,
  },

  label: {
    position: "relative",
    zIndex: 1,
  },
}));

export const Stream = () => {
  const { currentUser } = useContext(DeSoIdentityContext);
  const [streamName, setStreamName] = useState("");
  const [isFollowingWaves, setisFollowingWaves] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [disable, { toggle }] = useDisclosure(false);
  const { classes, theme } = useStyles();
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const interval = useInterval(
    () =>
      setProgress((current) => {
        if (current < 100) {
          return current + 1;
        }

        interval.stop();
        setLoaded(true);
        return 0;
      }),
    20
  );

  // Allowing user to create streams via livepeers useCreateStream hook
  const {
    mutate: createStream,
    data: stream,
    status,
  } = useCreateStream(streamName ? { name: streamName } : null);

  const isLoading = useMemo(() => status === "loading", [status]);

  const streamId = stream?.id;

  //Allowing user to stop streaming via livepeers useUpdateStream hook to change suspend to true
  const { mutate: updateStream } = useUpdateStream({
    streamId,
    suspend: true,
  });

  const handleEndStream = async () => {
    updateStream?.();
    setStreamName("");
    try {
      await updateProfile({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        ProfilePublicKeyBase58Check: "",
        NewUsername: "",
        MinFeeRateNanosPerKB: 1000,
        NewCreatorBasisPoints: 100,
        NewDescription: "",
        NewStakeMultipleBasisPoints: 12500,
        ExtraData: {
          WavesStreamPlaybackId: "",
          WavesStreamTitle: "",
        },
      });
    } catch (error) {
      console.log("something happened: " + error);
    }
  };

  //On the instance where a user clicks off their profile while streaming or the 'end wave' doesnt work
  //Users can clear the playbackid and title
  const clearWave = async () => {
    try {
      await updateProfile({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        ProfilePublicKeyBase58Check: "",
        NewUsername: "",
        MinFeeRateNanosPerKB: 1000,
        NewCreatorBasisPoints: 100,
        NewDescription: "",
        NewStakeMultipleBasisPoints: 12500,
        ExtraData: {
          WavesStreamPlaybackId: "",
          WavesStreamTitle: "",
        },
      });
    } catch (error) {
      console.log("something happened: " + error);
    }
  };

  useEffect(() => {
    const isFollowingPublicKey = async () => {
      try {
        const result = await getIsFollowing({
          PublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
          IsFollowingPublicKeyBase58Check:
            "BC1YLfjx3jKZeoShqr2r3QttepoYmvJGEs7vbYx1WYoNmNW9FY5VUu6",
        });

        setisFollowingWaves(result.IsFollowing);
      } catch (error) {
        console.log("Something went wrong:", error);
      }
    };

    isFollowingPublicKey();
  }, [currentUser]);

  const attachStreamToDesoProfile = async () => {
    try {
      setIsButtonDisabled(true);

      if (isFollowingWaves === false) {
        await updateFollowingStatus({
          MinFeeRateNanosPerKB: 1000,
          IsUnfollow: false,
          FollowedPublicKeyBase58Check:
            "BC1YLfjx3jKZeoShqr2r3QttepoYmvJGEs7vbYx1WYoNmNW9FY5VUu6",
          FollowerPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        });
      }
      await updateProfile({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        ProfilePublicKeyBase58Check: "",
        NewUsername: "",
        MinFeeRateNanosPerKB: 1000,
        NewCreatorBasisPoints: 100,
        NewDescription: "",
        NewStakeMultipleBasisPoints: 12500,
        ExtraData: {
          WavesStreamPlaybackId: stream?.playbackId,
          WavesStreamTitle: stream?.name,
        },
      });
    } catch (error) {
      console.log("something happened: " + error);
      setIsButtonDisabled(false);
    }
  };

  return (
    <Paper shadow="sm" p="lg" withBorder>
      <>
        <Tooltip label="Clear Idle Wave from your profile">
          <Button size="xs" color="red" radius="xl" onClick={clearWave}>
            Clear Wave
          </Button>
        </Tooltip>
        <Space h="md" />
        <Center>
          <Text fz="lg" fw={777} c="dimmed" truncate>
            Start Streaming
          </Text>
        </Center>
        <Space h="md" />
        <Textarea
          placeholder="Enter Stream Title"
          variant="filled"
          radius="md"
          disabled={disable}
          onChange={(e) => setStreamName(e.target.value)}
        />
        <Space h="xl" />
      </>

      {status === "success" && (
        <>
          {streamName ? (
            <>
              <Center>
                <Card shadow="sm" p="lg" radius="md" withBorder>
                  <Group position="center">
                    <CopyButton
                      value="rtmp://rtmp.livepeer.com/live"
                      timeout={2000}
                    >
                      {({ copied, copy }) => (
                        <Button
                          fullWidth
                          color={copied ? "teal" : "blue"}
                          onClick={copy}
                        >
                          {copied ? (
                            <>
                              <Center>
                                <h4>Stream Server</h4>
                                <Space w="xs" />
                                <IconCheck size={16} />
                              </Center>
                            </>
                          ) : (
                            <>
                              <Center>
                                <h4>Stream Server</h4>
                                <Space w="xs" />
                                <IconCopy size={16} />
                              </Center>
                            </>
                          )}
                        </Button>
                      )}
                    </CopyButton>
                  </Group>
                  <Space h="md" />
                  <Group position="center">
                    <CopyButton value={stream.streamKey} timeout={2000}>
                      {({ copied, copy }) => (
                        <Button
                          fullWidth
                          color={copied ? "teal" : "blue"}
                          onClick={copy}
                        >
                          {copied ? (
                            <>
                              <Center>
                                <h4>Stream Key</h4>
                                <Space w="xs" />
                                <IconCheck size={16} />
                              </Center>
                            </>
                          ) : (
                            <>
                              <Center>
                                <h4>Stream Key</h4>
                                <Space w="xs" />
                                <IconCopy size={16} />
                              </Center>
                            </>
                          )}
                        </Button>
                      )}
                    </CopyButton>

                    <Button
                      fullWidth
                      className={classes.button}
                      onClick={() => {
                        attachStreamToDesoProfile();
                        loaded
                          ? setLoaded(false)
                          : !interval.active && interval.start();
                      }}
                      color={loaded ? "teal" : "blue"}
                    >
                      <div className={classes.label}>
                        {progress !== 0
                          ? "Launching"
                          : loaded
                          ? "Launched"
                          : "Launch Wave to Deso"}
                      </div>
                      {progress !== 0 && (
                        <Progress
                          value={progress}
                          className={classes.progress}
                          color={theme.fn.rgba(
                            theme.colors[theme.primaryColor][2],
                            0.35
                          )}
                          radius="sm"
                        />
                      )}
                    </Button>
                  </Group>
                  <Space h="md" />
                  <Group position="center">
                    <Badge radius="sm" size="xl">
                      {streamName}
                    </Badge>
                  </Group>
                  <Space h="md" />
                </Card>
                <Space h="xl" />
              </Center>
              <Space h="md" />
              <Group position="center">
                <Player
                  title={stream?.name}
                  playbackId={stream?.playbackId}
                  autoPlay
                  muted
                />
              </Group>

              <Space h="md" />
              <Group position="center">
                <Button
                  fullWidth
                  color="red"
                  radius="xl"
                  onClick={handleEndStream}
                >
                  End Wave
                </Button>
              </Group>
            </>
          ) : (
            <Group position="center">
              <p>Wave suspended. Refresh to create a new Wave.</p>
            </Group>
          )}
        </>
      )}

      {status === "loading" && (
        <Group position="center">
          <Loader size="sm" />
        </Group>
      )}

      {status === "error" && (
        <Group position="center">
          <p>Error occurred while creating your wave.</p>
        </Group>
      )}

      <Space h="md" />
      {!stream && (
        <Group position="center">
          <Button
            radius="xl"
            onClick={() => {
              toggle();

              createStream?.(); // Create the stream and store the result
            }}
            disabled={isLoading || !createStream}
          >
            Create Wave
          </Button>
        </Group>
      )}
    </Paper>
  );
};
