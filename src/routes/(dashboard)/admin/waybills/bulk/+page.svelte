<script>
    import { read, utils } from 'xlsx';
    import * as yup from "yup";
    import { writable } from "svelte/store";
    import { slide } from 'svelte/transition';
    import { quintInOut } from 'svelte/easing';
    import { Avatar, Breadcrumb, BreadcrumbItem, Button, Checkbox, Input, Spinner, Modal, Dropzone, Dropdown, DropdownItem } from "flowbite-svelte";
    import { UilAngleDown, UilCloudUpload, UilCopyAlt, UilEllipsisH, UilFileDownload, UilPlusCircle, UilSearch, UilTrash } from "svelte-unicons";
    import { onMount } from "svelte";
    import { axiosFetch, clientFetch } from "$lib/client/api";
    import { debounce, getJSON } from "$lib/utils/helpers";
    import { failure, success } from "$lib/utils/toast";
    import dayjs from "dayjs";
    import { closeModal, showModal } from "$lib/stores/app";
    import { jsonToWaybills } from "$lib/client/helpers";

    onMount(() => {
        getCountries();
        closeModal();
    })

    let countries = [];
    let states = [];
    let users = [];
    let isLoading = false;
    let customer;
    let name;
    let showBulkModal = false;

    const tpl = {
        checked: false,
        name: "",
        quantity: 1,
        weight: 0.1,
        value: "1",
        pickup_at: "",
        recipient: {
            name: "",
            email: "",
            phone: "",
            alternate_phone: "",
            address: "",
            state: {
                id: ""
            }
        }
    };
    let storeInit ={
        checked: false,
        name: "",
        quantity: 1,
        weight: 0.1,
        value: "1",
        pickup_at: "",
        recipient: {
            name: "",
            email: "",
            phone: "",
            alternate_phone: "",
            address: "",
            state: {
                id: ""
            }
        }
    }

    const errors = writable({});
    const store = writable([]);

    const schema = yup.array().of(yup.object().shape({
        "checked": yup.bool().default(true),
        "pickup_at": yup.string().optional().nullable(true),
        "name": yup.string().required(),
        "quantity": yup.number().min(1).required(),
        "weight": yup.string().required().transform((value) => `${value}`),
        "value": yup.string().required(),
        "recipient": yup.object().shape({
            name: yup.string().min(2).required().label("Full name"),
            email: yup.string().email().optional().label("Email"),
            phone: yup.string().required().label("Phone"),
            alternate_phone: yup.string().label("Phone"),
            address: yup.string().required().label("Address"),
            state: yup.object().shape({
                id: yup.string().optional()
            })
        })
    }));

    async function doSumit() {
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

    function deleteRow(index) {
        if (!$store.length) return;
        store.update(items => items.filter((_, i) => i !== index));
    }

    function duplicateRow(index) {
        if (!$store.length) return;
        // const c = [Object.assign({}, tpl, $store[index])];

        const dup = JSON.parse(JSON.stringify({ ...$store[index]}));        
        store.update(items => [...items.slice(0, index == 0 ? null : index), dup, ...items.slice(index)]);
    }

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
            console.log("the states here", states);
        });
    }

    function getCustomers(e) {
        clientFetch({
            path: "/users",
            query: {
                limit: 5,
                role: "customer",
                search: e.target.value,
                full: true
            }
        })
        .then(res => res.json())
        .then(json => {
            if (!json.data) return;
            users = json.data;
        });
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
        users = [];
        name = "";
    }

    async function doUpload() {
        
        if (isLoading) return;

        if (!customer) {
            failure("You must select a customer");
            return;
        }

        const items = $store.filter(e => e.checked).map(e => {
            e.sender = customer;
            e.customer_id = customer.id
            e.recipient.country = countries.find(e => e.code == "NG");
            return e;
        });
        if (!items.length) {
            failure("You must select at least one waybill");
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
            window.location.reload();
        } catch (error) {
            failure(error);
        } finally {
            isLoading = false;
            closeModal();
        }
    }

    $: console.log(`the store has been updated ${JSON.stringify($store)}`);

    function downloadCSV() {
        const a = document.createElement("a");
        a.setAttribute("href", "/waybill.csv");
        a.setAttribute("download", "waybill-upload-template.csv");
        a.click();
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
        console.log("the data value is...", data);
        store.update(items => [
            ...items, 
            ...jsonToWaybills(data).map(e => JSON.parse(JSON.stringify(Object.assign({}, tpl, e))))
        ])
    }
</script>

<div class="gwx-breadcrumb print:hidden">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/admin/waybills">Waybills</BreadcrumbItem>
        <BreadcrumbItem>Bulk Upload</BreadcrumbItem>
    </Breadcrumb>
</div>

<div class="page">    
    <div class="mb-6 flex justify-between items-center">
        <h3 class="font-semibold pb-4">Bulk Waybill Upload</h3>
        <div class="flex flex-1 justify-end gap-3">
            <Button color="alternative" class="gap-x-2 text-sm" outline on:click={() => (showBulkModal = true)}>
                <span><UilCloudUpload size="18" /></span>
                Upload CSV
            </Button>
            <Button class="gap-x-2 text-sm" outline on:click={downloadCSV}>
                <span><UilFileDownload size="18" /></span>
                Download Template
            </Button>
        </div>
    </div>

    <div 
        class:border-primary-800={!customer}
        class="my-4 max-w-xs bg-base-100 rounded-md shadow-sm p-4 border {!customer ? 'border-primary-600' : ''} hidden">
        <div class="flex gap-4">
            <Avatar />
            <div class="flex-1 text-left text-sm">
                <div>{ customer?.name || "Select customer" }</div>
                <div class="text-gray-400 text-xs">{ customer?.email || customer?.phone || "Not set" }</div>
            </div>
            <UilAngleDown size="20" />
        </div>
    </div>

    <div class="w-full max-w-xs my-4">
        <Button color="none" class="w-full gap-4 items-center p-4 border {customer ? 'border-gray-200' : 'border-primary-600'}">
            <Avatar />
            <div class="flex-1 text-left text-sm">
                <div>{ customer?.name || "Select customer" }</div>
                <div class="text-gray-400 text-xs">{ customer?.email || customer?.phone || "Not set" }</div>
            </div>
            <UilAngleDown size="20" />
        </Button>
        <Dropdown class="w-full min-w-[310px]">
            <div class="px-3 py-2">
                <Input
                    bind:value={name}
                    size="sm"
                    placeholder="Search customers"
                    class="input input-md input-bordered rounded-lg placeholder:text-sm w-full"
                    on:keyup={(e) => (debounce(() => getCustomers(e), 400))}
                >
                    <span slot="left" class="text-primary"><UilSearch size="18" /></span>
                </Input>
            </div>
            
            {#each users as user }
                <DropdownItem 
                    on:click={() => (onSelectUser(user))}
                    class="flex w-full gap-x-3 px-3 py-4 items-center hover:bg-slate-50 transition-all">
                    <Avatar size="md" />
                    <!-- <div class="grid place-content-center w-10 h-10 bg-slate-50 rounded-full text-base-content/40">
                        <UilUser size="15" />
                    </div> -->
                    <div class="flex-1 text-left text-sm">
                        <div>{ user.name }</div>
                        <div class="text-gray-400 text-xs">{ user.email || user.phone || "" }</div>
                    </div>
                </DropdownItem>
                {/each}
        </Dropdown>
    </div>
    
    <div class="w-full overflow-x-auto">
        <table class="table custom">
            <caption class="text-left p-8 w-full max-w-4xl space-y-2">
                <h3 class="font-medium">Waybill Management Table</h3>
                <p class="text-sm text-gray-600 pr-6">Streamline your waybill management by uploading multiple waybills simultaneously. This feature allows you to efficiently process a large volume of waybills, saving you time and reducing manual entry errors. </p>
            </caption>
            <thead>
                <tr>
                    <th>
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
                    <th class="min-w-[200px]">Pickup Date</th>
                    <th class="min-w-[200px]">Package Name</th>
                    <th class="min-w-[90px]">Quantity</th>
                    <th class="min-w-[90px]">Weight</th>
                    <th class="min-w-[150px]">Value</th>
                    <th class="min-w-[220px]">Recipient Name</th>
                    <th class="min-w-[250px]">Recipient Email</th>
                    <th class="min-w-[200px]">Recipient Phone</th>
                    <th class="min-w-[200px]">Recipient Alternate Phone</th>
                    <th class="min-w-[200px]">Recipient Address</th>
                    <th class="min-w-[200px]">Destination State</th>
                    <!-- <th></th> -->
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
                        <div>
                            <Button size="xs" color="none">
                                <UilEllipsisH />
                            </Button>
                            <Dropdown>
                                <DropdownItem class="flex gap-2 text-sm text-gray-700" on:click={() => duplicateRow(index)}>
                                    <span><UilCopyAlt size="20" /></span>
                                    Duplicate Row
                                </DropdownItem>
                                <DropdownItem class="flex gap-2 text-sm text-primary" on:click={() => deleteRow(index)}>
                                    <span><UilTrash size="20" /></span>
                                    Delete Row
                                </DropdownItem>
                            </Dropdown>
                        </div>
                    </td>
                    <td>
                        <input
                            type="date"
                            inputmode="numeric"
                            placeholder="MM/DD/YYYY"
                            min='{dayjs().format('MM/DD/YYYY')}'
                            value={item.pickup_at}
                            pattern="(1[0-2]|0[1-9])\/\d\d"
                            class="input input-bordered input-xs h-9 w-full"
                            class:input-error={$errors[`[${index}].pickup_at`]}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].pickup_at = e.target.value;
                                    return updatedItems;
                                })
                            }}
                        />
                    </td>
                    <td>
                        <input
                            type="text"
                            inputmode="text"
                            bind:value={item.name}
                            class="input input-bordered input-xs h-9 w-full"
                            class:input-error={$errors[`[${index}].name`]}
                            on:input={(e) => {

                            }}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].name = e.target.value;
                                    return updatedItems;
                                })
                            }}
                        />
                    </td> 
                    <td>
                        <input
                            type="number"
                            value={item.quantity}
                            min="1"
                            class="input input-bordered input-xs h-9 w-full"
                            class:input-error={$errors[`[${index}].quantity`]}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].quantity = e.target.value;
                                    return updatedItems;
                                })
                            }}
                        />
                    </td>
                    <td>
                        <input
                            type="number"
                            inputmode="numeric"
                            value={item.weight}
                            min="0.1"
                            class="input input-bordered input-xs h-9 w-full"
                            class:input-error={$errors[`[${index}].weight`]}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].weight = e.target.value;
                                    return updatedItems;
                                })
                            }}
                        />
                    </td>
                    <td>
                        <input
                            type="number"
                            value={item.value}
                            min="1"
                            class="input input-bordered input-xs h-9 w-full"
                            class:input-error={$errors[`[${index}].value`]}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].value = e.target.value;
                                    return updatedItems;
                                })
                            }}
                        />
                    </td>
                    <td>
                        <input
                            type="text"
                            value={item.recipient.name}
                            class="input input-bordered input-xs h-9 w-full"
                            class:input-error={$errors[`[${index}].recipient.name`]}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].recipient.name = e.target.value;
                                    return updatedItems;
                                })
                            }}
                        />
                    </td>
                    <td>
                        <input
                            type="email"
                            value={item.recipient.email}
                            class="input input-bordered input-xs h-9 w-full"
                            class:input-error={$errors[`[${index}].recipient.email`]}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].recipient.email = e.target.value;
                                    return updatedItems;
                                })
                            }}
                        />
                    </td>
                    <td>
                        <input
                            type="tel"
                            inputmode="tel"
                            value={item.recipient.phone}
                            class="input input-bordered input-xs h-9 w-full"
                            class:input-error={$errors[`[${index}].recipient.phone`]}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].recipient.phone = e.target.value;
                                    return updatedItems;
                                })
                            }}
                        />
                    </td>
                    <td>
                        <input
                            type="text"
                            inputmode="tel"
                            value={item.recipient.alternate_phone}
                            class="input input-bordered input-xs h-9 w-full"
                            class:input-error={$errors[`[${index}].recipient.alternative_phone`]}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].recipient.alternate_phone = e.target.value;
                                    return updatedItems;
                                })
                            }}
                        />
                    </td>
                    <td>
                        <textarea
                            type="text"
                            value={item.recipient.address}
                            class="input input-bordered input-xs h-9 w-full"
                            class:input-error={$errors[`[${index}].recipient.address`]}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].recipient.address = e.target.value;
                                    return updatedItems;
                                })
                            }}
                        />
                    </td>
                    <td>
                        <!-- <select 
                            value={item.recipient.state.id}
                            class="select select-bordered select-xs w-full font-normal " style="height: 36px; margin-top: -3px;"
                            class:select-error={$errors[`[${index}].recipient.state.id`]}
                            on:change={(e) => {
                                store.update((items) => {
                                    const updatedItems = [...items];
                                    updatedItems[index].recipient.state.id = e.target.value;
                                    return updatedItems;
                                })
                            }}>
                            <option disabled >Select State:</option>
                            {#each states as state}
                            <option  value="{state.id}">{ state.name }</option> 
                            
                            {/each}
                        </select> -->

                        <input
                        type="text"
                        inputmode="text"
                        value={item.recipient.state.id}
                        class="input input-bordered input-xs h-9 w-full"
                        class:input-error={$errors[`[${index}].recipient.state.id`]}
                        on:change={(e) => {
                            store.update((items) => {
                                const updatedItems = [...items];
                                updatedItems[index].recipient.state.id  = e.target.value;
                                return updatedItems;
                            })
                        }}
                    />
                    </td>
                    <!-- <td>
                        <Button color="none" class="text-primary bg-primary-100" size="xs" on:click={() => deleteRow(index)}>
                            <UilTrash size="20" />
                        </Button>
                    </td> -->
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
            on:click={doSumit}
            disabled={isLoading}>
            {#if isLoading}
            <Spinner class="mr-3" size="4" color="white" />
            {/if}
            Submit
        </Button>
    </div>
</div>

<Modal title="Upload Waybills" bind:open={showBulkModal} autoclose>
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