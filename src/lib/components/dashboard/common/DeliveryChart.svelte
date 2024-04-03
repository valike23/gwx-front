<script>
    import dayjs from "dayjs";
    import { Chart } from "flowbite-svelte";
    import { onMount } from "svelte";
    import { getJSON, weekRange } from "$lib/utils/helpers";
    import { clientFetch } from "$lib/client/api";

    let data = {
        current: [],
        last: [],
    };

    let series = [
        {
            name: "Current Week",
            color: "#F08829",
            data: [
                { x: "Sun", y: 0 },
                { x: "Mon", y: 0 },
                { x: "Tue", y: 0 },
                { x: "Wed", y: 0 },
                { x: "Thu", y: 0 },
                { x: "Fri", y: 0 },
                { x: "Sat", y: 0 },
            ],
        },
        {
            name: "Previous Weeks",
            color: "#16A4A6",
            data: [
                { x: "Sun", y: 0 },
                { x: "Mon", y: 0 },
                { x: "Tue", y: 0 },
                { x: "Wed", y: 0 },
                { x: "Thu", y: 0 },
                { x: "Fri", y: 0 },
                { x: "Sat", y: 0 },
            ],
        },
    ];

    let options = {
        colors: ["#F08829", "#16A4A6"],
        series: series,
        chart: {
            height: "100%",
            maxWidth: "100%",
            type: "area",
            fontFamily: "Inter, sans-serif",
            dropShadow: {
                enabled: false,
            },
            toolbar: {
                show: false,
            },
        },
        fill: {
            type: "gradient",
            gradient: {
                opacityFrom: 0.55,
                opacityTo: 0,
                shade: "#1C64F2",
                gradientToColors: ["#1C64F2"],
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            width: 6,
        },
        grid: {
            show: false,
            strokeDashArray: 4,
            padding: {
                left: 2,
                right: 2,
                top: 0,
            },
        },
        xaxis: {
            categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            labels: {
                show: true,
            },
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        yaxis: {
            show: true,
        },
    };

    onMount(() => {
        data = Object.assign(data, getJSON(
            localStorage.getItem(
                `gwx.packages.chart`
            )
        ));

        composeData();

        if (!data.updated_at || (dayjs().diff(data.updated_at, 'minute') > 1)) {
            getData();
        }
    });

    function getData() {
        const range = weekRange();

        let urls = [
            new URLSearchParams({
                // status: "delivered",
                date_min: range.current.date_min,
                date_max: range.current.date_max,
                totals_by: "period",
                tag: "nis-application"
            }),
            new URLSearchParams({
                status: "delivered",
                date_min: range.last.date_min,
                date_max: range.last.date_max,
                totals_by: "period",
                tag: "nis-application"
            }),
        ];

        Promise.all(
            urls.map((v) =>
                clientFetch({
                    path: "/reports/packages?" + v.toString(),
                }).then((res) => res.json())
            )
        )
            .then((arr) => {
                data.current = arr[0].data;
                data.last = arr[1].data;
                data.updated_at = dayjs().toISOString();
                localStorage.setItem(
                    `gwx.packages.chart`,
                    JSON.stringify(data)
                );
            })
            .finally(() => {
                composeData();
            });
    }

    function composeData() {
        // compose current data
        for (let i = 0; i < data.current.length; i++) {
            const d = data.current[i];
            series[0].data[new Date(d.period).getDay()].y =
                d.total_packages;
        }

        // compose last data
        for (let i = 0; i < data.last.length; i++) {
            const d = data.last[i];
            series[1].data[new Date(d.period).getDay()].y =
                d.total_packages;
        }
        // series = series;
    }
</script>

<div class="bg-base-100 p-4 rounded-lg shadow-sm {$$props.class}">
    <div class="flex mb-4">
        <div class="flex-1 flex gap-3 items-center">
            <span
                class="bg-primary/5 text-primary text-2xs md:text-xs px-2 py-1 rounded-md"
            >
                Total Performance
            </span>
            <span class="flex gap-x-1 text-2xs md:text-xs items-center">
                <div class="dot w-2 h-2 bg-primary" />
                <span class="text-primary">Current Week</span>
            </span>
            <span class="flex gap-x-1 text-2xs md:text-xs items-center">
                <div class="dot w-2 h-2 bg-accent" />
                <span class="text-accent">Previous Week</span>
            </span>
        </div>
    </div>

    <Chart {options} />
</div>
