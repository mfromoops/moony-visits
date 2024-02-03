import { component$, useContext, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import { Form, routeAction$, useNavigate } from "@builder.io/qwik-city";
import { R2Bucket } from "@cloudflare/workers-types";
import cryptoJS from "crypto-js";
import { CTX, useHasLogin } from "../layout";
const { SHA512 } = cryptoJS;

export const useLogin = routeAction$(async (data, { platform }) => {
  try {
    const { MOONY } = platform.env as typeof platform.env & {
      MOONY: R2Bucket;
      DB: R2Bucket;
    };
    const password = await MOONY.get("password");
    const pass = (await password?.json()) as any[];
    if (!pass || pass.length === 0) return false;
    return {
      success: pass[0] === SHA512(data.password as string).toString(),
    };
  } catch {
    return {
      success: false,
    };
  }
});

export const useCreateLogin = routeAction$(async (data, { platform }) => {
  try {
    const { MOONY } = platform.env as typeof platform.env & {
      MOONY: R2Bucket;
      DB: R2Bucket;
    };
    MOONY.put(
      "password",
      JSON.stringify([SHA512(data.password as string).toString()]),
    );
    return {
      success: true,
    };
  } catch {
    return {
      success: false,
    };
  }
});

const useAddSession = routeAction$(
  async (data, { platform, cookie, request, url }) => {
    try {
      const { MOONY } = platform.env as typeof platform.env & {
        MOONY: R2Bucket;
        DB: R2Bucket;
      };
      const uuid = data.uuid as string;
      const session = (await (await MOONY.get("session"))?.json()) as any[];
      if (!session || session.length === 0)
        return MOONY.put("session", JSON.stringify([uuid]));
      else {
        MOONY.put("session", JSON.stringify([uuid, ...session]));
      }
      return {
        success: true,
      };
    } catch {
      return {
        success: false,
      };
    }
  },
);

export default component$(() => {
  const login = useLogin();
  const hasLogin = useHasLogin();
  const useCreate = useCreateLogin();
  const nav = useNavigate();
  const addSession = useAddSession();
  console.log({ loggedIn: login.value });
  const ctx = useContext(CTX);
  useTask$(({ track }) => {
    track(() => login.value?.success);
    console.log({ login: login.value?.success });
    if (login.value?.success) {
      const uuid = crypto.randomUUID();
      addSession.submit({ uuid }).then((res) => {
        localStorage.setItem("session", uuid);
        ctx.loggedIn.value = true;
        nav("/");
      });
    }
  });

  useVisibleTask$(() => {
    console.log(location.pathname);
  })

  return (
    <>
      <div class="container mx-auto">
        {hasLogin.value.success ? (
          <>
            <Form class="my-5 grid gap-2 bg-white p-5 shadow-md" action={login}>
              <div class="text-center">
                <h1>Login</h1>
              </div>
              <input name="password" class="border" type="password" />
              <button class="py2 bg-blue-500 px-4 text-white" type="submit">
                Login
              </button>
            </Form>
          </>
        ) : (
          <>
            <Form
              action={useCreate}
              class="my-5 grid gap-2 bg-white p-5 shadow-md"
            >
              <h1 class="text-center text-lg">Create a password</h1>
              <input class="border" name="password" type="password" />
              <button class="bg-green-500 text-white" type="submit">
                Create
              </button>
            </Form>
          </>
        )}
      </div>
    </>
  );
});
