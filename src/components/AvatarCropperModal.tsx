import React, { useEffect, useRef, useState } from 'react';
import { Move, ZoomIn } from 'lucide-react';
import { BottomSheet } from './BottomSheet';

const PREVIEW_SIZE = 264;
const OUTPUT_SIZE = 320;

interface AvatarCropperModalProps {
  file: File | null;
  onClose: () => void;
  onCrop: (image: string) => void;
  language: 'zh' | 'en';
}

type ImageInfo = { image: HTMLImageElement; width: number; height: number };

export const AvatarCropperModal: React.FC<AvatarCropperModalProps> = ({ file, onClose, onCrop, language }) => {
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragStart = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const zh = language === 'zh';

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      setImageInfo({ image, width: image.naturalWidth, height: image.naturalHeight });
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!file) return null;

  const baseScale = imageInfo
    ? Math.max(PREVIEW_SIZE / imageInfo.width, PREVIEW_SIZE / imageInfo.height)
    : 1;
  const imageWidth = imageInfo ? imageInfo.width * baseScale * zoom : PREVIEW_SIZE;
  const imageHeight = imageInfo ? imageInfo.height * baseScale * zoom : PREVIEW_SIZE;
  const maxOffsetX = Math.max(0, (imageWidth - PREVIEW_SIZE) / 2);
  const maxOffsetY = Math.max(0, (imageHeight - PREVIEW_SIZE) / 2);
  const clampOffset = (candidate: { x: number; y: number }) => ({
    x: Math.max(-maxOffsetX, Math.min(maxOffsetX, candidate.x)),
    y: Math.max(-maxOffsetY, Math.min(maxOffsetY, candidate.y)),
  });

  const updateZoom = (nextZoom: number) => {
    setZoom(nextZoom);
    const nextWidth = imageInfo ? imageInfo.width * baseScale * nextZoom : PREVIEW_SIZE;
    const nextHeight = imageInfo ? imageInfo.height * baseScale * nextZoom : PREVIEW_SIZE;
    setOffset((current) => ({
      x: Math.max(-(nextWidth - PREVIEW_SIZE) / 2, Math.min((nextWidth - PREVIEW_SIZE) / 2, current.x)),
      y: Math.max(-(nextHeight - PREVIEW_SIZE) / 2, Math.min((nextHeight - PREVIEW_SIZE) / 2, current.y)),
    }));
  };

  const saveCrop = () => {
    if (!imageInfo) return;
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const context = canvas.getContext('2d');
    if (!context) return;

    const displayWidth = imageInfo.width * baseScale * zoom;
    const displayHeight = imageInfo.height * baseScale * zoom;
    const sourceX = ((displayWidth - PREVIEW_SIZE) / 2 - offset.x) / displayWidth * imageInfo.width;
    const sourceY = ((displayHeight - PREVIEW_SIZE) / 2 - offset.y) / displayHeight * imageInfo.height;
    const sourceWidth = PREVIEW_SIZE / displayWidth * imageInfo.width;
    const sourceHeight = PREVIEW_SIZE / displayHeight * imageInfo.height;
    context.drawImage(imageInfo.image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    onCrop(canvas.toDataURL('image/jpeg', 0.86));
  };

  return (
    <BottomSheet isOpen={true} onClose={onClose} className="bg-slate-50 dark:bg-black" maxHeight="88dvh">
      <div className="px-5 pb-5 space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
            {zh ? '调整头像' : 'Adjust photo'}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            {zh ? '拖动照片调整位置，再用滑杆缩放。' : 'Drag to reposition, then use the slider to zoom.'}
          </p>
        </div>

        <div
          className="relative mx-auto w-[264px] h-[264px] rounded-full overflow-hidden bg-slate-200 dark:bg-zinc-800 touch-none select-none ring-4 ring-white dark:ring-zinc-900 shadow-lg"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            dragStart.current = { x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y };
          }}
          onPointerMove={(event) => {
            if (!dragStart.current) return;
            setOffset(clampOffset({
              x: dragStart.current.offsetX + event.clientX - dragStart.current.x,
              y: dragStart.current.offsetY + event.clientY - dragStart.current.y,
            }));
          }}
          onPointerUp={() => { dragStart.current = null; }}
          onPointerCancel={() => { dragStart.current = null; }}
        >
          {imageInfo ? (
            <img
              src={imageInfo.image.src}
              alt=""
              draggable={false}
              className="absolute max-w-none pointer-events-none"
              style={{
                width: imageWidth,
                height: imageHeight,
                left: `calc(50% + ${offset.x}px)`,
                top: `calc(50% + ${offset.y}px)`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ) : <div className="w-full h-full animate-pulse bg-slate-200 dark:bg-zinc-800" />}
        </div>

        <label className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-zinc-300">
          <ZoomIn size={16} className="shrink-0" />
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={(event) => updateZoom(Number(event.target.value))}
            className="w-full accent-blue-600"
            aria-label={zh ? '缩放头像' : 'Zoom photo'}
          />
        </label>
        <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 dark:text-zinc-500">
          <Move size={13} />
          <span>{zh ? '照片会保存为圆形头像裁切。' : 'The result is cropped for the circular avatar.'}</span>
        </div>

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="min-h-11 flex-1 rounded-xl text-sm font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800">
            {zh ? '取消' : 'Cancel'}
          </button>
          <button type="button" disabled={!imageInfo} onClick={saveCrop} className="min-h-11 flex-1 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-semibold">
            {zh ? '使用照片' : 'Use photo'}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};
