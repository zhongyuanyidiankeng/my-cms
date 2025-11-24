'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './image.module.css';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import BackToHome from '../../components/BackToHome';
import BackToTools from '../../components/BackToTools';

// 定义处理模式类型
type ProcessMode = 'grid' | 'compress' | 'gridAndCompress' | null;
// 增加 icon 模式
type IconProcessMode = ProcessMode | 'icon';

const ImageProcessingTool = () => {
  // 通用状态
  const [image, setImage] = useState<string | null>(null);
  const [processMode, setProcessMode] = useState<IconProcessMode>(null);
  
  // 网格相关状态（支持自定义行列，不局限于九宫格）
  const [rows, setRows] = useState<number>(3);
  const [cols, setCols] = useState<number>(3);
  const [horizontalLines, setHorizontalLines] = useState<number[]>(() => {
    // rows 为 3 时应有 2 条线，位置为 33.33%/66.66%
    const count = Math.max(0, 3 - 1);
    return Array.from({ length: count }, (_, i) => ((i + 1) / 3) * 100);
  });
  const [verticalLines, setVerticalLines] = useState<number[]>(() => {
    const count = Math.max(0, 3 - 1);
    return Array.from({ length: count }, (_, i) => ((i + 1) / 3) * 100);
  });
  const [isDragging, setIsDragging] = useState<{ index: number, type: 'horizontal' | 'vertical' } | null>(null);
  
  // 压缩相关状态
  const [maxWidth, setMaxWidth] = useState<number>(800);
  const [maxHeight, setMaxHeight] = useState<number>(800);
  const [quality, setQuality] = useState<number>(80);
  // 图标输出设置
  const [iconSize, setIconSize] = useState<number>(128);
  const [iconFormat, setIconFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [iconQuality, setIconQuality] = useState<number>(90);
  
  // 引用
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 处理拖动开始
  const handleMouseDown = (index: number, type: 'horizontal' | 'vertical') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging({ index, type });
  };

  // 处理拖动（useCallback 保持引用稳定，满足 Hook 依赖规则）
  const handleMouseMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    if (isDragging.type === 'horizontal') {
      const newPosition = ((e.clientY - rect.top) / rect.height) * 100;
      if (newPosition > 0 && newPosition < 100) {
        setHorizontalLines((prev) => {
          const newLines = [...prev];
          newLines[isDragging.index] = newPosition;
          return newLines;
        });
      }
    } else {
      const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
      if (newPosition > 0 && newPosition < 100) {
        setVerticalLines((prev) => {
          const newLines = [...prev];
          newLines[isDragging.index] = newPosition;
          return newLines;
        });
      }
    }
  }, [isDragging]);

  // 处理拖动结束
  const handleMouseUp = () => {
    setIsDragging(null);
  };

  // 压缩图片
  const compressImage = async (imgElement: HTMLImageElement, maxW: number, maxH: number, qual: number): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    let width = imgElement.naturalWidth;
    let height = imgElement.naturalHeight;
    
    // 计算缩放比例
    if (width > maxW || height > maxH) {
      const ratio = Math.min(maxW / width, maxH / height);
      width = width * ratio;
      height = height * ratio;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法获取画布上下文');
    
    ctx.drawImage(imgElement, 0, 0, width, height);
    
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('压缩图片失败'));
          }
        },
        'image/jpeg',
        qual / 100
      );
    });
  };

  // 下载压缩后的图片
  const downloadCompressedImage = async () => {
    if (!image || !imageRef.current) return;
    
    try {
      const blob = await compressImage(imageRef.current, maxWidth, maxHeight, quality);
      saveAs(blob, 'compressed_image.jpg');
    } catch (error) {
      console.error('压缩图片失败:', error);
      alert('压缩图片失败');
    }
  };

  // 下载网格切图图片（支持任意行列）
  const downloadGridImages = async () => {
    if (!image || !imageRef.current) return;
    
    const img = imageRef.current;
    
    // 计算切割位置
    const hCuts = [0, ...horizontalLines.map(h => h / 100 * img.naturalHeight), img.naturalHeight];
    const vCuts = [0, ...verticalLines.map(v => v / 100 * img.naturalWidth), img.naturalWidth];
    
    // 创建一个ZIP文件
    const zip = new JSZip();
    const promises: Promise<void>[] = [];
    
    // 切割图片为 rows x cols 部分并添加到ZIP
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = vCuts[j];
        const y = hCuts[i];
        const width = vCuts[j + 1] - vCuts[j];
        const height = hCuts[i + 1] - hCuts[i];
        
        // 为每个切片创建单独的画布，确保尺寸正确
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = width;
        sliceCanvas.height = height;
        const sliceCtx = sliceCanvas.getContext('2d');
        
        if (sliceCtx) {
          // 绘制切割后的图片部分到对应大小的画布上
          sliceCtx.drawImage(img, x, y, width, height, 0, 0, width, height);
          
          // 将画布转换为Blob并添加到ZIP
          const promise = new Promise<void>((resolve) => {
            sliceCanvas.toBlob((blob) => {
              if (blob) {
                zip.file(`grid_${i + 1}_${j + 1}.jpg`, blob);
              }
              resolve();
            }, 'image/jpeg', 0.95);
          });
          
          promises.push(promise);
        }
      }
    }
    
    // 等待所有图片处理完成
    await Promise.all(promises);
    
    // 生成ZIP文件并下载
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `grid_${rows}x${cols}.zip`);
  };

  // 下载切割并压缩的图片（支持任意行列）
  const downloadGridAndCompressImages = async () => {
    if (!image || !imageRef.current) return;
    
    const img = imageRef.current;
    
    // 计算切割位置
    const hCuts = [0, ...horizontalLines.map(h => h / 100 * img.naturalHeight), img.naturalHeight];
    const vCuts = [0, ...verticalLines.map(v => v / 100 * img.naturalWidth), img.naturalWidth];
    
    // 创建一个ZIP文件
    const zip = new JSZip();
    const promises: Promise<void>[] = [];
    
    // 切割图片为 rows x cols 部分，压缩后添加到ZIP
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = vCuts[j];
        const y = hCuts[i];
        const width = vCuts[j + 1] - vCuts[j];
        const height = hCuts[i + 1] - hCuts[i];
        
        // 为每个切片创建单独的画布
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = width;
        sliceCanvas.height = height;
        const sliceCtx = sliceCanvas.getContext('2d');
        
        if (sliceCtx) {
          // 绘制切割后的图片部分
          sliceCtx.drawImage(img, x, y, width, height, 0, 0, width, height);
          
          // 创建临时图片元素用于压缩
          const tempImg = new Image();
          
          const promise = new Promise<void>((resolve) => {
            // 将画布转换为数据URL
            const dataUrl = sliceCanvas.toDataURL('image/jpeg');
            
            tempImg.onload = async () => {
              try {
                // 修改：直接设置固定尺寸而不是最大尺寸
                const exactCanvas = document.createElement('canvas');
                exactCanvas.width = maxWidth;
                exactCanvas.height = maxHeight;
                
                const exactCtx = exactCanvas.getContext('2d');
                  if (exactCtx) {
                  // 绘制到指定大小的画布上
                  exactCtx.drawImage(tempImg, 0, 0, maxWidth, maxHeight);
                  
                  // 转换为Blob
                  exactCanvas.toBlob((blob) => {
                    if (blob) {
                      zip.file(`grid_${i + 1}_${j + 1}_${maxWidth}x${maxHeight}.jpg`, blob);
                    }
                    resolve();
                  }, 'image/jpeg', quality / 100);
                } else {
                  resolve();
                }
              } catch (error) {
                console.error('压缩图片失败:', error);
                resolve();
              }
            };
            
            tempImg.src = dataUrl;
          });
          
          promises.push(promise);
        }
      }
    }
    
    // 等待所有图片处理完成
    await Promise.all(promises);
    
    // 生成ZIP文件并下载
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `grid_${rows}x${cols}_${maxWidth}x${maxHeight}.zip`);
  };

  // 下载按指定大小压缩为图标（square）
  const downloadIconImage = async () => {
    if (!image || !imageRef.current) return;

    const img = imageRef.current;

    // 目标 canvas
    const size = Math.max(1, Math.floor(iconSize));
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('无法获取画布上下文');
      return;
    }

    // 根据目标格式，透明背景或白色背景（JPEG 无透明）
    if (iconFormat === 'jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
    } else {
      // 保持透明背景（默认）
      ctx.clearRect(0, 0, size, size);
    }

    // 把原图按比例缩放并居中到方形 canvas 中
    const srcW = img.naturalWidth;
    const srcH = img.naturalHeight;
    if (srcW === 0 || srcH === 0) {
      console.error('图片未加载完成');
      return;
    }

    const ratio = Math.min(size / srcW, size / srcH);
    const drawW = Math.round(srcW * ratio);
    const drawH = Math.round(srcH * ratio);
    const dx = Math.round((size - drawW) / 2);
    const dy = Math.round((size - drawH) / 2);

    ctx.drawImage(img, 0, 0, srcW, srcH, dx, dy, drawW, drawH);

    // 输出 mime
    const mime = iconFormat === 'png' ? 'image/png' : iconFormat === 'webp' ? 'image/webp' : 'image/jpeg';
    const qualityVal = Math.min(1, Math.max(0.01, iconQuality / 100));

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const ext = iconFormat === 'jpeg' ? 'jpg' : iconFormat;
          saveAs(blob, `icon_${size}x${size}.${ext}`);
        }
      },
      mime,
      mime === 'image/png' ? undefined : qualityVal,
    );
  };

  // 处理按钮点击
  const handleProcessButtonClick = async () => {
    switch (processMode) {
      case 'grid':
        await downloadGridImages();
        break;
      case 'compress':
        await downloadCompressedImage();
        break;
      case 'gridAndCompress':
        await downloadGridAndCompressImages();
        break;
      case 'icon':
        await downloadIconImage();
        break;
    }
  };

  useEffect(() => {
    // 添加全局鼠标事件监听
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  // 当 rows 或 cols 变化时，智能调整切割线数量并保持已有位置（若可能）
  useEffect(() => {
    const adjustLines = (current: number[], targetCount: number) => {
      if (current.length === targetCount) return current;
      if (current.length > targetCount) return current.slice(0, targetCount);
      // 增加时，保留已有值并在空位处均匀插入
      const result = [...current];
      const total = targetCount + 1; // 分割为 total 段
      for (let i = result.length; i < targetCount; i += 1) {
        // 默认插入平均位置
        result.push(((i + 1) / total) * 100);
      }
      // 简单排序，保证线位置递增
      result.sort((a, b) => a - b);
      return result;
    };

    setHorizontalLines((cur) => adjustLines(cur, Math.max(0, rows - 1)));
    setVerticalLines((cur) => adjustLines(cur, Math.max(0, cols - 1)));
  }, [rows, cols]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.navButtons}>
          <BackToHome />
          <BackToTools />
        </div>
        <h1 className={styles.title}>图片处理工具</h1>
      </div>
      
      <div className={styles.mainContent}>
        {/* 左侧功能切换按钮 */}
        <div className={styles.leftPanel}>
          <div className={styles.modeSelector}>
            <button 
              className={`${styles.modeButton} ${processMode === 'grid' ? styles.activeMode : ''}`}
              onClick={() => setProcessMode('grid')}
            >
              九宫格切图
            </button>
            <button
              className={`${styles.modeButton} ${processMode === 'icon' ? styles.activeMode : ''}`}
              onClick={() => setProcessMode('icon')}
            >
              图标压缩
            </button>
            <button 
              className={`${styles.modeButton} ${processMode === 'compress' ? styles.activeMode : ''}`}
              onClick={() => setProcessMode('compress')}
            >
              图片压缩
            </button>
            <button 
              className={`${styles.modeButton} ${processMode === 'gridAndCompress' ? styles.activeMode : ''}`}
              onClick={() => setProcessMode('gridAndCompress')}
            >
              切图并压缩
            </button>
          </div>
          
            <div className={styles.uploadContainer}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className={styles.fileInput}
              id="image-upload"
            />
            <label htmlFor="image-upload" className={styles.uploadButton}>
              选择图片
            </label>
          </div>
            {/* 网格行列设置 */}
            <div style={{ marginTop: 12 }}>
              <div className={styles.settingGroup}>
                <label htmlFor="rows">行数</label>
                <input
                  id="rows"
                  type="number"
                  min={1}
                  max={20}
                  value={rows}
                  onChange={(e) => setRows(Math.max(1, Number(e.target.value) || 1))}
                  className={styles.numberInput}
                />
              </div>
              <div className={styles.settingGroup}>
                <label htmlFor="cols">列数</label>
                <input
                  id="cols"
                  type="number"
                  min={1}
                  max={20}
                  value={cols}
                  onChange={(e) => setCols(Math.max(1, Number(e.target.value) || 1))}
                  className={styles.numberInput}
                />
              </div>
            </div>
        </div>
        
        {/* 中间图片预览区域 */}
        <div className={styles.centerPanel}>
          {image ? (
            <div 
              className={styles.imageContainer} 
              ref={containerRef}
              onMouseMove={isDragging ? handleMouseMove : undefined}
              onMouseUp={isDragging ? handleMouseUp : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt="待处理图片"
                className={styles.image}
                ref={imageRef}
              />

              {/* 仅在网格模式下显示切割线（支持自定义行列） */}
              {(processMode === 'grid' || processMode === 'gridAndCompress') && (
                <>
                  {/* 水平切割线 */}
                  {horizontalLines.map((line, index) => (
                    <div 
                      key={`h-${index}`}
                      className={styles.horizontalLine}
                      style={{ top: `${line}%` }}
                      onMouseDown={handleMouseDown(index, 'horizontal')}
                    />
                  ))}
                  
                  {/* 垂直切割线 */}
                  {verticalLines.map((line, index) => (
                    <div 
                      key={`v-${index}`}
                      className={styles.verticalLine}
                      style={{ left: `${line}%` }}
                      onMouseDown={handleMouseDown(index, 'vertical')}
                    />
                  ))}
                  
                  {/* 显示每个网格编号（可自适应 rows x cols） */}
                  <div className={styles.gridNumbers}>
                    {Array.from({ length: rows * cols }).map((_, index) => {
                      const row = Math.floor(index / cols);
                      const col = index % cols;

                      const top = row === 0 ? 0 : horizontalLines[row - 1];
                      const left = col === 0 ? 0 : verticalLines[col - 1];
                      const bottom = row === rows - 1 ? 100 : horizontalLines[row];
                      const right = col === cols - 1 ? 100 : verticalLines[col];

                      return (
                        <div
                          key={`cell-${row}-${col}`}
                          className={styles.gridNumber}
                          style={{
                            top: `${top}%`,
                            left: `${left}%`,
                            width: `${right - left}%`,
                            height: `${bottom - top}%`
                          }}
                        >
                          {index + 1}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className={styles.noImagePlaceholder}>
              请选择一张图片进行处理
            </div>
          )}
        </div>
        
        {/* 右侧设置和下载按钮 */}
        <div className={styles.rightPanel}>
          {processMode && image && (
            <>
              {/* 压缩设置 */}
              {(processMode === 'compress' || processMode === 'gridAndCompress') && (
                <div className={styles.compressionSettings}>
                  <h3>压缩设置</h3>
                  {processMode === 'compress' ? (
                    <>
                      <div className={styles.settingGroup}>
                        <label htmlFor="max-width">最大宽度 (像素)</label>
                        <input 
                          type="number" 
                          id="max-width"
                          value={maxWidth}
                          onChange={(e) => setMaxWidth(Number(e.target.value))}
                          min="1"
                          className={styles.numberInput}
                        />
                      </div>
                      <div className={styles.settingGroup}>
                        <label htmlFor="max-height">最大高度 (像素)</label>
                        <input 
                          type="number" 
                          id="max-height"
                          value={maxHeight}
                          onChange={(e) => setMaxHeight(Number(e.target.value))}
                          min="1"
                          className={styles.numberInput}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.settingGroup}>
                        <label htmlFor="max-width">输出宽度 (像素)</label>
                        <input 
                          type="number" 
                          id="max-width"
                          value={maxWidth}
                          onChange={(e) => setMaxWidth(Number(e.target.value))}
                          min="1"
                          className={styles.numberInput}
                        />
                      </div>
                      <div className={styles.settingGroup}>
                        <label htmlFor="max-height">输出高度 (像素)</label>
                        <input 
                          type="number" 
                          id="max-height"
                          value={maxHeight}
                          onChange={(e) => setMaxHeight(Number(e.target.value))}
                          min="1"
                          className={styles.numberInput}
                        />
                      </div>
                    </>
                  )}
                  <div className={styles.settingGroup}>
                    <label htmlFor="quality">质量 ({quality}%)</label>
                    <input 
                      type="range" 
                      id="quality"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      min="1"
                      max="100"
                      className={styles.rangeInput}
                    />
                  </div>
                </div>
              )}
              {/* 图标设置 */}
              {processMode === 'icon' && (
                <div className={styles.compressionSettings}>
                  <h3>图标输出设置</h3>
                  <div className={styles.settingGroup}>
                    <label htmlFor="icon-size">目标大小 (像素，正方形)</label>
                    <input
                      id="icon-size"
                      type="number"
                      min={1}
                      max={2048}
                      value={iconSize}
                      onChange={(e) => setIconSize(Math.max(1, Number(e.target.value) || 1))}
                      className={styles.numberInput}
                    />
                  </div>
                  <div className={styles.settingGroup}>
                    <label htmlFor="icon-format">格式</label>
                    <select
                      id="icon-format"
                      value={iconFormat}
                      onChange={(e) => setIconFormat(e.target.value as 'png' | 'jpeg' | 'webp')}
                      className={styles.numberInput}
                    >
                      <option value="png">PNG（透明）</option>
                      <option value="webp">WebP</option>
                      <option value="jpeg">JPEG（无透明）</option>
                    </select>
                  </div>
                  <div className={styles.settingGroup}>
                    <label htmlFor="icon-quality">质量 ({iconQuality}%)</label>
                    <input
                      id="icon-quality"
                      type="range"
                      min={1}
                      max={100}
                      value={iconQuality}
                      onChange={(e) => setIconQuality(Number(e.target.value))}
                      className={styles.rangeInput}
                    />
                  </div>
                </div>
              )}
              
              <div className={styles.controls}>
                <button
                  className={styles.processButton}
                  onClick={handleProcessButtonClick}
                >
                  {processMode === 'grid' && `下载 ${rows}x${cols} 切图`}
                  {processMode === 'compress' && '下载压缩图片'}
                  {processMode === 'gridAndCompress' && `下载 ${rows}x${cols} 切图并压缩`}
                  {processMode === 'icon' && `下载 ${iconSize}x${iconSize} 图标 (${iconFormat.toUpperCase()})`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* 隐藏的画布用于处理图片 */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageProcessingTool;