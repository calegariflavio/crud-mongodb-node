const form = document.getElementById('dataForm');
const dataList = document.getElementById('dataList');

// Fetch existing data
fetchData(); 

// Form Submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const _id = document.getElementById('_id').value;

  const data = { name }; // Assuming only name field

  const method = _id ? 'PUT' : 'POST';
  const url = _id ? `http://localhost:3000/data/${_id}` : 'http://localhost:3000/data';

  try {
    const response = await fetch(url, {
      method, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data) 
    });

    if (response.ok) {
      console.log('Success!');
      fetchData(); 
      form.reset();
      document.getElementById('_id').value = ''; // Clear the hidden ID field
    } else {
      console.error('Error:', response.statusText);
    }
  } catch (err) {
    console.error('Fetch Error:', err);
  }  
});

async function fetchData() {
    try {
      const response = await fetch('http://localhost:3000/data');
      const data = await response.json();
  
      // Update the dataList element with the fetched data 
      const dataList = document.getElementById('dataList');
      dataList.innerHTML = ''; // Clear existing content
  
      data.forEach(item => {
        // Create elements to display the data
        const dataItem = document.createElement('div');
        dataItem.className = 'data-item';
  
        const nameElement = document.createElement('p');
        nameElement.textContent = item.name;
  
        // Create edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'edit-btn';
        editBtn.onclick = () => editData(item._id, item.name);
  
        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = () => deleteData(item._id);
  
        // Append elements to the data item
        dataItem.appendChild(nameElement);
        dataItem.appendChild(editBtn);
        dataItem.appendChild(deleteBtn);
  
        // Append the data item to the list
        dataList.appendChild(dataItem);
      });
  
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }

  function editData(id, name) {
    document.getElementById('_id').value = id;
    document.getElementById('name').value = name;
  }
  
  async function deleteData(id) {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`http://localhost:3000/data/${id}`, { method: 'DELETE' }); 
        if (response.ok) {
          console.log('Delete successful!');
          fetchData(); 
        } else {
          console.error('Error:', response.statusText);
        }
      } catch (err) {
        console.error('Fetch Error:', err);
      }
    }
  }