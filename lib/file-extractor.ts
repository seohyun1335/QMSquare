// PDF.js 타입 정의
interface PDFDocumentProxy {
  numPages: number
  getPage(pageNumber: number): Promise<PDFPageProxy>
}

interface PDFPageProxy {
  getTextContent(): Promise<{ items: Array<{ str: string }> }>
}

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type
  const fileName = file.name.toLowerCase()

  try {
    // TXT 파일
    if (fileType === "text/plain" || fileName.endsWith(".txt")) {
      return await extractTextFromTxt(file)
    }

    // DOCX 파일
    if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")
    ) {
      return await extractTextFromDocx(file)
    }

    throw new Error("지원하지 않는 파일 형식입니다. TXT 또는 DOCX 파일만 지원합니다.")
  } catch (error) {
    console.error("[v0] 파일 텍스트 추출 오류:", error)
    throw error
  }
}

async function extractTextFromTxt(file: File): Promise<string> {
  return await file.text()
}

async function extractTextFromDocx(file: File): Promise<string> {
  try {
    const mammoth = await import("mammoth")
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })

    if (!result.value || result.value.trim().length < 50) {
      throw new Error("DOCX 파일에서 충분한 텍스트를 추출할 수 없습니다.")
    }

    return result.value
  } catch (error) {
    console.error("[v0] DOCX 추출 오류:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("DOCX 파일 처리 중 오류가 발생했습니다.")
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}
