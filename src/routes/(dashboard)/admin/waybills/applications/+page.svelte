<script>
  import { utils, read, writeFile } from "xlsx";
  import printJS from "print-js";
  import html2pdf from "html2pdf.js";
  import dayjs from "dayjs";
  import { getUser } from "$lib/stores/user";
  import WaybillPrint from "$lib/components/dashboard/WaybillPrint.svelte";
  import WaybillPrintThermal from "$lib/components/dashboard/WaybillPrintThermal.svelte";
  import {
    Breadcrumb,
    BreadcrumbItem,
    Checkbox,
    Button,
    Dropdown,
    DropdownItem,
    Drawer,
    Modal,
    Dropzone,
    Badge,
  } from "flowbite-svelte";
  import { clientFetch } from "$lib/client/api";
  import { onMount } from "svelte";
  import ListShimmer from "$lib/components/ListShimmer.svelte";
  import { writable } from "svelte/store";
  import SearchBox from "$lib/components/dashboard/SearchBox.svelte";
  import {
    UilAngleDown,
    UilFileAlt,
    UilFileCheckAlt,
    UilPlus,
    UilSlidersVAlt,
    UilTable,
    UilCancel,
    UilPathfinder,
  } from "svelte-unicons";
  import { closeModal, showModal, toggleDrawer } from "$lib/stores/app";
  import { failure, info, success } from "$lib/utils/toast";
  import { sineIn } from "svelte/easing";
  import ApplicationsFilter from "$lib/components/dashboard/admin/ApplicationsFilter.svelte";
  import { debounce } from "$lib/utils/helpers";
  import GwxPagination from "$lib/components/dashboard/GWXPagination.svelte";
  import { page } from "$app/stores";
  import BulkDeliveryAssign from "$lib/components/dashboard/admin/BulkDeliveryAssign.svelte";
  import { computeStatus } from "$lib/client/helpers";
  import { goto } from "$app/navigation";

  let isLoading = false;
  let bulkModal = false;
  let hideFilter = true;
  let items = [],
    labelLayout;
  let ids = [];
  let mainIds = [];
  let assignIds = [];
  let printIds = [];
  let recievedIds = [];
  let sendIds = [];
  let printers = [];
  let isPrint = false;
  let count = 1;
  let showDelivery = false;

  const handlePrint = async () => {
    if (!printIds.length) return;

    showModal();

    console.log("printers", printers);
    console.log("items...", items);
    showModal();
    isPrint = true;
    debounce(() => {
      const lay = document.getElementById("waybill-print-layout");
      const container = document.createElement("div");
      container.innerHTML = lay.innerHTML;
      console.log(container);
      html2pdf(container, {
        margin: 0,
        filename: `bulk-waybills.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      }).save();
      isPrint = false;
      getData();
      closeModal();
    }, 2000);
  };
  const checkBadRecords = () => {
    if (ids.length) {
    }
  };
  const toggleIds = (item) => {
    console.log(item);
    const { id, required } = item;
    let myItem = {};
    console.log("the ids to show here", ids);

    if (required) {
      ids.push(item.id);

      
        if (item.status == "waybill-generated") assignIds.push(id);
        if (item.status == "canceled") assignIds.push(id);
        if (item.status == "returned") assignIds.push(id);
        if (item.status == "draft" && !item.is_diaspora)
          recievedIds.push(id);
        if (item.status == "draft" && item.is_diaspora) sendIds.push(id);
        if (item.status != "draft") {
          printIds.push(id);
          printers.push(item);
        }
      
    } else {
      const index = ids.findIndex((r) => {
        return item.id == r.id;
      });
      ids.splice(index, 1);
      const aIndex = assignIds.findIndex((d)=>{return d == item.id});
      assignIds = assignIds;
      if(aIndex !== -1) assignIds.splice(aIndex, 1);
      const rIndex = recievedIds.findIndex((d)=>{return d == item.id});
      recievedIds = recievedIds;
      if(rIndex !== -1) recievedIds.splice(rIndex, 1);

      const sIndex = sendIds.findIndex((d)=>{return d == item.id});
      sendIds = sendIds;
      if(sIndex !== -1) sendIds.splice(sIndex, 1);

      const pIndex = printIds.findIndex((d)=>{return d == item.id});
      printIds = printIds;
      if(pIndex !== -1) sendIds.splice(pIndex, 1);
    }

  
  };
  const waybills = writable([]);
  let meta = {
    page: 1,
    limit: 10,
    total: 0,
    status: "delivered",
  };

  onMount(() => {
    meta.status = $page.url.searchParams.get("status") || "";

    getData();
  });

  async function getData() {
    isLoading = true;
    info("loading packages...");
    let query = new URLSearchParams(meta);

    try {
      const res = await clientFetch({
        path: "/packages",
        query: query.toString(),
      });

      const json = await res.json();
      if (!res.ok) throw json;
      items = json.data;
      items.forEach((item) => {
        if (
          item.recipient &&
          (item.recipient.state === null || item.recipient.state === undefined)
        ) {
          item.recipient.state = {};
        }
      });
      meta = Object.assign(meta, json.meta);
    } catch (error) {
      failure(error);
    } finally {
      isLoading = false;
    }
  }

  function statusStyle(val) {
    switch (val) {
      case "new":
      case "queued":
        return "bg-slate-100";
      case "draft":
        return "bg-slate-200";
      case "pending":
        return "bg-secondary/5 tex-secondary";
      case "processing":
        return "bg-info/5 text-info";
      case "in-transit":
        return "bg-warning/5 text-warning";
      case "out-for-delivery":
        return "bg-accent/5 text-accent";
      case "delivered":
        return "bg-success/5 text-success";
      case "returned":
        return "bg-error/5 text-error";
      case "canceled":
        return "bg-error/5 text-error";
      default:
        return "bg-slate-200";
    }
  }

  function onSearch(e) {
    meta.search = e.detail;
    getData();
  }
  const removeFilter = (met) => {
    delete meta[met];
    meta = meta;
    console.log("the world here", meta);
    getData();
  };

  function processApplications() {
    if (!recievedIds.length) return;

    const body = {
      notify: true,
      update: items
        .filter((e) => recievedIds.includes(e.id) && e.status == "draft")
        .map((e) => ({
          id: e.id,
          status: "waybill-generated",
        })),
    };

    showModal();

    clientFetch({
      path: "/packages/bulk",
      method: "POST",
      body,
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.data) {
          failure(json.data);
          return;
        } else {
          getData();
        }
        success("Processing request");
      })
      .catch((e) => {
        failure(e);
      })
      .finally(() => {
        closeModal();
        getData();
      });
  }

  function processInternational() {
    if (!sendIds.length) return;
    const package_ids = sendIds;

    const body = {
      package_ids,
    };

    showModal();

    clientFetch({
      path: "/shipments/diaspora",
      method: "POST",
      body,
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.data) {
          failure(json.data);
          return;
        } else {
          getData();
        }
        success("success exporting packages to international...");
      })
      .catch((e) => {
        failure(e);
      })
      .finally(() => {
        closeModal();
        getData();
      });
  }

  function printApplications() {}

  async function downloadAsCSV() {
    if (!meta.total) return;

    showModal();

    try {
      const res = await clientFetch({
        path: "/packages",
        query: Object.assign({}, meta, { limit: meta.total }),
      });

      const json = await res.json();
      if (!res.ok) throw json;
      console.log("the json file here", json);
      // generate the xlxs
      const headers = [
        "Application ID",
        "Ref Number",
        "Applicant Name",
        "Mobile Number",
        "Contact Address",
        "Contact City",
        "Contact State",
        "Status",
        "Hub",
        "Delivery Date",
      ];
      const aoa = [headers];

      for (let index = 0; index < json.data.length; index++) {
        const el = json.data[index];
        let a = Array.from(headers).map((e) => "");

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
        a[8] = el.hub.name;
        // Date Created
        a[9] = dayjs(el.created_at).format("DD-MM-YYYY");

        // Delivery Date
        const dd = (el.milestones || []).find(
          (e) => e.status == "delivered"
        )?.timestamp;
        a[4] = dd ? dayjs(dd).format("DD-MM-YYYY") : "";

        // push to the array
        aoa.push(a);
      }

      const ws = utils.aoa_to_sheet(aoa, { dense: true });
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
    console.log("the meta is here", e);
    meta = Object.assign({}, meta, e.detail);
    hideFilter = true;
    getData();
  }

  const fileTypes = [
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];
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
    const data = utils
      .sheet_to_json(wb.Sheets[wb.SheetNames[0]])
      .filter((e) => !!e.application_id)
      .map((e) => ({ application_id: e.application_id }));

    if (!data.length) return;

    showModal();

    clientFetch({
      path: "/packages/bulk",
      method: "POST",
      body: {
        register: data,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.data) {
          failure(json.data);
          return;
        }
        success("Processing request");
      })
      .catch((e) => {
        failure(e);
      })
      .finally(() => {
        debounce(() => {
          closeModal();
          getData();
        }, 2000);
      });
  }

  async function sendToThermal() {
    if (!printIds.length) return;
    console.log("the count here", count, printers);
    count++;
    showModal();
    isPrint = true;

    try {
      debounce(async () => {
        const el = document.createElement("div");
        el.innerHTML = labelLayout.innerHTML;

        const doc = await html2pdf()
          .from(el)
          .set({
            margin: 0,
            // filename: `${$item.waybill_number}.pdf`,
            image: { type: "png", quality: 1 },
            jsPDF: {
              unit: "cm",
              format: [10, 15],
              orientation: "portrait",
            },
          })
          .output("bloburi");

        // print the document
        printJS(doc);
        isPrint = false;
      }, 1000);
    } catch (error) {
      console.log(error);
      failure(error);
    } finally {
      printers = [];
      closeModal();
    }
  }
</script>

<div class="gwx-breadcrumb print:hidden">
  <Breadcrumb aria-label="GWX breadcrumb">
    <BreadcrumbItem href="/admin">Dashboard</BreadcrumbItem>
    <BreadcrumbItem>NIS Applications</BreadcrumbItem>
  </Breadcrumb>
</div>

<div class="page print:hidden">
  <div class="flex items-center gap-x-3 mb-4">
    <h2 class="text-lg font-semibold">NIS Applications</h2>
    <div class="flex flex-1 justify-end"></div>
  </div>
  <div class="filter">
    {#if meta.status}
      <Button
        color="yellow"
        pill
        on:click={() => {
          meta.status = "";
          goto("/admin/waybills/applications");
          getData();
        }}
        >{meta.status}
      </Button>
    {/if}

    {#if meta.hub_id}
      <Button
        color="green"
        pill
        on:click={() => {
          meta.hub_id = "";
        }}
        >hub ID:{meta.hub_id}
      </Button>
    {/if}
    {#if meta.date_min}
      <Button
        color="pink"
        pill
        on:click={() => {
          meta.date_min = "";
        }}
        >Date Min:{meta.date_min}
      </Button>
    {/if}

    {#if meta.date_max}
      <Button
        color="purple"
        pill
        on:click={() => {
          meta.date_max = "";
        }}
        >Date Min:{meta.date_max}
      </Button>
    {/if}
  </div>

  <div class="flex flex-col md:flex-row gap-y-4 gap-x-6 justify-between">
    <div class="flex items-center gap-4 mt-2">
      <div>
        <Button color="none" size="sm" class="border border-gray-300" outline>
          Action
          <span><UilAngleDown /></span>
        </Button>
        <Dropdown class="min-w-[120px]">
          {#if assignIds.length}
            <DropdownItem
              disabled={!assignIds.length}
              on:click={() => {
                if (!assignIds.length) return;
                checkBadRecords();
              }}
            >
              <div class="flex items-center space-x-2">
                <span>Assign</span>
                <span class="bg-slate-100 rounded-xl px-2 py-1 text-xs"
                  >{assignIds.length}</span
                >
              </div>
            </DropdownItem>
          {/if}
          {#if recievedIds.length}
            <DropdownItem
              disabled={!recievedIds.length}
              on:click={() => {
                if (!recievedIds.length) return;
                processApplications();
              }}
            >
              <div class="flex items-center space-x-2">
                <span>Recieved</span>
                <span class="bg-slate-100 rounded-xl px-2 py-1 text-xs"
                  >{recievedIds.length}</span
                >
              </div>
            </DropdownItem>
          {/if}
          {#if sendIds.length}
            <DropdownItem
              disabled={!sendIds.length}
              on:click={() => {
                if (!sendIds.length) return;
                processInternational();
              }}
            >
              <div class="flex items-center space-x-2">
                <span>Send</span>
                <span class="bg-slate-100 rounded-xl px-2 py-1 text-xs"
                  >{sendIds.length}</span
                >
              </div>
            </DropdownItem>
          {/if}
          {#if printIds.length}
            <DropdownItem
              disabled={!printIds.length}
              on:click={() => {
                if (!printIds.length) return;
                sendToThermal();
              }}
            >
              <div class="flex items-center space-x-2">
                <span>Print</span>
                <span class="bg-slate-100 rounded-xl px-2 py-1 text-xs"
                  >{printIds.length}</span
                >
              </div>
            </DropdownItem>
          {/if}
        </Dropdown>
      </div>
      <div class="relative w-full md:max-w-xs">
        <SearchBox placeholder="Search" on:search={onSearch} />
      </div>
      <div class="tooltip tooltip-top" data-tip="Update Filter">
        <Button
          color="light"
          size="sm"
          class="space-x-1"
          on:click={() => (hideFilter = false)}
          outline
        >
          <span><UilSlidersVAlt size="18" /></span>
          <span>Filter</span>
        </Button>
      </div>
    </div>
    <div class="flex w-full gap-x-3 md:flex-1 md:justify-end items-center">
      <Button
        size="xs"
        class="gap-2 w-[90px]"
        outline
        on:click={() => downloadAsCSV()}
      >
        <span><UilTable size="17" /></span>
        <span>Export</span>
      </Button>
      {#if getUser().role == "superadmin"}
        <Button
          size="sm"
          class="space-x-2 text-sm font-normal"
          href="/admin/waybills/applications/upload"
        >
          <span><UilPlus size="18" /></span>
          <span>New</span>
        </Button>
      {/if}
    </div>
  </div>

  <ListShimmer show={isLoading && !items.length} />

  <div
    class="overflow-x-auto w-full mt-4"
    class:hidden={isLoading && !items.length}
  >
    <table class="table table-xs custom table-auto">
      <thead>
        <tr>
          <th>
            <Checkbox
              checked={ids.length == items.length}
              on:change={(e) => {
                ids = e.target.checked ? items.map((e) => e.id) : [];
              }}
            />
          </th>
          <th class="min-w-[140px]">NIN</th>
          <th class="min-w-[200px]">Reciever</th>
          <th class="min-w-[130px]">Phone</th>
          <th class="min-w-[130px]">Address</th>
          <th class="min-w-[130px]">recipient Email</th>
          <th class="min-w-[100px]">State</th>
          <th class="min-w-[130px]">Status</th>
          <th class="min-w-[130px]">Hub</th>
          <th class="min-w-[100px]">Date</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each items as item (item.id)}
          <tr>
            <td>
              <Checkbox
                bind:checked={item.required}
                on:change={() => toggleIds(item)}
                bind:group={mainIds}
                value={item}
              />
            </td>
            <td>
              <div class="flex space-x-2 items-center">
                <span>{item.nin}</span>
                <a
                  href="/admin/waybills/{item.id}"
                  class="text-primary hover:text-secondary"
                  class:hidden={item.status === "draft"}
                >
                  <UilFileAlt size="15" />
                </a>
              </div>
            </td>
            <td>
              <span>{item.recipient.name || ""}</span>
            </td>
            <td>
              <span>{item.recipient.phone || ""}</span>
            </td>

            <td>
              <span>{item.recipient.address || ""}</span>
            </td>
            <td>
              <span>{item.recipient.email || ""}</span>
            </td>
            <td>
              <span>{item.recipient.state.name || ""}</span>
            </td>
            <td>
              <span
                class="{statusStyle(
                  item.status
                )} text-2xs px-2 py-1 rounded-md uppercase font-medium"
                >{computeStatus(item.status)}</span
              >
            </td>
            <td>
              <span>{item.hub?.name || ""}</span>
            </td>
            <td>
              <span class="text-xs"
                >{dayjs(item.created_at).format("DD-MM-YYYY")}</span
              >
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <GwxPagination
    currentPage={meta.page}
    pageSize={meta.limit}
    totalItems={meta.total}
    on:setPage={(e) => {
      meta.page = e.detail.page;
      getData();
    }}
    on:setPageSize={(e) => {
      meta.limit = e.detail.size;
      getData();
    }}
    class="w-full mt-8"
  />
</div>

<Drawer
  bind:hidden={hideFilter}
  placement="right"
  transitionType="fly"
  transitionParams={{ x: 320, duration: 200, easing: sineIn }}
>
  <ApplicationsFilter
    data={meta}
    on:close={() => (hideFilter = true)}
    on:data={onFilter}
  />
</Drawer>

{#if isPrint}
  <WaybillPrint items={printers} id="waybill-print-layout" class="hidden" />

  <WaybillPrintThermal
    bind:node={labelLayout}
    items={printers}
    class="hidden"
  />
{/if}
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
        <p class="text-xs text-gray-500 dark:text-gray-400">CSV File</p>
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

<Modal
  title="Assign Delivery ({ids.length})"
  bind:open={showDelivery}
  autoclose={false}
  size="xs"
  class="w-full"
>
  <BulkDeliveryAssign
    class="print:hidden"
    items={ids}
    on:close={() => (showDelivery = false)}
    on:done={() => {
      showDelivery = false;
      debounce(() => getData(), 500);
    }}
  />
</Modal>

<style>
  .filter {
    display: flex;
    flex-direction: row;
    padding: 5px;
  }

  .filter div {
    margin-left: 5px;
  }
</style>
