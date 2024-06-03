<script>
    import { page } from "$app/stores";
    import { Button, CloseButton, Label, Select } from "flowbite-svelte";
    import { createEventDispatcher } from "svelte";

    export let data = {
        status: "admin,hub,rider",
        role: ""
    }

    const user = $page.data.session.user;
    const dispatch = createEventDispatcher();

    const roles = {
        "admin,hub,regionalmanager,courier,rider": "All Users",
        "admin": "Admin",
        "regionalmanager": "Regional Manager",
        "rider,courier": "Rider",
        "manager": "Hub Officer"
    };
    const statuses = {
        "": "All",
        "active": "Active",
        "inactive": "Inactive"
    };
</script>

<div>
    <div class="flex justify-between items-center pb-3">
        <h3 class="font-medium pt-2">Filter Users</h3>
        <CloseButton on:click={() => (dispatch('close'))} />
    </div>
    <div 
        class="form-control mt-4"
        class:hidden={["manager"].includes(user.role)}>
        <Label for="role" class="mb-1 font-normal">Select Role</Label>
        <Select
            id="role"
            placeholder="Select role"
            bind:value={data.role}
            items={Object.entries(roles).map(e => ({value: e[0], name: e[1]}))}
        />
    </div>
    <div class="form-control">
        <Label for="status" class="mb-1 font-normal">Status</Label>
        <Select
            id="status"
            bind:value={data.status}
            placeholder="Select status"
            items={Object.entries(statuses).map(e => ({value: e[0], name: e[1]}))}
        />
    </div>
    <div class="form-control mt-4">
        <Button on:click={() => (dispatch('data', data))}>
            Submit
        </Button>
    </div>
</div>