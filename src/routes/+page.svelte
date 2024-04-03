<script>
    import { page } from "$app/stores";
    import HomeAccess from "$lib/components/dashboard/HomeAccess.svelte";
    import { UilMapMarker, UilPlaneDeparture, UilTruck, UilUsersAlt } from "svelte-unicons";

    $: user = $page.data.session.user;
    const stats = [
        {
            icon: UilMapMarker,
            value: "50",
            title: "Locations in Nigeria"
        },
        {
            icon: UilUsersAlt,
            value: "726",
            title: "Satisfied Clients"
        },
        {
            icon: UilTruck,
            value: "1,395,609",
            title: "Number of Shipments"
        },
        {
            icon: UilPlaneDeparture,
            value: "68",
            title: "Flights Daily"
        }
    ]
</script>

<header class="h-14 fixed top-0 w-full backdrop-blur">
</header>

<div class="page p-0 min-h-screen flex flex-col">

    <div class="md:hidden bg-base-100 flex justify-between mt-16 mx-8 px-5 py-3 rounded-md text-sm gap-4 flex-wrap">
        <span class="text-base-content/60">Welcome back 👋🏽</span>
        <a href="/dashboard" class="text-primary font-medium">Go to dashboard</a>
    </div>

    <div class="flex-1 mx-auto w-full max-w-5xl grid md:grid-cols-2 lg:grid-cols-5 lg:items-center justify-center p-8 py-14 gap-8">
        <div class="lg:col-span-3 flex flex-col gap-y-4">
            <div>
                <img src="/images/logo.png" alt="GWX Logo"  class="w-28"/>
            </div>
            <span class="uppercase text-xs text-base-content/50 font-medium">Safe, fast and reliable</span>
            <h2 class="text-4xl leading-snug">Trusted Global <br>Logistics Services</h2>
            <p class="text-base-content/50 text-sm">Scalability and Flexibity are key to us across every sector. We add value and deliver outstanding customer experience with presence in the 36 states of Nigeria including FCT.</p>
            <div class="flex gap-x-4 mt-4">
                {#if user}
                <a href="https://greaterwashintonng.com/contact.php" class="btn btn-primary uppercase rounded-sm w-32">
                    Contact Us
                </a>
                <a href="https://greaterwashintonng.com/about.php?slug=who" class="btn btn-outline btn-primary w-32 rounded-sm">
                    About Us
                </a>
                {/if}

                {#if user}
                <a href="/dashboard" class="btn btn-primary hidden">
                    Go to Dashboard
                </a>
                {/if}
            </div>
        </div>
        <HomeAccess class="hidden md:block lg:col-span-2"/>
    </div>
    <div class="bg-base-content/5">
        <div class="mx-auto w-full max-w-5xl py-8 px-8 gap-y-6 grid lg:grid-cols-6">
            <div class="text-base-content/50 py-4 text-center lg:text-start text-lg xs:text-sm lg:col-span-2">
                <p>With over 15 years of experience</p>
                <p>The numbers speak for themselves</p>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 items-center justify-center gap-y-4 lg:col-span-4">
                {#each stats as stat}
                <div class="flex flex-col justify-center items-center text-center gap-y-2 py-4">
                    <span class="text-base-content/40 md:hidden"> <svelte:component this={stat.icon} /></span>
                    <span class="font-medium text-lg text-base-content/60">{ stat.value }</span>
                    <span class="text-xs text-base-content/50">{ stat.title }</span>
                </div>
                {/each}
            </div>
        </div>
    </div>
</div>