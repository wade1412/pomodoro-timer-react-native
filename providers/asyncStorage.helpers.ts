import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeData = async (key: string, value: unknown) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error("Error saving data", error);
  }
};

export const getStorageByKey = async (key: string): Promise<unknown | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error("Error loading data", error);
    return null;
  }
};
