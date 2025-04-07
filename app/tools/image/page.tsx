'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './image.module.css';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import BackToHome from '../../components/BackToHome';

// 定义处理模式类型
type ProcessMode = 'grid' | 'compress' | 'gridAndCompress' | null;

const ImageProcessingTool = () => {
  // 通用状态
  const [image, setImage] = useState<string | null>(null);
  const [processMode, setProcessMode] = useState<ProcessMode>(null);
  
  // 九宫格相关状态
  const [horizontalLines, setHorizontalLines] = useState<number[]>([33.33, 66.66]);
  const [verticalLines, setVerticalLines] = useState<number[]>([33.33, 66.66]);
  const [isDragging, setIsDragging] = useState<{ index: number, type: 'horizontal' | 'vertical' } | null>(null);
  
  // 压缩相关状态
  const [maxWidth, setMaxWidth] = useState<number>(800);
  const [maxHeight, setMaxHeight] = useState<number>(800);
  const [quality, setQuality] = useState<number>(80);
  
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

  // 处理拖动
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    
    if (isDragging.type === 'horizontal') {
      const newPosition = ((e.clientY - rect.top) / rect.height) * 100;
      if (newPosition > 0 && newPosition < 100) {
        const newLines = [...horizontalLines];
        newLines[isDragging.index] = newPosition;
        setHorizontalLines(newLines);
      }
    } else {
      const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
      if (newPosition > 0 && newPosition < 100) {
        const newLines = [...verticalLines];
        newLines[isDragging.index] = newPosition;
        setVerticalLines(newLines);
      }
    }
  };

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

  // 下载九宫格图片
  const downloadGridImages = async () => {
    if (!image || !imageRef.current) return;
    
    const img = imageRef.current;
    
    // 计算切割位置
    const hCuts = [0, ...horizontalLines.map(h => h / 100 * img.naturalHeight), img.naturalHeight];
    const vCuts = [0, ...verticalLines.map(v => v / 100 * img.naturalWidth), img.naturalWidth];
    
    // 创建一个ZIP文件
    const zip = new JSZip();
    const promises: Promise<void>[] = [];
    
    // 切割图片为9个部分并添加到ZIP
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
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
    saveAs(zipBlob, 'nine_grid_images.zip');
  };

  // 下载切割并压缩的图片
  const downloadGridAndCompressImages = async () => {
    if (!image || !imageRef.current) return;
    
    const img = imageRef.current;
    
    // 计算切割位置
    const hCuts = [0, ...horizontalLines.map(h => h / 100 * img.naturalHeight), img.naturalHeight];
    const vCuts = [0, ...verticalLines.map(v => v / 100 * img.naturalWidth), img.naturalWidth];
    
    // 创建一个ZIP文件
    const zip = new JSZip();
    const promises: Promise<void>[] = [];
    
    // 切割图片为9个部分，压缩后添加到ZIP
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
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
    saveAs(zipBlob, `nine_grid_${maxWidth}x${maxHeight}.zip`);
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
    }
  };

  useEffect(() => {
    // 添加全局鼠标事件监听
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove as any);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <BackToHome />
        <h1 className={styles.title}>图片处理工具</h1>
      </div>
      
      <div className={styles.modeSelector}>
        <button 
          className={`${styles.modeButton} ${processMode === 'grid' ? styles.activeMode : ''}`}
          onClick={() => setProcessMode('grid')}
        >
          九宫格切图
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
      
      {image && (
        <>
          <div 
            className={styles.imageContainer} 
            ref={containerRef}
            onMouseMove={isDragging ? handleMouseMove : undefined}
            onMouseUp={isDragging ? handleMouseUp : undefined}
          >
            <img 
              src={image} 
              alt="待处理图片" 
              className={styles.image}
              ref={imageRef}
            />
            
            {/* 仅在九宫格模式下显示切割线 */}
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
                
                {/* 显示九宫格编号 */}
                <div className={styles.gridNumbers}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num, index) => {
                    const row = Math.floor(index / 3);
                    const col = index % 3;
                    
                    const top = row === 0 ? 0 : horizontalLines[row - 1];
                    const left = col === 0 ? 0 : verticalLines[col - 1];
                    const bottom = row === 2 ? 100 : horizontalLines[row];
                    const right = col === 2 ? 100 : verticalLines[col];
                    
                    return (
                      <div 
                        key={num}
                        className={styles.gridNumber}
                        style={{
                          top: `${top}%`,
                          left: `${left}%`,
                          width: `${right - left}%`,
                          height: `${bottom - top}%`
                        }}
                      >
                        {num}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          
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
          
          {processMode && (
            <div className={styles.controls}>
              <button 
                className={styles.processButton}
                onClick={handleProcessButtonClick}
              >
                {processMode === 'grid' && '下载九宫格图片'}
                {processMode === 'compress' && '下载压缩图片'}
                {processMode === 'gridAndCompress' && '下载切图并压缩'}
              </button>
            </div>
          )}
          
          {/* 隐藏的画布用于处理图片 */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </>
      )}
    </div>
  );
};

export default ImageProcessingTool;