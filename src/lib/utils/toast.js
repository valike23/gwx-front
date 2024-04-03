import { toast } from '@zerodevx/svelte-toast'
import { getErrorString } from './helpers';

export const success = m => toast.push(getErrorString(m), {
    theme: {
        '--toastBackground': '#edfff3',
        '--toastBarBackground': 'olive',
        '--toastBarHeight': '0px',
        '--toastBorder': '1px solid #8ce6b0',
        '--toastBorderRadius': '10px',
        '--toastColor': '#333',
        '--toastMinHeight': '2.8rem'
    }
});

export const warning = m => toast.push(getErrorString(m), { 
    theme: {
        '--toastBackground': '#fff9e6',
        '--toastBarHeight': '0px',
        '--toastBorder': '1px solid #ffd77a',
        '--toastBorderRadius': '10px',
        '--toastColor': '#333',
        '--toastMinHeight': '2.8rem'
    } 
});

export const failure = m => toast.push(getErrorString(m), { 
    theme: {
        '--toastBackground': '#ffefe6',
        '--toastBarHeight': '0px',
        '--toastBorder': '1px solid #ffb08f',
        '--toastBorderRadius': '10px',
        '--toastColor': '#333',
        '--toastMinHeight': '2.8rem'
    } 
});

export const info = m => toast.push(getErrorString(m), { 
    theme: {
        '--toastBackground': '#f0faff',
        '--toastBarHeight': '0px',
        '--toastBorder': '1px solid #abdcff',
        '--toastBorderRadius': '10px',
        '--toastColor': '#333',
        '--toastMinHeight': '2.8rem'
    } 
});

export const neutral = m => toast.push(getErrorString(m), { 
    theme: {
        '--toastBackground': '#000000',
        '--toastBarHeight': '0px',
        '--toastBorder': '1px solid #abdcff',
        '--toastBorderRadius': '10px',
        '--toastColor': '#ffffff',
        '--toastMinHeight': '2.8rem'
    } 
});