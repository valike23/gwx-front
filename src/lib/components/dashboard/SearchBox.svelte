<script>
    import { debounce } from "$lib/utils/helpers";
    import { createEventDispatcher } from "svelte";
    import { UilSearch } from "svelte-unicons";

    export let placeholder = "Search";
    export let delay = 800;
    export let disabled = false;


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
        class="input text-sm bg-slate-50 w-full h-11 rounded-xl pl-10 font-normal border border-slate-200 !outline-none focus:outline-0"
        { placeholder }
        bind:value={search}
        on:keyup={onKeyUp}
        {disabled}
    />
    <span class="absolute left-3 top-3 text-primary"><UilSearch size="20" /></span
    >
</div>
