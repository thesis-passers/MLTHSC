let savedPosts = []

const PostDisplay = (post, index) => {
    const postElement = document.createElement('div');
    postElement.classList.add('postDisplay', 'border-none');

    postElement.textContent = post.text;

    const labelsContainer = document.createElement('div');
    labelsContainer.classList.add('postDisplay-labelContainer');

    for (let label of post.labels) {
        if (parseFloat(label.probability) > 50) {
            const labelElement = document.createElement('div');
            labelElement.classList.add('postDisplay-label', `label-${label.name.toLowerCase()}`);
            labelElement.innerHTML += `&nbsp;&nbsp;${label.name}`;
            labelsContainer.appendChild(labelElement);
        }
    }

    // Add a delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteSavedPost(index)); // Associate the event handler

    // Append labels and delete button to the post element
    postElement.appendChild(labelsContainer);
    postElement.appendChild(deleteButton);

    return postElement;
};

function saveToLocalStorage(data) {

    // localStorage.clear()
    console.log('data')
    console.log(data)

    // Retrieve existing data from localStorage
    savedPosts = JSON.parse(localStorage.getItem('savedPosts')) || [];

    // Add new data to saved posts array
    savedPosts.push(data)

    // Save the updated array back to localStorage
    localStorage.setItem('savedPosts', JSON.stringify(savedPosts));

    console.log("Localstorage:")
    console.log(JSON.parse(localStorage.getItem('savedPosts')))


}

function updateSavedPostsDisplay() {

    savedPosts = JSON.parse(localStorage.getItem('savedPosts')) || [];

    console.log("savedPosts");
    console.log(savedPosts);

    const savedPostsContainer = document.getElementById('savedPosts');

    // Clear existing content in the container
    savedPostsContainer.innerHTML = '';

    for (let i = savedPosts.length - 1; i >= 0; i--) {
        const post = savedPosts[i];
        const postDisplayElement = PostDisplay(post);
        savedPostsContainer.appendChild(postDisplayElement);
    }

    countLabelFrequency()

}

function countLabelFrequency() {

    const labelNames = ['Age', 'Gender', 'Physical', 'Race', 'Religion', 'Others'];
    let labelFrequency = {}

    labelNames.forEach((label) => {
        labelFrequency[label] = 0;
    });

    savedPosts.forEach((obj) => {
        // Iterate through the labels array of each object
        obj.labels.forEach((label) => {
            // Check if the label probability is greater than 50%
            if (parseFloat(label.probability) > 50 && label.name in labelFrequency) {
                // If it meets the conditions, increment the count
                labelFrequency[label.name]++;
            }
        });
    });

    // Print the label frequencies
    console.log(labelFrequency);

    return labelFrequency;

}

function deleteSavedPost(index) {
    // Retrieve existing data from localStorage
    savedPosts = JSON.parse(localStorage.getItem('savedPosts')) || [];

    // Remove the post at the specified index
    savedPosts.splice(index, 1);

    // Save the updated array back to localStorage
    localStorage.setItem('savedPosts', JSON.stringify(savedPosts));

    // Update the display after deletion
    updateSavedPostsDisplay();
}




