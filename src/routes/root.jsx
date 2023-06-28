import { configure } from "deso-protocol";
import { DeSoIdentityContext } from "react-deso-protocol";
import { useContext } from "react";
import { Outlet } from "react-router-dom";
import { MantineAppShell } from "../components/AppShell/AppShell";
import { Loader, Center } from "@mantine/core";

configure({
  spendingLimitOptions: {
    GlobalDESOLimit: 10000000, // 0.01 DESO
    TransactionCountLimitMap: {
      UPDATE_PROFILE: "UNLIMITED",
      CREATE_NFT: "UNLIMITED",
      UPDATE_NFT: "UNLIMITED",
      SUBMIT_POST: "UNLIMITED",
      NEW_MESSAGE: "UNLIMITED",
      BASIC_TRANSFER: "UNLIMITED",
      FOLLOW: "UNLIMITED",
      LIKE: "UNLIMITED",
      CREATOR_COIN: "UNLIMITED",
      CREATOR_COIN_TRANSFER: "UNLIMITED",
      ACCEPT_NFT_BID: "UNLIMITED",
      BURN_NFT: "UNLIMITED",
      CREATE_USER_ASSOCIATION: "UNLIMITED",
      CREATE_POST_ASSOCIATION: "UNLIMITED",
      ACCESS_GROUP: "UNLIMITED",
      ACCESS_GROUP_MEMBERS: "UNLIMITED",
    },
    CreatorCoinOperationLimitMap: {
      "": { any: "UNLIMITED" },
    },
    AssociationLimitMap: [
      {
        AssociationClass: "Post",
        AssociationType: "",
        AppScopeType: "Any",
        AppPublicKeyBase58Check: "",
        AssociationOperation: "Any",
        OpCount: "UNLIMITED",
      },
      {
        AssociationClass: "User",
        AssociationType: "",
        AppPublicKeyBase58Check: "",
        AppScopeType: "Any",
        AssociationOperation: "Any",
        OpCount: "UNLIMITED",
      },
    ],
  },
});

configure({
  spendingLimitOptions: {
    IsUnlimited: true,
  },
});

export const Root = () => {
  const { isLoading } = useContext(DeSoIdentityContext);

  return (
    <MantineAppShell>
      <div role="main" className="main-content">
        {isLoading ? (
          <Center>
            <Loader variant="bars" />
          </Center>
        ) : (
          <Outlet />
        )}
      </div>
    </MantineAppShell>
  );
};
