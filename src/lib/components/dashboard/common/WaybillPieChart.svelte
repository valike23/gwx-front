<script>
    import dayjs from "dayjs";
    import { Chart } from "flowbite-svelte";
    import { onMount } from "svelte";
    import { formatK, formatNumber, getJSON } from "$lib/utils/helpers";
    import { clientFetch } from "$lib/client/api";

    let pie = {};
    let series = [0, 0, 0, 0];
    let isLive = false;
    
    const options = {
        series: series,
        colors: ["#3abff8", "#adaaaa", "#36d399", "#f08829", "#FF0000"],
        chart: {
            height: 320,
            width: "100%",
            type: "donut",
        },
        stroke: {
            colors: ["transparent"],
            lineCap: "",
        },
        plotOptions: {
            pie: {
                donut: {
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontFamily: "Inter, sans-serif",
                            offsetY: 20,
                        },
                        total: {
                            showAlways: true,
                            show: true,
                            label: "Total",
                            fontFamily: "Inter, sans-serif",
                            formatter: function (w) {
                                const sum = w.globals.seriesTotals.reduce(
                                    (a, b) => a + b,
                                    0
                                );
                                return formatNumber(sum);
                            },
                        },
                        value: {
                            show: true,
                            fontFamily: "Inter, sans-serif",
                            offsetY: -20,
                            formatter: function (value) {
                                return formatNumber(value);
                            },
                        },
                    },
                    size: "80%",
                },
            },
        },
        grid: {
            padding: {
                top: -2,
            },
        },
        labels: ["Waybill Generated", "In-Transit", "Delivered", "Caneled", "Returned"],
        dataLabels: {
            enabled: false,
        },
        legend: {
            position: "bottom",
            fontFamily: "Inter, sans-serif",
        },
        yaxis: {
            labels: {
                formatter: function (value) {
                    return formatNumber(value);
                },
            },
        },
        xaxis: {
            labels: {
                formatter: function (value) {
                    return formatNumber(value);
                },
            },
            axisTicks: {
                show: false,
            },
            axisBorder: {
                show: false,
            },
        },
    };

    onMount(async () => {
        try {
            const res = await clientFetch({
                path: `/reports/packages/count?status=returned,canceled,delivered,waybill-generated,out-for-delivery`,
                method: "GET"
            });
            const resData = await res.json();
            pie = resData.ok ? resData.data : {};
            console.log("piechart response", pie);
            if(pie) composeData();
        } catch (error) {
            console.error("Error fetching pie chart data:", error);
        }
    });

    function composeData() {
        if (pie) {
            series[0] = pie['waybill-generated'] || 0;
            series[1] = pie['out-for-delivery'] || 0;
            series[2] = pie['delivered'] || 0;
            series[3] = pie['canceled'] || 0;
            series[4] = pie['returned'] || 0;
            console.log("Updated series data:", series);
            isLive = true;
        }
    }
</script>

{#if isLive}
<div class="bg-base-100 shadow-sm rounded-md p-6 {$$props.class}">
    <Chart {options} class="py-6" />
</div>
{/if}
