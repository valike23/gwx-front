<script>
    import { onMount } from "svelte";
    import StatCard from "./settings/StatCard.svelte";
    import { clientFetch } from "$lib/client/api";
    import dayjs from "dayjs";
    import { getJSON } from "$lib/utils/helpers";

    let data = {
        items: [],
    }

    onMount(() => {

        data = Object.assign({items: []}, getJSON(localStorage.getItem(`gwx.packages.totals`)));

        getData()

        if (!data.updated_at || (dayjs().diff(data.updated_at, 'minute') > 1)) {
            getData();
        }
    })

    function getData() {
        clientFetch({
            path: "/reports/packages",
            query: {
                // status: "delivered,in-transit,picked, new,queued,pending,out-for-delivery",
                //date_min: dayjs().subtract(7, 'year').format("YYYY-MM-DD"),
                totals_by: 'status',
                tag: "nis-application",
            }
        })
        .then(res => res.json())
        .then(json => {
            data.items = json.data;
            console.log(data.items);
            data.updated_at = dayjs().toISOString();
            // save item
            localStorage.setItem(`gwx.packages.totals`, JSON.stringify(data));
        })
        .catch(console.log)
    }

</script>
<div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <StatCard class="bg-primary" href="/admin/waybills/applications">
            <span slot="title">
                Passport Applications
            </span>
            <span slot="value">{ data.items.reduce((a, c) => a + c.total_packages, 0)}</span>
        </StatCard>
        <StatCard class="bg-success" href="/admin/waybills/applications?status=waybill-generated">
            <span slot="title">
                Waybill Generated
            </span>
            <span slot="value">{ data.items.find(e => e.status == "waybill-generated")?.total_packages || 0}</span>
        </StatCard>
        <StatCard class="bg-info" href="/admin/waybills/applications?status=out-for-delivery">
            <span slot="title">
                In Transit
            </span>
            <span slot="value">{ data.items.find(e => e.status == "out-for-delivery")?.total_packages || 0}</span>
        </StatCard>

        
        <StatCard class="bg-warning" href="/admin/waybills/applications?status=delivered"> 
            <span slot="title">
                Delivered
            </span>
            <span slot="value">{ data.items.find(e => e.status == "delivered")?.total_packages || 0}</span>
        </StatCard>
        
        <StatCard class="bg-error" href="/admin/waybills/applications?status=canceled">
            <span slot="title">
                Returned
            </span>
            <span slot="value">{ data.items.find(e => e.status == "canceled")?.total_packages || 0}</span>
        </StatCard>
    </div>
</div>