var currentShiftDate;
var currentShiftType;

function openModal() {
  document.getElementById('settingsModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('settingsModal').style.display = 'none';
}

/*function checkPassword() {
  var inputPassword = document.getElementById('passwordInput').value;
  if (inputPassword === "1234") {  // Assume "1234" is the correct password
    alert("Password correct!");
    // Here you would typically load or display the settings form
  } else {
    alert("Incorrect password!");
  }
}*/

function showNamesModal() {
  fetch('/names')
    .then(response => response.json())
    .then(names => {
      const namesModal = document.getElementById('namesModal');
      const namesList = document.getElementById('namesList');

      if (!namesList) {
        console.error('The "namesList" element was not found.');
        return;
      }

      namesList.innerHTML = ''; // Clear existing list items
      if (names.length === 0) {
        namesList.innerHTML = '<li>No names found in the database.</li>';
      } else {
                    names.forEach(name => {
            const li = document.createElement('li');
            li.id = `name-${name.id}`;
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';

            const nameSpan = document.createElement('span');
            nameSpan.textContent = name.name;
            nameSpan.style.flexGrow = '1';
            nameSpan.style.marginRight = '10px'; // Ensure spacing between text and icons
            nameSpan.contentEditable = false;

            const editSpan = document.createElement('span');
            editSpan.textContent = '✏️';
            editSpan.style.cursor = 'pointer';
            editSpan.style.padding = '0 10px';
            editSpan.onclick = () => {
                nameSpan.contentEditable = true;
                nameSpan.focus(); 
            };

            nameSpan.onkeydown = function(event) {
                if (event.key === "Enter") {
                event.preventDefault();
                nameSpan.contentEditable = false;
                updateName(name.id, nameSpan.textContent);
                nameSpan.blur();
                }
            };

            document.addEventListener('click', function(event) {
                if (!li.contains(event.target) && nameSpan.contentEditable === "true") {
                nameSpan.contentEditable = false;
                updateName(name.id, nameSpan.textContent);
                }
            }, { capture: true }); // Added capturing phase to handle event propagation properly

            const deleteSpan = document.createElement('span');
            deleteSpan.textContent = '✖';
            deleteSpan.style.cursor = 'pointer';
            deleteSpan.style.padding = '0 10px';
            deleteSpan.style.color = 'red';
            deleteSpan.onclick = () => deleteName(name.id);

            li.appendChild(nameSpan);
            li.appendChild(editSpan);
            li.appendChild(deleteSpan);
            namesList.appendChild(li);
            });

      }
      
      // Ensure the modal is visible
      if (namesModal.style.display === 'none' || !namesModal.style.display) {
        namesModal.style.display = 'block';
      }
    })
    .catch(error => {
      console.error('Error fetching names:', error);
    });

}

function openNamesModal(cell) {
    var columnIndex = cell.cellIndex;
    var table = cell.closest('table');
    var headerRow = table.querySelector('thead tr');
    currentShiftDate = headerRow.children[columnIndex].getAttribute('data-date');
    currentShiftType = cell.parentNode.getAttribute('data-shift');

    
    var columnIndex = cell.cellIndex;
    var table = cell.closest('table');
    var headerRow = table.querySelector('thead tr');
    currentShiftDate = headerRow.children[columnIndex].getAttribute('data-date');
    currentShiftType = cell.parentNode.getAttribute('data-shift');
  const shiftDate = cell.getAttribute('data-date'); // Get the date from the cell
  const shiftName = cell.parentNode.querySelector('td').textContent; // Get the shift name from the first cell in the row
  const modal = document.getElementById('namesSelectionModal');
  const checklist = document.getElementById('namesChecklist');
  
  // Clear previous entries
  checklist.innerHTML = '';

  // Fetch the list of all names from the server
  fetch('/names')
    .then(response => response.json())
    .then(data => {
      if (data && data.length > 0) {
        data.forEach(name => {
          const listItem = document.createElement('li');
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.id = `name-${name.id}`;
          checkbox.value = name.id; // Assuming the server sends an id field

          // Optionally, check if this name is already assigned to this shift
          // This would need another API call or data handling depending on your backend setup
          // Example: if (alreadyAssigned(name.id, shiftDate, shiftName)) { checkbox.checked = true; }

          const label = document.createElement('label');
          label.htmlFor = `name-${name.id}`;
          label.textContent = name.name;

          listItem.appendChild(checkbox);
          listItem.appendChild(label);
          checklist.appendChild(listItem);
        });
      } else {
        checklist.innerHTML = '<li>No names available</li>';
      }
      modal.style.display = 'block'; // Display the modal
    })
    .catch(error => {
      console.error('Failed to fetch names:', error);
      checklist.innerHTML = '<li>Error loading names</li>';
    });
}

function alreadyAssigned(nameId, shiftDate, shiftName) {
  // This function would need to interact with your backend to check if a name is already assigned
  // to the given shift on the given date. This would typically be another fetch() call.
  return false; // Placeholder return
}


function closeWeeklyNamesModal() {
  document.getElementById('namesSelectionModal').style.display = 'none';
}

function saveSelections() {
    const checkboxes = document.querySelectorAll('#namesChecklist input[type="checkbox"]:checked');
    const staffIds = Array.from(checkboxes).map(cb => cb.value);
    const staffNames = Array.from(checkboxes).map(cb => cb.parentNode.textContent.trim());

    // Use global variables
    const shiftDate = currentShiftDate;
    const shiftType = currentShiftType;
    console.log("Current Shift Date:", currentShiftDate);
    console.log("Current Shift Type:", currentShiftType);
    // Send this data to the server
    fetch('/assign-staff-to-shift', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            date: shiftDate,
            shiftType: shiftType,
            staffIds: staffIds
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Staff assigned:', data);
        document.getElementById('namesSelectionModal').style.display = 'none'; // Close the modal
    })
    .catch(error => {
        console.error('Error assigning staff:', error);
    });
}



function updateName(id, newName) {
  // Check if the newName is not just an empty string or similar
  if (newName.trim() === "") {
    alert("Name cannot be empty!");
    return;
  }

  fetch(`/names/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: newName })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Updated:', data);
    // Optionally, provide feedback to the user that the update was successful
  })
  .catch(error => {
    console.error('Error updating name:', error);
    // Optionally, inform the user that an error occurred
  });
}


function closeNamesModal() {
  document.getElementById('namesModal').style.display = 'none';
}

function checkPassword() {
  var inputPassword = document.getElementById('passwordInput').value;
  if (inputPassword === "1234") {  // Assume "1234" is the correct password
    closeModal();
    showNamesModal();
  } else {
    alert("Incorrect password!");
  }
}

function addName() {
  const newName = document.getElementById('newName').value;
  fetch('/names', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newName })
  }).then(response => response.json())
    .then(name => {
      document.getElementById('newName').value = ''; // Clear input
      showNamesModal(); // Refresh the list
    });
}

function updateName(id, newName) {
  fetch(`/names/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newName })
  }).then(response => response.json())
    .then(result => {
      console.log('Updated:', result);
    });
}

function deleteName(id) {
  fetch(`/names/${id}`, {
    method: 'DELETE'
  }).then(response => response.json())
    .then(result => {
      console.log('Deleted:', result);
      showNamesModal(); // Refresh the list
    });
}
