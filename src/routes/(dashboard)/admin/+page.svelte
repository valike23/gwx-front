<script>
    import DeliveryChart from "$lib/components/dashboard/common/DeliveryChart.svelte";
    import TerminalOverview from "$lib/components/dashboard/common/TerminalOverview.svelte";
    import WaybillOverview from "$lib/components/dashboard/common/WaybillOverview.svelte";
    import WaybillPieChart from "$lib/components/dashboard/common/WaybillPieChart.svelte";
    import ShipmentCards from "$lib/components/dashboard/common/ShipmentCards.svelte";
    import { page } from "$app/stores";
    import DeliveryBarChart from "$lib/components/dashboard/common/DeliveryBarChart.svelte";

    const user = $page.data.session.user;
</script>

<div class="page space-y-7">
    <ShipmentCards />

    <div class="grid md:grid-cols-3 gap-6">
        <DeliveryBarChart class="md:col-span-2 min-h-[300px]" />
        <WaybillPieChart />
    </div>

   <div class="grid md:grid-cols-2 gap-8">
        <WaybillOverview />
        {#if !["hub"].includes(user.acl?.scope)}
        <TerminalOverview />
        {/if}
   </div>
</div>