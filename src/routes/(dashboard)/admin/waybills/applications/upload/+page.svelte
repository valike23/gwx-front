<script>
    import { read, utils } from "xlsx";
    import * as yup from "yup";
    import { fade } from "svelte/transition";
    import {
        Avatar,
        Breadcrumb,
        BreadcrumbItem,
        Button,
        Label,
        Dropdown,
        DropdownItem,
        Dropzone,
        Input,
        Modal,
        Spinner,
    } from "flowbite-svelte";
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import { axiosFetch, clientFetch } from "$lib/client/api";
    import {
        UilAngleDown,
        UilApps,
        UilCloudUpload,
        UilCopyAlt,
        UilPlusCircle,
        UilSearch,
        UilTrash,
    } from "svelte-unicons";
    import { binarySearch, debounce, getJSON } from "$lib/utils/helpers";
    import { failure, success } from "$lib/utils/toast";
    import { closeModal, showModal } from "$lib/stores/app";

    onMount(() => {
        getCountries();
    });

    let countries = [];
    let states = [];
    let users = [];
    let hubs = [], hub;
    let isLoading = false;
    let customer;
    let name;
    let showBulkModal = false;
    let apps = [];
    let isUploading = false;
    let progress = 0;

    const tpl = {
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
        payment_received_date: "",
    };

    const errors = writable({});
    const store = writable([
        {
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
            payment_received_date: "",
        },
    ]);

    const schema = yup.array().of(
        yup.object().shape({
            checked: yup.bool().default(true),
            application_id: yup.string().required(),
            ref_num: yup.string(),
            first_name: yup.string().optional().default(" "),
            middle_name: yup.string().optional(),
            last_name: yup.string().default(" "),
            mobile_number: yup.string(),
            current_address_line1: yup.string(),
            current_address_city: yup.string(),
            contact_city: yup.string(),
            current_address_state_name: yup.string(),
            current_address_lga_name: yup.string(),
            booket_fee: yup.string(),
            av_fee: yup.string(),
            payment_date: yup.string().optional().nullable(true),
            payment_received_date: yup.string().optional().nullable(true),
        }),
    );

    function getCountries() {
        axiosFetch
            .get("/countries")
            .then((res) => {
                countries = res.data.data;
            })
            .finally(() => {
                getStates();
            });
    }

    function getStates() {
        let q = new URLSearchParams({
            country_id: countries.find((e) => e.code == "NG").id,
            limit: 1000,
        }).toString();
        axiosFetch.get("/states?" + q).then((res) => {
            states = res.data.data;
        });
    }

    async function doSubmit() {
        try {
            await schema.validate(
                apps.filter((e) => e.checked),
                { stripUnknown: true, abortEarly: false },
            );
            doUpload();
            // debounce(doUpload, 500);
            errors.set({});
        } catch (err) {
            console.log(err);
            if (err.inner) {
                errors.set(
                    err.inner.reduce((acc, err) => {
                        return { ...acc, [err.path]: err.message };
                    }, {}),
                );
            }
            failure("Some errors need to be fixed");
        }
    }

    async function doUpload() {
        if (isLoading) return;

        if (!customer) {
            failure("You must select a customer");
            return;
        }

        if (!hub) {
            failure("You must select the origin hub");
            return;
        }

        // const items = apps
        //     .filter((e) => e.checked)
        //     .map((e) => {
        //         return   {
        //             applicationId:  e.applicationId,
        //             referenceId: e.referenceId,
        //             receiverName: e.receiverName,
        //             address: e.address,
        //             postalCode: e.postalCode,
        //             lga: e.lga,
        //             city: e.city,
        //       state      state: e.state,
        //             country: e.country,
        //             landmark: e.landmark,
        //             receiverPhone: e.receiverPhone,
        //             receiverEmail: e.receiverEmail,
        //             alternativePhone: e.alternativePhone,
        //             nin: e.nin,
        //             productionCenter: e.productionCenter,
        //             // name: e.applicationId,
        //             // quantity: 1,
        //             // weight: 0.1,
        //             // value: "1",
        //             // pickup_at: "",
        //             // status: "draft",
        //             // sender: customer,
        //             // customer_id: customer.id,
        //             // hub: hub,
        //             // tag: "nis-application",
        //             // recipient: {
        //             //     name:e.receiverName,
        //             //     email: e.receiverEmail,
        //             //     postal: e.postalCode,
        //             //     phone: e.receiverPhone,
        //             //     alternate_phone: e.alternativePhone,
        //             //     address: e.address,
        //             //     state: states.find(
        //             //         (s) => s.name == e.current_address_state_name,
        //             //     ) || { name: e.current_address_state_name },
        //             //     country: countries.find((e) => e.code == "NG"),
        //            // },
        //             metadata: e,
        //         };
        //     });
        apps.forEach((a,i)=>{
            apps[i].state = a.state;
            apps[i].applicationId = a.applicationId.toString();
            apps[i].nin = a.nin.toString();
            apps[i].postalCode = a.postalCode.toString();
            apps[i].receiverPhone = a.receiverPhone.toString();
            apps[i].referenceId = a.referenceId.toString();
            apps[i].productionCenter = a.productionState + ' ' + a.productionCenter
        })
        const items = apps;
        if (!items.length) {
            failure("You must select at least one application");
            return;
        }

        sendRequestsInChunks(items, 500);

        // showModal();
        // isLoading = true;
        // try {
        //     const res = await clientFetch({
        //         path: "/packages/bulk",
        //         method: "POST",
        //         body: {
        //             create: items,
        //         },
        //     });
        //     const json = await res.json();
        //     if (!res.ok) throw json;
        //     success(json.message || "Upload is being processed");
        //     store.update((va) => []);
        // } catch (error) {
        //     failure(error);
        // } finally {
        //     isLoading = false;
        //     closeModal();
        // }
    }

    function getCustomers(e) {
        clientFetch({
            path: "/users",
            query: {
                limit: 5,
                role: "customer",
                search: e.target.value,
                full: true,
            },
        })
            .then((res) => res.json())
            .then((json) => {
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
            zip: user.zip || "",
        };
        users = [];
        name = "";
    }

    function getHubs(e) {
        clientFetch({
            path: "/hubs",
            query: {
                search: e.target?.value,
                limit: 10
            }
        })
        .then(res => res.json())
        .then(json => (hubs = json.data))
    }

    const fileTypes = [
        "text/csv",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
    ];
    /**@type {File} */
    let value = [];
    const dropHandle = (event) => {
        console.log('drop is handled here',event.dataTransfer.items);
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
        console.log("the union here is working");
        if (!value || !value?.text) return;
        const content = await value.arrayBuffer();
        console.log("the content", content);
        const wb = read(content);
        const data = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        console.log("the data here is", data);
        // apps = data
        //     .map((e) => {
        //         e = JSON.parse(JSON.stringify(Object.assign({}, tpl, e)));
               
        //         e.checked = true;
        //         return e;
        //     })
        //     .filter((e) => e.applicationId?.length);
        apps = data;
            console.log('the app', apps);
        // store.update(items => [
        //     ...items,
        //     ...data.map(e => {
        //         e = JSON.parse(JSON.stringify(Object.assign({}, tpl, e)));
        //         e.current_address_state_name = binarySearch(states.map(e => e.name), e.current_address_state_name) || e.current_address_state_name;
        //         e.checked = true;
        //         return e;
        //     })
        // ].filter(e => e.application_id?.length))
    }

    /**
     *
     * @param {Array<object>} data
     * @param {number} chunkSize
     */
    async function sendRequestsInChunks(data, chunkSize = 500) {
        isUploading = true;
        isLoading = true;
        try {
            const totalChunks = Math.ceil(data.length / chunkSize);
            let currentChunk = 0;
            let body = [];

            for (let i = 0; i < data.length; i += chunkSize) {
                body.push(data.slice(i, i + chunkSize));
                isUploading = true;
                progress = Math.round((currentChunk / totalChunks) * 100);

                await clientFetch({
                    path: "/packages/bulk",
                    method: "POST",
                    body: {
                        create: data.slice(i, i + chunkSize),
                    },
                });

                await new Promise((resolve) => setTimeout(resolve, 1000))
                progress = Math.round((currentChunk / totalChunks) * 100); 
                currentChunk++;
            }
            success("Upload is being processed");
        } catch (error) {
            failure(error);
            console.error("Error sending requests:", error);
        } finally {
            isLoading = false;
            isUploading = false;
            apps = [];
        }
    }
</script>

<div class="gwx-breadcrumb print:hidden">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/admin/waybills/applications"
            >Applications</BreadcrumbItem
        >
        <BreadcrumbItem>Upload</BreadcrumbItem>
    </Breadcrumb>
</div>

<div class="page">
    <div class="mb-6 flex justify-between items-center">
        <h3 class="font-semibold pb-4">Bulk Application Upload</h3>
        <div class="flex flex-1 justify-end gap-3">
            <Button
                color="alternative"
                class="gap-x-2 text-sm"
                outline
                on:click={() => (showBulkModal = true)}
            >
                <span><UilCloudUpload size="18" /></span>
                Upload CSV
            </Button>
            <!-- <Button class="gap-x-2 text-sm" outline on:click={downloadCSV}>
                <span><UilFileDownload size="18" /></span>
                Download Template
            </Button> -->
        </div>
    </div>

    <div class="my-4 hidden justify-between">
        <Button
            size="sm"
            color="alternative"
            class="gap-x-3 text-base-content/60"
            on:click={() => {
                store.update((items) => [...items, Object.assign({}, tpl)]);
            }}
        >
            <span><UilPlusCircle /></span>
            <span>Add Row</span>
        </Button>
        <Button
            size="lg"
            class="w-full max-w-[200px]"
            on:click={doSubmit}
            disabled={isLoading}
        >
            {#if isLoading}
                <Spinner class="mr-3" size="4" color="white" />
            {/if}
            Submit
        </Button>
    </div>

    <div class="max-w-xl w-full">
        <div class="grid grid-cols-2 gap-6">
            <div class="w-full">
                <Label class="mb-2">Origin Hub</Label>
                <Button 
                    color="none"
                    class="w-full gap-4 items-center p-4 border {hub
                        ? 'border-gray-200'
                        : 'border-primary-600'}"
                >
                    <Avatar size="md" />
                    <div class="flex-1 text-start">
                        <div class="font-normal text-sm">{ hub?.name || "Select a hub"}</div>
                        <div class="text-xs text-gray-400">{ hub?.code || "Not set" }</div>
                    </div>
                    <span><UilAngleDown /></span>
                </Button>
                <Dropdown class="p-3">
                    <div class="w-full min-w-[250px] py-3">
                        <Input
                            type="text"
                            placeholder="Search hubs..."
                            on:keyup={(e) => (debounce(() => getHubs(e), 400))}
                        >
                            <span slot="left" class="text-primary"><UilSearch size="20" /></span>
                        </Input>
                    </div>
                    {#each hubs as item }
                    <button 
                        on:click={() => {
                            hub = item;
                            
                        }}
                        class="flex w-full gap-x-3 px-3 py-4 items-center hover:bg-slate-50 transition-all">
                        <Avatar size="sm" />
                        <div class="flex-1 text-left text-sm">
                            <div>{ item.name }</div>
                            <div class="text-gray-400 text-xs">{ item.code || "" }</div>
                        </div>
                    </button>
                    {/each}
                </Dropdown>
            </div>
            <div class="w-full max-w-xs">
                <Label class="mb-2">Customer:</Label>
                <Button
                    color="none"
                    class="w-full gap-4 items-center p-4 border {customer
                        ? 'border-gray-200'
                        : 'border-primary-600'}"
                >
                    <Avatar />
                    <div class="flex-1 text-left text-sm">
                        <div>{customer?.name || "Select customer"}</div>
                        <div class="text-gray-400 text-xs">
                            {customer?.email || customer?.phone || "Not set"}
                        </div>
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
                            on:keyup={(e) => debounce(() => getCustomers(e), 400)}
                        >
                            <span slot="left" class="text-primary"
                                ><UilSearch size="18" /></span
                            >
                        </Input>
                    </div>
    
                    {#each users as user}
                        <DropdownItem
                            on:click={() => onSelectUser(user)}
                            class="flex w-full gap-x-3 px-3 py-4 items-center hover:bg-slate-50 transition-all"
                        >
                            <Avatar size="md" />
                            <!-- <div class="grid place-content-center w-10 h-10 bg-slate-50 rounded-full text-base-content/40">
                                <UilUser size="15" />
                            </div> -->
                            <div class="flex-1 text-left text-sm">
                                <div>{user.name}</div>
                                <div class="text-gray-400 text-xs">
                                    {user.email || user.phone || ""}
                                </div>
                            </div>
                        </DropdownItem>
                    {/each}
                </Dropdown>
            </div>
        </div>
    </div>

    <div class="w-full bg-base-100 rounded-lg p-8">
        <div class="border border-dashed rounded-md p-8 flex gap-6 mb-7">
            <div class="text-base-content/60 mt-2">
                <UilApps size="26" />
            </div>
            <div class="flex-1">
                <h3 class="font-medium">Bulk Applications Upload</h3>
                <p class="text-sm text-gray-600 pr-6">
                    Streamline your application management by uploading multiple
                    applications simultaneously. This feature allows you to
                    efficiently process a large volume of applications, saving
                    you time and reducing manual entry errors.
                </p>
                <div
                    class="flex items-center justify-center py-2 px-4 rounded-full border w-[200px] gap-3 mt-8"
                >
                    <div class="badge badge-accent">{apps.length}</div>
                    <div class="text-sm">Applications</div>
                </div>
            </div>
        </div>

        <Button
            size="lg"
            class="w-full max-w-[200px]"
            on:click={doSubmit}
            disabled={isLoading}
        >
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
                    <span class="font-semibold">Click to upload</span> or drag and
                    drop
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">CSV File</p>
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

{#if isUploading}
    <div
        transition:fade={{ delay: 0, duration: 300 }}
        class="fixed inset-0 bg-black/20 grid place-content-center z-50 print:hidden"
    >
        <div
            class="bg-base-100 w-40 h-40 rounded-2xl shadow-md grid place-content-center z-50"
        >
            <div
                class="radial-progress"
                style="--value:{progress};"
                role="progressbar"
            >
                {progress}%
            </div>
            <div class="text-sm text-base-content/60 pt-3">Uploading...</div>
        </div>
    </div>
{/if}
