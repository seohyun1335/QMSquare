import { get, set, del, keys } from "idb-keyval"

const FILE_STORE_PREFIX = "qmsquare_file_"

export async function saveFileToIndexedDB(fileId: string, blob: Blob): Promise<void> {
  await set(`${FILE_STORE_PREFIX}${fileId}`, blob)
}

export async function getFileFromIndexedDB(fileId: string): Promise<Blob | undefined> {
  return await get(`${FILE_STORE_PREFIX}${fileId}`)
}

export async function deleteFileFromIndexedDB(fileId: string): Promise<void> {
  await del(`${FILE_STORE_PREFIX}${fileId}`)
}

export async function getAllFileIds(): Promise<string[]> {
  const allKeys = await keys()
  return allKeys
    .filter((key) => typeof key === "string" && key.startsWith(FILE_STORE_PREFIX))
    .map((key) => (key as string).replace(FILE_STORE_PREFIX, ""))
}
