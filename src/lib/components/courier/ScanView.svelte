<script>
    import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
    import { UilTimes } from "svelte-unicons";

    let outerWidth, outerHeight;

    /**@type {Html5Qrcode}*/
    let scanner;

    const dispatch = createEventDispatcher();

    /**@type {import('html5-qrcode').Html5QrcodeCameraScanConfig}*/
    const config = { 
        fps: 10, 
    };

    onMount(() => {

        config.aspectRatio = outerHeight / outerWidth;
        config.qrbox = 250;

        scanner = new Html5Qrcode("reader", 
            { 
                useBarCodeDetectorIfSupported: true,
                formatsToSupport: [ 
                    Html5QrcodeSupportedFormats.QR_CODE,
                    Html5QrcodeSupportedFormats.CODE_39,
                    Html5QrcodeSupportedFormats.CODE_128
                ] 
            }
        );

        setTimeout(start, 50);
    });

    onDestroy(async () => {
        await stop();
        scanner.clear();
    })

    function start() {

        scanner.start(
            { facingMode: "environment"},
            config,
            onScanSuccess
        );
    }

    async function stop() {
        if (scanner.isScanning) {
            await scanner.stop();
        }
    }

    function onScanSuccess(decodedText, _) {
        stop();
        dispatch("result", {
            text: decodedText
        })
    }

    function onScanFailure(error) {
        console.warn(`Code scan error = ${error}`)
    }
</script>

<svelte:window bind:outerWidth bind:outerHeight />
<div class="w-full h-screen bg-black relative">
    <div 
        id="reader" 
        class="absolute top-0 bottom-0 left-0 right-0 min-w-full min-h-full"
    />

    <button 
        class="absolute left-3 top-5 btn btn-ghost btn-circle btn-sm z-10 text-base-100" 
        on:click={() => (dispatch('close', null))}
    >
        <UilTimes />
    </button>

    <div class="absolute bottom-0 w-screen z-10 flex justify-center h-min p-4">
        <button class="btn btn-outline border-slate-50 rounded-full btn-md text-base-100 min-w-[120px] hover:text-base-content hover:bg-base-100" on:click={() => (dispatch('close', null))}>
            Close
        </button>
    </div>
</div>

<!-- <div id="qr-shaded-region" style="position: absolute; border-width: 219.5px 84px; border-style: solid; border-color: rgba(0, 0, 0, 0.48); box-sizing: border-box; inset: 0px;"><div style="position: absolute; background-color: rgb(255, 255, 255); width: 40px; height: 5px; top: -5px; left: 0px;"></div><div style="position: absolute; background-color: rgb(255, 255, 255); width: 40px; height: 5px; top: -5px; right: 0px;"></div><div style="position: absolute; background-color: rgb(255, 255, 255); width: 40px; height: 5px; bottom: -5px; left: 0px;"></div><div style="position: absolute; background-color: rgb(255, 255, 255); width: 40px; height: 5px; bottom: -5px; right: 0px;"></div><div style="position: absolute; background-color: rgb(255, 255, 255); width: 5px; height: 45px; top: -5px; left: -5px;"></div><div style="position: absolute; background-color: rgb(255, 255, 255); width: 5px; height: 45px; bottom: -5px; left: -5px;"></div><div style="position: absolute; background-color: rgb(255, 255, 255); width: 5px; height: 45px; top: -5px; right: -5px;"></div><div style="position: absolute; background-color: rgb(255, 255, 255); width: 5px; height: 45px; bottom: -5px; right: -5px;"></div></div> -->
