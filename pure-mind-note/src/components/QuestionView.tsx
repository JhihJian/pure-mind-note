import React, { useState, useEffect } from 'react';
import { MindMapData } from '../types';
import './QuestionView.css';

interface QuestionViewProps {
  data: MindMapData | null;
}

interface Question {
  id: string;
  text: string;
  solutions: Solution[];
}

interface Solution {
  id: string;
  text: string;
}

const QuestionView: React.FC<QuestionViewProps> = ({ data }) => {
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (data && data.data) {
      const questionItems: Question[] = [];
      
      // 递归处理节点及其子节点
      const processNode = (node: any, nodeId: string) => {
        // 检查当前节点是否有 tag 字段且包含 'question'
        if (node?.data?.tag && Array.isArray(node.data.tag) && node.data.tag.includes('question')) {
          const solutions: Solution[] = [];
          
          // 收集子节点作为解决方案
          if (node?.children && Array.isArray(node.children)) {
            node.children.forEach((child: any, index: number) => {
              if (child?.data?.text) {
                solutions.push({
                  id: `${nodeId}_solution_${index}`,
                  text: child.data.text
                });
              }
            });
          }

          questionItems.push({
            id: nodeId,
            text: node.data.text || '',
            solutions
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

      setQuestions(questionItems);
    } else {
      setQuestions([]);
    }
  }, [data]);

  return (
    <div className="question-view">
      <h2>问题列表</h2>
      <div className="question-list">
        {questions.map(question => (
          <div key={question.id} className="question-item">
            <div className="question-header">
              <span className="question-icon">❓</span>
              <span className="question-text">{question.text}</span>
            </div>
            {question.solutions.length > 0 ? (
              <div className="solutions-list">
                <h3>解决方案：</h3>
                {question.solutions.map(solution => (
                  <div key={solution.id} className="solution-item">
                    <span className="solution-icon">💡</span>
                    <span className="solution-text">{solution.text}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-solutions">暂无解决方案</div>
            )}
          </div>
        ))}
        {questions.length === 0 && (
          <div className="no-questions">暂无问题</div>
        )}
      </div>
    </div>
  );
};

export default QuestionView; 