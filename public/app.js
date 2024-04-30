// Fetch staff names from server and populate table
fetch('/staff')
  .then(response => response.json())
  .then(data => {
    // Populate the table or dropdown for selection
    console.log(data);
  })
  .catch(error => console.error('Error fetching staff:', error));
