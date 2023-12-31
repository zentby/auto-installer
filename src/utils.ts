import fs from 'fs';
import path from 'path';
import { Uri } from 'vscode';
/**
 * Convert extension name to a valid file name
 * @returns {string} file name
 */
export function getFileName(extensionName: string): string {
  return `${extensionName.replace(/[^A-Za-z0-9-]/g, '-')}.vsix`;
}

/**
 * Check if a file exists
 * @param path path to file
 * @returns {boolean} true if file exists
 */
export function fileExists(path: string): boolean {
  return fs.existsSync(path);
}

/**
 * Convert relative file path uri
 * @param filePath
 * @param rootFolder
 * @returns file path
 */
export function convertRelativePath(filePath: string, rootFolder: string): Uri {
  if (filePath.startsWith('file://')) {
    return Uri.parse(filePath);
  }
  if (path.isAbsolute(filePath)) {
    return Uri.file(filePath);
  }
  return Uri.file(path.join(rootFolder, filePath));
}
