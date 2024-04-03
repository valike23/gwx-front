<script>
    import { goto, invalidateAll } from "$app/navigation";
    import { page } from "$app/stores";
    import dayjs from "dayjs";
    import { Button, Input } from "flowbite-svelte";
    import { space } from "postcss/lib/list";
    import { UilCheck, UilCheckCircle, UilPackage } from "svelte-unicons";

    const pkg = $page.data.data;
    let id = $page.url.searchParams.get("id");


    function onKeyUp(e) {
        if (id.length < 5) return;
        if(e.key == "Enter") {
            $page.url.searchParams.set("id", id);
            window.location.href = $page.url.toString();
        }
    }

    function sortArr(arr = []) {
        arr =  arr.sort((a, b) => {
            // Convert timestamps to Date objects for accurate comparison
            const dateA = new Date(a?.timestamp);
            const dateB = new Date(b?.timestamp);

            // Reverse the comparison for descending order
            return dateB - dateA;
        }).map(e => {
            switch (e.status) {
                case "new": 
                case "created": e.status_text = "Waybill created"
                    break;
                case "picked":
                case "in-transit": e.status_text = "Assigned for delivery"
                default: break;
            }
            return e;
        }).filter(e => !["in-transit"].includes(e.status));

        return arr;
    }

</script>

<a href="https://www.greaterwashingtonng.com" target="_blank" class="block py-4 px-6">
    <img src="/images/logo.png" alt="GEX Logo" class="w-[130px]"/>
</a>

<div class="page">
    <div class="pb-8">
        <h3 class="text-2xl uppercase font-medium">Track your shipment</h3>
        <p class="text-gray-500">Find and track your shipment anytime</p>
    </div>
    <div class="w-full max-w-lg">
        <Input
            bind:value={id}
            placeholder="Enter Tracking ID or waybill number"
            size="lg"
            class="py-4 placeholder:text-sm"
            on:keyup={onKeyUp}
        >
            <Button 
                slot="right" 
                on:click={async () => {
                    if (id?.length < 4) return;
                    $page.url.searchParams.set("id", id);
                    window.location.href = $page.url.toString();
                }}>
                Track
            </Button>
        </Input>
    </div>

    {#if pkg}
    <div class="border my-6 overflow-hidden rounded-md">
        <div class="bg-slate-100 text-center p-4 font-medium text-sm">
            { $page.url.searchParams.get("id") }
        </div>
        <div class="timeline timeline-vertical">
        {#each sortArr(pkg.milestones) as item, index }
            <div class="relative">
                <div class="flex divide-x relative">
                    <div class="flex-none w-36 py-4 px-4">
                        <div class="font-medium text-sm">{ dayjs(item.timestamp).format('MMM DD, YYYY') }</div>
                        <div class="text-gray-500 text-xs">{ dayjs(item.timestamp).format('hh:mm A') }</div>
                    </div>
                    <div class="flex-1 px-6 py-4 text-sm font-medium">
                        { item.status_text }
                    </div>
    
                    
                </div>
                <div class="absolute left-[134px] z-10 top-4">
                    {#if index == 0}
                    <span class="w-5 h-5 rounded-full grid place-content-center bg-success text-white">
                        <UilCheck size="18" />
                    </span>
                    
                    {:else}
                    <span class="w-5 h-5 rounded-full grid place-content-center bg-slate-200 text-gray-400">
                        <UilCheck size="18" />
                    </span>
                    {/if}
                </div>
            </div>
            
        {/each}  
        </div>
    </div>
    {:else}
    <div class="border rounded-sm min-h-[250px] flex flex-col items-center justify-center mt-8 gap-2 p-5">
        <span class="text-gray-300">
            <UilPackage size="60" />
        </span>
        <div class="text-gray-500">Package not found</div>
    </div>
    {/if}
</div>