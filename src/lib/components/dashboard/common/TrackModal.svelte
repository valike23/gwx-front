<script>
    import dayjs from 'dayjs';
    import { createEventDispatcher } from 'svelte';

    export let item;
    const dispatch = createEventDispatcher();

</script>

<div>
    <div class="py-2 px-2">
        <div>
            {#each (item.milestones || []) as item }
            <div class="border-l relative pl-8 pb-8 space-y-1">
                <div class="text-sm">
                    {item.status_text}
                </div>
                <div class="text-xs text-gray-400">{ dayjs(item.timestamp).format("MMM DD, YYYY [|] hh:mm a") }</div>
                <div class="absolute w-3 h-3 rounded-full bg-slate-100 -left-[6px] top-2" />
            </div>
            {/each}
        </div>
    </div>
</div>