export {}

declare global {
  interface Window {
    api: {
      store: {
        get: (key: string) => Promise<unknown>
        set: (key: string, value: unknown) => Promise<void>
        delete: (key: string) => Promise<void>
      }
      dialog: {
        openFile: () => Promise<string[]>
      }
      file: {
        read: (path: string) => Promise<{
          name: string
          mimeType: string
          base64: string
          size: number
        }>
      }
    }
  }
}
