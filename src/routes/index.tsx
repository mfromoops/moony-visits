import { component$, useContext, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Form, routeAction$, type DocumentHead, useNavigate } from "@builder.io/qwik-city";
import { type R2Bucket } from "@cloudflare/workers-types";
import { TextInput, SelectInput } from "~/components/inputs/FormInputs";
import VestibuloImg from "~/media/building.jpeg";
import { CTX, useCheckSession } from "./layout";

export const usePostUser = routeAction$(async (data, { platform }) => {
  try {
    const id = crypto.randomUUID();
    const { MOONY } = platform.env as typeof platform.env & {
      MOONY: R2Bucket;
      DB: R2Bucket;
    };
    const users =
      ((await (await MOONY.get("users"))?.json()) as any[] | undefined) || [];
    await MOONY.put("users", JSON.stringify([...users, {...data, id, created_at: new Date().toISOString()}]));
  } catch {
    console.log("local storage not available");
  }
});

export default component$(() => {
  const action = usePostUser();
  const isChecked = useSignal(false);
  const ctx = useContext(CTX);
  const checkSession = useCheckSession();
  const nav = useNavigate();
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
    <div class="relative">
      <img
        src={VestibuloImg}
        alt="Vestibulo"
        class="h-96 w-full object-cover"
        width={100}
        height={100}
      />
      <div class="px-4 py-8 sm:px-6 lg:px-8">
        {/* select one or two residents */}
        <div class="flex justify-end">
          <>
            <label class="autoSaverSwitch relative mb-2 inline-flex cursor-pointer select-none items-center">
              <input
                type="checkbox"
                name="autoSaver"
                class="sr-only"
                checked={isChecked.value}
                onChange$={() => (isChecked.value = !isChecked.value)}
              />
              <span class="label mr-3 flex items-center text-sm font-medium text-black">
                Multiple Residents
              </span>
              <span
                class={`slider flex h-[26px] w-[50px] items-center rounded-full p-1 duration-200 ${
                  isChecked.value ? "bg-blue-200" : "bg-gray-200"
                }`}
              >
                <span
                  class={`dot h-[18px] w-[18px] rounded-full bg-blue-500 duration-200 ${
                    isChecked.value ? "translate-x-6" : ""
                  }`}
                ></span>
              </span>
            </label>
          </>
        </div>
        <Form
          action={action}
          onSubmit$={(e) => {
            (e.target as HTMLFormElement).reset();
          }}
          class="mb-4 rounded bg-white px-8 pb-8 pt-6 shadow-md"
        >
          <h2 class="mb-5 text-3xl font-bold text-gray-800">
            Visitant Profile
          </h2>
          <TextInput label="Name" name="firstname" />
          <TextInput label="Last Names" name="lastnames" />
          <TextInput label="Phone" name="phone" />
          <TextInput label="Email" name="email" />
            <TextInput label="Address Line 1" name="addressLine1" />
            <TextInput label="Address Line 2" name="addressLine2" />
          <div class="flex items-center justify-between">
            <TextInput label="Town" name="town" />
            <TextInput label="ZIP Code" name="zipcode" />
          </div>
          <TextInput label="Resident 1 Name" name="resident1Name" />
          <TextInput label="Resident 1 Age" name="resident1Age" />
          <SelectInput
            label="Resident 1 Gender"
            name="resident1Gender"
            options={["Male", "Female", "Other"]}
          />
          <div class={isChecked.value ? "block" : "hidden"}>
            <TextInput label="Resident 2 Name" name="resident2Name" />
            <TextInput label="Resident 2 Age" name="resident2Age" />
            <SelectInput
              label="Resident 2 Gender"
              name="resident2Gender"
              options={["Male", "Female", "Other"]}
            />
          </div>
          <TextInput label="Health Condition" name="healthCondition" />
          <TextInput label="Medical Plan" name="medicalPlan" />
          <SelectInput
            label="Room Type"
            name="roomType"
            options={["Private", "Semi-Private"]}
          />
          <SelectInput
            label="Resident Type"
            name="residentType"
            options={["Dependent", "Independent", "Co-Dependent"]}
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



export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
