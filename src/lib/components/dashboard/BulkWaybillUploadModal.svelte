<script>
    import { csvToJSON } from "$lib/client/helpers";
    import { Button, Dropzone } from "flowbite-svelte";
    import { createEventDispatcher } from "svelte";
    import { UilCloudDownload } from "svelte-unicons";

    const dispatch = createEventDispatcher();

    function downloadCSV() {
        const a = document.createElement("a");
        a.setAttribute("href", "/waybill.csv");
        a.setAttribute("download", "waybill-upload-template.csv");
        a.click();
    }

    const fileTypes = ["text/csv"];
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
        if (!value) return;
        const content = await value.text();
        dispatch("data", csvToJSON(content));
    }
</script>

<div class="relative overflow-y-auto">

    <div>
        <div class="flex gap-4">
            <Button size="sm" on:click={downloadCSV}>
                <span class="mr-2"><UilCloudDownload /></span>
                Download CSV Template
            </Button>
        </div>
    </div>

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

    <div class="flex gap-3 pb-1">
        <Button size="sm" on:click={() => dispatch("close")} outline>
            Cancel
        </Button>
        <Button size="sm" on:click={() => submit()}>Submit</Button>
    </div>
</div>
