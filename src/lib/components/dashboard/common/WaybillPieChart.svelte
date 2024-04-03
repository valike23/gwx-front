<script>
    import dayjs from "dayjs";
    import { Chart } from "flowbite-svelte";
    import { onMount } from "svelte";
    import { formatK, formatNumber, getJSON } from "$lib/utils/helpers";
    import { clientFetch } from "$lib/client/api";

    let data = {
        items: [],
    };

    let series = [0, 0, 0, 0];
    const options = {
        series: series,
        colors: ["#3abff8", "#adaaaa", "#36d399", "#f08829"],
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
                            label: "Deliveries",
                            fontFamily: "Inter, sans-serif",
                            formatter: function (w) {
                                const sum = w.globals.seriesTotals.reduce(
                                    (a, b) => {
                                        return a + b;
                                    },
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
        labels: ["Picked Up", "In-Transit", "Delivered", "Exceptions"],
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

    onMount(() => {
        data = Object.assign(data, getJSON(localStorage.getItem(`gwx.deliveries.chart`)));

        composeData();

        if (!data.updated_at || (dayjs(data.updated_at).diff(null, 'minute') < 10)) {
            getData();
        }
    });

    function getData() {

        clientFetch({
            path: "/reports/deliveries",
            query: {
                status: "",
                date_min: dayjs().subtract(7, 'year').format("YYYY-MM-DD"),
                totals_by: "status"
            }
        })
        .then(res => res.json())
        .then(json => {
            if (!json.data) return;
            data.items = json.data;
            data.updated_at = dayjs().toISOString();
            // save item
            localStorage.setItem(`gwx.deliveries.chart`, JSON.stringify(data));
        })
        .catch(console.log)
        .finally(composeData)
    }

    function composeData() {
        // compose current data "Picked Up", "In-Transit", "Delivered", "Exceptions"
        for (let i = 0; i < data.items.length; i++) {
            const p = data.items[i];

            switch (p.status) {
                case "pending": series[0] += p.total_deliveries; break;
                case "completed": series[2] += p.total_deliveries; break;
                case "en-route": series[1] += p.total_deliveries; break;
                case "canceled":
                case "returned": series[3] += p.total_deliveries; break;
                default:
                    break;
            }
        }
    }
</script>

<div class="bg-base-100 shadow-sm rounded-md p-6 {$$props.class}">
    <Chart {options} class="py-6" />
</div>
