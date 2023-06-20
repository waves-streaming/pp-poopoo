import {
  getPostsStateless,
  getFollowersForUser,
  getIsFollowing,
  submitPost,
  createPostAssociation,
  sendDiamonds,
} from "deso-protocol";
import { useEffect, useState, useContext } from "react";
import { DeSoIdentityContext } from "react-deso-protocol";

import {
  Text,
  UnstyledButton,
  
  Avatar,
  Group,
  Badge,
  createStyles,
  Paper,
  TypographyStylesProvider,
  Center,
  Space,
  ActionIcon,
  Tooltip,
  Image,
  Loader,
  Button,
  Textarea,
  Collapse,
  Modal
} from "@mantine/core";
import {
  IconHeart,
  IconDiamond,
  IconRecycle,
  IconMessageCircle,
} from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { Player } from "@livepeer/react";
import { useDisclosure } from "@mantine/hooks";

const useStyles = createStyles((theme) => ({
  comment: {
    padding: `${theme.spacing.lg}px ${theme.spacing.xl}px`,
  },
  body: {
    paddingTop: theme.spacing.sm,
    fontSize: theme.fontSizes.sm,
    wordWrap: "break-word",
  },
  content: {
    "& > p:last-child": {
      marginBottom: 0,
    },
  },
}));

export const FollowerFeed = () => {
  const navigate = useNavigate();
  const { currentUser, isLoading } = useContext(DeSoIdentityContext);
  const { classes } = useStyles();
  const [followerFeed, setFollowerFeed] = useState([]);
  const [followingWaves, setFollowingWaves] = useState([]);
  const [filteredWaves, setFilteredWaves] = useState([]);
  const [waves, setWaves] = useState([]);
  const userPublicKey = currentUser?.PublicKeyBase58Check;
 const [selectedImage, setSelectedImage] = useState("");
   const [opened, { open, close }] = useDisclosure(false);
  useEffect(() => {
    const fetchFollowerFeed = async () => {
      try {
        const followerFeedData = await getPostsStateless({
          ReaderPublicKeyBase58Check: userPublicKey,
          NumToFetch: 30,
          GetPostsForFollowFeed: true,
          FetchSubcomments: true,
        });

        setFollowerFeed(followerFeedData.PostsFound);
      } catch (error) {
        console.error("Error fetching user hotFeed:", error);
      }
    };

    const fetchWaves = async () => {
      try {
        //Getting Profiles that are following the Waves_Streams Account
        const resultWaves = await getFollowersForUser({
          Username: "Waves_Streams",
          GetEntriesFollowingUsername: true,
          //Will have to increase as the followers increase
          NumToFetch: 20,
        });

        setWaves(Object.values(resultWaves.PublicKeyToProfileEntry));
      } catch (error) {
        console.log("Something went wrong:", error);
      }
    };

    if (currentUser) {
      fetchFollowerFeed();
      fetchWaves();
    }
  }, [currentUser, userPublicKey]);

  // Filtering the waves array based on conditions
  const filterWaves = () => {
    const filtered = waves.filter(
      (post) =>
        post.ExtraData?.WavesStreamPlaybackId &&
        post.ExtraData?.WavesStreamPlaybackId !== "" &&
        post.ExtraData?.WavesStreamTitle &&
        post.ExtraData?.WavesStreamTitle !== ""
    );
    console.log(filteredWaves);
    setFilteredWaves(filtered);
  };

  // Call the filterWaves function whenever the waves array updates
  useEffect(() => {
    filterWaves();
  }, [waves]);

  // Check if the current user is following the profiles in filteredPosts
  const fetchFollowingPosts = async () => {
    const followingPosts = [];
    for (const post of filteredWaves) {
      const request = {
        PublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        IsFollowingPublicKeyBase58Check: post.PublicKeyBase58Check,
      };
      const response = await getIsFollowing(request);
      if (response.IsFollowing === true) {
        followingPosts.push(post);
      }
    }
    setFollowingWaves(followingPosts);
  };

  useEffect(() => {
    if (currentUser) {
      fetchFollowingPosts();
    }
  }, [filteredWaves]);

  const [commentToggles, setCommentToggles] = useState({});
  const [commentPostHash, setCommentPostHash] = useState("");
  const [comment, setComment] = useState("");

  const handleCommentToggle = (postHash) => {
    setCommentPostHash(postHash);
    setCommentToggles((prevState) => ({
      ...prevState,
      [postHash]: !prevState[postHash],
    }));
  };

  const submitComment = async () => {
    try {
      await submitPost({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        ParentStakeID: commentPostHash,
        BodyObj: {
          Body: comment,
          VideoURLs: [],
          ImageURLs: [],
        },
      });

      alert("Comment submitted successfully!");
    } catch (error) {
      alert("Error submitting comment. Please try again.");
      console.error("Error submitting comment:", error);
    }

    // Reset the comment state after submitting
    setComment("");
  };

  const [repostSuccess, setRepostSuccess] = useState(false);
  const [currentPostHash, setCurrentPostHash] = useState("");
  const submitRepost = async (postHash) => {
    try {
      await submitPost({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        RepostedPostHashHex: postHash,
        BodyObj: {
          Body: "",
          VideoURLs: [],
          ImageURLs: [],
        },
      });
      setRepostSuccess(true);
      setCurrentPostHash(postHash);
    } catch (error) {
      alert("Error submitting Repost. Please try again.");
      console.error("Error submitting Repost:", error);
    }
  };

  const [heartSuccess, setHeartSuccess] = useState(false);
  const [currentHeartPostHash, setCurrentHeartPostHash] = useState("");
  const submitHeart = async (postHash) => {
    try {
      await createPostAssociation({
        TransactorPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        PostHashHex: postHash,
        AssociationType: "Reaction",
        AssociationValue: "Heart",
        MinFeeRateNanosPerKB: 1000,
      });
      setHeartSuccess(true);
      setCurrentHeartPostHash(postHash);
    } catch (error) {
      alert("Error submitting heart. Please try again.");
      console.error("Error submitting heart:", error);
    }
  };

  const [diamondTipSuccess, setDiamondTipSuccess] = useState(false);
  const [currentDiamondPostHash, setCurrentDiamondPostHash] = useState("");

  const sendDiamondTip = async (postHash, postPubKey) => {
    setCurrentDiamondPostHash(postHash);

    try {
      await sendDiamonds({
        ReceiverPublicKeyBase58Check: postPubKey,
        SenderPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        DiamondPostHashHex: postHash,
        DiamondLevel: 1,
        MinFeeRateNanosPerKB: 1000,
      });
      setDiamondTipSuccess(true);
    } catch (error) {
      alert("Error submitting diamond. Please try again.");
      console.error("Error submitting diamond:", error);
    }
  };

  return (
    <>
      <div>
        {currentUser &&
          followingWaves &&
          followingWaves.length > 0 &&
          followingWaves.map((post) => {
            if (
              post.PublicKeyBase58Check === currentUser.PublicKeyBase58Check
            ) {
              return null; // Exclude current user from the list
            }

            return (
              <Paper
                m="md"
                shadow="lg"
                radius="md"
                p="xl"
                withBorder
                key={post.PublicKeyBase58Check}
                className={classes.comment}
              >
                <Center>
                  <ActionIcon
                    onClick={() => {
                      const state = {
                        userPublicKey: post.PublicKeyBase58Check,
                        userName: post.Username || post.PublicKeyBase58Check,
                        description: post.Description || null,
                        largeProfPic:
                          post.ExtraData?.LargeProfilePicURL || null,
                        featureImage: post.ExtraData?.FeaturedImageURL || null,
                      };

                      navigate(`/wave/${post.Username}`, {
                        state,
                      });
                    }}
                    variant="transparent"
                  >
                    <Avatar
                      radius="xl"
                      size="lg"
                      src={
                        post.ExtraData?.LargeProfilePicURL ||
                        `https://node.deso.org/api/v0/get-single-profile-picture/${post.PublicKeyBase58Check}` ||
                        null
                      }
                    />
                    <Space w="xs" />
                    <Text weight="bold" size="sm">
                      {post.Username}
                    </Text>
                  </ActionIcon>
                </Center>
                <Space h="xl" />
                <Player
                  playbackId={post.ExtraData.WavesStreamPlaybackId}
                  title={post.ExtraData.WavesStreamTitle}
                  automute
                />
              </Paper>
            );
          })}
      </div>

      <div>
        {currentUser ? (
          followerFeed && followerFeed.length > 0 ? (
            followerFeed.map((post) => (
              <Paper
                m="md"
                shadow="lg"
                radius="md"
                p="xl"
                withBorder
                key={post.PostHashHex}
                className={classes.comment}
              >
                <Center>
                  <ActionIcon
                    onClick={() => {
                      const state = {
                        userPublicKey: post.PosterPublicKeyBase58Check,
                        userName: post.ProfileEntryResponse.Username
                          ? post.ProfileEntryResponse.Username
                          : post.PosterPublicKeyBase58Check,
                        description: post.ProfileEntryResponse.Description
                          ? post.ProfileEntryResponse.Description
                          : null,
                        largeProfPic:
                          post.ProfileEntryResponse.ExtraData &&
                          post.ProfileEntryResponse.ExtraData.LargeProfilePicURL
                            ? post.ProfileEntryResponse.ExtraData
                                .LargeProfilePicURL
                            : null,
                        featureImage:
                          post.ProfileEntryResponse.ExtraData &&
                          post.ProfileEntryResponse.ExtraData.FeaturedImageURL
                            ? post.ProfileEntryResponse.ExtraData
                                .FeaturedImageURL
                            : null,
                      };

                      navigate(`/wave/${post.ProfileEntryResponse.Username}`, {
                        state,
                      });
                    }}
                    variant="transparent"
                  >
                    {post.ProfileEntryResponse &&
                    post.ProfileEntryResponse.ExtraData?.LargeProfilePicURL ? (
                      <Avatar
                        radius="xl"
                        size="lg"
                        src={
                          post.ProfileEntryResponse.ExtraData.LargeProfilePicURL
                        }
                      />
                    ) : (
                      <Avatar
                        radius="xl"
                        size="lg"
                        src={`https://node.deso.org/api/v0/get-single-profile-picture/${post.ProfileEntryResponse.PublicKeyBase58Check}`}
                      />
                    )}

                    <Space w="xs" />
                    <Text weight="bold" size="sm">
                      {post.ProfileEntryResponse.Username}
                    </Text>
                  </ActionIcon>
                </Center>

                <TypographyStylesProvider>
                  <Space h="sm" />
                  <Text align="center" size="md" className={classes.body}>
                    {post.Body}
                  </Text>
                </TypographyStylesProvider>

                <Space h="md" />
                {post.RepostedPostEntryResponse && (
                  <Paper
                    m="md"
                    shadow="lg"
                    radius="md"
                    p="xl"
                    withBorder
                    key={post.RepostedPostEntryResponse.PostHashHex}
                    className={classes.comment}
                  >
                    <Center>
                      <Avatar
                        radius="xl"
                        size="lg"
                        src={
                          post.RepostedPostEntryResponse?.ProfileEntryResponse
                            ?.ExtraData?.LargeProfilePicURL ||
                          `https://node.deso.org/api/v0/get-single-profile-picture/${post.RepostedPostEntryResponse?.ProfileEntryResponse?.PublicKeyBase58Check}`
                        }
                      />

                      <Space w="xs" />
                      <Text weight="bold" size="sm">
                        {
                          post.RepostedPostEntryResponse.ProfileEntryResponse
                            ?.Username
                        }
                      </Text>
                    </Center>
                    <TypographyStylesProvider>
                      <Space h="sm" />
                      <Text align="center" size="md" className={classes.body}>
                        {post.RepostedPostEntryResponse.Body}
                      </Text>
                    </TypographyStylesProvider>

                    <Space h="md" />

                    {post.RepostedPostEntryResponse.VideoURLs && (
                      <Group
                        style={{
                          width: "100%",
                          height: "100%",
                          position: "relative",
                        }}
                        position="center"
                      >
                        <iframe
                          style={{ width: "100%", height: "100%" }}
                          src={post.RepostedPostEntryResponse.VideoURLs}
                          title={post.RepostedPostEntryResponse.PostHashHex}
                        />
                      </Group>
                    )}
                    {post.RepostedPostEntryResponse.ImageURLs &&
                      post.RepostedPostEntryResponse.ImageURLs.length > 0 && (
                        <Group position="center">
                          <UnstyledButton
                            onClick={() => {
                              setSelectedImage(
                                post.RepostedPostEntryResponse.ImageURLs[0]
                              );
                              open();
                            }}
                          >
                            <Image
                              src={post.RepostedPostEntryResponse.ImageURLs[0]}
                              radius="md"
                              alt="repost-image"
                              fit="contain"
                            />
                          </UnstyledButton>
                        </Group>
                      )}
                  </Paper>
                )}
                {post.VideoURLs && (
                  <Group
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                    }}
                    position="center"
                  >
                    <iframe
                      style={{ width: "100%", height: "100%" }}
                      src={post.VideoURLs}
                      title={post.PostHashHex}
                    />
                  </Group>
                )}
                {post.ImageURLs && (
                 <Group position="center">
                    <UnstyledButton
                      onClick={() => {
                        setSelectedImage(post.ImageURLs[0]);
                        open();
                      }}
                    >
                      <Image
                        src={post.ImageURLs[0]}
                        radius="md"
                        alt="post-image"
                        fit="contain"
                      />
                    </UnstyledButton>
                  </Group>
                )}

                <Space h="md" />

                <Center>
                  <Tooltip
                    transition="slide-down"
                    withArrow
                    position="bottom"
                    label="Like"
                  >
                    <ActionIcon
                      onClick={() =>
                        currentUser && submitHeart(post.PostHashHex)
                      }
                      variant="subtle"
                      radius="md"
                      size={36}
                    >
                      <IconHeart
                        color={
                          heartSuccess &&
                          currentHeartPostHash === post.PostHashHex
                            ? "red"
                            : "white"
                        }
                        size={18}
                        stroke={1.5}
                      />
                    </ActionIcon>
                  </Tooltip>
                  <Text size="xs" color="dimmed">
                    {post.LikeCount}
                  </Text>

                  <Space w="sm" />

                  <Tooltip
                    transition="slide-down"
                    withArrow
                    position="bottom"
                    label="Repost"
                  >
                    <ActionIcon
                      onClick={() =>
                        currentUser && submitRepost(post.PostHashHex)
                      }
                      variant="subtle"
                      radius="md"
                      size={36}
                    >
                      <IconRecycle
                        color={
                          repostSuccess && currentPostHash === post.PostHashHex
                            ? "#228BE6"
                            : "#FFFFFF"
                        }
                        size={18}
                        stroke={1.5}
                      />
                    </ActionIcon>
                  </Tooltip>
                  <Text size="xs" color="dimmed">
                    {post.RepostCount}
                  </Text>

                  <Space w="sm" />

                  <Tooltip
                    transition="slide-down"
                    withArrow
                    position="bottom"
                    label="Diamonds"
                  >
                    <ActionIcon
                      onClick={() =>
                        currentUser &&
                        sendDiamondTip(
                          post.PostHashHex,
                          post.PosterPublicKeyBase58Check
                        )
                      }
                      variant="subtle"
                      radius="md"
                      size={36}
                    >
                      <IconDiamond
                        color={
                          diamondTipSuccess &&
                          currentDiamondPostHash === post.PostHashHex
                            ? "#228BE6"
                            : "#FFFFFF"
                        }
                        size={18}
                        stroke={1.5}
                      />
                    </ActionIcon>
                  </Tooltip>
                  <Text size="xs" color="dimmed">
                    {post.DiamondCount}
                  </Text>

                  <Space w="sm" />

                  <Tooltip
                    transition="slide-down"
                    withArrow
                    position="bottom"
                    label="Comments"
                  >
                    <ActionIcon
                      onClick={() => handleCommentToggle(post.PostHashHex)}
                      variant="subtle"
                      radius="md"
                      size={36}
                    >
                      <IconMessageCircle size={18} stroke={1.5} />
                    </ActionIcon>
                  </Tooltip>
                  <Text size="xs" color="dimmed">
                    {post.CommentCount}
                  </Text>
                </Center>
                <Collapse in={commentToggles[post.PostHashHex]}>
                  <>
                    {currentUser && currentUser.ProfileEntryResponse ? (
                      <>
                        <Textarea
                          placeholder="Empower."
                          description="Your comment"
                          variant="filled"
                          value={comment}
                          onChange={(event) => setComment(event.target.value)}
                        />
                        <Space h="sm" />
                        <Group position="right">
                          <Button radius="md" onClick={() => submitComment()}>
                            Comment
                          </Button>
                        </Group>
                      </>
                    ) : (
                      <>
                        <Textarea
                          placeholder="Please Login/Signup or Set username to Comment."
                          description="Your comment"
                          variant="filled"
                          disabled
                        />
                        <Space h="sm" />
                        <Group position="right">
                          <Button radius="md" disabled>
                            Comment
                          </Button>
                        </Group>
                      </>
                    )}
                  </>
                </Collapse>
              </Paper>
            ))
          ) : (
            <Center>
              <Space h="md" />
              {isLoading ? (
                <Loader variant="bars" />
              ) : (
                <Badge
                  size="md"
                  radius="sm"
                  variant="gradient"
                  gradient={{ from: "indigo", to: "cyan", deg: 45 }}
                >
                  No posts found in the follower feed.
                </Badge>
              )}
              <Space h={222} />
            </Center>
          )
        ) : (
          <Center>
            <Space h="md" />

            <Badge
              size="md"
              radius="sm"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan", deg: 45 }}
            >
              Please login to view your Follower Feed.
            </Badge>

            <Space h={222} />
          </Center>
        )}
      </div>
      
       <Modal opened={opened} onClose={close} size="auto" centered>
        <Image src={selectedImage} radius="md" alt="post-image" fit="contain" />
      </Modal>
    </>
  );
};
