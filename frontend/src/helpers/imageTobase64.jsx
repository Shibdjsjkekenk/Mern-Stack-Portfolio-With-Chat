const fileToBase64 = async (file) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);

  const data = await new Promise((resolve, reject) => {
    reader.onload = () => {
      // pura DataURL return karo, prefix ke saath
      resolve(reader.result);
    };
    reader.onerror = (error) => reject(error);
  });

  return data;
};

export default fileToBase64;
