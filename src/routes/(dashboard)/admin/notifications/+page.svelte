<script>
    import { page } from "$app/stores";
    import { db } from "$lib/client/db";
    import GwxPagination from "$lib/components/dashboard/GWXPagination.svelte";
    import { debounce } from "$lib/utils/helpers";
    import { Breadcrumb, BreadcrumbItem } from "flowbite-svelte";
    import { onMount } from "svelte";

    const user = $page.data.session.user;
    let timer;
    let isLoading= true;
    let items = [];
    let meta = {
        limit: 10,
        page: 1
    }

    onMount(() => {
        getData();

        // subscribe to changes
        db.collection('notifications').on('change', () => (debounce(() => (getData()), 300, timer)));
    });

    function getData() {
        isLoading = true;
        db.collection("notifications")
            .aggregate([
                { 
                    $match: {
                        $or: [
                            {uid: null},
                            {uid: user.id}
                        ]
                    } 
                },
                {
                    $facet: {
                        total: [{ $count: "total" }, { $unwind: "$total" }],
                        results: [
                            { $sort: { created_at: -1 } },
                            { $skip: (meta.limit * meta.page) - meta.limit },
                            { $limit: meta.limit },
                            {
                                $project: {
                                    // _id: 0,
                                    id: "$id",
                                    title: "$title",
                                    body: "$body",
                                    tag: "$tag",
                                    timestamp: "$timestamp",
                                },
                            },
                        ],
                    },
                },
                { $unwind: "$total" },
                {
                    $project: {
                        results: "$results",
                        total: "$total.total",
                    },
                },
            ])
            .then((data) => {
                if (data.length) {
                    items = data[0].results;
                    meta = Object.assign({}, meta, {total: data[0].total})
                }
            });
    }
</script>

<div class="gwx-breadcrumb print:hidden">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem>Notifications</BreadcrumbItem>
    </Breadcrumb>
</div>

<div class="page">
    <div class="w-full overflow-y-auto">
        <table class="table custom">
            <caption>
                <div class="w-full p-6 text-start">
                    <h3 class="text-lg font-medium">Notifications</h3>
                    <p class="text-gray-500 text-sm">Keep track of updates on the platform</p>
                </div>
            </caption>
            <thead>
                <tr>
                    <th class="w-[40px]"></th>
                    <th>Title</th>
                    <th>Message</th>
                </tr>
            </thead>
            <tbody>
                {#each items as item}
                    <tr>
                        <td></td>
                        <td>
                            <span class="font-medium">{ item.title }</span>
                        </td>
                        <td>
                            <p>{ item.body }</p>
                        </td>
                    </tr>
                {/each}
                <tr class:hidden={items.length}>
                    <td colspan="3" class="text-center text-gray-500">
                        <p class="py-3">Nothing to show</p>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <GwxPagination 
        currentPage={meta.page}
        pageSize={meta.limit}
        totalItems={meta.total}
        on:setPage={(e) => {
            meta.page = e.detail.page;
            getData();
        }}
        on:setPageSize={(e) => {
            meta.limit = e.detail.size;
            getData();
        }}
        class="w-full mt-8"
    />
</div>
