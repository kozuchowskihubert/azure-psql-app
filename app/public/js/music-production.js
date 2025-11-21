// Music Production Preview - JavaScript
let allProjects = [];
let currentProject = null;
let currentAudio = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadProjects();
    checkCLIStatus();
});

// Check CLI availability
async function checkCLIStatus() {
    try {
        const response = await fetch('/api/music/cli/status');
        const data = await response.json();

        if (!data.success || !data.cli.available) {
            console.warn('CLI not available');
        } else {
            console.log('CLI ready:', data.cli.path);
        }
    } catch (error) {
        console.error('Error checking CLI status:', error);
    }
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch('/api/music/stats');
        const data = await response.json();

        if (data.success) {
            displayStats(data.stats);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Display statistics
function displayStats(stats) {
    const container = document.getElementById('stats-container');
    container.innerHTML = `
        <div class="stat-card rounded-xl p-6 text-white">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-white text-opacity-80 text-sm">Total Projects</p>
                    <p class="text-3xl font-bold mt-1">${stats.totalProjects}</p>
                </div>
                <i class="fas fa-folder text-4xl text-white text-opacity-30"></i>
            </div>
        </div>
        
        <div class="stat-card rounded-xl p-6 text-white">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-white text-opacity-80 text-sm">Audio Files</p>
                    <p class="text-3xl font-bold mt-1">${stats.totalAudioFiles}</p>
                </div>
                <i class="fas fa-file-audio text-4xl text-white text-opacity-30"></i>
            </div>
        </div>
        
        <div class="stat-card rounded-xl p-6 text-white">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-white text-opacity-80 text-sm">Ableton Files</p>
                    <p class="text-3xl font-bold mt-1">${stats.totalProjectFiles}</p>
                </div>
                <i class="fas fa-music text-4xl text-white text-opacity-30"></i>
            </div>
        </div>
        
        <div class="stat-card rounded-xl p-6 text-white">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-white text-opacity-80 text-sm">Total Size</p>
                    <p class="text-3xl font-bold mt-1">${stats.totalSizeGB} GB</p>
                </div>
                <i class="fas fa-hdd text-4xl text-white text-opacity-30"></i>
            </div>
        </div>
    `;
}

// Load projects
async function loadProjects() {
    try {
        const response = await fetch('/api/music/projects');
        const data = await response.json();

        document.getElementById('loading').classList.add('hidden');

        if (data.success && data.projects.length > 0) {
            allProjects = data.projects;
            displayProjects(allProjects);
        } else {
            document.getElementById('empty-state').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('empty-state').classList.remove('hidden');
    }
}

// Display projects
function displayProjects(projects) {
    const grid = document.getElementById('projects-grid');
    grid.classList.remove('hidden');

    grid.innerHTML = projects.map(project => {
        const date = new Date(project.modified);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return `
            <div class="project-card bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
                 onclick="openProject('${encodeURIComponent(project.name)}')">
                <div class="bg-gradient-to-r from-purple-500 to-indigo-500 p-4">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <h3 class="text-white font-bold text-lg truncate" title="${project.name}">
                                ${project.name}
                            </h3>
                            <p class="text-white text-opacity-80 text-sm mt-1">
                                <i class="far fa-clock mr-1"></i>${dateStr}
                            </p>
                        </div>
                        <i class="fas fa-music text-white text-2xl text-opacity-50"></i>
                    </div>
                </div>
                
                <div class="p-4">
                    <div class="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <span>
                            <i class="far fa-calendar mr-1"></i>
                            ${new Date(project.created).toLocaleDateString()}
                        </span>
                        ${project.hasProjectInfo ? '<span class="text-green-600"><i class="fas fa-check-circle mr-1"></i>Project Info</span>' : ''}
                    </div>
                    
                    <div class="flex items-center justify-end space-x-2">
                        <button class="text-purple-600 hover:text-purple-800 transition px-3 py-1 rounded"
                                onclick="event.stopPropagation(); openProject('${encodeURIComponent(project.name)}')">
                            <i class="fas fa-eye mr-1"></i>View
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Filter projects
function filterProjects() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filtered = allProjects.filter(project =>
        project.name.toLowerCase().includes(searchTerm),
    );
    displayProjects(filtered);
}

// Sort projects
function sortProjects() {
    const sortBy = document.getElementById('sort-select').value;
    const sorted = [...allProjects];

    switch (sortBy) {
        case 'newest':
            sorted.sort((a, b) => new Date(b.modified) - new Date(a.modified));
            break;
        case 'oldest':
            sorted.sort((a, b) => new Date(a.modified) - new Date(b.modified));
            break;
        case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }

    allProjects = sorted;
    displayProjects(allProjects);
}

// Refresh projects
function refreshProjects() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('projects-grid').classList.add('hidden');
    document.getElementById('empty-state').classList.add('hidden');
    loadStats();
    loadProjects();
}

// Open project details
async function openProject(projectName) {
    try {
        const response = await fetch(`/api/music/projects/${projectName}`);
        const data = await response.json();

        if (data.success) {
            currentProject = data;
            displayProjectModal(data);
        }
    } catch (error) {
        console.error('Error loading project details:', error);
        alert('Failed to load project details');
    }
}

// Display project modal
function displayProjectModal(data) {
    const { project } = data;
    const { contents } = data;

    document.getElementById('modal-title').textContent = project.name;
    document.getElementById('modal-subtitle').textContent =
        `${project.files} files • ${project.audioFiles} audio • ${project.projectFiles} Ableton projects`;

    // Project info
    document.getElementById('project-info').innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs text-gray-600">Created</p>
                <p class="font-semibold text-sm">${new Date(project.created).toLocaleDateString()}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs text-gray-600">Modified</p>
                <p class="font-semibold text-sm">${new Date(project.modified).toLocaleDateString()}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs text-gray-600">Total Files</p>
                <p class="font-semibold text-sm">${project.files}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs text-gray-600">Audio Files</p>
                <p class="font-semibold text-sm">${project.audioFiles}</p>
            </div>
        </div>
    `;

    // Audio files
    if (contents.audio.length > 0) {
        document.getElementById('audio-list').innerHTML = contents.audio.map(file => `
            <div class="bg-gray-50 rounded-lg p-4 mb-3">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-file-audio text-purple-600 text-xl"></i>
                        <div>
                            <p class="font-semibold">${file.name}</p>
                            <p class="text-xs text-gray-600">${formatFileSize(file.size)} • ${file.extension}</p>
                        </div>
                    </div>
                    <button onclick="playAudio('${encodeURIComponent(project.name)}', '${encodeURIComponent(file.name)}')" 
                            class="text-purple-600 hover:text-purple-800 px-4 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition">
                        <i class="fas fa-play mr-2"></i>Play
                    </button>
                </div>
                <audio id="audio-${file.name}" class="w-full hidden" controls></audio>
            </div>
        `).join('');
    } else {
        document.getElementById('audio-list').innerHTML = '<p class="text-gray-500 text-center py-4">No audio files found</p>';
    }

    // Ableton files
    if (contents.projectFiles.length > 0) {
        document.getElementById('als-files').innerHTML = contents.projectFiles.map(file => `
            <div class="bg-gray-50 rounded-lg p-4 mb-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-music text-indigo-600 text-xl"></i>
                        <div>
                            <p class="font-semibold">${file.name}</p>
                            <p class="text-xs text-gray-600">${formatFileSize(file.size)} • Modified ${new Date(file.modified).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <button onclick="openInAbleton('${encodeURIComponent(project.name)}')" 
                            class="text-indigo-600 hover:text-indigo-800 px-4 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition">
                        <i class="fas fa-external-link-alt mr-2"></i>Open in Ableton
                    </button>
                </div>
            </div>
        `).join('');
    } else {
        document.getElementById('als-files').innerHTML = '<p class="text-gray-500 text-center py-4">No Ableton project files found</p>';
    }

    // All files
    document.getElementById('all-files').innerHTML = `
        <div class="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            ${contents.all.map(file => `
                <div class="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                    <div class="flex items-center space-x-2">
                        <i class="fas ${file.type === 'directory' ? 'fa-folder' : 'fa-file'} text-gray-400"></i>
                        <span class="text-sm">${file.name}</span>
                    </div>
                    <span class="text-xs text-gray-500">${file.type === 'file' ? formatFileSize(file.size) : 'Folder'}</span>
                </div>
            `).join('')}
        </div>
    `;

    document.getElementById('project-modal').classList.remove('hidden');
}

// Play audio
function playAudio(projectName, fileName) {
    // Stop current audio if playing
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    const audioElement = document.getElementById(`audio-${fileName}`);
    audioElement.src = `/api/music/audio/${projectName}/${fileName}`;
    audioElement.classList.remove('hidden');
    audioElement.play();
    currentAudio = audioElement;
}

// Open in Ableton
async function openInAbleton(projectName) {
    try {
        const response = await fetch(`/api/music/open/${projectName}`, {
            method: 'POST',
        });
        const data = await response.json();

        if (data.success) {
            alert(`Opening ${data.file} in Ableton Live`);
        } else {
            alert('Failed to open project: ' + data.error);
        }
    } catch (error) {
        console.error('Error opening project:', error);
        alert('Failed to open project in Ableton');
    }
}

// Toggle all files
function toggleAllFiles() {
    const allFiles = document.getElementById('all-files');
    const toggleText = document.getElementById('toggle-files-text');

    if (allFiles.classList.contains('hidden')) {
        allFiles.classList.remove('hidden');
        toggleText.textContent = 'Hide All Files';
    } else {
        allFiles.classList.add('hidden');
        toggleText.textContent = 'Show All Files';
    }
}

// Close modal
function closeModal(event) {
    if (!event || event.target.id === 'project-modal') {
        document.getElementById('project-modal').classList.add('hidden');
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

// ESC key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// ============================================================================
// CLI Functions
// ============================================================================

// Toggle CLI panel
function toggleCLIPanel() {
    const panel = document.getElementById('cli-panel');
    panel.classList.toggle('hidden');
}

// Show CLI output
function showCLIOutput(text, isError = false) {
    const output = document.getElementById('cli-output');
    const outputText = document.getElementById('cli-output-text');

    output.classList.remove('hidden');

    const timestamp = new Date().toLocaleTimeString();
    const prefix = isError ? '❌ ERROR' : '✅ SUCCESS';
    const message = `[${timestamp}] ${prefix}\n${text}\n\n`;

    outputText.textContent += message;
    outputText.scrollTop = outputText.scrollHeight;
}

// Clear CLI output
function clearCLIOutput() {
    const outputText = document.getElementById('cli-output-text');
    outputText.textContent = '';
    document.getElementById('cli-output').classList.add('hidden');
}

// Generate MIDI
async function generateMIDI() {
    const genre = document.getElementById('midi-genre').value;
    const bpm = parseInt(document.getElementById('midi-bpm').value);
    const bars = parseInt(document.getElementById('midi-bars').value);

    try {
        showCLIOutput(`Generating ${genre} MIDI patterns at ${bpm} BPM, ${bars} bars...`);

        const response = await fetch('/api/music/cli/generate-midi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ genre, bpm, bars }),
        });

        const data = await response.json();

        if (data.success) {
            showCLIOutput(data.message + '\n\n' + data.output);
        } else {
            showCLIOutput(data.error, true);
        }
    } catch (error) {
        showCLIOutput('Error: ' + error.message, true);
    }
}

// Generate Template
async function generateTemplate() {
    const name = document.getElementById('template-name').value;
    const tempo = parseInt(document.getElementById('template-tempo').value);

    try {
        showCLIOutput(`Generating Ableton template "${name}" at ${tempo} BPM...`);

        const response = await fetch('/api/music/cli/generate-template', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, tempo }),
        });

        const data = await response.json();

        if (data.success) {
            showCLIOutput(data.message + '\n\n' + data.output);
        } else {
            showCLIOutput(data.error, true);
        }
    } catch (error) {
        showCLIOutput('Error: ' + error.message, true);
    }
}

// Create Full Project
async function createFullProject() {
    const genre = document.getElementById('project-genre').value;
    const bpm = parseInt(document.getElementById('project-bpm').value);
    const bars = parseInt(document.getElementById('project-bars').value);

    try {
        showCLIOutput(`Creating complete ${genre} techno project...\nThis may take a moment...`);

        const response = await fetch('/api/music/cli/create-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ genre, bpm, bars }),
        });

        const data = await response.json();

        if (data.success) {
            showCLIOutput(data.message + '\n\n' + data.output);

            // Refresh projects list after creation
            setTimeout(() => {
                refreshProjects();
            }, 1000);
        } else {
            showCLIOutput(data.error, true);
        }
    } catch (error) {
        showCLIOutput('Error: ' + error.message, true);
    }
}
