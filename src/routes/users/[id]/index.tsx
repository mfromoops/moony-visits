/* eslint-disable qwik/no-use-visible-task */
import { component$, useContext, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Form, routeAction$, useLocation, useNavigate } from "@builder.io/qwik-city";
import { type R2Bucket } from "@cloudflare/workers-types";
import { SelectInput, TextInput } from "~/components/inputs/FormInputs";
import VestibuloImg from "~/media/building.jpeg";
import { CTX, useCheckSession, useGetUsers } from "~/routes/layout";
export const useDeleteUser = routeAction$(async (data, { platform, url }) => {
  const params = url.toString().split("/");
  const id = params[params.length - 2];
  try {
    const { MOONY } = platform.env as typeof platform.env & {
      MOONY: R2Bucket;
      DB: R2Bucket;
    };
    const users = await MOONY.get("users");
    const usersData = (await users?.json()) as any[];
    const index = usersData.findIndex((user) => user.id === id);
    usersData.splice(index, 1);
    await MOONY.put("users", JSON.stringify(usersData));
  } catch {
    console.log("local storage not available");
  }
});
export const useUpdateUser = routeAction$(async (data, { platform, url }) => {
  const params = url.toString().split("/");
  const id = params[params.length - 2];
  try {
    const { MOONY } = platform.env as typeof platform.env & {
      MOONY: R2Bucket;
      DB: R2Bucket;
    };
    const users = await MOONY.get("users");
    const usersData = (await users?.json()) as any[];
    const index = usersData.findIndex((user) => user.id === id);
    usersData[index] = {...data, id};
    await MOONY.put("users", JSON.stringify(usersData));
  } catch {
    console.log("local storage not available");
  }
});

export default component$(() => {
  const users = useGetUsers();
  const location = useLocation();
  const nav = useNavigate();
  const user = useSignal<any>({});
  useVisibleTask$(() => {
    user.value = users.value?.find((user) => user.id === location.params.id);
  });
  const ctx = useContext(CTX);
  const checkSession = useCheckSession();
  useVisibleTask$(() => {
    
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
  const updateUser = useUpdateUser();
  const deletUser = useDeleteUser();
  return (
    <div>
      <img
        src={VestibuloImg}
        alt="Vestibulo"
        class="h-96 w-full object-cover"
        width={100}
        height={100}
      />
      
      <div class="mx-5 flex justify-between mt-5">
        <button
          class="rounded bg-gray-200 px-4 py-2"
          onClick$={() => nav("/users")}
        >
          Back
        </button>
        <button class="bg-red-500 text-white px-4 rounded py-2" onClick$={() => deletUser.submit().then(() => {
          nav("/users");
        })}>
            <a>Delete Record</a>
          </button>
      </div>
      <div class="mx-5 mt-5 rounded border bg-white p-2 shadow-md">
      
        <Form
        onSubmit$={() => {
          nav("/users");
        }}
         action={updateUser}
        >
          <div class="flex justify-between">
          <h2 class="mb-5 text-3xl font-bold text-gray-800">
            Visitant Profile
          </h2>

          </div>
          <TextInput label="Name" name="firstname" value={user} />
          <TextInput label="Last Names" name="lastnames" value={user} />
          <TextInput label="Phone" name="phone" value={user} />
          <TextInput label="Email" name="email" value={user} />
            <TextInput label="Address Line 1" name="addressLine1" value={user} />
            <TextInput label="Address Line 2" name="addressLine2" value={user} />
          <div class="flex items-center justify-between">
            <TextInput label="Town" name="town" value={user} />
            <TextInput label="ZIP Code" name="zipcode" value={user} />
          </div>
          <TextInput
            label="Resident 1 Name"
            name="resident1Name"
            value={user}
          />
          <TextInput label="Resident 1 Age" name="resident1Age" value={user} />
          <SelectInput
            label="Resident 1 Gender"
            name="resident1Gender"
            options={["Male", "Female", "Other"]}
            value={user}
          />
          <div>
            <TextInput
              label="Resident 2 Name"
              name="resident2Name"
              value={user}
            />
            <TextInput
              label="Resident 2 Age"
              name="resident2Age"
              value={user}
            />
            <SelectInput
              label="Resident 2 Gender"
              name="resident2Gender"
              options={["Male", "Female", "Other"]}
              value={user}
            />
          </div>
          <TextInput
            label="Health Condition"
            name="healthCondition"
            value={user}
          />
          <TextInput label="Medical Plan" name="medicalPlan" value={user} />
          <SelectInput
            label="Room Type"
            name="roomType"
            options={["Private", "Semi-Private"]}
            value={user}
          />
          <SelectInput
            label="Resident Type"
            name="residentType"
            options={["Dependent", "Independent", "Co-Dependent"]}
            value={user}
          />
          <div class="flex items-center justify-between">
            <button
              class="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
              type="submit"
            >
              Submit
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
});
