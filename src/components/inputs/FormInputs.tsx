import { component$, type Signal } from "@builder.io/qwik";
export const TextInput = component$(
  ({
    label,
    name,
    value,
  }: {
    label: string;
    name: string;
    value?: Signal<Record<string, string>>;
  }) => {

    return (
      <div class="mb-4 w-full">
        <label class="mb-2 block text-sm font-bold text-gray-700" for={name}>
          {label}
        </label>
        <input
          class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
          name={name}
          value={value?.value[name]}
          onKeyUp$={(ev, el) => {
            if (value) value.value = { ...value.value, [name]: el.value };
          }}
          type="text"
        />
      </div>
    );
  },
);

export const SelectInput = component$(
  ({
    label,
    name,
    options,
    value,
  }: {
    label: string;
    name: string;
    options: string[];
    value?: Signal<any>;
  }) => {
  
    return (
      <>
        <div class="mb-4">
          <label class="mb-2 block text-sm font-bold text-gray-700" for={name}>
            {label}
          </label>
          <select
            class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            value={value?.value[name]}
            name={name}
            onLoad$={(_, el) => {
                if (value) value.value = el.value = value.value[name];
            }}
            onChange$={(_, el) => {
              if (value) value.value = { ...value.value, [name]: el.value };
            }}
          >
            <option value="">Select One</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </>
    );
  },
);
