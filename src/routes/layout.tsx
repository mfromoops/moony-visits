import {
  component$,
  createContextId,
  Signal,
  Slot,
  useContextProvider,
  useSignal,
  useStore,
  useTask$,
  useVisibleTask$
} from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import {
  routeAction$,
  routeLoader$,
  useLocation,
  useNavigate
} from "@builder.io/qwik-city";
import { type R2Bucket } from "@cloudflare/workers-types";
import ImgMoonyLogo from "~/media/moony-logo.jpeg?jsx";

export const onGet: RequestHandler = async ({
  cacheControl,
  cookie,
  url,
  redirect,
  platform,
}) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.builder.io/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    noCache: true,
  });
};

export const useServerTimeLoader = routeLoader$(() => {
  return {
    date: new Date().toISOString(),
  };
});

export const useGetUsers = routeLoader$(async ({ platform }) => {
  try {
    const { MOONY } = platform.env as typeof platform.env & {
      MOONY: R2Bucket;
      DB: R2Bucket;
    };
    const users = await MOONY.get("users");
    return (await users?.json()) as any[] | undefined;
  } catch {
    return [
      {
        id: 1,
        firstname: "John",
        lastnames: "Doe",
        phone: "123-456-7890",
      },
    ];
  }
});

export const useHasLogin = routeLoader$(async ({ platform }) => {
  try {
    const { MOONY } = platform.env as typeof platform.env & {
      MOONY: R2Bucket;
      DB: R2Bucket;
    };

    await MOONY.get("password")
      .then((res) => res?.json())
      .then((response) => (response as any[])?.length > 0);
    return {
      success: true,
    };
  } catch {
    return {
      success: false,
    };
  }
});

export const useClearSessions = routeAction$(async (data, { platform }) => {
  try {
    const { MOONY } = platform.env as typeof platform.env & {
      MOONY: R2Bucket;
      DB: R2Bucket;
    };
    await MOONY.put("session", JSON.stringify([]));
    return {
      success: true,
    };
  } catch {
    return {
      success: false,
    };
  }
});

export const useCheckSession = routeAction$(async ({session}, { platform }) => {
  try {
    const { MOONY } = platform.env as typeof platform.env & {
      MOONY: R2Bucket;
      DB: R2Bucket;
    };
    const sessionData = (await (await MOONY.get("session"))?.json()) as any[];
    console.log('sessionData', sessionData)
    console.log('session', session)
    return {
      success: sessionData?.includes(session)
    }
  } catch {
    return {
      success: false
    }
  }
});

export const CTX = createContextId<{ loggedIn: Signal<boolean> }>("auth");

export default component$(() => {
  const nav = useNavigate();
  const clearSessions = useClearSessions();
  const authStore = useStore({
    loggedIn: useSignal(false),
  });
  useContextProvider(CTX, authStore);

  useVisibleTask$(() => {
    console.log(location.pathname);
  })

  return (
    <>
      <nav class="flex w-full justify-between gap-5 py-2 pr-5">
        <ImgMoonyLogo class="w-20" />
        <span class="flex gap-5">
          <button onClick$={() => clearSessions.submit()}>Clear Sessions</button>
          <button onClick$={() => nav("/")}>Form</button>
          <button onClick$={() => nav("/users")}>Users</button>
          <button
            onClick$={() => {
              if (authStore.loggedIn.value) {
                localStorage.removeItem("session");
                authStore.loggedIn.value = false;
              }
              nav("/auth");
            }}
          >
            {authStore.loggedIn.value ? "Logout" : "Login"}
          </button>
        </span>
      </nav>
      <main>
        <Slot />
      </main>
    </>
  );
});
