<script>
    import { page } from "$app/stores";
    import { sineIn } from 'svelte/easing';
    import { tweened } from 'svelte/motion';
    import { Avatar, Button, Drawer } from 'flowbite-svelte';
    import dayjs from "dayjs";
    import { UilAngleLeft, UilCheck, UilHouseUser, UilParcel, UilPhoneAlt, UilUser } from "svelte-unicons";
    import { clientFetch } from "$lib/client/api";
    import { failure, success } from "$lib/utils/toast";
    import CompleteDeliveryView from "$lib/components/courier/CompleteDeliveryView.svelte";
    import CancelDeliveryView from "$lib/components/courier/CancelDeliveryView.svelte";
    import PinView from "$lib/components/courier/PinView.svelte";

    let item = $page.data.data;
    let isLoading = false;
    let hideCompleteDrawer = true;
    let hideCancelDrawer = true;
    let hidePinDrawer = true;
    let timer = tweened(dayjs(item.otp_last_send_at || dayjs().subtract(4, 'minutes')).add(5, 'minutes').diff(new Date(), 'seconds'))

    let transitionParamsBottom = {
        y: 320,
        duration: 200,
        easing: sineIn
    };

    $: minutes = Math.floor($timer / 60);
    $: minname = minutes > 1 ? "mins" : "min";
    $: seconds = Math.floor($timer - minutes * 60)

    setInterval(() => {
        if ($timer > 0) $timer--;
    }, 1000);

    async function startDelivery() {
        isLoading = true;
        try {
            const res = await clientFetch({
                path: `/deliveries/${item.id}/start`,
                method: "POST",
                body: {}
            });
            const json = await res.json();
            if (!res.ok) throw json;
            success("Delivery started successfully");
            window.location.reload();
        } catch (error) {
            failure(error)
        } finally {
            isLoading = false;
        }
    }

    async function onDeliverySuccess() {
        hideCompleteDrawer = true;
        window.location.reload();
    }

    async function onDeliveryCancel() {
        hideCancelDrawer = true;
        window.location.reload();
    }

    function resendOTP() {
        isLoading = true;
        clientFetch({
            path: `/deliveries/${item.id}/send-otp`,
            method: "POST",
            body: "{}"
        })
        .then(res => res.json())
        .then(json => {
            if (json.data) {
                success(json.message || "OTP sent successfully");
                item.otp_last_send_at = dayjs().toISOString();
                timer.set(60 * 10);
            } else {
                failure(json.message || "An error occurred");
            }
        })
        .finally(() => {
            isLoading = false;
        })
    }

</script>

<div class="h-14 shadow-sm bg-base-100 sticky top-0 w-full flex items-center justify-between px-4">
    <button href="/courier" class="btn btn-circle btn-sm" on:click={() => (window.history.back())}>
        <UilAngleLeft size="20" />
    </button>
</div>

<div class="page">

    <div class="mb-2 text-center">
        <div class="font-medium">{ dayjs().format('ddd MMMM DD, YYYY') } </div>
        <span class="text-xs text-base-content/70">ID: { item.package.waybill_number }</span>
    </div>

    <div
        class="flex justify-end"
        class:hidden={!["en-route"].includes(item.status)}>
        <Button
            size="xs"
            color="{$timer > 0 ? 'none' : 'blue'}"
            class=""
            disabled={$timer > 0 || isLoading}
            on:click={resendOTP}>
            {#if $timer < 1}
            Send OTP
            {:else}
            <span>Resend OTP in {minutes}{minname} {seconds}s!</span>
            {/if}
        </Button>
    </div>

    <div class="border rounded-lg p-4 pb-0 relative mt-8">
        <!-- <div class="absolute right-3 -top-8 text-sm bg-accent/5 px-2 py-1 rounded-lg font-semibold">
            OTP: { item.pin || ""}
        </div> -->

        <div class="flex gap-x-3 items-center">
            <Avatar class="bg-base-content/5" rounded>
                <UilParcel size="20" />
            </Avatar>
            <div class="flex flex-col">
                <span class="text-sm">{ item.package?.name || "No package description" }</span>
                <span class="text-xs text-base-content/75">Date: {dayjs(item.created_at).format('ddd MMMM DD, YYYY')}</span>
            </div>
        </div>

        <div class="flex items-start py-3 gap-x-3 mt-4">
            <span class="text-base-content/50 grid place-content-center w-10 h-10 flex-none">
                <UilUser size="23" />
            </span>

            <div class="flex flex-col">
                <span class="text-sm">Recipient Name</span>
                <span class="text-xs text-base-content/75">{ item.package.recipient.name }</span>
            </div>
            
        </div>

        <div class="flex items-start py-3 gap-x-3">
            <span class="text-base-content/50 grid place-content-center w-10 h-10 flex-none">
                <UilHouseUser size="23" />
            </span>

            <div class="flex flex-col">
                <span class="text-sm">Delivery Address</span>
                <span class="text-xs text-base-content/75">{ item.package.recipient.address }</span>
            </div>
            
        </div>

        <div class="flex items-start py-2 gap-x-3">
            <a href="tel:{item.package.recipient.phone}" class="text-base-content/50 grid place-content-center w-10 h-10 flex-none bg-primary-100 text-primary rounded-full">
                <UilPhoneAlt size="23" />
            </a>

            <div class="flex flex-col">
                <span class="text-sm">Contact</span>
                <span class="text-xs text-base-content/75">{ item.package.recipient.phone || "Not set" }</span>
            </div>
            
        </div>
    </div>

    <div class="mt-6">
        <button 
            class="btn btn-primary w-full" 
            class:hidden={item.status != "pending"}
            class:btn-disabled={isLoading}
            on:click={startDelivery}
        >
            <span class="loading loading-spinner" class:hidden={!isLoading}></span>
            Start Delivery
        </button>

        <div class="relative border-l border-dashed my-4 mx-6">
            {#each (item.milestones || []) as m }
            <div class="flex space-x-6 py-4 items-center">
                <div 
                    class="flex-none grid place-content-center w-5 h-5 rounded-full -ml-[10px] { (m.status != item.status || item.status == "completed") ? 'bg-primary' : 'bg-slate-300'}"
                    class:text-base-100={m.status != item.status || item.status == "completed"}
                >
                    <UilCheck size="15" />
                </div>
                <div>
                    <div class="text-sm font-medium">{ m.status_text }</div>
                    <div class="text-xs text-base-content/60 ">{ dayjs(m.timestamp).format('ddd MMMM DD, YYYY [at] hh:mm a') }</div>
                </div>
            </div>
            {/each}
        </div>

        <div 
            class="mt-6 space-y-3"
            class:hidden={["completed", "canceled", "pending"].includes(item.status)}>
            <button 
                class="btn w-full btn-primary"
                class:btn-disabled={isLoading}
                on:click={() => (hidePinDrawer = false)}
            >
                <span class="loading loading-spinner" class:hidden={!isLoading}></span>
                Complete Delivery
            </button>

            <button 
                class="btn w-full btn-primary btn-outline"
                class:btn-disabled={isLoading}
                on:click={() => (hideCancelDrawer = false)}
            >
                <span class="loading loading-spinner" class:hidden={!isLoading}></span>
                Return Delivery
            </button>
        </div>
    </div>
</div>

<Drawer placement="bottom" transitionType="fly" transitionParams={transitionParamsBottom} bind:hidden={hidePinDrawer} width="w-full" id="complete-modal" divClass="overflow-y-hidden z-50 p-0 bg-white h-screen max-h-screen">
    <PinView pinLength={item.pin?.length || 5} on:close={() => (hidePinDrawer = true)} on:success={(e) => {
        hidePinDrawer = true;
        setTimeout(() => {
            if (e.detail !== item.pin) {
                alert("Incorrect delivery PIN");
            } else {
                hideCompleteDrawer = false;
            }
        }, 1000);
    }} />
</Drawer>

<Drawer placement="bottom" transitionType="fly" transitionParams={transitionParamsBottom} bind:hidden={hideCompleteDrawer} width="w-full" id="complete-modal" divClass="overflow-y-hidden z-50 p-0 bg-white h-screen max-h-screen">
    <CompleteDeliveryView id={item.id} consignee={item.package.recipient.name} on:close={() => (hideCompleteDrawer = true)} on:success={onDeliverySuccess} />
</Drawer>

<Drawer placement="bottom" transitionType="fly" transitionParams={transitionParamsBottom} bind:hidden={hideCancelDrawer} width="w-full" divClass="overflow-y-auto z-50 p-0 bg-white h-screen max-h-screen scrollbar-hide">
    <CancelDeliveryView id={item.id} on:close={() => (hideCancelDrawer = true)} on:cancel={onDeliveryCancel} />
</Drawer>