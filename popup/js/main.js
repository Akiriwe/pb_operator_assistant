'use strict';

//----------------------------------GLOBAL VARIABLES---------------------------------------------------
let clientAddForm = $('#add_client');
let clientList = $('#client_list');
let removeButton = $
const clientName = 'clientName';
const recallPurpose = 'recallPurpose';
const clientPhoneNumber = 'clientPhoneNumber';
const timeToRecall = 'timeToRecall';
const storage = browser.storage.sync;

//----------------------------------EVENT HOOKS--------------------------------------------------------
$(document).ready(rewriteClientList)
clientAddForm.submit(handleAddClientAction);

function bindEventToRemoveButtons() {
  $('button[name="remove_client"]').each(function() {
    $(this).click(handleClientRemoval);
  });
}

//----------------------------------EVENT HANDLERS-----------------------------------------------------
function handleAddClientAction(event) {
  event.preventDefault();
  let client = {};
  client[clientName] = $('input[name="client_name_input"]').val();
  client[recallPurpose] = $('textarea[name="recall_purpose_input"]').val();
  client[clientPhoneNumber] = $('input[name="client_phone_number_input"]').val();
  client[timeToRecall] = $('input[name="time_to_recall_input"]').val();

  let errors = validateClient(client);

  if ($.isEmptyObject(errors)) {
    addClientToStorage(client);
    rewriteClientList();
  } else {
    let errorText = '';
    for (let errorType in errors) {
      errorText += errors[errorType] + '\n';
    }
    alert(errorText);
  }
}

function handleClientRemoval(event) {
  event.preventDefault();
  removeClientFromStorage($(this).data('phone'));
}



//----------------------------------CLIENT VALIDATION--------------------------------------------------
function validateClient(client) {
  let errorsMap = {};

  if (isEmpty(client[clientPhoneNumber])) {
    errorsMap[clientPhoneNumber] = 'Телефон клієнта має бути заповненим.';
  } else if (!isNumberValid(client[clientPhoneNumber])) {
    errorsMap[clientPhoneNumber] = 'Телефон клієнта має починатися с 0 та містити 10 цифр.';
  }

  if (isEmpty(client[timeToRecall])) {
    errorsMap[timeToRecall] = 'Час передзвону має бути заповненим.';
  } else if (!isTimeValid(client[timeToRecall])) {
    errorsMap[timeToRecall] = 'Не можна завдати час, що вже минув';
  }


  return errorsMap;
}

function isEmpty(entry) {
  if (!entry) {
    return true;
  }
  return false;
}

function isNumberValid(phoneNumber) {
  if (/^0\d{9}$/.test(phoneNumber)) {
    return true;
  }
  return false;
}

function isTimeValid(time) {
  if (!time) {
    return false;
  }

  let today = new Date();
  const hours = time.match(/^(\d{2}):\d{2}$/)[1];
  const minutes = time.match(/^\d{2}:(\d{2})$/)[1];
  let specifiedTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);

  if (today - specifiedTime > 0) {
    return false;
  }

  return true;
}


//----------------------------------STORAGE FUNCTIONS--------------------------------------------------
function addClientToStorage(client) {
  const phoneNumber = client[clientPhoneNumber];

  const item = {};
  item[phoneNumber] = client;

  storage.set(item);
}

function removeClientFromStorage(clientPhoneNumber) {
  storage.remove(clientPhoneNumber);
  rewriteClientList();
}


//----------------------------------RENDER FUNCTIONS---------------------------------------------------
function rewriteClientList() {
  clientList.empty();
  storage.get().then(renderAllItems);
}

function renderAllItems(storageData) {
  for (const client in storageData) {
    const clientData = storageData[client];
    clientList.append(`
      <div class="client" id="${clientData[clientPhoneNumber]}">
        <div class="up_client_info">
            <div class="time_to_recall">
                ${clientData[timeToRecall]}
            </div>
            <button class="remove_client_form" title="Видалити запис" name="remove_client" data-phone="${clientData[clientPhoneNumber]}">B</button>
        </div>
        <div class="down_client_info">
            <div class="client_name">${clientData[clientName]}</div>
            <div class="phone_info">
                <div class="phone_number_icon"></div>
                <div class="client_phone_number">${clientData[clientPhoneNumber]}</div>
                <div class="copy_number">
                    <button title="Скопіювати номер з кодом України" name="copy_ukrainian">b</button>
                    <button title="Скопіювати номер з кодом Jabber" name="copy_jabber">b</button>
                </div>
            </div>
            <div class="recall_purpose">${clientData[recallPurpose]}</div>
        </div>
      </div>
    `);
  }

  //event hook for each remove button 
  bindEventToRemoveButtons();
}
