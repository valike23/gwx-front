<script>
    import { Button, CloseButton } from "flowbite-svelte";
    import { createEventDispatcher } from "svelte";
    import { UilCancel, UilClockSeven } from "svelte-unicons";

    export let pinLength = 5;

    const dispatch = createEventDispatcher();
    let pin = [];

    function onTap(val) {
        if (val == 99) {
            if (pin.length) {
                pin.pop();
            }
            pin = pin;
            return;
        }

        pin.push(`${val}`);
        pin = pin;

        if (pin.length == pinLength) {
            dispatch('success', pin.join(""));
        }

    }
</script>

<div class="w-full h-full bg-base-100 relative z-50 overflow-y-auto flex flex-col">
    <div class="flex gap-x-4 sticky bg-base-100 shadow-sm w-full top-0 px-4 items-center h-14">
        <div><CloseButton on:click={() => (dispatch('close'))} /></div>
        <h3 class="font-medium text-primary">Confirm PIN</h3>
    </div>
    <div class="flex-1 flex flex-col items-center justify-center">
        <div class="py-6 font-semibold">
            Enter the Confirmation PIN
        </div>
        <div class="flex flex-wrap gap-x-4 justify-center items-center">
            {#each Array(pinLength) as _, index }
            <div 
                class="w-14 h-14 rounded-2xl bg-slate-50 border-0 border-slate-300 grid place-content-center font-medium text-lg transition-all"
                class:border-2={!!pin[index]}
            >
                { pin[index] || "" }
            </div>
            {/each}
        </div>
    </div>
    <div class="py-8 grid grid-cols-3 gap-4 items-center justify-center w-full">
        {#each Array(9) as _, index }
        <Button color="none" class="bg-slate-50 rounded-full w-16 h-16 mx-auto border border-slate-200 font-semibold" on:click={() => (onTap(index+1))}>
            {index + 1}
        </Button>
        {/each}
        <div />
        <Button color="none" class="bg-slate-50 rounded-full w-16 h-16 mx-auto border border-slate-200 font-semibold" on:click={() => (onTap(0))}>
            0
        </Button>
        <Button color="none" class="bg-slate-50 rounded-full w-16 h-16 mx-auto border border-slate-200" on:click={() => (onTap(99))}>
            <span class="rotate-180 text-gray-500"><UilCancel size="24"/></span>
        </Button>
    </div>

</div>