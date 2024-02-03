import { component$, useContext, useSignal, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import VestibuloImg from "~/media/building.jpeg";
import { CTX, useCheckSession, useGetUsers } from "../layout";

export default component$(() => {
  const users = useGetUsers();
  const nav = useNavigate();
  const ctx = useContext(CTX);
  useTask$(() => {
    console.log('loaded users')
  })
  const usersList = useSignal(
    users.value?.sort((a, b) => {
      const res = a.created_at.localeCompare(b.created_at);
      return res;
    }),
  );
    const checkSession = useCheckSession();
  useVisibleTask$(() => {
    console.log(location.pathname);
    checkSession.submit({ session: localStorage.getItem("session") }).then(res => {
      console.log('login status', res.value.success)
      if (!res.value.success) {
        nav('/auth');
        ctx.loggedIn.value = false;
      } else {
        ctx.loggedIn.value = true;
      }
    });
  })

  return (
    <div>
      <img
        src={VestibuloImg}
        alt="Vestibulo"
        class="h-96 w-full object-cover"
        width={100}
        height={100}
      />
      {!usersList.value || usersList.value.length === 0 ? (
        <div class="mx-5 mt-5 flex h-full w-full items-center justify-center">
          <div class="rounded-lg bg-white p-6 shadow-lg">
            <h2 class="mb-2 text-2xl font-bold text-gray-800">
              No record found
            </h2>
            <p class="text-gray-700">
              You don't have any record yet, click the button below to add a new
              record.
            </p>
            <button
              onClick$={() => nav("/")}
              class="mt-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
            >
              Add Record
            </button>
          </div>
        </div>
      ) : (
        <>
          <div class="mx-5 mt-5 rounded border bg-white p-2 shadow-md">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Last Names
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Phone
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Date of Creation
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                {users.value?.map((user) => (
                  <tr key={user.id} onClick$={() => nav("/users/" + user.id)}>
                    <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {user.firstname}
                    </td>
                    <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {user.lastnames}
                    </td>
                    <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {user.phone}
                    </td>
                    <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString() +
                        " " +
                        new Date(user.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
});
