imageInput.addEventListener("change", () => {
    if (imageInput.files.length === 0) {
        Toast("Please select an image file.", "failed", false);
        return;
    }

    const file = imageInput.files[0];
    const fileName = file.name;

    fileNameElement.textContent = fileName;
    uploadedImage.src = URL.createObjectURL(file);
    uploadedImage.style.display = "block";

    const imageIcon = document.getElementById("image-icon");
    imageIcon.style.display = "none";

    imageBtn.disabled = false;
    clearBtn.disabled = false;
});

async function processImage() {
    const loadingToast = Toast("Extracting text please wait!", "loading", true);

    try {
        const file = imageInput.files[0];

        if (!file) {
            handleImageProcessingError("Please select an image file.", loadingToast);
            return;
        }

        const formData = createFormData(file);
        const response = await uploadImage(formData); 


          if (response.ok) {
            const data = await response.json();
            console.log(   `data: ${JSON.stringify(data, null, 2)}`)
            handleImageExtractionSuccess(data, loadingToast);
          } else {
            handleImageProcessingError(`Error: ${response.statusText}`, loadingToast);
          }
    } catch (error) {
        handleImageProcessingError(`Error: ${error.message}`, loadingToast);
    }
}

function createFormData(file) {
    const formData = new FormData();
    formData.append("image", file);
    console.log(file)
    console.log(formData)
    return formData;
}

async function uploadImage(formData) {
    return await fetch("http://127.0.0.1:8080/upload", {
        method: "POST",
        body: formData,
    });

}

function handleImageExtractionSuccess(data, loadingToast) {
    const wordCount = countWords(data.hateSpeech);

    if (wordCount < 3 || wordCount > 280) {
        loadingToast.remove();
        Toast("Extracted text does not satisfy the word limit.", "failed", false);
    } else {
        loadingToast.remove();
        Toast("Text successfully extracted!", "success", false);

        extractedTextbox.style.display = "block";
        extractedTextbox.value = data.hateSpeech;

        showAnalyzingState();
        setTimeout(() => {
            fetchLabelsandDisplay2();
        }, 1000);
    }
}

function handleImageProcessingError(errorMessage, loadingToast) {
    console.error(errorMessage);
    loadingToast.remove();
    Toast("Error extracting text. Please try again.", "failed", false);
}

function countWords(str) {
    return str.trim().split(/\s+/).length;
}