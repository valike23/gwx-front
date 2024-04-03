<script>
    import { utils, read, writeFile } from 'xlsx';
    import dayjs from 'dayjs';
    import { Breadcrumb, BreadcrumbItem, Checkbox, Button, Dropdown, DropdownItem, Drawer, Modal, Dropzone } from "flowbite-svelte";
    import { PaginationNav } from "svelte-paginate";
    import { clientFetch } from "$lib/client/api";
    import { onMount } from 'svelte';
    import ListShimmer from '$lib/components/ListShimmer.svelte';
    import { writable } from 'svelte/store';
    import SearchBox from '$lib/components/dashboard/SearchBox.svelte';
    import { UilAngleDown, UilFileAlt, UilFileCheckAlt, UilPlus, UilSlidersVAlt, UilTable } from 'svelte-unicons';
    import { closeModal, showModal } from '$lib/stores/app';
    import { failure, success } from '$lib/utils/toast';
    import { sineIn } from 'svelte/easing';
    import ApplicationsFilter from '$lib/components/dashboard/admin/ApplicationsFilter.svelte';
    import { debounce } from '$lib/utils/helpers';

    let isLoading = false;
    let bulkModal = false;
    let hideFilter = true;
    let items = [];
    let ids = [];
    const waybills = writable([]);
    let meta = {
        page: 1,
        limit: 10,
        total: 0,
        status: "",
        tag: "nis-application"
    }

    onMount(() => {
        getData();
    });

    async function getData() {
        isLoading = true;

        let query = new URLSearchParams(meta);

        try {
            const res = await clientFetch({
                path: "/packages",
                query: query.toString()
            });

            const json = await res.json();
            if (!res.ok) throw json;
            items = json.data
            meta = Object.assign(meta, json.meta);    
        } catch (error) {
            failure(error);
        } finally {
            isLoading = false;
            ids = [];
        }
    }

    function statusStyle(val) {
        switch (val) {
            case "new": 
            case "queued": return "bg-slate-100";
            case "draft": return "bg-slate-200";
            case "pending": return "bg-secondary/5 tex-secondary";
            case "processing": return "bg-info/5 text-info";
            case "in-transit": return "bg-warning/5 text-warning";
            case "out-for-delivery": return "bg-accent/5 text-accent";
            case "delivered": return "bg-success/5 text-success";
            case "canceled": return "bg-error/5 text-error";
            default: return "bg-slate-200";
        }
    }

    function setPage(val) {
        meta.page = val.detail.page;
        getData();
    }

    function onSearch(e) {
        meta.search = e.detail;
        getData();
    }

    function processApplications() {
        if (!ids.length) return;

        const body = {
            register: items.filter(e => ids.includes(e.id) && e.status == "draft").map(e => ({
                id: e.id,
                status: "new"
            }))
        }

        showModal();

        clientFetch({
            path: "/packages/bulk",
            method: "POST",
            body
        })
        .then(res => res.json())
        .then(json => {
            if(!json.data) {
                failure(json.data)
                return;
            }
            success("Processing request");
        })
        .catch(e => {
            failure(e);
        })
        .finally(() => {
            closeModal();
            getData();
        });
    }

    async function downloadAsCSV() {
        if (!meta.total) return;

        showModal();

        try {
            const res = await clientFetch({
                path: "/packages",
                query: Object.assign({}, meta, {limit: meta.total}),
            });

            const json = await res.json();
            if (!res.ok) throw json;

            // generate the xlxs
            const headers = ["Application ID", "Ref Number", "Applicant Name", "Mobile Number", "Contact Address", "Contact City", "Contact State", "Status", "Delivery Date"];
            const aoa = [headers];

            for (let index = 0; index < json.data.length; index++) {
                const el = json.data[index];
                let a = Array.from(headers).map(e => "");

                // application id
                a[0] = el.metadata.application_id;

                // reference number
                a[1] = el.metadata.ref_num;

                // applicant
                a[2] = el.recipient.name;

                // mobile number
                a[3] = el.metadata.mobile_number;

                // contact address
                a[4] = el.metadata.current_address_line1;

                // contact city
                a[5] = el.metadata.contact_city;

                // contact state
                a[6] = el.metadata.current_address_state_name;

                // status
                a[7] = el.status.replaceAll("-", " ").toUpperCase();

                // Date Created
                a[8] = dayjs(el.created_at).format('DD-MM-YYYY');

                // push to the array
                aoa.push(a);
            }

            const ws = utils.aoa_to_sheet(aoa, { dense: true,  });
            const wb = utils.book_new();
            utils.book_append_sheet(wb, ws, "Sheet1");
            writeFile(wb, "NIS-Applications.xlsx");
        } catch (error) {
            failure(error);
        } finally {
            closeModal();
        }
    }

    function onFilter(e) {
        meta = Object.assign({}, meta, e.detail);
        hideFilter = true;
        getData();
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

    async function submitUpload() {
        if (!value || !value?.text) return;
        const content = await value.arrayBuffer();
        const wb = read(content);
        const data = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]).filter(e => !!e.application_id).map(e => ({application_id: e.application_id}));
  
        if (!data.length) return;

        showModal();

        clientFetch({
            path: "/packages/bulk",
            method: "POST",
            body: {
                "register": data
            }
        })
        .then(res => res.json())
        .then(json => {
            if(!json.data) {
                failure(json.data)
                return;
            }
            success("Processing request");
        })
        .catch(e => {
            failure(e);
        })
        .finally(() => {
            debounce(() => {
                closeModal();
                getData();
            }, 2000)
        });
    }

</script>
<div class="gwx-breadcrumb print:hidden">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem>Applications</BreadcrumbItem>
    </Breadcrumb>
</div>

<div class="page print:hidden">

    <div class="flex items-center gap-x-3 mb-4">
        <h2 class="text-lg font-semibold">Applications</h2>
        <div class="flex flex-1 justify-end">
        </div>
    </div>

    <div class="flex flex-col md:flex-row gap-y-4 gap-x-6 justify-between">
        <div class="flex items-center gap-4 mt-2">
            <div>
                <Button color="none" size="sm" class="border border-gray-300" outline>
                    Action
                    <span><UilAngleDown /></span>
                </Button>
                <Dropdown class="min-w-[120px]">
                    <DropdownItem on:click={() => processApplications()}>
                        Register
                    </DropdownItem>
                </Dropdown>
            </div>
            <div class="relative w-full md:max-w-xs" class:hidden={isLoading && items.length}>
                <SearchBox placeholder="Search application" on:search={onSearch} />
            </div>
            <div class="tooltip tooltip-top" data-tip="Upload Applications">
                <Button color="light" size="sm" class="space-x-1" on:click={() => (hideFilter = false)} outline>
                    <span><UilSlidersVAlt size="18"/></span>
                    <span>Filter</span>
                </Button>
                <Button color="light" size="sm" class="space-x-1" on:click={() => (hideFilter = false)} outline>
                    <span><UilFileCheckAlt size="18"/></span>
                    <span>Filter</span>
                </Button>
                <!-- <a 
                    href="/admin/waybills/bulk"
                    class="btn btn-outline btn-primary btn-circle btn-sm">
                    <UilTable size="20" />
                </a> -->
            </div>
        </div>
        <div class="flex w-full gap-x-3 md:flex-1 md:justify-end items-center">
            <Button size="xs" class="gap-2 w-[90px]" outline on:click={() => (downloadAsCSV())}>
                <span><UilTable size="17" /></span>
                <span>Export</span>
            </Button>
            <Button size="sm" class="space-x-2 text-sm font-normal" href="/customer/waybills/applications/upload">
                <span><UilPlus size="18" /></span>
                <span>New</span>
            </Button>
        </div>
    </div>

    <ListShimmer show={isLoading && !items.length }/>

    <div class="overflow-x-auto w-full mt-4" class:hidden={isLoading && !items.length}>
        <table class="table table-xs custom table-auto">
            <thead>
                <tr>
                    <th>
                        <Checkbox checked={ids.length == items.length} on:change={(e) => { 
                            ids = e.target.checked ? items.map(e => e.id) : []
                        }}
                    />
                    </th>
                    <th class="min-w-[140px]">ID</th>
                    <th class="min-w-[200px]">Applicant</th>
                    <th class="min-w-[130px]">Phone</th>
                    <th class="min-w-[120px]">Contact State</th>
                    <th class="min-w-[100px]">Status</th>
                    <th class="min-w-[100px]">Date</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {#each items as item (item.id)}
                <tr>
                    <td>
                        <Checkbox checked={ids.includes(item.id)} bind:group={ids} value={item.id} on:change={(e) => {
                            if (e.target.checked) {
                                ids.push(item.id)
                                ids = ids
                            } else {
                                ids = ids.filter(i => !ids.includes(item.id));
                            }
                        }} />
                    </td>
                    <td>
                        <div class="flex space-x-2 items-center">
                            <span>{ item.metadata?.application_id || item.id}</span>
                            <a 
                                href="/customer/waybills/{item.id}" 
                                class="text-primary"
                                class:hidden={item.status === "draft"}>
                                <UilFileAlt size="15" />
                            </a>
                        </div>
                    </td>
                    <td>
                        <span>{ item.recipient.name || '' }</span>
                    </td>
                    <td>
                        <span>{ item.recipient.phone || "" }</span>
                    </td>
                    <td>
                        <span>{ item.recipient.state.name || "" }</span>
                    </td>
                    <td>
                        <span class="{statusStyle(item.status)} text-2xs px-2 py-1 rounded-md uppercase font-medium">{ item.status }</span>
                    </td>
                    <td>
                        <span class="text-xs">{ dayjs(item.created_at).format('DD-MM-YYYY') }</span>
                    </td>
                </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <div 
        class="flex justify-between items-center gwx-paginator mt-8"
        class:hidden={!meta.total}
    >
        <span class="text-sm">
            Total: {meta.total}
        </span>
        <PaginationNav 
            currentPage={meta.page}
            limit={meta.limit}
            pageSize={meta.limit}
            totalItems={meta.total}
            on:setPage={(e) => setPage(e)}
        />
    </div>
</div>

<Drawer
    bind:hidden={hideFilter} 
    placement="right" 
    transitionType="fly"
    transitionParams={{x: 320, duration: 200, easing: sineIn}}>

    <ApplicationsFilter 
        data={meta} 
        on:close={() => (hideFilter = true)} 
        on:data={onFilter}
    />
</Drawer>

<Modal title="Upload Applications" bind:open={bulkModal} autoclose>
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
        <Button on:click={submitUpload}>Submit</Button>
        <Button color="alternative">Cancel</Button>
    </svelte:fragment>
</Modal>