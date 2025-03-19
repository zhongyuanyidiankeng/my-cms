'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './ToolIconsClient.module.css';

interface ToolIconsClientProps {
  tools: Array<{
    id: string;
    path: string;
    icon: string;
  }>;
}

export default function ToolIconsClient({ tools }: ToolIconsClientProps) {
  const router = useRouter();
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  const handleToolClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(path);
  };

  return (
    <div className={styles.toolIcons}>
      {tools.slice(0, 3).map(tool => (
        <div
          key={tool.id}
          className={styles.toolIconLink}
          onClick={(e) => handleToolClick(e, tool.path)}
          onMouseEnter={() => setHoveredTool(tool.id)}
          onMouseLeave={() => setHoveredTool(null)}
          role="button"
          tabIndex={0}
          aria-label={`打开${tool.id}工具`}
        >
          <span className={styles.toolIcon}>
            {tool.icon}
          </span>
          {hoveredTool === tool.id && (
            <div className={styles.tooltip}>{tool.id}</div>
          )}
        </div>
      ))}
    </div>
  );
}