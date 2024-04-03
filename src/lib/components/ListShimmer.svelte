<script>
    export let show = true;
</script>
{#if show}
<div class="animate-pulse overflow-hidden">
    <div class="grid grid-cols-6 gap-4 mt-4">
        <div class="rounded-lg h-2 bg-slate-50"></div>
        <div class="rounded-lg h-2 bg-slate-50"></div>
        <div class="rounded-lg h-2 bg-slate-50"></div>
        <div class="rounded-lg h-2 bg-slate-50"></div>
        <div class="rounded-lg h-2 bg-slate-50"></div>
        <div class="rounded-lg h-2 bg-slate-50"></div>
    </div>
    {#each Array(5) as  _}
    <div class="grid grid-cols-6 gap-4 mt-4">
        <div class="rounded-lg h-5 bg-slate-50"></div>
        <div class="rounded-lg h-5 bg-slate-50"></div>
        <div class="rounded-lg h-5 bg-slate-50"></div>
        <div class="rounded-lg h-5 bg-slate-50"></div>
        <div class="rounded-lg h-5 bg-slate-50"></div>
        <div class="rounded-lg h-5 bg-slate-50"></div>
    </div>
    {/each}
</div>
{/if}