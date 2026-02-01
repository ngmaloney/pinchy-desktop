import { formatFileSize, isImageFile } from '../lib/file-utils'

export interface MessageAttachmentData {
  type: string
  mimeType: string
  fileName: string
  content: string
  size?: number
}

interface MessageAttachmentProps {
  attachment: MessageAttachmentData
}

export function MessageAttachment({ attachment }: MessageAttachmentProps) {
  const isImage = isImageFile(attachment.mimeType)
  const dataUrl = `data:${attachment.mimeType};base64,${attachment.content}`

  if (isImage) {
    return (
      <div style={{
        marginTop: '0.5rem',
        marginBottom: '0.25rem',
      }}>
        <img
          src={dataUrl}
          alt={attachment.fileName}
          style={{
            maxWidth: '100%',
            maxHeight: '300px',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
          onClick={() => {
            // Open in new window
            const win = window.open()
            if (win) {
              win.document.write(`<img src="${dataUrl}" style="max-width:100%; height:auto;" />`)
            }
          }}
        />
        <div style={{
          fontSize: '0.7rem',
          color: '#888',
          marginTop: '0.25rem',
        }}>
          {attachment.fileName}
          {attachment.size && ` (${formatFileSize(attachment.size)})`}
        </div>
      </div>
    )
  }

  // Non-image attachment
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginTop: '0.5rem',
      padding: '0.5rem',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '6px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    }}>
      <div style={{
        fontSize: '1.5rem',
      }}>
        📎
      </div>
      <div style={{
        flex: 1,
        minWidth: 0,
      }}>
        <div style={{
          fontSize: '0.8rem',
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {attachment.fileName}
        </div>
        {attachment.size && (
          <div style={{
            fontSize: '0.7rem',
            color: '#888',
          }}>
            {formatFileSize(attachment.size)}
          </div>
        )}
      </div>
    </div>
  )
}
