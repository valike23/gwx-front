<script>
    import * as yup from "yup";
    import { createForm } from "svelte-forms-lib";
    import { failure, success } from "$lib/utils/toast";
    import Sender from "$lib/components/dashboard/common/package/Sender.svelte";
    import Recipient from "$lib/components/dashboard/common/package/Recipient.svelte";
    import PackageInfo from "$lib/components/dashboard/common/package/PackageInfo.svelte";
    import { UilEditAlt } from "svelte-unicons";
    import { clientFetch } from "$lib/client/api";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { page } from "$app/stores";

    let user = $page.data.session.user;

    let activeIndex = 0; 
    let isLoading = false;

    onMount(() => {
    })

    const tabs = [
        {
            index: 0,
            title: "Sender",
            view: Sender
        },
        {
            index: 1,
            title: "Recipient",
            view: Recipient
        },
        {
            index: 2,
            title: "Package Info",
            view: PackageInfo
        }
    ];

    const { form, errors, handleSubmit } = createForm({
        initialValues: {
            sender: {},
            recipient: {},
            name: "",
            value: "",
            weight: "",
            dimensions: {},
            quantity: 1,
        },
        validationSchema: yup.object().shape({}),
        async onSubmit(values) {
            isLoading = true;
            try {
                const res = await clientFetch({
                    path: "/packages",
                    method: "POST",
                    body: values
                });
                const json = await res.json();
                if (!res.ok) throw json;
                success("Waybill generated successfully");
                goto("/customer/waybills/" + json.data.id);
            } catch (error) {
                failure(error);
            } finally {
                isLoading = false;
            }
        },
    });

    function onIndexChanged(e) {
        activeIndex = e.detail;
    }

</script>

<div class="page">
    <div class="text-sm breadcrumbs">
        <ul>
            <li><a href="/customer">Dashboard</a></li>
            <li><a href="/customer/waybills">Waybills</a></li>
            <li>New Waybill</li>
        </ul>
    </div>

    <div class="text-sm breadcrumbs mt-4 bg-base-100 shadow-sm px-3 rounded-lg">
        <ul>
            {#each tabs as tab (tab.index)}
            <li class="flex gap-x-3 items-center">
                <span 
                        class="flex-none grid place-content-center w-4 h-4 bg-base-200 rounded-full text-[8px] text-base-content/60 transition-all"
                        class:bg-primary={activeIndex == tab.index}
                        class:text-primary-content={activeIndex == tab.index}
                    >
                        { tab.index + 1 }
                </span>
                <button 
                    class=""
                    class:text-primary={activeIndex == tab.index}
                    class:font-medium={activeIndex == tab.index}
                    class:btn-disabled={activeIndex < (tabs.length - 1)}
                    on:click={() => (activeIndex = tab.index)}
                >
                    <span></span>
                    { tab.title }
            </button>
            </li>   
            {/each}
        </ul>
    </div>

    <form on:submit={handleSubmit} class="py-3">
        <div class="bg-base-100 shadow-sm rounded-md p-8 max-w-3xl">

            {#if activeIndex == tabs.length}
            <div>
                <div>
                    <h2 class="uppercase mb-5 font-medium text-sm text-base-content/70">Preview</h2>
                    <div class="info-item">
                        <span class="title">sender name</span>
                        <div class="content">
                            <span class:fade={!$form.sender.name} >{ $form.sender.name || "Not set" }</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="title">sender address</span>
                        <div class="content">
                            <span class:fade={!$form.sender.address} >{ $form.sender.address || "Not set" }</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="title">recipient address</span>
                        <div class="content">
                            <span class:fade={!$form.recipient.address} >{ $form.recipient.address || "Not set" }</span>
                        </div>
                    </div>
                    <h4 class="uppercase text-xs mt-5 mb-2">Package details</h4>
                    <div class="info-item">
                        <span class="title">Item</span>
                        <div class="content">
                            <span class:fade={!$form.name} >{ $form.name || "Not set" }</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="title">value</span>
                        <div class="content">
                            <span class:fade={!$form.value} >{ $form.value || "Not set" }</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="title">Quantity</span>
                        <div class="content">
                            <span class:fade={!$form.quantity} >{ $form.quantity || "Not set" }</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="title">weight</span>
                        <div class="content">
                            <span class:fade={!$form.weight} >{ $form.weight || "Not set" }</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="title">Dimensions</span>
                        <div class="content">
                            <div class="flex gap-x-2">
                                <span>{ $form.dimensions?.width || "0" }W</span>
                                <span>{ $form.dimensions?.height || "0" }H</span>
                                <span>{ $form.dimensions?.length || "0" }L</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-8">
                    <button class="btn btn-primary min-w-[200px]" class:btn-disabled={isLoading}>
                        <span class="loading loading-spinner" class:hidden={!isLoading}></span>
                        Create Waybill
                    </button>
                </div>
            </div>
            {/if}

            {#if activeIndex < tabs.length}
                <svelte:component 
                    this={tabs[activeIndex].view} 
                    formData={form} on:index={onIndexChanged}/>
            {/if}
        </div>
    </form>
</div>

<style lang="postcss" scoped>
.info-item {
    @apply flex py-2 border-b border-b-slate-50;
}
.info-item .title {
    @apply flex-none w-36 md:w-44 text-xs uppercase text-base-content/60 pt-1;
}
.info-item .content {
    @apply text-sm flex flex-col items-start text-base-content/75 gap-y-2;
}
.info-item .content .fade {
    @apply text-base-content/40 italic;
}
</style>