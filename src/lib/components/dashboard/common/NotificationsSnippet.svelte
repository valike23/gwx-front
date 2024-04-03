<script>
    import { db } from "$lib/client/db";
    import { user } from "$lib/stores/user";
    import { debounce } from "$lib/utils/helpers";
    import { Button, Dropdown, DropdownItem } from "flowbite-svelte";
    import { onMount } from "svelte";
    import { NotificationsOutline } from "svelte-ionicons";

    let items = [];
    let timer;

    onMount(() => {
        getData();

        // subscribe to changes
        db.collection('notifications').on('change', () => (debounce(() => (getData()), 300, timer)));
    })

    function getData() {
        db.collection('notifications')
        .find({
            $or: [
                {uid: null},
                {uid: user.id}
            ]
        }, {
            limit: 5,
            sort: {timestamp: -1}
        })
        .then(data => {
            items = data;
        })
    }

</script>
<div>
    <Button color="none">
        <span><NotificationsOutline size="22" class="outline-none" /></span>
    </Button>
    <Dropdown 
        containerClass="mt-1"
        class="w-full md:w-[320px] -mt-1">
        <div slot="header" class="text-center text-xs font-semibold bg-slate-50 py-2">
            Notifications
        </div>
        <div class="divide-y divide-slate-100">
        {#each items as item }
            <DropdownItem class="flex items-center font-normal py-3 px-3 gap-4">
                <div class="w-8 h-8 rounded-full bg-indigo-50 grid place-content-center">
                    <NotificationsOutline size="18"/>
                </div>
                <div class="flex-1 space-y-0.5">
                    <div class="font-medium text-xs">{ item.title }</div>
                    <p class="text-xs text-gray-500 line-clamp-2">{ item.body || "" }</p>
                </div>
            </DropdownItem>
        {/each}
        </div>
        {#if !items.length}
        <div class="py-4 px-6 text-center text-sm text-gray-500">
            No alerts to show.
        </div>
        {/if}
        <div slot="footer" class="bg-slate-50 -mb-1 py-2 text-center" class:hidden={!items.length}>
            <a href="/admin/notifications" class="text-xs font-semibold text-primary">See all</a>
        </div>
    </Dropdown>
</div>
