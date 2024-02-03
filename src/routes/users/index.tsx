import { component$, useSignal } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import VestibuloImg from '~/media/building.jpeg';
import { useGetUsers } from "../layout";

export default component$(() => {
  const users = useGetUsers();
  const nav = useNavigate();
  const usersList = useSignal(users.value?.sort((a, b) => {
   const res = a.created_at.localeCompare(b.created_at)
   console.log(a.created_at, b.created_at)
   console.log(res)
    return res
  }));
  
  return (
    <div>
      <img src={VestibuloImg} alt="Vestibulo" class="w-full h-96 object-cover" width={100} height={100} />
      {usersList.value?.length === 0 ? (
        <div class="flex items-center justify-center h-full mt-5 w-full mx-5">
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <h2 class="text-2xl font-bold mb-2 text-gray-800">No record found</h2>
          <p class="text-gray-700">
            You don't have any record yet, click the button below to add a new record.
          </p>
          <button 
            onClick$={() => nav('/')}
            class="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
          >
            Add Record
          </button>
        </div>
      </div>
      ) : (
        <>
        <div class="bg-white rounded p-2 shadow-md mt-5 border mx-5">

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
                <tr key={user.id} onClick$={() => nav('/users/'+user.id)}>
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
                    {new Date(user.created_at).toLocaleDateString() + ' ' + new Date(user.created_at).toLocaleTimeString()}
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
