//ts-check
import type { Prompt } from '../../types';
export function findMostSimilarPrompt(keyword: string, items: Prompt[]): Prompt {
    let bestMatch: Prompt = items[0];
    let minDistance = Number.MAX_SAFE_INTEGER;
    for (const item of items) {
        const distance = levenshteinDistance(keyword, item.shortcut);
        if (distance < minDistance) {
            minDistance = distance;
            bestMatch = item;
        }
    }
    return bestMatch;
}

function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    const aLen = a.length;
    const bLen = b.length;

    // 初始化矩阵
    for (let i = 0; i <= bLen; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= aLen; j++) {
        matrix[0][j] = j;
    }

    // 计算距离
    for (let i = 1; i <= bLen; i++) {
        for (let j = 1; j <= aLen; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // 替换操作
                    matrix[i][j - 1] + 1, // 插入操作
                    matrix[i - 1][j] + 1, // 删除操作
                );
            }
        }
    }

    return matrix[bLen][aLen];
}

interface TreeNode {
    value: string;
    label: string;
    children?: TreeNode[];
  }
  
 export function searchTree(
    tree: TreeNode[],
    target: string,
    path: string[] = [],
  ): string[] | undefined {
    for (const node of tree) {
      path.push(node.value);
  
      if (node.value === target) {
        // 如果找到目标节点，则返回路径
        return path;
      }
  
      if (node.children) {
        // 如果当前节点有子节点，则递归搜索子节点
        const result = searchTree(node.children, target, path);
        if (result) {
          // 如果找到目标节点，则返回路径
          return result;
        }
      }
  
      // 如果没有找到目标节点，则从路径中删除当前节点
      path.pop();
    }
    // 如果在树中没有找到目标节点，则返回 undefined
    return undefined;
  }
  
  
  

interface CommandLineArgs {
    [key: string]: boolean | number | string | (boolean | number | string)[];
}

function parseCommandLineArgs(argString: string): CommandLineArgs {
    const pattern = /(\-\-[^\s=]+|\-[^\s=]+)(?:\s+|=)?([^\s]*)?/g;
    const args: CommandLineArgs = {};
    let match;

    while ((match = pattern.exec(argString))) {
        const name = match[1];
        const value = match[2] ? (isNaN(Number(match[2])) ? match[2] : Number(match[2])) : true;
        if (args[name]) {
            if (Array.isArray(args[name])) {
                args[name].push(value);
            } else {
                args[name] = [args[name], value];
            }
        } else {
            args[name] = value;
        }
    }

    return args;
}

export function extractLongText(inputString: string): [string, CommandLineArgs] {
    const argString = inputString.match(/(\-\-[^\s=]+|\-[^\s=]+)(?:\s+|=)?([^\s]*)?/g)?.join(' ') || '';
    const args = parseCommandLineArgs(argString);
    const longText = inputString.replace(argString, '').trim();
    return [longText, args];
}

export const languageOptions = ['中文', 'English', 'Français', 'Español', 'Deutsch', 'Português', '日本語', '한국어', 'Italiano', 'Nederlands'];