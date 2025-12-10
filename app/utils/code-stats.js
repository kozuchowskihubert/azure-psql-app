/**
 * Code Statistics API
 * Calculates live code metrics for the HAOS.fm platform
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * File extensions to include in analysis
 */
const FILE_EXTENSIONS = {
  js: ['.js', '.jsx', '.ts', '.tsx'],
  html: ['.html', '.htm'],
  css: ['.css', '.scss', '.sass', '.less'],
  py: ['.py'],
  md: ['.md'],
  json: ['.json'],
  other: [],
};

/**
 * Directories to exclude from analysis
 */
const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '__pycache__',
  'venv',
  'env',
];

/**
 * Count lines in a file
 */
async function countLinesInFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split('\n').length;
    return lines;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return 0;
  }
}

/**
 * Get file type from extension
 */
function getFileType(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  for (const [type, extensions] of Object.entries(FILE_EXTENSIONS)) {
    if (extensions.includes(ext)) {
      return type;
    }
  }

  return 'other';
}

/**
 * Recursively scan directory for code files
 */
async function scanDirectory(dirPath, baseDir = dirPath) {
  const files = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Skip excluded directories
        if (EXCLUDE_DIRS.includes(entry.name)) {
          continue;
        }

        // Recursively scan subdirectory
        const subFiles = await scanDirectory(fullPath, baseDir);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        const type = getFileType(entry.name);

        // Only include recognized file types
        if (type !== 'other' || entry.name.endsWith('.json')) {
          const lines = await countLinesInFile(fullPath);
          const relativePath = path.relative(baseDir, fullPath);

          files.push({
            name: relativePath,
            path: fullPath,
            lines,
            type,
            size: (await fs.stat(fullPath)).size,
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
  }

  return files;
}

/**
 * Calculate code statistics
 */
async function calculateCodeStats(projectRoot) {
  console.log('📊 Calculating code statistics...');

  const startTime = Date.now();
  const files = await scanDirectory(projectRoot);

  // Calculate totals by type
  const stats = {
    js: 0,
    html: 0,
    css: 0,
    py: 0,
    md: 0,
    json: 0,
    other: 0,
    total: 0,
    files: files.length,
    filesByType: {
      js: 0,
      html: 0,
      css: 0,
      py: 0,
      md: 0,
      json: 0,
      other: 0,
    },
  };

  files.forEach((file) => {
    stats.total += file.lines;
    stats[file.type] = (stats[file.type] || 0) + file.lines;
    stats.filesByType[file.type] = (stats.filesByType[file.type] || 0) + 1;
  });

  // Calculate file statistics
  const lineCounts = files.map((f) => f.lines);
  stats.avgLinesPerFile = Math.round(stats.total / stats.files) || 0;
  stats.maxLines = Math.max(...lineCounts, 0);
  stats.minLines = Math.min(...lineCounts, 0);

  // Find largest files
  stats.largestFiles = files
    .sort((a, b) => b.lines - a.lines)
    .slice(0, 20)
    .map((f) => ({
      name: f.name,
      lines: f.lines,
      type: f.type,
      sizeKB: Math.round(f.size / 1024),
    }));

  // Calculate language distribution
  stats.distribution = {};
  for (const [type, lines] of Object.entries(stats)) {
    if (typeof lines === 'number' && type !== 'total' && type !== 'files'
            && type !== 'avgLinesPerFile' && type !== 'maxLines' && type !== 'minLines') {
      stats.distribution[type] = {
        lines,
        files: stats.filesByType[type] || 0,
        percentage: Math.round((lines / stats.total) * 100) || 0,
      };
    }
  }

  // Code quality metrics
  stats.quality = calculateQuality(stats);

  // Calculate velocity (lines per file)
  stats.velocity = Math.round((stats.avgLinesPerFile / 1000) * 100);

  const endTime = Date.now();
  stats.calculationTime = endTime - startTime;

  console.log(`✅ Code stats calculated in ${stats.calculationTime}ms`);
  console.log(`📈 Total: ${stats.total.toLocaleString()} lines across ${stats.files} files`);

  return stats;
}

/**
 * Calculate code quality grade
 */
function calculateQuality(stats) {
  const avg = stats.avgLinesPerFile;

  // Quality based on average file size (sweet spot is 200-500 lines)
  if (avg > 1000) return { grade: 'C', message: 'Large files - consider refactoring' };
  if (avg > 500) return { grade: 'B+', message: 'Good - some large files' };
  if (avg > 300) return { grade: 'A', message: 'Excellent - well-structured' };
  if (avg > 200) return { grade: 'A+', message: 'Perfect - optimal file sizes' };
  if (avg > 100) return { grade: 'A', message: 'Good - compact codebase' };
  return { grade: 'B', message: 'Small files - good modularity' };
}

/**
 * Express route handler
 */
async function getCodeStatsHandler(req, res) {
  try {
    const projectRoot = path.join(__dirname, '..', '..', '..');
    const stats = await calculateCodeStats(projectRoot);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats,
    });
  } catch (error) {
    console.error('Error calculating code stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  calculateCodeStats,
  getCodeStatsHandler,
};
