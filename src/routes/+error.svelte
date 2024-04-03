<script>
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { Alert } from "flowbite-svelte";
    import { onMount } from "svelte";

    onMount(() => {
        if ($page.status == 401) {
            goto("/auth/login", {replaceState : true });
        }
    })

    function getMessage() {
        switch ($page.status) {
            case 404: return "The page you are looking for does not exist.";
            case 500: return "Something broke. An internal error occured.";
            default: return "Looks like you broke something. Something really weird went wrong."
        }
    }

</script>

<div class="w-screen h-screen flex flex-col items-center justify-center p-6 sm:p-8">
    <div class="mx-auto max-w-3xl text-center">
        <h3 class="text-7xl mb-4">{ $page.status }</h3>
        <Alert color="orange">
            <span class="font-medium">Oopsy!</span> { getMessage() }
        </Alert>
        <div class="mt-6 text-sm">
            <a href="/customer" class="underline font-semibold">Click here</a> to go back to your dashboard.
        </div>
        <div class="my-5">
            <button class="text-sm border-none outline-none bg-info/5 text-info-content px-4 py-2 rounded-lg" on:click={() => (window.location.reload())}>
                Refresh
            </button>
        </div>
    </div>
    
</div>