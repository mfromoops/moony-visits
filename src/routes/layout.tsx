import { component$, Slot } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import { routeLoader$, useNavigate } from "@builder.io/qwik-city";
import { type R2Bucket } from "@cloudflare/workers-types";
import ImgMoonyLogo from '~/media/moony-logo.jpeg?jsx';

export const onGet: RequestHandler = async ({ cacheControl }) => {
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
    return [{
      id: 1,
      firstname: "John",
      lastnames: "Doe",
      phone: "123-456-7890",
    }];
  }
});

export default component$(() => {
  const nav = useNavigate();
  return (
    <>
      <nav class="flex w-full justify-between gap-5 py-2 pr-5">
        <ImgMoonyLogo class="w-20"/>
        <span class="flex gap-5">
          <button onClick$={() => nav("/")}>Form</button>
          <button onClick$={() => nav("/users")}>Users</button>
        </span>
      </nav>
      <main>
        <Slot />
      </main>
    </>
  );
});
