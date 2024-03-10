function updateImagePreview(file) {
  const reader = new FileReader();

  reader.onload = function (e) {
    const imagePreview = document.getElementById('image-preview');
    imagePreview.src = e.target.result;
  };

  reader.readAsDataURL(file);
}

function handleFiles() {
  const input = document.getElementById('image');
  const files = input.files;

  if (files.length > 0) {
    updateImagePreview(files[0]);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    // Show loading message
    const loadingMessage = document.getElementById('loading-message');
    loadingMessage.style.display = 'block';

    fetch('/upload', {
        method: 'POST',
        body: formData,
      })
      .then(response => response.json())
      .then(data => {
        const zip = new JSZip();

        data.forEach((imageData, index) => {
          const base64Data = imageData.placeholderBase64.split(';base64,').pop();
          zip.file(`placeholder_${index + 1}.png`, base64Data, {
            base64: true
          });
        });

        zip.generateAsync({
            type: 'blob'
          })
          .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'placeholders.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            // Hide loading message after generating placeholders
            loadingMessage.style.display = 'none';
          })
          .catch(error => {
            console.error('Error generating zip file:', error);
            // Hide loading message in case of an error
            loadingMessage.style.display = 'none';
          });
      })
      .catch(error => {
        console.error('Error uploading images:', error);
        // Hide loading message in case of an error
        loadingMessage.style.display = 'none';
      });
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

function downloadAllPlaceholders() {
  fetch('/download-all')
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'placeholders.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    })
    .catch(error => console.error('Error downloading placeholders:', error));
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

  return new Blob(byteArrays, {
    type: contentType
  });
}