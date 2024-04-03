<script>
    import { copyText } from "$lib/utils/helpers";
    import dayjs from "dayjs";
    import { sineIn } from 'svelte/easing';
    import { Button, Drawer, Modal } from "flowbite-svelte";
    import { UilCalender, UilCopy, UilInfoCircle, UilLocationArrow, UilReceipt } from "svelte-unicons";
    import TrackModal from "../TrackModal.svelte";

    export let item;

    let showTrack = false;

    function statusStyle(val) {
        switch (val) {
            case "new": 
            case "queued": return "bg-slate-200";
            case "pending": return "bg-secondary/5";
            case "processing": return "bg-info/5 text-info";
            case "in-transit": return "bg-warning/5";
            case "out-for-delivery": return "bg-accent/10 text-accent";
            case "delivered": return "bg-success text-base-100";
            case "canceled": return "bg-error/5 text-error";
            default: return "bg-slate-200";
        }
    }
</script>

<div class="bg-base-100 rounded-lg shadow-sm p-4 max-w-[280px]">
    <div class="w-10 h-10 bg-info/5 rounded-full grid place-content-center mb-4 text-info">
        <UilInfoCircle size="18" />
    </div>
    <div class="flex items-center gap-3">
        <span class="grid place-content-center w-9 h-9 rounded-full border bg-slate-100 text-slate-400">
            <UilReceipt size="15" />
        </span>
        <div class="flex-1 flex flex-col gap-y-1">
            <span class="text-xs text-base-content/50 uppercase">Waybill Number</span>
            <div class="text-sm">{ item.waybill_number }</div>
        </div>  
        <button 
            class="btn btn-circle btn-sm" 
            on:click={(() => copyText(item.waybill_number))}>
            <span><UilCopy size="15"/></span>
        </button>
    </div>
    <div 
        class="flex items-center gap-3"
        class:hidden={!item.tracking_number}>
        <span class="grid place-content-center w-9 h-9 rounded-full border bg-slate-100 text-slate-400">
            <UilLocationArrow size="15" />
        </span>
        <div class="flex-1 flex flex-col gap-y-1 py-3" >
            <span class="text-xs text-base-content/50 uppercase">Tracking Number</span>
            <div class="text-sm">{ item.tracking_number }</div>
        </div>
    </div>
   
    <div class="flex items-center gap-3">
        <span class="grid place-content-center w-9 h-9 rounded-full border bg-slate-100 text-slate-400">
            <UilCalender size="15" />
        </span>
        <div class="flex-1 flex flex-col gap-y-1 py-3">
            <span class="text-xs text-base-content/50 uppercase">Date created</span>
            <div class="text-xs text-base-content/80">{ dayjs(item.created_at).format("DD-MM-YYYY [at] HH:mm A")}</div>
        </div>
    </div>
    
    <div class="flex justify-between items-center mt-4">
        <span class="{statusStyle(item.status)} text-xs px-2 py-1 rounded-md uppercase">
            { item.status }
        </span>
        <div>
            <Button size="xs" class="uppercase" on:click={() => (showTrack = true)}>
                Track
            </Button>
        </div>
        
    </div>
</div>

<Modal title="Track Waybill" bind:open={showTrack} autoclose outsideclose>
    <TrackModal item={item} on:close={() => (showTrack = false)} />
</Modal>