import React, { useState, useEffect } from 'react';
import { MindMapData, NodeTag } from '../types';
import './ProjectView.css';

interface ProjectViewProps {
  data: MindMapData | null;
}

interface Project {
  id: string;
  name: string;
  progress: Progress[];
}

interface Progress {
  id: string;
  text: string;
  date?: string;
}

const ProjectView: React.FC<ProjectViewProps> = ({ data }) => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (data && data.data) {
      const projectItems: Project[] = [];
      
      // 递归处理节点及其子节点
      const processNode = (node: any, nodeId: string) => {
        // 检查当前节点是否有 project 标签
        if (node?.data?.tag && Array.isArray(node.data.tag) && node.data.tag.includes(NodeTag.PROJECT)) {
          const progress: Progress[] = [];
          
          // 收集子节点中的进展信息
          if (node?.children && Array.isArray(node.children)) {
            node.children.forEach((child: any, index: number) => {
              if (child?.data?.tag && Array.isArray(child.data.tag) && child.data.tag.includes(NodeTag.PROGRESS)) {
                progress.push({
                  id: `${nodeId}_progress_${index}`,
                  text: child.data.text || '',
                  date: (child.data.tagCreateTime ? 
                    `${child.data.tagCreateTime.split('T')[0]} ${child.data.tagCreateTime.split('T')[1].substring(0, 5)}` 
                    : child.data.date) || 
                    `${new Date().toISOString().split('T')[0]} ${new Date().toISOString().split('T')[1].substring(0, 5)}`
                });
              }
            });
          }

          projectItems.push({
            id: nodeId,
            name: node.data.text || '',
            progress
          });
        }
        
        // 处理子节点
        if (node?.children && Array.isArray(node.children)) {
          node.children.forEach((child: any, index: number) => {
            processNode(child, `${nodeId}_${index}`);
          });
        }
      };

      // 处理根节点
      if (data.data.root) {
        processNode(data.data.root, 'root');
      }
      
      // 处理其他节点
      if (data.data.children && Array.isArray(data.data.children)) {
        data.data.children.forEach((child: any, index: number) => {
          processNode(child, `child_${index}`);
        });
      }

      setProjects(projectItems);
    } else {
      setProjects([]);
    }
  }, [data]);

  return (
    <div className="project-view">
      <h2>项目进展</h2>
      <div className="project-list">
        {projects.map(project => (
          <div key={project.id} className="project-item">
            <div className="project-header">
              <span className="project-icon">📊</span>
              <span className="project-name">{project.name}</span>
            </div>
            {project.progress.length > 0 ? (
              <div className="progress-list">
                <h3>进展记录：</h3>
                {project.progress.map(progress => (
                  <div key={progress.id} className="progress-item">
                    <span className="progress-icon">📈</span>
                    <div className="progress-content">
                      <span className="progress-text">{progress.text}</span>
                      {progress.date && (
                        <span className="progress-date">{progress.date}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-progress">暂无进展记录</div>
            )}
          </div>
        ))}
        {projects.length === 0 && (
          <div className="no-projects">暂无项目</div>
        )}
      </div>
    </div>
  );
};

export default ProjectView; 