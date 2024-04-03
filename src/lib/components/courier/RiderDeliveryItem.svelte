<script>
    import dayjs from 'dayjs';
    import { Avatar } from 'flowbite-svelte';
    import { UilParcel } from 'svelte-unicons';

    export let showStatus = false;
    export let data;

    function statusText(val) {
        switch (val) {
            case "pending": return "Pending";
            case "completed": return "Completed";
            case "en-route": return "En route";
            case "canceled": return "Canceled";
            default: return "Pending"
        }
    }

    function statusStyle(val) {
        switch (val) {
            case "pending": return "text-secondary";
            case "completed": return "text-success";
            case "in-transit": return "text-info";
            case "canceled": return "text-error";
            default: return "text-accent";
        }
    }

    function statusBg(val) {
        switch (val) {
            case "pending": return "bg-secondary";
            case "completed": return "bg-success";
            case "in-transit": return "bg-info";
            case "canceled": return "bg-error";
            default: return "bg-accent";
        }
    }
</script>

<div class="flex p-4 rounded-xl border gap-x-3 relative cursor-pointer hover:border-primary transition-all overflow-hidden {$$props.class}">
    <!-- <div class="avatar">
        <div class="w-9 h-9 rounded-lg">
            <img src="/images/logo.png" alt="">
        </div>
    </div> -->
    <Avatar class="bg-base-content/5 text-primary/90">
        <span><UilParcel size="16"/></span>
    </Avatar>
    <div class="flex flex-col">
        <a href="/courier/deliveries/{data.id}" class="text-sm">{ data.package.name }</a>
        <div class="text-xs text-base-content/75 space-x-1">
            <span>#{ data.package.waybill_number } - </span>
            <span 
                class="font-semibold {statusStyle(data.status)}"
                class:hidden={!showStatus && !["pending", "en-route"].includes(data.status)}
            >
                { statusText(data.status) }
            </span>
            <span>{ dayjs(data.created_at).format("ddd MMM DD") }</span>
        </div>
    </div>

    <div class:hidden={!showStatus} class="absolute {statusBg(data.status)} -right-4 -top-4 w-7 h-7 rotate-[40deg]" />
</div>