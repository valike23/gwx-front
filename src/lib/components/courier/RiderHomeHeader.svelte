<script>
    import { Avatar, Drawer, Modal, Spinner } from 'flowbite-svelte';
    import { getInitials } from '$lib/utils/helpers';
    import { page } from '$app/stores';
    import { UilQrcodeScan } from 'svelte-unicons';
    import { sineIn } from 'svelte/easing';
    import ScanView from './ScanView.svelte';
    import { clientFetch } from '$lib/client/api';
    import { failure } from '$lib/utils/toast';
    import { goto } from '$app/navigation';

    $: user = $page.data.session.user;
    let hideDrawer = true;
    let showModal = false; 
    let transitionParamsBottom = {
        y: 320,
        duration: 200,
        easing: sineIn
    };

    async function onResult(e) {
        hideDrawer = true;
        showModal = true;

        let query = new URLSearchParams({
            search: e.detail.text,
            limit: 1
        })

        try {
            const res = await clientFetch({
                path: "/deliveries?"+ query.toString(),
                method: "GET"
            });

            const json = await res.json();
            if (!res.ok) throw json;
            const items = json.data;
            if (!items.length) {
                throw ("Package could not be found");
            }
            goto("/courier/deliveries/" + items[0].id);
        } catch (error) {
            failure(error);
        } finally {
            showModal = false;
        }
    }

</script>

<div class="bg-black py-3 px-4">
    <div class="flex justify-between">
        <img src="/images/logo.png" alt="GEX Logo" class="w-[90px]"/>
    </div>
    <div class="py-4 flex justify-between">
        <div class="flex items-center gap-x-3">
            <Avatar class="bg-slate-100">
                {getInitials(user.name)}
            </Avatar>
            <span class="text-base-100">Hi, {user?.name.split(" ")[0]} 👋🏽</span>
        </div>
        <button class="btn btn-sm btn-circle btn-ghost text-white" on:click={() => (hideDrawer = false)}>
            <UilQrcodeScan />
        </button>
    </div>
</div>

<Modal bind:open={showModal} dismissable={false} defaultClass="bg-transparent shadow-none">
    <div class="grid place-content-center w-14 h-14 rounded-xl bg-base-100 shadow-sm mx-auto">
        <Spinner color="yellow" />
    </div>
</Modal>

<Drawer placement="bottom" transitionType="fly" transitionParams={transitionParamsBottom} bind:hidden={hideDrawer} id="sidebar8" width="w-full" divClass="p-0 z-50">
    <ScanView on:close={() => (hideDrawer = true)} on:result={onResult} />
</Drawer>