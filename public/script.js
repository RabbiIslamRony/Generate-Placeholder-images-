function handleFiles(files) {
    const file = files[0];
  
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
  
      fetch('/upload', {
        method: 'POST',
        body: formData,
      })
      .then(response => response.json())
      .then(data => {
        const resultDiv = document.getElementById('result');
        
        // Display the placeholder image with the original image size
        const placeholderImage = new Image();
        placeholderImage.src = `data:image/png;base64,${data.placeholderBase64}`;
        placeholderImage.alt = 'Placeholder Image';
        placeholderImage.width = data.originalSize.width;
        placeholderImage.height = data.originalSize.height;
  
        // Create a div to hold the image and size information
        const imageContainer = document.createElement('div');
        imageContainer.appendChild(placeholderImage);
  
        // Display the original image size
        const sizeInfo = document.createElement('p');
        sizeInfo.textContent = `Original Image Size: ${data.originalSize.width} x ${data.originalSize.height}`;
        imageContainer.appendChild(sizeInfo);
  
        // Replace the content of the result div
        resultDiv.innerHTML = '';
        resultDiv.appendChild(imageContainer);
  
        // Create a download button for the placeholder image
        const downloadButton = document.createElement('button');
        downloadButton.textContent = 'Download Placeholder Image';
        downloadButton.addEventListener('click', () => {
          downloadPlaceholderImage(data.placeholderBase64);
        });
        resultDiv.appendChild(downloadButton);
      })
      .catch(error => console.error('Error uploading image:', error));
    }
  }
  
  function downloadPlaceholderImage(base64Data) {
    const blob = base64toBlob(base64Data, 'image/png');
    const url = window.URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.href = url;
    a.download = 'placeholder.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
  
  // Helper function to convert base64 to blob
  function base64toBlob(base64Data, contentType) {
    const sliceSize = 512;
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
  
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
  
    return new Blob(byteArrays, { type: contentType });
  }
  