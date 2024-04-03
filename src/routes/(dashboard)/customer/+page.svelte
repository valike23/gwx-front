<script>
    import DeliveryBarChart from "$lib/components/dashboard/common/DeliveryBarChart.svelte";
    import WaybillPieChart from "$lib/components/dashboard/common/WaybillPieChart.svelte";
    import ShipmentCards from "$lib/components/dashboard/common/ShipmentCards.svelte";
    import RecentWaybills from "$lib/components/dashboard/customer/RecentWaybills.svelte";
</script>

<div class="page">
    <ShipmentCards />

    <div class="my-6 flex flex-col md:flex-row md:items-stretch gap-8">
        <DeliveryBarChart class="md:w-2/3"/>
        <WaybillPieChart class="max-h-[350px]"/>
    </div>

    <div>
        <RecentWaybills />
    </div>
</div>