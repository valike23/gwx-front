import { config } from "$lib/config";
import random from 'random-string-generator'

export async function registerPushNotification() {
  return new Promise((resolve, reject) => {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(reg => {
        if (!reg) {
          reject(null);
        } else {
          reg.pushManager.getSubscription().then(sub => {
            if (sub) {
              reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: config.webpushPublicKey
              })
            }
            resolve(sub);
          })
        }
      });
    } else {
      reject(null);
    }

  })

}

/**
 * 
 * @returns {Promise<PushSubscription|null>}
 */
export async function enableNotification() {
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    return new Promise((resolve, reject) => {
      if (!("Notification" in window)) {
        reject(null);
      } else {
        navigator.serviceWorker.ready.then(reg => {
          if (!reg) {
            reject(null);
          } else {
            console.log(reg);
            if (Notification.permission == "granted") {
              reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: config.webpushPublicKey
              }).then(resolve)
            } else {
              Notification.requestPermission().then(permission => {
                if (permission == "granted") {
                  reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: config.webpushPublicKey
                  }).then(resolve)
                }
              })
            }
          }
        })
      }
    })
  }
}


// Function to convert CSV to JSON, taking care of dots in headers as objects
export function csvToJSON(csv) {
  // Split the CSV into an array of lines
  const lines = csv.split('\n');

  // Get the headers from the first line
  const headers = lines[0].split(',');

  // Create an empty object to store the JSON data
  const jsonData = [];

  // Loop through the remaining lines of the CSV
  for (let i = 1; i < lines.length; i++) {
    // Split the line into an array of values
    const values = lines[i].split(',');

    // Create a new object to store the JSON data for this line
    const rowData = {};

    // Loop through the headers and values
    for (let j = 0; j < headers.length; j++) {
      // If the header contains a dot, split it into an array of keys
      const keyParts = headers[j].split('.');

      // Create a nested object to store the value
      let nestedObject = rowData;
      for (let k = 0; k < keyParts.length - 1; k++) {
        if (!nestedObject[keyParts[k]]) {
          nestedObject[keyParts[k]] = {};
        }
        nestedObject = nestedObject[keyParts[k]];
      }

      // Set the value of the nested object
      nestedObject[keyParts[keyParts.length - 1]] = values[j];
    }

    // Add the row data to the JSON data array
    jsonData.push(rowData);
  }

  // Return the JSON data
  return jsonData;
}

/**
 * 
 * @param {array<object>} val 
 */
function defConv(val) {

  let headers = ["pickup_at", "name", "quantity", "weight", "value", "recipient.name", "recipient.email", "recipient.phone", "recipient.address", "recipient.state.id"];

  let htok = {
    "Pickup Date": "pickup_at",
    "Package Name": "name",
    "Quantity": "quantity",
    "Weight": "weight",
    "Package Value": "value",
    "Recipient Name": "recipient.name",
    "Recipient Email": "recipient.email",
    "Recipient Phone": "recipient.phone",
    "Recipient Address": "recipient.address",
    "Destination State": "recipient.state.id"
  }

  let arr = [headers.join(",")];

  for (let index = 0; index < val.length; index++) {
    let a = Array.from(headers).map(e => "");
    Object.entries(val[index]).forEach(value => {
      // check if key is contained in htok
      let hi = Object.keys(htok).findIndex(e => e.includes(value[0]));
      if (hi >= 0) {
        // check the index in headers
        let v = Object.values(htok)[hi];
        let ai = headers.indexOf(v);
        if (ai >= 0) {
          a[ai] = value[1];
        }
      }
    })
    arr.push(a.join(","))
  }

  return csvToJSON(arr.join("\n"));
}

function nisConv(val) {
  let headers = ["pickup_at", "name", "quantity", "weight", "value", "recipient.name", "recipient.email", "recipient.phone", "recipient.address", "recipient.state.id", "metadata.first_name", "metadata.middle_name", "metadata.last_name", "metadata.city", "metadata.contact_city", "metadata.current_address_state_name", "metadata.current_address_lga_name", "metadata.booket_fee", "metadata.av_fee", "metadata.payment_date", "metadata.payment_received_date"];

  let htok = {
    "ref_num": "tracking_number",
    "application_id": "name",
    "first_name": "metadata.first_name",
    "middle_name": "metadata.middle_name",
    "last_name": "metadata.last_name",
    "mobile_number": "recipient.phone",
    "current_address_line1": "recipient.address",
    "current_address_city": "metadata.city",
    "contact_city": "metadata.contact_city",
    "current_address_state_name": "metadata.current_address_state_name",
    "current_address_lga_name": "metadata.current_address_lga_name",
    "booket_fee": "metadata.booket_fee",
    "av_fee": "metadata.av_fee",
    "payment_date": "metadata.payment_date",
    "payment_received_date": "metadata.payment_received_date"
  }

  let arr = [headers.join(",")];

  for (let index = 0; index < val.length; index++) {
    let a = Array.from(headers).map(e => "");
    Object.entries(val[index]).forEach(value => {
      // check if key is contained in htok
      let hi = Object.keys(htok).findIndex(e => e.includes(value[0]));
      if (hi >= 0) {
        // check the index in headers
        let v = Object.values(htok)[hi];
        let ai = headers.indexOf(v);
        if (ai >= 0) {
          a[ai] = value[1];
        }
      }
    })
    arr.push(a.join(","))
  }

  return csvToJSON(arr.join("\n")).map(e => {
    return Object.assign({}, e, {
      recipient: {
        name: [e.metadata.first_name, e.metadata.middle_name, e.metadata.last_name].filter(e => !!e).join(" "),
        phone: e.recipient.phone,
        alternate_phone: "",
        address: e.recipient.address,
        email: "",
        state: {
          name: e.metadata.current_address_state_name
        }
      },
      quantity: 1,
      weight: 0.1,
      value: "1",
    })
  });

}

/**
 * 
 * @param {array<object>} val 
 */
export function jsonToWaybills(val) {

  let f = val[0] || {}

  // for default conversion
  if (f.hasOwnProperty("Package Name")) {
    return defConv(val);
  }

  // for NIS conversion
  if (f.hasOwnProperty("application_id")) {
    return nisConv(val);
  }

  return [];
}

export function mergeObjects(...objects) {
  const mergedObject = {};

  for (const object of objects) {
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        mergedObject[key] = object[key];
      }
    }
  }

  return mergedObject;
}

/**
 * 
 * @param {string} phoneNumber 
 * @returns 
 */
export function formatPhoneNumber(phoneNumber) {

  // Remove non-numeric characters
  const numericPhoneNumber = phoneNumber.replace(/\D/g, '');

  // Check if the number starts with '0' and has a length of 11 (Nigeria local format)
  if (numericPhoneNumber.startsWith('0') && numericPhoneNumber.length === 11) {
      // Format local number to international format
      return `234${numericPhoneNumber.substring(1)}`;
  }

  // Check if the number starts with '234' and has a length of 13 (Nigeria international format)
  if (numericPhoneNumber.startsWith('234') && numericPhoneNumber.length === 13) {
      // Return the same number since it's already in international format
      return numericPhoneNumber;
  }

  // For other scenarios, return the original number
  return phoneNumber;
}

export function computeStatus (status) {
  switch (status) {
    case "canceled": return "returned";
    default: return status;
  }
}

export function numId(length = 16) {
  return random(length, 'numeric');
}