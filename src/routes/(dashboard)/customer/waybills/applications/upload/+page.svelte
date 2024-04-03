<script>
    import { read, utils } from 'xlsx';
    import * as yup from "yup";
    import { slide } from 'svelte/transition';
    import { quintInOut } from 'svelte/easing';
    import { Avatar, Breadcrumb, BreadcrumbItem, Button, Checkbox, Dropdown, DropdownItem, Dropzone, Input, Modal, Spinner } from "flowbite-svelte";
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import dayjs from 'dayjs';
    import { axiosFetch, clientFetch } from '$lib/client/api';
    import { UilAngleDown, UilCloudUpload, UilCopyAlt, UilPlusCircle, UilSearch, UilTrash } from 'svelte-unicons';
    import { binarySearch, debounce, getJSON } from '$lib/utils/helpers';
    import { failure, success } from '$lib/utils/toast';
    import { closeModal, showModal } from '$lib/stores/app';
    import { page } from '$app/stores';

    onMount(() => {
        getCountries();
        onSelectUser($page.data.session.user);
    })

    let countries = [];
    let states = [];
    let isLoading = false;
    let customer;
    let showBulkModal = false;

    const tpl = {
        application_id: "",
        "ref_num": "",
        first_name: "",
        middle_name: "",
        last_name: "",
        mobile_number: "",
        current_address_line1: "",
        current_address_city: "",
        contact_city: "",
        current_address_state_name: "",
        current_address_lga_name: "",
        booket_fee: "",
        av_fee: "",
        payment_date: "",
        payment_received_date: ""
    }

    const errors = writable({});
    const store = writable([{
        checked: false,
        application_id: "",
        ref_num: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        mobile_number: "",
        current_address_line1: "",
        current_address_city: "",
        contact_city: "",
        current_address_state_name: "",
        current_address_lga_name: "",
        booket_fee: "",
        av_fee: "",
        payment_date: "",
        payment_received_date: ""
    }]);

    const schema = yup.array().of(yup.object().shape({
        "checked": yup.bool().default(true),
        "application_id": yup.string().required(),
        "ref_num": yup.string().required(),
        "first_name": yup.string().required(),
        "middle_name": yup.string().optional(),
        "last_name": yup.string().required(),
        "mobile_number": yup.string().required(),
        "current_address_line1": yup.string(),
        "current_address_city": yup.string(),
        "contact_city": yup.string(),
        "current_address_state_name": yup.string(),
        "current_address_lga_name": yup.string(),
        "booket_fee": yup.string(),
        "av_fee": yup.string(),
        "payment_date": yup.string().optional().nullable(true),
        "payment_received_date": yup.string().optional().nullable(true),
    }));

    function getCountries() {
        axiosFetch.get("/countries")
        .then(res => {
            countries = res.data.data;
        }).finally(() => {
            getStates();
        });
    }

    function getStates() {
        let q = new URLSearchParams({
            country_id: countries.find(e => e.code == "NG").id,
            limit: 1000
        }).toString()
        axiosFetch.get("/states?" + q)
        .then(res => {
            states = res.data.data;
        });
    }

    async function doSubmit() {
        try {
        await schema.validate($store.filter(e => e.checked), { stripUnknown: true, abortEarly: false });
        // doUpload();
        debounce(doUpload, 500);
        errors.set({});
        } catch (err) {
            if (err.inner) {
                errors.set(err.inner.reduce((acc, err) => {
                    return { ...acc, [err.path]: err.message };
                }, {}));
            }
        }
    }

    async function doUpload() {
        if (!customer) {
            failure("You must select a customer");
            return;
        }

        const items = $store.filter(e => e.checked).map(e => {
            return {
                name: e.application_id,
                quantity: 1,
                weight: 0.1,
                value: "1",
                pickup_at: "",
                status: "draft",
                sender: customer,
                customer_id: customer.id,
                tag: "nis-application",
                recipient: {
                    name: [e.first_name, e.middle_name, e.last_name].filter(e => !!e).join(" "),
                    email: "",
                    phone: e.mobile_number,
                    alternate_phone: "",
                    address: e.current_address_line1,
                    state: states.find(s => s.name == e.current_address_state_name) || {name: e.current_address_state_name},
                    country: countries.find(e => e.code == "NG")
                },
                metadata: e
            }
        });
        if (!items.length) {
            failure("You must select at least one application");
            return;
        }

        showModal();
        isLoading = true;
        try {
            const res = await clientFetch({
                path: "/packages/bulk",
                method: "POST",
                body: {
                    "create": items
                }
            });
            const json = await res.json();
            if (!res.ok) throw json;
            success(json.message || "Upload is being processed");
        } catch (error) {
            failure(error);
        } finally {
            isLoading = false;
            closeModal();
        }
    }

    function onSelectUser(user) {
        customer = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address || "",
            country: getJSON(user.country) || {},
            state: getJSON(user.state) || {},
            city: user.city || "",
            zip: user.zip || ""
        }
    }

    const fileTypes = ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"];
    /**@type {File} */
    let value = [];
    const dropHandle = (event) => {
        event.preventDefault();
        if (event.dataTransfer.items) {
            [...event.dataTransfer.items].forEach((item, i) => {
                if (item.kind === "file") {
                    const file = item.getAsFile();
                    if (!fileTypes.includes(file.type)) {
                        value = [];
                    } else {
                        value = file;
                    }
                    
                }
            });
        } else {
            [...event.dataTransfer.files].forEach((file, i) => {
                if (!fileTypes.includes(file.type)) {
                    value = null;
                } else {
                    value = file;
                }
            });
        }
    };

    const handleChange = (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            value = files[0];
            value = value;
        }
    };

    async function submit() {
        if (!value || !value?.text) return;
        const content = await value.arrayBuffer();
        const wb = read(content);
        const data = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        store.update(items => [
            ...items, 
            ...data.map(e => {
                e = JSON.parse(JSON.stringify(Object.assign({}, tpl, e)));
                e.current_address_state_name = binarySearch(states.map(e => e.name), e.current_address_state_name) || e.current_address_state_name;
                return e;
            })
        ])
    }
</script>

<div class="gwx-breadcrumb print:hidden">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/admin/waybills/applications">Applications</BreadcrumbItem>
        <BreadcrumbItem>Upload</BreadcrumbItem>
    </Breadcrumb>
</div>

<div class="page">
    <div class="mb-6 flex justify-between items-center">
        <h3 class="font-semibold pb-4">Bulk Applications Upload</h3>
        <div class="flex flex-1 justify-end gap-3">
            <Button color="alternative" class="gap-x-2 text-sm" outline on:click={() => (showBulkModal = true)}>
                <span><UilCloudUpload size="18" /></span>
                Upload CSV
            </Button>
        </div>
    </div>

    <div class="w-full overflow-x-auto">
        <table class="table custom">
            <thead>
                <tr>
                    <th class="w-[50px]">
                        <Checkbox 
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items].map(item => {
                                        item.checked = e.target.checked;
                                        return item;
                                    });
                                    return updatedItems;
                                })
                            }}
                        />
                    </th>
                    <th></th>
                    <th class="min-w-[170px]">Application ID</th>
                    <th class="min-w-[190px]">Ref Number</th>
                    <th class="min-w-[180px]"> First Name</th>
                    <th class="min-w-[180px]">Middle Name</th>
                    <th class="min-w-[180px]">Last Name</th>
                    <th class="min-w-[180px]">Mobile Number</th>
                    <th class="min-w-[220px]">Address</th>
                    <th class="min-w-[160px]">City</th>
                    <th class="min-w-[160px]">LGA</th>
                    <th class="min-w-[200px]">State</th>
                    <th class="min-w-[140px]">Booket Fee</th>
                    <th class="min-w-[140px]">AV Fee</th>
                    <th>Payment Date</th>
                    <th>Payment Received Date</th>
                </tr>
            </thead>
            <tbody>
                {#each $store as item, index }
                <tr transition:slide={{delay: 100, duration: 500, easing: quintInOut, axis: 'y'}}>
                    <td>
                        <Checkbox 
                            checked={item.checked}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].checked = e.target.checked;
                                    return updatedItems;
                                })
                            }}
                        />
                    </td>
                    <td>
                        <div class="flex space-x-2">
                            <Button 
                                size="xs" 
                                color="none"
                                class="px-2"
                                on:click={() => {
                                    if (!$store.length) return;
                                    const dup = JSON.parse(JSON.stringify({ ...$store[index]}));        
                                    store.update(items => [...items.slice(0, index == 0 ? null : index), dup, ...items.slice(index)]);
                                }}>
                                <UilCopyAlt size="20" />
                            </Button>
                            <Button 
                                size="xs" 
                                color="none"
                                class="px-2"
                                on:click={() => {
                                    if (!$store.length) return;
                                    store.update(items => items.filter((_, i) => i !== index));
                                }}>
                                <UilTrash size="20" />
                            </Button>
                        </div>
                    </td>
                    <td>
                        <input
                            type="text"
                            inputmode="text"
                            value={item.application_id}
                            class="input input-bordered input-xs h-9 w-full"
                            class:input-error={$errors[`[${index}].application_id`]}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].application_id = e.target.value;
                                    return updatedItems;
                                })
                            }}
                        />
                    </td>
                    <td>
                        <input
                            type="text"
                            inputmode="text"
                            value={item.ref_num}
                            class="input input-bordered input-xs h-9 w-full"
                            class:input-error={$errors[`[${index}].ref_num`]}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].ref_num = e.target.value;
                                    return updatedItems;
                                })
                            }}
                        />
                        
                    </td>
                    <td>
                        <input
                            type="text"
                            inputmode="text"
                            value={item.first_name}
                            class="input input-bordered input-xs h-9 w-full"
                            class:input-error={$errors[`[${index}].first_name`]}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].first_name = e.target.value;
                                    return updatedItems;
                                })
                            }}
                        />
                    </td>
                    <td>
                        <input
                            type="text"
                            inputmode="text"
                            value={item.middle_name}
                            class="input input-bordered input-xs h-9 w-full"
                            class:input-error={$errors[`[${index}].middle_name`]}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].middle_name = e.target.value;
                                    return updatedItems;
                                })
                            }}
                        />
                    </td>
                    <td>
                        <input
                            type="text"
                            inputmode="text"
                            value={item.last_name}
                            class="input input-bordered input-xs h-9 w-full"
                            class:input-error={$errors[`[${index}].last_name`]}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].last_name = e.target.value;
                                    return updatedItems;
                                })
                            }}
                        />
                    </td>
                    <td>
                        <input
                            type="text"
                            inputmode="text"
                            value={item.mobile_number}
                            class="input input-bordered input-xs h-9 w-full"
                            class:input-error={$errors[`[${index}].mobile_number`]}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].mobile_number = e.target.value;
                                    return updatedItems;
                                })
                            }}
                        />
                    </td>
                    <td>
                        <textarea
                            type="text"
                            value={item.current_address_line1}
                            class="input input-bordered input-xs h-9 w-full"
                            class:input-error={$errors[`[${index}].current_address_line1`]}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].current_address_line1 = e.target.value;
                                    return updatedItems;
                                })
                            }}
                        />
                    </td>
                    <td>
                        <input
                            type="text"
                            inputmode="text"
                            value={item.contact_city}
                            class="input input-bordered input-xs h-9 w-full"
                            class:input-error={$errors[`[${index}].contact_city`]}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].contact_city = e.target.value;
                                    return updatedItems;
                                })
                            }}
                        />
                    </td>
                    <td>
                        <input
                            type="text"
                            inputmode="text"
                            value={item.current_address_lga_name}
                            class="input input-bordered input-xs h-9 w-full"
                            class:input-error={$errors[`[${index}].current_address_lga_name`]}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].current_address_lga_name = e.target.value;
                                    return updatedItems;
                                })
                            }}
                        />
                        
                    </td>
                    <td>
                        <select 
                            value={item.current_address_state_name}
                            class="select select-bordered select-xs w-full font-normal " style="height: 36px; margin-top: -3px;"
                            class:select-error={$errors[`[${index}].current_address_state_name`]}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].current_address_state_name = e.target.value;
                                    return updatedItems;
                                })
                            }}>
                            <option disabled selected>Select State:</option>
                            {#each states as state}
                            <option value="{state.name}">{ state.name }</option> 
                            {/each}
                        </select>
                    </td>
                    <td>
                        <input
                            type="text"
                            inputmode="text"
                            value={item.booket_fee}
                            class="input input-bordered input-xs h-9 w-full"
                            class:input-error={$errors[`[${index}].booket_fee`]}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].booket_fee = e.target.value;
                                    return updatedItems;
                                })
                            }}
                        />
                        
                    </td>
                    <td>
                        <input
                            type="text"
                            inputmode="text"
                            value={item.av_fee}
                            class="input input-bordered input-xs h-9 w-full"
                            class:input-error={$errors[`[${index}].av_fee`]}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].av_fee = e.target.value;
                                    return updatedItems;
                                })
                            }}
                        />
                        
                    </td>
                    <td>
                        <input
                            type="date"
                            inputmode="numeric"
                            placeholder="DD/MM/YYYY"
                            min='{dayjs().format('YYYY-MM-DD')}'
                            value={item.payment_date}
                            pattern="(1[0-2]|0[1-9])\/\d\d"
                            class="input input-bordered input-xs h-9 w-full"
                            class:input-error={$errors[`[${index}].payment_date`]}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].payment_date = e.target.value;
                                    return updatedItems;
                                })
                            }}
                        />
                    </td>
                    <td>
                        <input
                            type="date"
                            inputmode="numeric"
                            placeholder="DD/MM/YYYY"
                            min='{dayjs().format('YYYY-MM-DD')}'
                            value={item.payment_received_date}
                            pattern="(1[0-2]|0[1-9])\/\d\d"
                            class="input input-bordered input-xs h-9 w-full"
                            class:input-error={$errors[`[${index}].payment_received_date`]}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].payment_received_date = e.target.value;
                                    return updatedItems;
                                })
                            }}
                        />
                    </td>
                </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <div class="my-4 flex justify-between">
        <Button 
            size="sm" 
            color="alternative" 
            class="gap-x-3 text-base-content/60"
            on:click={() => {
                store.update(items => [...items, Object.assign({}, tpl)]);
            }}>
            <span><UilPlusCircle /></span>
            <span>Add Row</span>
        </Button>
        <Button 
            size="lg" 
            class="w-full max-w-[200px]" 
            on:click={doSubmit}
            disabled={isLoading}>
            {#if isLoading}
            <Spinner class="mr-3" size="4" color="white" />
            {/if}
            Submit
        </Button>
    </div>
</div>

<Modal title="Upload Applications" bind:open={showBulkModal} autoclose>
    <div>
        <Dropzone
        id="dropzone"
        on:drop={dropHandle}
        on:dragover={(event) => {
            event.preventDefault();
        }}
        on:change={handleChange}
        class="my-8"
    >
        <svg
            aria-hidden="true"
            class="mb-3 w-10 h-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            /></svg
        >
        {#if !value || !value?.name}
            <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span class="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
                CSV File
            </p>
        {:else}
            <p>{value.name}</p>
        {/if}
    </Dropzone>
    </div>
    <svelte:fragment slot="footer">
        <Button on:click={submit}>Submit</Button>
        <Button color="alternative">Cancel</Button>
    </svelte:fragment>
</Modal>