<script>
    import { page } from "$app/stores";

    import CustomerDashboard from "$lib/components/dashboard/customer/Dashboard.customer.svelte";
    import AdminDashboard from "$lib/components/dashboard/admin/Dashboard.admin.svelte";

    $: role = $page.data.session.user.role;
    $: views = {
        "user": CustomerDashboard,
        "admin": AdminDashboard,
        "hubmanager": CustomerDashboard,
        "courier": CustomerDashboard
    }

</script>

<svelte:component this={views[role]} />