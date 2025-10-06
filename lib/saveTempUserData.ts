import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY || "fallback-secret";

export const hashData = (data: string): string => {
  return CryptoJS.SHA256(data).toString();
};

export const encryptData = (data: any): string => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

export const decryptData = (cipher: string): any | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    return null;
  }
};

export const saveTempPatientData = (data: any) => {
  localStorage.setItem("pendingPatient", encryptData(data));
};

export const getTempPatientData = (): any | null => {
  const cipher = localStorage.getItem("pendingPatient");
  return cipher ? decryptData(cipher) : null;
  //   return cipher;
};

export const clearTempPatientData = () => {
  localStorage.removeItem("pendingPatient");
};
