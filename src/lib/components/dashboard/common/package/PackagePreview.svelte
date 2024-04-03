<script>
    import { clientFetch } from "$lib/client/api";
    import { success, failure } from "$lib/utils/toast";
    import { goto } from "$app/navigation";
    
    export let formData;

    let isLoading = false;

    async function sendData() {
        isLoading = true;

        try {
            const res = await clientFetch({
                path: "/packages",
                method: "POST",
                body: $formData
            })
            const json = await res.json();
            if (!res.ok) throw json;
            success("Waybill generated successfully");
            goto("/admin/waybills/" + json.data.id);
        } catch (error) {
            failure(error);
        } finally {
            isLoading = false;
        }
    }
</script>

<div>
    <div>
        <div class="grid grid-cols-2 gap-x-5">
            <div>
                <h2 class="uppercase mb-5 font-medium text-sm text-base-content/70">Preview</h2>
                <div class="info-item">
                    <span class="title">sender name</span>
                    <div class="content">
                        <span class:fade={!$formData.sender.name} >{ $formData.sender.name || "Not set" }</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="title">sender address</span>
                    <div class="content">
                        <span class:fade={!$formData.sender.address} >{ $formData.sender.address || "Not set" }</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="title">recipient address</span>
                    <div class="content">
                        <span class:fade={!$formData.recipient.address} >{ $formData.recipient.address || "Not set" }</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="title">Origin hub</span>
                    <div class="content">
                        <span class:fade={!$formData.hub.name} >{ $formData.hub.name || "Not set" }</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="grid grid-cols-2 gap-x-5 mt-8">
            <div>
                <h4 class="uppercase text-xs mt-6 mb-2">Package details</h4>
                <div class="info-item">
                    <span class="title">Item</span>
                    <div class="content">
                        <span class:fade={!$formData.name} >{ $formData.name || "Not set" }</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="title">value</span>
                    <div class="content">
                        <span class:fade={!$formData.value} >{ $formData.value || "Not set" }</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="title">Quantity</span>
                    <div class="content">
                        <span class:fade={!$formData.quantity} >{ $formData.quantity || "Not set" }</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="title">weight</span>
                    <div class="content">
                        <span class:fade={!$formData.weight} >{ $formData.weight || "Not set" }</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="title">Dimensions</span>
                    <div class="content">
                        <div class="flex gap-x-2">
                            <span>{ $formData.dimensions?.width || "0" }W</span>
                            <span>{ $formData.dimensions?.height || "0" }H</span>
                            <span>{ $formData.dimensions?.length || "0" }L</span>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <h4 class="uppercase text-xs mt-6 mb-2">Billing details</h4>
                <div class="info-item">
                    <span class="title">Amount</span>
                    <div class="content">
                        <span>{ $formData.billing.amount || "0.00" }</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="title">Extra charges</span>
                    <div class="content">
                        <span>{ $formData.billing.extra || "0.00" }</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="title">Discount</span>
                    <div class="content">
                        <span>{ $formData.billing.discount || "0.00" }</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="title">VAT</span>
                    <div class="content">
                        <span>{ $formData.billing.vat || "0.00" }</span>
                    </div>
                </div>
            </div>
        </div>
        
    </div>
    <div class="mt-8">
        <button 
            on:click={() => sendData()}
            class="btn btn-primary min-w-[200px]" class:btn-disabled={isLoading}>
            <span class="loading loading-spinner" class:hidden={!isLoading}></span>
            Create Waybill
        </button>
    </div>
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