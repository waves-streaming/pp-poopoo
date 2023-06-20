import { useLocation } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { Player } from "@livepeer/react";
import {
  IconHeart,
  IconDiamond,
  IconRecycle,
  IconMessageCircle,
} from "@tabler/icons-react";
import {
  getFollowersForUser,
  getPostsForUser,
  getNFTsForUser,
  getSingleProfile,
  updateFollowingStatus,
  getIsFollowing,
  identity,
  submitPost,
  createPostAssociation,
  sendDiamonds,
} from "deso-protocol";
import {
  Avatar,
  Paper,
  Group,
  Text,
  Card,
  Space,
  rem,
  Menu,
  Modal,
  Center,
  Divider,
  Image,
  Tabs,
  Badge,
  TypographyStylesProvider,
  createStyles,
  ActionIcon,
  Tooltip,
  Button,
  Textarea,
  Collapse,
  UnstyledButton,
} from "@mantine/core";
import { DeSoIdentityContext } from "react-deso-protocol";
import { RiUserUnfollowLine } from "react-icons/ri";
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

  menuControl: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    border: 0,
    borderLeft: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white
    }`,
  },

  button: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  avatar: {
    border: `${rem(2)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.white
    }`,
  },
}));

export const Wave = () => {
  const { classes } = useStyles();
  const location = useLocation();
  const { userPublicKey, userName, description, largeProfPic, featureImage } =
    location.state;
  const [posts, setPosts] = useState([]);
  const [NFTs, setNFTs] = useState([]);
  const [profile, setProfile] = useState([]);
  const [followerInfo, setFollowers] = useState({ followers: 0, following: 0 });
  const [activeTab, setActiveTab] = useState("first");
  const { currentUser } = useContext(DeSoIdentityContext);
  const [isFollowingUser, setisFollowingUser] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [opened, { open, close }] = useDisclosure(false);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const following = await getFollowersForUser({
          PublicKeyBase58Check: userPublicKey,
        });
        const followers = await getFollowersForUser({
          PublicKeyBase58Check: userPublicKey,
          GetEntriesFollowingUsername: true,
        });

        const profileData = await getSingleProfile({
          Username: userName,
        });

        setProfile(profileData.Profile);

        setFollowers({ following, followers });
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchProfile();
  }, [userPublicKey]);

  useEffect(() => {
    if (currentUser) {
      const getIsFollowingData = async () => {
        try {
          const result = await getIsFollowing({
            PublicKeyBase58Check: currentUser.PublicKeyBase58Check,
            IsFollowingPublicKeyBase58Check: userPublicKey,
          });
          console.log("Is Following:", result.IsFollowing);
          setisFollowingUser(result.IsFollowing);
        } catch (error) {
          console.error("Error checking if following:", error);
        }
      };

      getIsFollowingData();
    }
  }, [currentUser, isFollowingUser]);

  const getIsFollowingData = async () => {
    try {
      const result = await getIsFollowing({
        PublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        IsFollowingPublicKeyBase58Check: userPublicKey,
      });
      console.log("Is Following:", result.IsFollowing);
      setisFollowingUser(result.IsFollowing);
    } catch (error) {
      console.error("Error checking if following:", error);
    }
  };

  const followUser = async () => {
    await updateFollowingStatus({
      MinFeeRateNanosPerKB: 1000,
      IsUnfollow: false,
      FollowedPublicKeyBase58Check: userPublicKey,
      FollowerPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
    });
    getIsFollowingData();
  };

  const unfollowUser = async () => {
    await updateFollowingStatus({
      MinFeeRateNanosPerKB: 1000,
      IsUnfollow: true,
      FollowedPublicKeyBase58Check: userPublicKey,
      FollowerPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
    });
    getIsFollowingData();
  };

  const fetchPosts = async () => {
    try {
      const postData = await getPostsForUser({
        PublicKeyBase58Check: userPublicKey,
        NumToFetch: 25,
      });
      setPosts(postData.Posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  const fetchNFTs = async () => {
    try {
      const nftData = await getNFTsForUser({
        UserPublicKeyBase58Check: userPublicKey,
        IsForSale: true,
      });
      setNFTs(nftData.NFTsMap);
    } catch (error) {
      console.error("Error fetching user NFTs:", error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // Fetch posts if the "Posts" tab is selected
    if (tab === "first") {
      fetchPosts();
    }

    // Fetch NFTs if the "NFTs" tab is selected
    if (tab === "second") {
      fetchNFTs();
    }
  };

  useEffect(() => {
    fetchPosts(); // Fetch posts initially
  }, [userPublicKey]);

  useEffect(() => {
    fetchNFTs(); // Fetch NFTs initially
  }, [userPublicKey]);

  const [commentToggles, setCommentToggles] = useState({});

  const [comment, setComment] = useState("");

  // Add a new state variable to track the current comment post hash
  const [commentPostHash, setCommentPostHash] = useState("");

  // Function to handle comment submission
  const submitComment = async () => {
    try {
      await submitPost({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        ParentStakeID: commentPostHash, // Use the commentPostHash as ParentStakeID
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

    // Reset the comment and commentPostHash state after submitting
    setComment("");
    setCommentPostHash("");
  };

  // Function to handle toggling the comment section
  const handleCommentToggle = (postHash) => {
    // Update the commentPostHash state when the user clicks on the comment button
    setCommentPostHash(postHash);
    setCommentToggles((prevState) => ({
      ...prevState,
      [postHash]: !prevState[postHash],
    }));
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
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section>
          <Image src={featureImage} height={200} withPlaceholder />
        </Card.Section>

        <Center>
          <Avatar
            size={80}
            radius={80}
            src={
              `https://node.deso.org/api/v0/get-single-profile-picture/${userPublicKey}` || {
                largeProfPic,
              }
            }
            alt="Profile Picture"
            mx="auto"
            mt={-30}
            className={classes.avatar}
          />
        </Center>

        <Center>
          <Text fz="lg" fw={777} variant="gradient" truncate>
            {userName}'s Wave
          </Text>
        </Center>

        <Space h="md" />
        <Card.Section>
          {profile &&
          profile.ExtraData &&
          profile.ExtraData.WavesStreamPlaybackId &&
          profile.ExtraData.WavesStreamTitle ? (
            <Player
              playbackId={profile.ExtraData?.WavesStreamPlaybackId}
              title={profile.ExtraData?.WavesStreamTitle}
              autoPlay
              muted
            />
          ) : (
            <Divider
              my="xs"
              label={
                <>
                  <Badge
                    size="md"
                    radius="sm"
                    variant="gradient"
                    gradient={{ from: "indigo", to: "cyan", deg: 45 }}
                  >
                    Not live right now
                  </Badge>
                </>
              }
              labelPosition="center"
            />
          )}
        </Card.Section>
        <Space h="md" />

        <Paper shadow="xl" radius="md" p="xl">
          <Text
            fz="sm"
            style={{
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "wrap",
            }}
          >
            {description}
          </Text>
        </Paper>

        <Space h="sm" />

        <Center>
          {followerInfo.followers && followerInfo.followers.NumFollowers ? (
            <Text fz="sm">
              Followers: {followerInfo.followers.NumFollowers}
            </Text>
          ) : (
            <Text fz="sm">Followers: 0</Text>
          )}

          <Space w="sm" />
          <Divider size="sm" orientation="vertical" />
          <Space w="sm" />
          {followerInfo.following && followerInfo.following.NumFollowers ? (
            <Text fz="sm">
              Following: {followerInfo.following.NumFollowers}
            </Text>
          ) : (
            <Text fz="sm">Following: 0</Text>
          )}
        </Center>
        <Space h="md" />
        <Space h="md" />
        {currentUser ? (
          isFollowingUser ? (
            <Group noWrap spacing={0}>
              <Button
                fullWidth
                variant="gradient"
                gradient={{ from: "cyan", to: "indigo" }}
                className={classes.button}
              >
                Following
              </Button>
              <Tooltip
                label="Unfollow User"
                color="gray"
                withArrow
                arrowPosition="center"
              >
                <ActionIcon
                  variant="filled"
                  color="indigo"
                  size={36}
                  className={classes.menuControl}
                  onClick={unfollowUser}
                >
                  <RiUserUnfollowLine size="1rem" stroke={1.5} />
                </ActionIcon>
              </Tooltip>
            </Group>
          ) : (
            <Button
              fullWidth
              variant="gradient"
              gradient={{ from: "cyan", to: "indigo" }}
              radius="md"
              onClick={followUser}
            >
              Follow
            </Button>
          )
        ) : (
          <Button
            fullWidth
            variant="gradient"
            gradient={{ from: "cyan", to: "indigo" }}
            radius="md"
            onClick={() => identity.login()}
          >
            Login to Follow
          </Button>
        )}
      </Card>

      <Space h="xl" />

      <Tabs radius="sm" value={activeTab} onTabChange={handleTabChange}>
        <Tabs.List grow position="center">
          <Tabs.Tab value="first">
            <Text fz="sm">Posts</Text>
          </Tabs.Tab>

          <Tabs.Tab value="second">
            <Text fz="sm">NFTs</Text>
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="first">
          {posts && posts.length > 0 ? (
            posts.map((post, index) => (
              <Paper
                m="md"
                shadow="lg"
                radius="md"
                p="xl"
                withBorder
                key={index}
                className={classes.comment}
              >
                <Center>
                  {post.ProfileEntryResponse &&
                  post.ProfileEntryResponse.ExtraData?.LargeProfilePicURL ? (
                    <Avatar
                      radius="xl"
                      size="lg"
                      src={
                        post.ProfileEntryResponse.ExtraData?.LargeProfilePicURL
                      }
                    />
                  ) : (
                    <Avatar
                      radius="xl"
                      size="lg"
                      src={`https://node.deso.org/api/v0/get-single-profile-picture/${userPublicKey}`}
                    />
                  )}

                  <Space w="xs" />
                  <Text weight="bold" size="sm">
                    {userName}
                  </Text>
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
                      title={post.PostHashHex}
                      src={post.VideoURLs}
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

              <Badge
                size="md"
                radius="sm"
                variant="gradient"
                gradient={{ from: "indigo", to: "cyan", deg: 45 }}
              >
                Post something to view them here!
              </Badge>

              <Space h={222} />
            </Center>
          )}
        </Tabs.Panel>
        <Tabs.Panel value="second">
          {NFTs && Object.keys(NFTs).length > 0 ? (
            Object.keys(NFTs).map((key, index) => {
              const nft = NFTs[key];
              return (
                <Paper
                  m="md"
                  shadow="lg"
                  radius="md"
                  p="xl"
                  withBorder
                  key={index}
                  className={classes.comment}
                >
                  <Center>
                    <Avatar
                      size="lg"
                      radius="xl"
                      src={
                        `https://node.deso.org/api/v0/get-single-profile-picture/${userPublicKey}` ||
                        null
                      }
                      alt="Profile Picture"
                    />
                    <Space w="xs" />
                    <Text weight="bold" size="sm">
                      {userName}
                    </Text>
                  </Center>
                  <Space h="sm" />
                  <TypographyStylesProvider>
                    <Text align="center" size="md" className={classes.body}>
                      {nft.PostEntryResponse.Body}
                    </Text>
                  </TypographyStylesProvider>
                  <Space h="md" />
                  {nft.PostEntryResponse.VideoURLs && (
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
                        src={nft.VideoURLs}
                        title={nft.PostHashHex}
                      />
                    </Group>
                  )}
                  {nft.PostEntryResponse.ImageURLs && (
                    <Group position="center">
                      <UnstyledButton
                        onClick={() => {
                          setSelectedImage(nft.PostEntryResponse.ImageURLs[0]);
                          open();
                        }}
                      >
                        <Image
                          src={nft.PostEntryResponse.ImageURLs[0]}
                          radius="md"
                          alt="repost-image"
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
                          currentUser &&
                          submitHeart(nft.PostEntryResponse.PostHashHex)
                        }
                        variant="subtle"
                        radius="md"
                        size={36}
                      >
                        <IconHeart
                          color={
                            heartSuccess &&
                            currentHeartPostHash ===
                              nft.PostEntryResponse.PostHashHex
                              ? "red"
                              : "white"
                          }
                          size={18}
                          stroke={1.5}
                        />
                      </ActionIcon>
                    </Tooltip>
                    <Text size="xs" color="dimmed">
                      {nft.PostEntryResponse.LikeCount}
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
                          currentUser &&
                          submitRepost(nft.PostEntryResponse.PostHashHex)
                        }
                        variant="subtle"
                        radius="md"
                        size={36}
                      >
                        <IconRecycle
                          color={
                            repostSuccess &&
                            currentPostHash ===
                              nft.PostEntryResponse.PostHashHex
                              ? "#228BE6"
                              : "#FFFFFF"
                          }
                          size={18}
                          stroke={1.5}
                        />
                      </ActionIcon>
                    </Tooltip>
                    <Text size="xs" color="dimmed">
                      {nft.PostEntryResponse.RepostCount}
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
                            nft.PostEntryResponse.PostHashHex,
                            nft.PostEntryResponse.PosterPublicKeyBase58Check
                          )
                        }
                        variant="subtle"
                        radius="md"
                        size={36}
                      >
                        <IconDiamond
                          color={
                            diamondTipSuccess &&
                            currentDiamondPostHash ===
                              nft.PostEntryResponse.PostHashHex
                              ? "#228BE6"
                              : "#FFFFFF"
                          }
                          size={18}
                          stroke={1.5}
                        />
                      </ActionIcon>
                    </Tooltip>
                    <Text size="xs" color="dimmed">
                      {nft.PostEntryResponse.DiamondCount}
                    </Text>

                    <Space w="sm" />

                    <Tooltip
                      transition="slide-down"
                      withArrow
                      position="bottom"
                      label="Comments"
                    >
                      <ActionIcon
                        onClick={() =>
                          handleCommentToggle(nft.PostEntryResponse.PostHashHex)
                        }
                        variant="subtle"
                        radius="md"
                        size={36}
                      >
                        <IconMessageCircle size={18} stroke={1.5} />
                      </ActionIcon>
                    </Tooltip>
                    <Text size="xs" color="dimmed">
                      {nft.PostEntryResponse.CommentCount}
                    </Text>
                  </Center>
                  <Collapse
                    in={commentToggles[nft.PostEntryResponse.PostHashHex]}
                  >
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
              );
            })
          ) : (
            <Center>
              <Space h="md" />

              <Badge
                size="md"
                radius="sm"
                variant="gradient"
                gradient={{ from: "indigo", to: "cyan", deg: 45 }}
              >
                Mint/Buy some NFTs to view them here!
              </Badge>

              <Space h={222} />
            </Center>
          )}
        </Tabs.Panel>
      </Tabs>

      <Modal opened={opened} onClose={close} size="auto" centered>
        <Image src={selectedImage} radius="md" alt="post-image" fit="contain" />
      </Modal>
    </>
  );
};
