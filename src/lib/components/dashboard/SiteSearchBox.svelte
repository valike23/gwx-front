<script>
    import { debounce } from "$lib/utils/helpers";
    import { createEventDispatcher } from "svelte";
    import { UilSearch } from "svelte-unicons";

    export let placeholder = "Search";
    export let delay = 800;


    const dispatch = createEventDispatcher();

    let search;

    function onKeyUp(e) {
        if (e.key == "Enter") {
            dispatch("search", search);
            return;
        }

        debounce(() => {
            dispatch("search", search);
        }, delay);
    }
</script>

<div class="w-full relative {$$props.class}">
    <input
        type="text"
        class="input text-sm bg-slate-50 w-full h-11 rounded-full px-5 font-normal "
        { placeholder }
        bind:value={search}
        on:keyup={onKeyUp}
    />
    <span class="absolute right-4 top-3 text-fade"><UilSearch size="16" /></span
    >
</div>