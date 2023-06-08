import { getPostsStateless } from "deso-protocol";
import { useEffect, useState, useContext } from "react";
import { DeSoIdentityContext } from "react-deso-protocol";

import {
  Text,
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
} from "@mantine/core";
import {
  IconHeart,
  IconDiamond,
  IconRecycle,
  IconMessageCircle,
} from "@tabler/icons-react";
import { useNavigate } from "react-router";

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
  const userPublicKey = currentUser?.PublicKeyBase58Check;

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

    if (currentUser) {
      fetchFollowerFeed();
    }
  }, [currentUser, userPublicKey]);

  return (
    <>
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
                       largeProfPic: post.ProfileEntryResponse.ExtraData &&
    post.ProfileEntryResponse.ExtraData.LargeProfilePicURL
    ? post.ProfileEntryResponse.ExtraData.LargeProfilePicURL
    : null,
  featureImage: post.ProfileEntryResponse.ExtraData &&
    post.ProfileEntryResponse.ExtraData.FeaturedImageURL
    ? post.ProfileEntryResponse.ExtraData.FeaturedImageURL
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
                        radius="lg"
                        size="lg"
                        src={
                          post.ProfileEntryResponse.ExtraData.LargeProfilePicURL
                        }
                      />
                    ) : (
                      <Avatar
                        radius="lg"
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
                        radius="lg"
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
                          <Image
                            src={post.RepostedPostEntryResponse.ImageURLs[0]}
                            radius="md"
                            alt="repost-image"
                            fit="contain"
                          />
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
                    <Image
                      src={post.ImageURLs[0]}
                      radius="md"
                      alt="post-image"
                      fit="contain"
                    />
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
                    <ActionIcon variant="subtle" radius="md" size={36}>
                      <IconHeart size={18} stroke={1.5} />
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
                    <ActionIcon variant="subtle" radius="md" size={36}>
                      <IconRecycle size={18} stroke={1.5} />
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
                    <ActionIcon variant="subtle" radius="md" size={36}>
                      <IconDiamond size={18} stroke={1.5} />
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
                    <ActionIcon variant="subtle" radius="md" size={36}>
                      <IconMessageCircle size={18} stroke={1.5} />
                    </ActionIcon>
                  </Tooltip>
                  <Text size="xs" color="dimmed">
                    {post.CommentCount}
                  </Text>
                </Center>
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
    </>
  );
};
