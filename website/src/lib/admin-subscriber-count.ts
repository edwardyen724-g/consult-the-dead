type ClerkUser = {
  publicMetadata?: {
    subscription_tier?: unknown;
  } | null;
};

type ClerkUserPage = {
  data: ClerkUser[];
};

type ClerkUsersApi = {
  getUserList(args: { limit: number; offset: number }): Promise<ClerkUserPage>;
};

export type ClerkClientLike = {
  users: ClerkUsersApi;
};

const PAGE_SIZE = 100;

export function isProSubscriber(user: ClerkUser): boolean {
  return user.publicMetadata?.subscription_tier === "pro";
}

export async function countProSubscribers(clerk: ClerkClientLike): Promise<number> {
  let offset = 0;
  let total = 0;

  while (true) {
    const page = await clerk.users.getUserList({
      limit: PAGE_SIZE,
      offset,
    });

    for (const user of page.data) {
      if (isProSubscriber(user)) {
        total += 1;
      }
    }

    if (page.data.length < PAGE_SIZE) {
      break;
    }

    offset += PAGE_SIZE;
  }

  return total;
}
