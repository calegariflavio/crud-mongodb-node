const form = document.getElementById('dataForm');
const dataList = document.getElementById('dataList');

// Fetch existing data
fetchData(); // Assuming you have this function defined

// Form Submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const age = document.getElementById('age').value;
  const gender = document.getElementById('gender').value;
  const file = document.getElementById('file').files[0];
 

  const dataSet = new FormData(); // Use FormData for multipart uploads
  dataSet.append('name', name);
  dataSet.append('age', age);
  dataSet.append('gender', gender);
  dataSet.append('file', file);

    const _id = document.getElementById('_id').value;
    const method = _id ? 'PUT' : 'POST';
    const url = _id ? `http://localhost:3000/data/${_id}` : 'http://localhost:3000/data';

    try {
      const response = await fetch(url, {
        method: method, 
        body: dataSet
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
        nameElement.textContent = `Name: ${item.name}`;

        const ageElement = document.createElement('p');
        ageElement.textContent = `Age: ${item.age}`;

        const genderElement = document.createElement('p');
        genderElement.textContent = `Gender: ${item.gender}`;

        if (item.imagePath) {
          const imageElement = document.createElement('img');
          imageElement.src = item.imagePath; 
          imageElement.alt = 'Profile Image';
          dataItem.appendChild(imageElement);
        }
  
        // Create edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'edit-btn';
        editBtn.onclick = () => editData(item._id, item.name, item.age, item.gender);
  
        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = () => deleteData(item._id);
  
        // Append elements to the data item
        dataItem.appendChild(nameElement);
        dataItem.appendChild(ageElement);
        dataItem.appendChild(genderElement);
        
        dataItem.appendChild(editBtn);
        dataItem.appendChild(deleteBtn);
  
        // Append the data item to the list
        dataList.appendChild(dataItem);
      });
  
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }

  function editData(id, name, age, gender) {
    document.getElementById('_id').value = id;
    document.getElementById('name').value = name;
    document.getElementById('age').value = age;
    document.getElementById('gender').value = gender;
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