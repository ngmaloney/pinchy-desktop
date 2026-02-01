import type { FileAttachment } from '../lib/file-utils'
import { formatFileSize, isImageFile } from '../lib/file-utils'

interface AttachmentPreviewProps {
  attachments: FileAttachment[]
  onRemove: (index: number) => void
}

export function AttachmentPreview({ attachments, onRemove }: AttachmentPreviewProps) {
  if (attachments.length === 0) return null

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      padding: '0.5rem',
      borderBottom: '1px solid #2a2a4a',
      backgroundColor: '#1a1a2e',
    }}>
      {attachments.map((attachment, index) => {
        const isImage = isImageFile(attachment.mimeType)
        const dataUrl = `data:${attachment.mimeType};base64,${attachment.base64}`

        return (
          <div
            key={index}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem',
              backgroundColor: '#16213e',
              border: '1px solid #2a2a4a',
              borderRadius: '6px',
              maxWidth: '200px',
            }}
          >
            {isImage ? (
              <img
                src={dataUrl}
                alt={attachment.name}
                style={{
                  width: '48px',
                  height: '48px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                }}
              />
            ) : (
              <div style={{
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#2a2a4a',
                borderRadius: '4px',
                fontSize: '1.5rem',
              }}>
                📄
              </div>
            )}
            
            <div style={{
              flex: 1,
              minWidth: 0,
              fontSize: '0.75rem',
              color: '#e0e0e0',
            }}>
              <div style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: 500,
              }}>
                {attachment.name}
              </div>
              <div style={{
                color: '#888',
                fontSize: '0.7rem',
              }}>
                {formatFileSize(attachment.size)}
              </div>
            </div>

            <button
              onClick={() => onRemove(index)}
              style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.7rem',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}
              title="Remove attachment"
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}
