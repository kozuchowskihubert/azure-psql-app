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
        .filter((entry) => entry.isDirectory())
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
        }),
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
      }),
    );

    // Find audio files
    const audioFiles = files.filter((f) => ['.wav', '.mp3', '.aif', '.aiff', '.flac', '.m4a'].includes(f.extension.toLowerCase()),
    );

    // Find Ableton project files
    const abletonFiles = files.filter((f) => f.extension === '.als');

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
    const projects = entries.filter((entry) => entry.isDirectory());

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
    const alsFile = entries.find((file) => path.extname(file) === '.als');

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

/**
 * GET /api/music/cli/download-midi/:filename
 * Download a generated MIDI file
 */
router.get('/cli/download-midi/:filename', async (req, res) => {
  try {
    const { filename } = req.params;

    // Security: Prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filename',
      });
    }

    // Only allow .mid files
    if (!filename.endsWith('.mid')) {
      return res.status(400).json({
        success: false,
        error: 'Only MIDI files (.mid) can be downloaded',
      });
    }

    // Search for the file in all MIDI output directories
    const outputDir = path.join(CLI_PATH, 'output', 'MIDI-Files');

    // Try to find the file (could be in subdirectories like Deep, Hard, etc.)
    const findFile = async (dir, target) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          const found = await findFile(fullPath, target);
          if (found) return found;
        } else if (entry.name === target) {
          return fullPath;
        }
      }
      return null;
    };

    const filePath = await findFile(outputDir, filename);

    if (!filePath) {
      return res.status(404).json({
        success: false,
        error: 'MIDI file not found',
      });
    }

    // Check if file exists and is readable
    await fs.access(filePath, fs.constants.R_OK);

    // Set headers for file download
    res.setHeader('Content-Type', 'audio/midi');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream the file
    const fileStream = require('fs').createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading MIDI file:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/music/cli/download-all-midi
 * Download all generated MIDI files as a zip
 */
router.get('/cli/download-all-midi', async (req, res) => {
  try {
    const outputDir = path.join(CLI_PATH, 'output', 'MIDI-Files');
    const archiver = require('archiver');

    // Create zip archive
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    // Set headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="techno-midi-${Date.now()}.zip"`);

    // Pipe archive to response
    archive.pipe(res);

    // Add all MIDI files from output directory
    const addMidiFiles = async (dir, zipPath = '') => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            await addMidiFiles(fullPath, path.join(zipPath, entry.name));
          } else if (entry.name.endsWith('.mid')) {
            const fileContent = await fs.readFile(fullPath);
            archive.append(fileContent, { name: path.join(zipPath, entry.name) });
          }
        }
      } catch (e) {
        // Directory might not exist
      }
    };

    await addMidiFiles(outputDir);

    // Finalize the archive
    await archive.finalize();
  } catch (error) {
    console.error('Error creating MIDI zip:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
});

/**
 * GET /api/music/cli/preview-midi/:filename
 * Preview MIDI file contents (parse and return note information)
 */
router.get('/cli/preview-midi/:filename', async (req, res) => {
  try {
    const { filename } = req.params;

    // Security: Prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filename',
      });
    }

    // Only allow .mid files
    if (!filename.endsWith('.mid')) {
      return res.status(400).json({
        success: false,
        error: 'Only MIDI files (.mid) can be previewed',
      });
    }

    // Use Python to parse MIDI and extract note information
    const outputDir = path.join(CLI_PATH, 'output', 'MIDI-Files');

    // Create a Python script to parse MIDI
    const pythonScript = `
import sys
import json
from pathlib import Path
import os

try:
    from midiutil import MIDIFile
    import mido
except ImportError:
    # Try using mido if available
    try:
        import mido
    except ImportError:
        print(json.dumps({"error": "MIDI parsing library not available"}))
        sys.exit(1)

def find_midi_file(root_dir, target_file):
    for dirpath, dirnames, filenames in os.walk(root_dir):
        if target_file in filenames:
            return os.path.join(dirpath, target_file)
    return None

def parse_midi(filepath):
    try:
        mid = mido.MidiFile(filepath)
        
        notes = []
        tempo = 500000  # Default tempo (120 BPM)
        ticks_per_beat = mid.ticks_per_beat
        
        # Note names mapping
        note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        
        for i, track in enumerate(mid.tracks):
            current_time = 0
            active_notes = {}
            
            for msg in track:
                current_time += msg.time
                
                if msg.type == 'set_tempo':
                    tempo = msg.tempo
                elif msg.type == 'note_on' and msg.velocity > 0:
                    active_notes[msg.note] = {
                        'start_time': current_time,
                        'velocity': msg.velocity,
                        'note': msg.note
                    }
                elif msg.type == 'note_off' or (msg.type == 'note_on' and msg.velocity == 0):
                    if msg.note in active_notes:
                        note_info = active_notes.pop(msg.note)
                        duration = current_time - note_info['start_time']
                        
                        # Calculate note name
                        octave = (msg.note // 12) - 1
                        note_name = note_names[msg.note % 12]
                        
                        notes.append({
                            'track': i,
                            'note': msg.note,
                            'note_name': f"{note_name}{octave}",
                            'velocity': note_info['velocity'],
                            'start_tick': note_info['start_time'],
                            'duration_ticks': duration,
                            'start_time_seconds': (note_info['start_time'] / ticks_per_beat) * (tempo / 1000000),
                            'duration_seconds': (duration / ticks_per_beat) * (tempo / 1000000)
                        })
        
        # Calculate BPM
        bpm = 60000000 / tempo
        
        return {
            'success': True,
            'filename': os.path.basename(filepath),
            'tracks': len(mid.tracks),
            'ticks_per_beat': ticks_per_beat,
            'bpm': round(bpm, 2),
            'total_notes': len(notes),
            'notes': notes[:100]  # Limit to first 100 notes for preview
        }
    except Exception as e:
        return {'error': str(e)}

# Find and parse the MIDI file
root_dir = "${outputDir.replace(/\\/g, '/')}"
target_file = "${filename}"
filepath = find_midi_file(root_dir, target_file)

if filepath:
    result = parse_midi(filepath)
    print(json.dumps(result))
else:
    print(json.dumps({"error": "MIDI file not found"}))
`;

    // Execute Python script
    const { execSync } = require('child_process');
    const output = execSync(`python3 -c '${pythonScript.replace(/'/g, "'\\''")}'`, {
      cwd: CLI_PATH,
      timeout: 10000,
      encoding: 'utf8',
    });

    const result = JSON.parse(output);

    if (result.error) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error previewing MIDI file:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// BEHRINGER 2600 CLI ROUTES
// ============================================

const SYNTH2600_CLI = path.join(__dirname, '../ableton-cli/synth2600_cli.py');

/**
 * GET /api/music/synth2600/presets
 * List all available Behringer 2600 presets
 */
router.get('/synth2600/presets', async (req, res) => {
  try {
    const { stdout, stderr } = await execPromise(
      `python3 "${SYNTH2600_CLI}" preset --list`,
      {
        cwd: path.join(__dirname, '../ableton-cli'),
        timeout: 5000,
        encoding: 'utf8',
      },
    );

    // Parse the output to extract preset names
    const presetCategories = {
      soundscape: [],
      rhythmic: [],
      modulation: [],
      cinematic: [],
      psychedelic: [],
      performance: [],
      musical: [],
    };

    const lines = stdout.split('\n');
    let currentCategory = null;

    lines.forEach((line) => {
      if (line.includes('Soundscape Generators:')) currentCategory = 'soundscape';
      else if (line.includes('Rhythmic Experiments:')) currentCategory = 'rhythmic';
      else if (line.includes('Modulation Madness:')) currentCategory = 'modulation';
      else if (line.includes('Cinematic FX:')) currentCategory = 'cinematic';
      else if (line.includes('Psychedelic:')) currentCategory = 'psychedelic';
      else if (line.includes('Performance:')) currentCategory = 'performance';
      else if (line.includes('Musical Techniques:')) currentCategory = 'musical';
      else if (line.trim().startsWith('•') && currentCategory) {
        const presetName = line.trim().substring(1).trim();
        if (presetName) {
          presetCategories[currentCategory].push(presetName);
        }
      }
    });

    res.json({
      success: true,
      categories: presetCategories,
      rawOutput: stdout,
    });
  } catch (error) {
    console.error('Error listing synth2600 presets:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stderr: error.stderr,
    });
  }
});

/**
 * GET /api/music/synth2600/preset/:name
 * Load and display a specific Behringer 2600 preset
 */
router.get('/synth2600/preset/:name', async (req, res) => {
  try {
    const presetName = req.params.name;

    const { stdout, stderr } = await execPromise(
      `python3 "${SYNTH2600_CLI}" preset --load "${presetName}"`,
      {
        cwd: path.join(__dirname, '../ableton-cli'),
        timeout: 5000,
        encoding: 'utf8',
      },
    );

    // Parse the patch matrix from output
    const patchConnections = [];
    const lines = stdout.split('\n');

    lines.forEach((line) => {
      // Look for patch cable connections like: [RED] VCO1/OUT → MIXER/IN1 (Level: 0.70)
      const match = line.match(/\[(.*?)\]\s+(.*?)\s+→\s+(.*?)\s+\(Level:\s+([\d.]+)\)/);
      if (match) {
        patchConnections.push({
          color: match[1],
          source: match[2],
          destination: match[3],
          level: parseFloat(match[4]),
        });
      }
    });

    res.json({
      success: true,
      preset: presetName,
      patchConnections,
      rawOutput: stdout,
    });
  } catch (error) {
    console.error('Error loading synth2600 preset:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stderr: error.stderr,
    });
  }
});

/**
 * POST /api/music/synth2600/export
 * Export current synth configuration to MIDI file
 */
router.post('/synth2600/export', async (req, res) => {
  try {
    const { filename = 'synth2600_export.mid', bars = 4 } = req.body;
    const outputPath = path.join(__dirname, '../ableton-cli/output', filename);

    const { stdout, stderr } = await execPromise(
      `python3 "${SYNTH2600_CLI}" export --midi "${outputPath}" --bars ${bars}`,
      {
        cwd: path.join(__dirname, '../ableton-cli'),
        timeout: 10000,
        encoding: 'utf8',
      },
    );

    // Read the generated MIDI file
    const midiData = await fs.readFile(outputPath);
    const midiBase64 = midiData.toString('base64');

    res.json({
      success: true,
      filename,
      path: outputPath,
      midiData: midiBase64,
      rawOutput: stdout,
    });
  } catch (error) {
    console.error('Error exporting synth2600 MIDI:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stderr: error.stderr,
    });
  }
});

/**
 * POST /api/music/synth2600/patch
 * Add or remove a patch cable
 */
router.post('/synth2600/patch', async (req, res) => {
  try {
    const {
      action, source, destination, level = 0.8, color = 'red',
    } = req.body;

    let command;
    if (action === 'add') {
      command = `python3 "${SYNTH2600_CLI}" patch --add "${source}" "${destination}" --level ${level} --color ${color}`;
    } else if (action === 'remove') {
      command = `python3 "${SYNTH2600_CLI}" patch --remove "${source}" "${destination}"`;
    } else if (action === 'show') {
      command = `python3 "${SYNTH2600_CLI}" patch --show`;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Use "add", "remove", or "show"',
      });
    }

    const { stdout, stderr } = await execPromise(command, {
      cwd: path.join(__dirname, '../ableton-cli'),
      timeout: 5000,
      encoding: 'utf8',
    });

    res.json({
      success: true,
      action,
      rawOutput: stdout,
    });
  } catch (error) {
    console.error('Error managing synth2600 patch:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stderr: error.stderr,
    });
  }
});

/**
 * POST /api/music/synth2600/sequencer
 * Program the 16-step sequencer
 */
router.post('/synth2600/sequencer', async (req, res) => {
  try {
    const { pattern = 'random', steps = 16 } = req.body;

    const { stdout, stderr } = await execPromise(
      `python3 "${SYNTH2600_CLI}" sequencer --program "${pattern}" --steps ${steps}`,
      {
        cwd: path.join(__dirname, '../ableton-cli'),
        timeout: 5000,
        encoding: 'utf8',
      },
    );

    res.json({
      success: true,
      pattern,
      steps,
      rawOutput: stdout,
    });
  } catch (error) {
    console.error('Error programming synth2600 sequencer:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stderr: error.stderr,
    });
  }
});

/**
 * POST /api/music/synth2600/params
 * Set synthesizer parameters
 */
router.post('/synth2600/params', async (req, res) => {
  try {
    const { module, parameter, value } = req.body;

    if (!module || !parameter || value === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: module, parameter, value',
      });
    }

    const { stdout, stderr } = await execPromise(
      `python3 "${SYNTH2600_CLI}" params --set "${module}.${parameter}=${value}"`,
      {
        cwd: path.join(__dirname, '../ableton-cli'),
        timeout: 5000,
        encoding: 'utf8',
      },
    );

    res.json({
      success: true,
      module,
      parameter,
      value,
      rawOutput: stdout,
    });
  } catch (error) {
    console.error('Error setting synth2600 parameters:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stderr: error.stderr,
    });
  }
});

// ========== PRESET LIBRARY ROUTES ==========

/**
 * GET /api/music/presets
 * List all presets from the Behringer 2600 preset library
 */
router.get('/presets', async (req, res) => {
  try {
    const { category, tags, search } = req.query;
    const presetLibPath = path.join(CLI_PATH, 'output/presets/preset_library.json');
    
    // Check if library exists
    try {
      await fs.access(presetLibPath);
    } catch (error) {
      return res.json({
        success: true,
        count: 0,
        presets: [],
        message: 'Preset library not initialized. Initialize with POST /api/music/presets/init'
      });
    }
    
    // Read library
    const libraryData = await fs.readFile(presetLibPath, 'utf8');
    const library = JSON.parse(libraryData);
    let presets = library.presets || [];
    
    // Filter by category
    if (category) {
      presets = presets.filter(p => p.category === category.toLowerCase());
    }
    
    // Filter by tags
    if (tags) {
      const tagList = tags.split(',').map(t => t.trim().toLowerCase());
      presets = presets.filter(p => 
        tagList.some(tag => p.tags && p.tags.includes(tag))
      );
    }
    
    // Search by text
    if (search) {
      const query = search.toLowerCase();
      presets = presets.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.notes && p.notes.toLowerCase().includes(query))
      );
    }
    
    res.json({
      success: true,
      count: presets.length,
      presets: presets.map(p => ({
        name: p.name,
        category: p.category,
        description: p.description,
        tags: p.tags,
        bpm: p.bpm,
        key: p.key,
        author: p.author,
        created_at: p.created_at,
        modified_at: p.modified_at
      }))
    });
  } catch (error) {
    console.error('Error listing presets:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/music/presets/:presetName
 * Get detailed information about a specific preset
 */
router.get('/presets/:presetName', async (req, res) => {
  try {
    const presetName = decodeURIComponent(req.params.presetName);
    const presetLibPath = path.join(CLI_PATH, 'output/presets/preset_library.json');
    
    const libraryData = await fs.readFile(presetLibPath, 'utf8');
    const library = JSON.parse(libraryData);
    const preset = library.presets.find(p => p.name === presetName);
    
    if (!preset) {
      return res.status(404).json({
        success: false,
        error: 'Preset not found'
      });
    }
    
    res.json({
      success: true,
      preset
    });
  } catch (error) {
    console.error('Error loading preset:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/music/presets/init
 * Initialize preset library with factory presets (100 presets)
 */
router.post('/presets/init', async (req, res) => {
  try {
    // Use the 100-preset catalog instead of factory_presets
    const { stdout, stderr } = await execPromise(
      `cd ${CLI_PATH} && python3 -m src.presets.preset_catalog_100`,
      { maxBuffer: 1024 * 1024 * 10 }
    );
    
    res.json({
      success: true,
      message: '100 factory presets initialized',
      output: stdout,
      errors: stderr || null
    });
  } catch (error) {
    console.error('Error initializing presets:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stderr: error.stderr
    });
  }
});

/**
 * GET /api/music/presets/stats
 * Get preset library statistics
 */
router.get('/presets/stats', async (req, res) => {
  try {
    const presetLibPath = path.join(CLI_PATH, 'output/presets/preset_library.json');
    
    const libraryData = await fs.readFile(presetLibPath, 'utf8');
    const library = JSON.parse(libraryData);
    const presets = library.presets || [];
    
    // Calculate statistics
    const categories = {};
    const allTags = new Set();
    
    presets.forEach(preset => {
      // Count by category
      const cat = preset.category;
      categories[cat] = (categories[cat] || 0) + 1;
      
      // Collect tags
      if (preset.tags) {
        preset.tags.forEach(tag => allTags.add(tag));
      }
    });
    
    res.json({
      success: true,
      stats: {
        total_presets: presets.length,
        total_tags: allTags.size,
        categories,
        tags: Array.from(allTags).sort(),
        library_version: library.version,
        last_updated: library.updated_at
      }
    });
  } catch (error) {
    console.error('Error getting preset stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/music/presets/:presetName/render
 * Render a preset to MIDI file for playback
 */
router.post('/presets/:presetName/render', async (req, res) => {
  try {
    const presetName = decodeURIComponent(req.params.presetName);
    const { note = 60, duration = 2.0, velocity = 100 } = req.body;
    
    // TODO: Implement preset rendering to MIDI
    // This would involve calling a Python script that loads the preset
    // and generates a MIDI file with the specified note
    
    res.json({
      success: false,
      error: 'Preset rendering not yet implemented',
      message: 'Will be implemented in next iteration'
    });
  } catch (error) {
    console.error('Error rendering preset:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/music/presets/:presetName/variations
 * Get all variations for a specific preset
 */
router.get('/presets/:presetName/variations', async (req, res) => {
  try {
    const presetName = decodeURIComponent(req.params.presetName);
    const presetLibPath = path.join(CLI_PATH, 'output/presets/preset_library.json');
    
    const libraryData = await fs.readFile(presetLibPath, 'utf8');
    const library = JSON.parse(libraryData);
    const preset = library.presets.find(p => p.name === presetName);
    
    if (!preset) {
      return res.status(404).json({
        success: false,
        error: 'Preset not found'
      });
    }
    
    res.json({
      success: true,
      preset_name: preset.name,
      active_variation: preset.active_variation || null,
      variations: preset.variations || [],
      variation_count: (preset.variations || []).length
    });
  } catch (error) {
    console.error('Error loading preset variations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/music/presets/:presetName/variations/:variationName
 * Get a specific variation for a preset
 */
router.get('/presets/:presetName/variations/:variationName', async (req, res) => {
  try {
    const presetName = decodeURIComponent(req.params.presetName);
    const variationName = decodeURIComponent(req.params.variationName);
    const presetLibPath = path.join(CLI_PATH, 'output/presets/preset_library.json');
    
    const libraryData = await fs.readFile(presetLibPath, 'utf8');
    const library = JSON.parse(libraryData);
    const preset = library.presets.find(p => p.name === presetName);
    
    if (!preset) {
      return res.status(404).json({
        success: false,
        error: 'Preset not found'
      });
    }
    
    const variation = (preset.variations || []).find(v => v.name === variationName);
    
    if (!variation) {
      return res.status(404).json({
        success: false,
        error: 'Variation not found'
      });
    }
    
    res.json({
      success: true,
      preset_name: preset.name,
      variation
    });
  } catch (error) {
    console.error('Error loading variation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

