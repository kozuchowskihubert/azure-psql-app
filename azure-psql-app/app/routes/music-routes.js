const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

// Ableton Live Recordings path
const ABLETON_PATH = '/Users/haos/Music/Ableton/Live Recordings';
const CLI_PATH = path.join(__dirname, '../ableton-cli');
const CLI_SCRIPT = path.join(CLI_PATH, 'techno_studio.py');

/**
 * GET /api/music/projects
 * List all Ableton projects
 */
router.get('/projects', async (req, res) => {
  try {
    const entries = await fs.readdir(ABLETON_PATH, { withFileTypes: true });
    
    const projects = await Promise.all(
      entries
        .filter(entry => entry.isDirectory())
        .map(async (entry) => {
          const projectPath = path.join(ABLETON_PATH, entry.name);
          const stats = await fs.stat(projectPath);
          
          // Check for project info
          const infoPath = path.join(projectPath, 'Ableton Project Info');
          let hasInfo = false;
          try {
            await fs.access(infoPath);
            hasInfo = true;
          } catch (e) {
            // No info file
          }
          
          return {
            name: entry.name,
            path: projectPath,
            created: stats.birthtime,
            modified: stats.mtime,
            hasProjectInfo: hasInfo,
          };
        })
    );
    
    // Sort by modification date (newest first)
    projects.sort((a, b) => b.modified - a.modified);
    
    res.json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error('Error listing Ableton projects:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/music/projects/:projectName
 * Get details about a specific project
 */
router.get('/projects/:projectName', async (req, res) => {
  try {
    const projectName = decodeURIComponent(req.params.projectName);
    const projectPath = path.join(ABLETON_PATH, projectName);
    
    // Verify project exists
    const stats = await fs.stat(projectPath);
    if (!stats.isDirectory()) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }
    
    // Read project contents
    const entries = await fs.readdir(projectPath, { withFileTypes: true });
    
    const files = await Promise.all(
      entries.map(async (entry) => {
        const filePath = path.join(projectPath, entry.name);
        const fileStats = await fs.stat(filePath);
        
        return {
          name: entry.name,
          type: entry.isDirectory() ? 'directory' : 'file',
          size: fileStats.size,
          modified: fileStats.mtime,
          extension: path.extname(entry.name),
        };
      })
    );
    
    // Find audio files
    const audioFiles = files.filter(f => 
      ['.wav', '.mp3', '.aif', '.aiff', '.flac', '.m4a'].includes(f.extension.toLowerCase())
    );
    
    // Find Ableton project files
    const abletonFiles = files.filter(f => f.extension === '.als');
    
    res.json({
      success: true,
      project: {
        name: projectName,
        path: projectPath,
        created: stats.birthtime,
        modified: stats.mtime,
        files: files.length,
        audioFiles: audioFiles.length,
        projectFiles: abletonFiles.length,
      },
      contents: {
        all: files,
        audio: audioFiles,
        projectFiles: abletonFiles,
      },
    });
  } catch (error) {
    console.error('Error getting project details:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/music/audio/:projectName/:fileName
 * Stream audio file
 */
router.get('/audio/:projectName/:fileName', async (req, res) => {
  try {
    const projectName = decodeURIComponent(req.params.projectName);
    const fileName = decodeURIComponent(req.params.fileName);
    const filePath = path.join(ABLETON_PATH, projectName, fileName);
    
    // Security check - ensure file is within Ableton path
    const realPath = await fs.realpath(filePath);
    if (!realPath.startsWith(ABLETON_PATH)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }
    
    // Check file exists and get stats
    const stats = await fs.stat(realPath);
    
    // Set appropriate content type
    const ext = path.extname(fileName).toLowerCase();
    const contentTypes = {
      '.wav': 'audio/wav',
      '.mp3': 'audio/mpeg',
      '.aif': 'audio/aiff',
      '.aiff': 'audio/aiff',
      '.flac': 'audio/flac',
      '.m4a': 'audio/mp4',
    };
    
    res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Accept-Ranges', 'bytes');
    
    // Stream the file
    const fileStream = require('fs').createReadStream(realPath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error streaming audio:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/music/stats
 * Get overall music production statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const entries = await fs.readdir(ABLETON_PATH, { withFileTypes: true });
    const projects = entries.filter(entry => entry.isDirectory());
    
    let totalAudioFiles = 0;
    let totalProjectFiles = 0;
    let totalSize = 0;
    
    for (const project of projects) {
      try {
        const projectPath = path.join(ABLETON_PATH, project.name);
        const files = await fs.readdir(projectPath);
        
        for (const file of files) {
          const filePath = path.join(projectPath, file);
          const stats = await fs.stat(filePath);
          
          if (stats.isFile()) {
            const ext = path.extname(file).toLowerCase();
            if (['.wav', '.mp3', '.aif', '.aiff', '.flac', '.m4a'].includes(ext)) {
              totalAudioFiles++;
              totalSize += stats.size;
            }
            if (ext === '.als') {
              totalProjectFiles++;
            }
          }
        }
      } catch (e) {
        // Skip problematic projects
      }
    }
    
    res.json({
      success: true,
      stats: {
        totalProjects: projects.length,
        totalAudioFiles,
        totalProjectFiles,
        totalSizeGB: (totalSize / (1024 ** 3)).toFixed(2),
      },
    });
  } catch (error) {
    console.error('Error getting music stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/music/open/:projectName
 * Open project in Ableton Live (macOS only)
 */
router.post('/open/:projectName', async (req, res) => {
  try {
    const projectName = decodeURIComponent(req.params.projectName);
    const projectPath = path.join(ABLETON_PATH, projectName);
    
    // Find .als file in project
    const entries = await fs.readdir(projectPath);
    const alsFile = entries.find(file => path.extname(file) === '.als');
    
    if (!alsFile) {
      return res.status(404).json({
        success: false,
        error: 'No Ableton project file (.als) found',
      });
    }
    
    const alsPath = path.join(projectPath, alsFile);
    
    // Open in Ableton Live on macOS
    await execPromise(`open "${alsPath}"`);
    
    res.json({
      success: true,
      message: `Opening ${alsFile} in Ableton Live`,
      file: alsFile,
    });
  } catch (error) {
    console.error('Error opening project:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * CLI Integration Routes
 */

/**
 * GET /api/music/cli/status
 * Check CLI availability
 */
router.get('/cli/status', async (req, res) => {
  try {
    const cliExists = await fs.access(CLI_SCRIPT).then(() => true).catch(() => false);
    const outputDir = path.join(CLI_PATH, 'output');
    const outputExists = await fs.access(outputDir).then(() => true).catch(() => false);
    
    res.json({
      success: true,
      cli: {
        available: cliExists,
        path: CLI_SCRIPT,
        outputDir: outputExists ? outputDir : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/music/cli/generate-midi
 * Generate MIDI patterns using CLI
 */
router.post('/cli/generate-midi', async (req, res) => {
  try {
    const { genre = 'deep', bpm = 124, bars = 136 } = req.body;
    
    const cmd = `cd "${CLI_PATH}" && python3 "${CLI_SCRIPT}" midi --genre ${genre} --bpm ${bpm} --bars ${bars}`;
    const { stdout, stderr } = await execPromise(cmd);
    
    res.json({
      success: true,
      message: `Generated ${genre} MIDI patterns at ${bpm} BPM`,
      output: stdout,
      genre,
      bpm,
      bars,
    });
  } catch (error) {
    console.error('Error generating MIDI:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stderr: error.stderr,
    });
  }
});

/**
 * POST /api/music/cli/generate-template
 * Generate Ableton template using CLI
 */
router.post('/cli/generate-template', async (req, res) => {
  try {
    const { name = 'Deep-Techno', tempo = 124 } = req.body;
    
    const cmd = `cd "${CLI_PATH}" && python3 "${CLI_SCRIPT}" template --tempo ${tempo}`;
    const { stdout, stderr } = await execPromise(cmd);
    
    res.json({
      success: true,
      message: `Generated Ableton template at ${tempo} BPM`,
      output: stdout,
      name,
      tempo,
    });
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stderr: error.stderr,
    });
  }
});

/**
 * POST /api/music/cli/create-project
 * Full workflow: Generate MIDI + Template
 */
router.post('/cli/create-project', async (req, res) => {
  try {
    const { genre = 'deep', bpm = 124, bars = 136 } = req.body;
    
    const cmd = `cd "${CLI_PATH}" && python3 "${CLI_SCRIPT}" create --genre ${genre} --bpm ${bpm} --bars ${bars}`;
    const { stdout, stderr } = await execPromise(cmd, { timeout: 30000 });
    
    res.json({
      success: true,
      message: `Created complete ${genre} techno project`,
      output: stdout,
      genre,
      bpm,
      bars,
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stderr: error.stderr,
    });
  }
});

/**
 * GET /api/music/cli/generated-files
 * List all generated MIDI and project files
 */
router.get('/cli/generated-files', async (req, res) => {
  try {
    const outputDir = path.join(CLI_PATH, 'output');
    const midiDir = path.join(outputDir, 'MIDI-Files');
    const projectsDir = path.join(outputDir, 'Projects');
    
    const files = {
      midi: [],
      projects: [],
    };
    
    // Read MIDI files
    try {
      const midiEntries = await fs.readdir(midiDir, { withFileTypes: true, recursive: true });
      for (const entry of midiEntries) {
        if (entry.isFile() && entry.name.endsWith('.mid')) {
          const filePath = path.join(midiDir, entry.name);
          const stats = await fs.stat(filePath);
          files.midi.push({
            name: entry.name,
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
          });
        }
      }
    } catch (e) {
      // MIDI dir might not exist
    }
    
    // Read project files
    try {
      const projectEntries = await fs.readdir(projectsDir, { withFileTypes: true });
      for (const entry of projectEntries) {
        if (entry.isFile() && entry.name.endsWith('.als')) {
          const filePath = path.join(projectsDir, entry.name);
          const stats = await fs.stat(filePath);
          files.projects.push({
            name: entry.name,
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
          });
        }
      }
    } catch (e) {
      // Projects dir might not exist
    }
    
    res.json({
      success: true,
      files,
      counts: {
        midi: files.midi.length,
        projects: files.projects.length,
      },
    });
  } catch (error) {
    console.error('Error listing generated files:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/music/cli/automate-vst
 * Automate VST loading (Ableton must be open)
 */
router.post('/cli/automate-vst', async (req, res) => {
  try {
    const cmd = `cd "${CLI_PATH}" && python3 "${CLI_SCRIPT}" automate`;
    const { stdout, stderr } = await execPromise(cmd, { timeout: 60000 });
    
    res.json({
      success: true,
      message: 'VST automation completed',
      output: stdout,
    });
  } catch (error) {
    console.error('Error automating VST:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stderr: error.stderr,
    });
  }
});

module.exports = router;

