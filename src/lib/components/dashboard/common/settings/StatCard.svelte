<script>
    import { Button } from "flowbite-svelte";

    export let href;
</script>

<Button
    color="none"
    {href}
    class="flex flex-col rounded-md items-start text-primary-content p-4 gap-y-3 {$$props.class}">
    <div class="text-xs">
        <slot name="title"/>
    </div>
    <div class="flex">
        <div class="font-medium text-lg">
            <slot name="value">0</slot>
        </div>
    </div>
</Button>

<!-- <div class="flex flex-col rounded-md text-primary-content p-4 gap-y-3 {$$props.class}">
    <div class="text-xs">
        <slot name="title"/>
    </div>
    <div class="flex">
        <div class="font-medium text-lg">
            <slot name="value">0</slot>
        </div>
    </div>
</div> -->