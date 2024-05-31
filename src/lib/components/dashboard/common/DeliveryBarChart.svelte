<script>
    import { formatK, getJSON } from "$lib/utils/helpers";
    import dayjs from "dayjs";
    import { Chart } from "flowbite-svelte";
    import { onMount } from "svelte";
    import { clientFetch } from "$lib/client/api";

    let data = { items: [] };
    let dashboardInfo = [];
    let series = [
        {
            name: "Total",
            color: "#F08829",
            data: [
                { x: "Jan", y: 0 },
                { x: "Feb", y: 0 },
                { x: "Mar", y: 0 },
                { x: "Apr", y: 0 },
                { x: "May", y: 0 },
                { x: "Jun", y: 0 },
                { x: "Jul", y: 0 },
                { x: "Aug", y: 0 },
                { x: "Sep", y: 0 },
                { x: "Oct", y: 0 },
                { x: "Nov", y: 0 },
                { x: "Dec", y: 0 },
            ],
        },
        {
            name: "Delivered",
            color: "#16A4A6",
            data: [
                { x: "Jan", y: 0 },
                { x: "Feb", y: 0 },
                { x: "Mar", y: 0 },
                { x: "Apr", y: 0 },
                { x: "May", y: 0 },
                { x: "Jun", y: 0 },
                { x: "Jul", y: 0 },
                { x: "Aug", y: 0 },
                { x: "Sep", y: 0 },
                { x: "Oct", y: 0 },
                { x: "Nov", y: 0 },
                { x: "Dec", y: 0 },
            ],
        },
    ];
    let options = {
        colors: ["#F08829", "#16A4A6"],
        series: series,
        chart: {
            type: "bar",
            height: "100%",
            maxWidth: "100%",
            sparkline: { enabled: false,},
            toolbar: { show: false },
        },
        fill: {
            opacity: 1,
        },
        plotOptions: {
            bar: {
                columnWidth: "100%",
                borderRadiusApplication: "end",
                borderRadius: 5,
                columnWidth: '60%',
                dataLabels: {
                    position: "top",
                },
            },
        },
        grid: {
            show: true,
            strokeDashArray: 4,
            padding: {
                left: 2,
                right: 2,
                // top: -20,
            },
        },
        legend: {
            show: true,
            position: "bottom",
        },
        dataLabels: {
            enabled: false,
        },
        tooltip: {
            shared: true,
            intersect: false,
            //   formatter: function (value) {
            //     return '$' + value;
            //   }
        },
        xaxis: {
            labels: {
                show: true,
                style: {
                    fontFamily: "Inter, sans-serif",
                    cssClass:
                        "text-xs font-normal fill-gray-500 dark:fill-gray-400",
                },
            },
            axisTicks: {
                show: false,
            },
            axisBorder: {
                show: false,
            },
        },
        yaxis: {
            labels: {
                show: true,
                formatter: function (value) {
                    return formatK(value || "0");
                }
            }
        },
        
    };

    onMount(() => {
        data = Object.assign(
            {},
            data,
            getJSON(localStorage.getItem(`gwx.packages.year.chart`))
        );

        composeData();

        // if (!data.updated_at || dayjs().diff(data.updated_at, "minute") > 5) {
            getData();
        // }
    });

    async function  getData () {
      

        let urls = [
            new URLSearchParams({
                date_min: dayjs().startOf('year').format("YYYY-MM-DD"),
                totals_by: "period",
                period: "month",
                tag: "nis-application",
                totals: true,
                url: "/reports/packages?"
            }),
            new URLSearchParams({
                date_min: dayjs().startOf('year').format("YYYY-MM-DD"),
                totals_by: "period",
                period: "month",
                status: "completed",
                totals: true,
                url: "/reports/deliveries?"
            }),
        ];

        Promise.all(
            urls.map((v) =>
                clientFetch({
                    path: v.get("url") + v.toString(),
                }).then((res) => res.json())
            )
        )
            .then((arr) => {
                data.current = arr[0].data;
                data.last = arr[1].data;
                data.updated_at = dayjs().toISOString();
                console.log("graph data", data);
                localStorage.setItem(
                    `gwx.packages.year.chart`,
                    JSON.stringify(data)
                );
            })
            .finally(() => {
                composeData();
            });
    }

    function composeData() {
        // compose current data
        try {
            for (let i = 0; i < (data.current || []).length; i++) {
            const d = data.current[i];
            series[0].data[new Date(d.period).getMonth()].y =
                d.total_packages || 0;
        }

        // compose last data
        for (let i = 0; i < (data.last || []).length; i++) {
            const d = data.last[i];
            series[1].data[new Date(d.period).getMonth()].y =
                d.total_deliveries|| 0;
        } 
        } catch (error) {
            console.warn('error here', error);
        }
       
    }
</script>

<div class="bg-base-100 p-4 rounded-lg shadow-sm {$$props.class}">
    <div class="flex mb-6">
        <div class="flex-1 flex gap-3 items-center">
            <span
                class="bg-primary/5 text-primary text-2xs md:text-xs px-2 py-1 rounded-md"
            >
                Generated Waybills
            </span>
            <span class="flex gap-x-1 text-2xs md:text-xs items-center">
                <div class="dot w-2 h-2 bg-primary" />
                <span class="text-primary">Total</span>
            </span>
            <span class="flex gap-x-1 text-2xs md:text-xs items-center">
                <div class="dot w-2 h-2 bg-accent" />
                <span class="text-accent">Delivered</span>
            </span>
            <!-- <span class="flex gap-x-2 text-2xs md:text-xs items-center">
                <div class="dot w-[5px] h-[5px]" />
                <span class="text-accent">Previous Week</span>
            </span> -->
        </div>
    </div>
    <div class="h-72">
        <Chart {options} />
    </div>
</div>
