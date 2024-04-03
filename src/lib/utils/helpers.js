import { browser } from "$app/environment";
import { PUBLIC_ENC_KEY } from '$env/static/public';
import { SimpleCrypto } from "simple-crypto-js";
import { success } from "./toast";

const sc = new SimpleCrypto(PUBLIC_ENC_KEY);

const encryptMessage = async (message) => {
    if (!message) return null;
    const pwUtf8 = new TextEncoder().encode(PUBLIC_ENC_KEY);
    const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const alg = { name: 'AES-GCM', iv: iv }

    const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']);

    const ptUint8 = new TextEncoder().encode(message);
    const ctBuffer = await crypto.subtle.encrypt(alg, key, ptUint8);

    const ctArray = Array.from(new Uint8Array(ctBuffer));
    const ctString = ctArray.map(byte => String.fromCharCode(byte)).join('');
    const ctBase64 = btoa(ctString);

    const ivHex = Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join('');

    return ivHex+ctBase64;

}

const decryptMessage = async (cipherText) => {
    if (!cipherText) return null;
    const pwUtf8 = new TextEncoder().encode(PUBLIC_ENC_KEY);
    const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);

    const iv = cipherText.slice(0, 24).match(/.{2}/g).map(byte => parseInt(byte, 16));

    const alg = { name: 'AES-GCM', iv: new Uint8Array(iv) };

    const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt']);

    const ctStr = atob(cipherText.slice(24));
    const ctUint8 = new Uint8Array(ctStr.match(/[\s\S]/g).map(ch => ch.charCodeAt(0)));

    const plainBuffer = await crypto.subtle.decrypt(alg, key, ctUint8);
    const plainText = new TextDecoder().decode(plainBuffer);

    return plainText;

}

function aesEncrypt(text, key) {
  // Convert the plaintext text to a byte array
  const plaintext = new TextEncoder().encode(text);

  // Create a CryptoKey object from the key
  const cryptoKey = crypto.subtle.importKey("raw", key, { name: "AES-CBC" }, false, ["encrypt"]);

  // Generate an initialization vector (IV)
  const iv = crypto.getRandomValues(new Uint8Array(16));

  // Encrypt the plaintext using AES-CBC and the generated IV
  const ciphertext = crypto.subtle.encrypt({ name: "AES-CBC", iv: iv }, cryptoKey, plaintext);

  // Concatenate the IV and ciphertext into a single Uint8Array
  const encryptedData = new Uint8Array([...iv, ...ciphertext]);

  // Convert the encrypted data to a Base64 string
  const encryptedString = btoa(String.fromCharCode.apply(null, encryptedData));

  return encryptedString;
}

function aesDecrypt(encryptedString, key) {
  console.log(key);
  // Convert the encrypted string to a Base64 string
  const encryptedData = atob(encryptedString);

  // Convert the Base64 string to a Uint8Array
  const encryptedBytes = new Uint8Array(encryptedData.length);
  for (let i = 0; i < encryptedData.length; i++) {
    encryptedBytes[i] = encryptedData.charCodeAt(i);
  }

  // Extract the IV from the encrypted data
  const iv = encryptedBytes.slice(0, 16);

  // Extract the ciphertext from the encrypted data
  const ciphertext = encryptedBytes.slice(16);

  // Create a CryptoKey object from the key
  const cryptoKey = crypto.subtle.importKey("raw", key, { name: "AES-CBC" }, false, ["decrypt"]);

  // Decrypt the ciphertext using AES-CBC and the extracted IV
  const decryptedPlaintext = crypto.subtle.decrypt({ name: "AES-CBC", iv: iv }, cryptoKey, ciphertext);

  // Convert the decrypted plaintext to a string
  const decryptedString = new TextDecoder().decode(decryptedPlaintext);

  return decryptedString;
}

export const scrypt = sc;
// export const scrypt = {
//   encrypt: (val) => aesEncrypt(val, PUBLIC_ENC_KEY),
//   decrypt: (val) => aesDecrypt(val, PUBLIC_ENC_KEY)
// }
// export const scrypt = {
//     encrypt: encryptMessage,
//     decrypt: decryptMessage
// }

/**
* 
* @param {string} data 
* @returns {json | null }
*/
export function getJSON(data) {
    try {
        var o = JSON.parse(data);
        if (o && typeof o === 'object') {
            return o;
        }
    } catch (error) {
        return data;
    }
 
    return data;
 }

 export function getErrorString(error) {
    if (typeof error == 'object') return networkError(error);
    return error.toString();
}

export function networkError(error) {

    if (error.response) {

        if(!error.response.data){
            return error.message || "An unexpected error occured";
        } 

        if(!error.response.data.message){
            return error.message || "An unexpected error occured";
        }

        // if credentials is no longer valid
        if (error.response.status == 403 && error.response.data.message == "Could not validate credentials") {
            failure("Your session has expired");
            removeUser();
            window.location.reload();
        }
    }

    if (typeof error == 'string') {
        if (error.toLowerCase().includes("failed to fetch")) {
            return "Could not connect to the server";
        }
        return error;
    }

    

    return error.message || "An unexpected error occured";
}

let LIT;

/*
 * Given a word and count, pluralize the word.
 * Optionally, include withCount = false to not include the # in the returned string
 */
export function pluralize(word, count = 0, withCount = true) {
    const out = (count > 1) ? `${word}s` : word;
    return withCount ? `${count} ${out}` : out;
}

export const formatK = (value) => {
    try {
    
        if (value < 1000) {
          // less than a million
          return value;
        } else if (value >= 1000 && value < (1000000)) {
          var result = value / 1000;
          return result.toFixed(0) + "k";
        } else if (value >= 1000000 && value < (1000000 * 10 * 100)) {
          // less than 100 million
          var result = value / 1000000;
          return result.toFixed(2) + "M";
        } else if (value >= (1000000 * 10 * 100) &&
            value < (1000000 * 10 * 100 * 100)) {
          // less than 100 billion
          var result = value / (1000000 * 10 * 100);
          return result.toFixed(0) + "B";
        } else if (value >= (1000000 * 10 * 100 * 100) &&
            value < (1000000 * 10 * 100 * 100 * 100)) {
          // less than 100 trillion
          var result = value / (1000000 * 10 * 100 * 100);
          return result.toFixed(0) + "T";
        }
        return value;
      } catch (e) {
        return value;
      }
}

export const truncate = (text = "", length = 100) => {
  if(text.length <= length) {
    return text;
  } else {
    text = text.replace(/\n/g, " ");
    return text.substring(0, length) + "...";
  }
}

export function debounce(func, timeout = 300, prop) {

  if (browser) {
    if (typeof window.LIT !== 'undefined') {
      clearTimeout(window.LIT);
    }

    window.LIT = setTimeout(() => {
      func();
    }, timeout);
  } else {
    if (typeof LIT !== 'undefined') {
      clearTimeout(LIT);
    }

    LIT = setTimeout(() => {
      func();
    }, timeout);
  }
}

/**
 * 
 * @param {string} text 
 */
export function copyText(text) {
  if (browser) {
    navigator.clipboard.writeText(text);
    success("Copied text sucessfully");
  }
}

/**
 * 
 * @param {string} text 
 */
export function getInitials(text) {
  let p = text.split(" ").map(e => e[0]).join("");
  return p.substring(0, 2).toUpperCase();
}

/**
 * 
 * @param {string,number} val 
 */
export function formatCurrency(val = "0") {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(Number(val))
}

export function clickOutside(element, callbackFunction) {
  function onClick(event) {
    if (!element.contains(event.target)){
      callbackFunction();
    }
  }

  document.body.addEventListener('click', onClick);

  return {
    update(newCallbackFunction) {
      callbackFunction = newCallbackFunction;
    },
    destroy() {
      document.body.removeEventListener('click', onClick);
    }
  }
}

export function weekRange() {
  // Get the current date.
  const today = new Date();

  // Get the start of the current week.
  const thisWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());

  // Get the end of the current week.
  const thisWeekEnd = new Date(thisWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

  // Get the start of last week.
  const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get the end of last week.
  const lastWeekEnd = new Date(lastWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

  // Compose the start date ranges.
  const lastWeekRange = {
    date_min: lastWeekStart.toISOString().split('T')[0],
    date_max: lastWeekEnd.toISOString().split('T')[0],
  };

  const thisWeekRange = {
    date_min: thisWeekStart.toISOString().split('T')[0],
    date_max: thisWeekEnd.toISOString().split('T')[0],
  };

  return {
    last: lastWeekRange,
    current: thisWeekRange
  }
}

export function formatNumber(num = 0, digits = 0) {
  num = Number(num);
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup.slice().reverse().find(function(item) {
    return num >= item.value;
  });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}

export function binarySearch(arr, searchInput) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const state = arr[mid].toLowerCase();

    if (state === searchInput.toLowerCase()) {
      return arr[mid];
    } else if (state > searchInput.toLowerCase()) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  return null;
}